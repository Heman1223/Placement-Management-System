const { Company, Student, Application, Job, College } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Get company dashboard stats
 * @route   GET /api/company/stats
 * @access  Company
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;

    const [
        totalJobs,
        activeJobs,
        totalApplications,
        shortlisted,
        hired
    ] = await Promise.all([
        Job.countDocuments({ company: companyId }),
        Job.countDocuments({ company: companyId, status: 'open' }),
        Application.countDocuments({
            job: { $in: await Job.find({ company: companyId }).distinct('_id') }
        }),
        Application.countDocuments({
            job: { $in: await Job.find({ company: companyId }).distinct('_id') },
            status: 'shortlisted'
        }),
        Application.countDocuments({
            job: { $in: await Job.find({ company: companyId }).distinct('_id') },
            status: 'hired'
        })
    ]);

    // Recent jobs
    const recentJobs = await Job.find({ company: companyId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title type status stats applicationDeadline');

    res.json({
        success: true,
        data: {
            stats: {
                jobs: { total: totalJobs, active: activeJobs },
                applications: { total: totalApplications, shortlisted, hired }
            },
            recentJobs
        }
    });
});

/**
 * @desc    Search students
 * @route   GET /api/company/students/search
 * @access  Company (Approved)
 */
const searchStudents = asyncHandler(async (req, res) => {
    const {
        department,
        batch,
        minCgpa,
        maxBacklogs,
        skills,
        placementStatus,
        college,
        search,
        sortBy = 'cgpa',
        order = 'desc',
        page = 1,
        limit = 10
    } = req.query;

    const query = { isVerified: true };

    if (department) {
        query.department = { $in: department.split(',') };
    }
    if (batch) {
        query.batch = { $in: batch.split(',').map(Number) };
    }
    if (minCgpa) {
        query.cgpa = { $gte: parseFloat(minCgpa) };
    }
    if (maxBacklogs !== undefined) {
        query['backlogs.active'] = { $lte: parseInt(maxBacklogs) };
    }
    if (skills) {
        query.skills = { $in: skills.split(',').map(s => new RegExp(s.trim(), 'i')) };
    }
    if (placementStatus) {
        query.placementStatus = placementStatus;
    }
    if (college) {
        query.college = college;
    }
    if (search) {
        query.$or = [
            { 'name.firstName': { $regex: search, $options: 'i' } },
            { 'name.lastName': { $regex: search, $options: 'i' } },
            { skills: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [students, total] = await Promise.all([
        Student.find(query)
            .populate('college', 'name code')
            .select('name email department batch cgpa skills placementStatus resumeUrl linkedinUrl')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(parseInt(limit)),
        Student.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            students,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }
    });
});

/**
 * @desc    Get student full profile
 * @route   GET /api/company/students/:id
 * @access  Company (Approved)
 */
const getStudentProfile = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id)
        .populate('college', 'name code city');

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    if (!student.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Student profile is not verified'
        });
    }

    res.json({
        success: true,
        data: student
    });
});

/**
 * @desc    Shortlist a student for a job
 * @route   POST /api/company/shortlist
 * @access  Company (Approved)
 */
const shortlistStudent = asyncHandler(async (req, res) => {
    const { studentId, jobId, notes } = req.body;
    const companyId = req.user.companyProfile._id;

    // Validate required fields
    if (!studentId || !jobId) {
        return res.status(400).json({
            success: false,
            message: 'Student ID and Job ID are required'
        });
    }

    // Verify job belongs to company
    const job = await Job.findOne({ _id: jobId, company: companyId });
    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found or access denied'
        });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    // Check if already applied/shortlisted
    let application = await Application.findOne({ student: studentId, job: jobId });

    if (application) {
        // Update existing application
        application.status = 'shortlisted';
        application.companyNotes = notes || '';
        application.lastUpdatedBy = req.userId;
        await application.save();
    } else {
        // Create new application
        application = await Application.create({
            student: studentId,
            job: jobId,
            status: 'shortlisted',
            companyNotes: notes || '',
            lastUpdatedBy: req.userId,
            resumeSnapshot: {
                url: student.resumeUrl || '',
                cgpa: student.cgpa || 0,
                skills: student.skills || []
            }
        });

        // Update job stats
        await Job.findByIdAndUpdate(jobId, {
            $inc: { 'stats.shortlisted': 1 }
        });
    }

    // Update student status if not placed
    if (student.placementStatus === 'not_placed') {
        await Student.findByIdAndUpdate(studentId, {
            placementStatus: 'in_process'
        });
    }

    res.json({
        success: true,
        message: 'Student shortlisted successfully',
        data: application
    });
});

/**
 * @desc    Update application status
 * @route   PATCH /api/company/applications/:id/status
 * @access  Company (Approved)
 */
const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status, remarks, interviewDetails, offerDetails } = req.body;
    const companyId = req.user.companyProfile._id;

    const application = await Application.findById(req.params.id)
        .populate('job');

    if (!application) {
        return res.status(404).json({
            success: false,
            message: 'Application not found'
        });
    }

    // Verify job belongs to company
    if (application.job.company.toString() !== companyId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }

    application.status = status;
    application.lastUpdatedBy = req.userId;

    // Add interview details if provided
    if (interviewDetails) {
        application.interviews.push(interviewDetails);
    }

    // Add offer details if hiring
    if (status === 'offered' && offerDetails) {
        application.offer = {
            ...offerDetails,
            offeredAt: new Date()
        };
    }

    await application.save();

    // Update job stats if hired
    if (status === 'hired') {
        await Job.findByIdAndUpdate(application.job._id, {
            $inc: { 'stats.hired': 1 }
        });

        // Update student placement status
        await Student.findByIdAndUpdate(application.student, {
            placementStatus: 'placed',
            'placementDetails.company': application.job.company,
            'placementDetails.role': application.offer?.role,
            'placementDetails.package': application.offer?.package
        });
    }

    res.json({
        success: true,
        message: 'Application status updated',
        data: application
    });
});

/**
 * @desc    Get shortlisted candidates for company
 * @route   GET /api/company/shortlist
 * @access  Company (Approved)
 */
const getShortlistedCandidates = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { jobId, status, page = 1, limit = 10 } = req.query;

    // Get all jobs for this company
    const companyJobs = await Job.find({ company: companyId }).distinct('_id');

    const query = { job: { $in: companyJobs } };
    if (jobId) query.job = jobId;
    if (status) query.status = status;
    else query.status = { $in: ['shortlisted', 'interviewed', 'offered'] };

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
        Application.find(query)
            .populate('student', 'name email phone department batch cgpa skills resumeUrl')
            .populate('job', 'title type')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Application.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            applications,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }
    });
});

/**
 * @desc    Update company profile
 * @route   PUT /api/company/profile
 * @access  Company
 */
const updateProfile = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;

    // Fields that can be updated
    const allowedFields = [
        'name', 'industry', 'description', 'website', 'logo',
        'contactPerson', 'headquarters', 'size', 'preferredDepartments'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
            updates[key] = req.body[key];
        }
    });

    const company = await Company.findByIdAndUpdate(
        companyId,
        updates,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: company
    });
});

/**
 * @desc    Get all verified colleges for filter dropdown
 * @route   GET /api/company/colleges
 * @access  Company (Approved)
 */
const getColleges = asyncHandler(async (req, res) => {
    const colleges = await College.find({ isVerified: true })
        .select('name code city')
        .sort({ name: 1 });

    res.json({
        success: true,
        data: colleges
    });
});

/**
 * @desc    Export shortlisted candidates to CSV
 * @route   GET /api/company/shortlist/export
 * @access  Company (Approved)
 */
const exportShortlist = asyncHandler(async (req, res) => {
    const { formatApplicationData, sendCSVResponse } = require('../utils/csvExporter');
    const companyId = req.user.companyProfile._id;
    const { jobId, status } = req.query;

    // Get all jobs for this company
    const companyJobs = await Job.find({ company: companyId }).distinct('_id');

    const query = { job: { $in: companyJobs } };
    if (jobId) query.job = jobId;
    if (status) query.status = status;
    else query.status = { $in: ['shortlisted', 'interviewed', 'offered', 'hired'] };

    const applications = await Application.find(query)
        .populate('student', 'name email phone department batch cgpa skills resumeUrl linkedinUrl githubUrl college')
        .populate('job', 'title type')
        .lean();

    const formattedData = formatApplicationData(applications);

    // Track export count for activity logging
    req.exportCount = applications.length;

    const filename = `shortlist_${Date.now()}`;
    sendCSVResponse(res, formattedData, filename);
});

module.exports = {
    getDashboardStats,
    searchStudents,
    getStudentProfile,
    shortlistStudent,
    updateApplicationStatus,
    getShortlistedCandidates,
    updateProfile,
    getColleges,
    exportShortlist
};
