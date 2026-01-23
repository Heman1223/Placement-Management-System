const { Company, Student, Application, Job, College } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Get company dashboard stats
 * @route   GET /api/company/stats
 * @access  Company
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;

    // Get all job IDs for this company
    const companyJobIds = await Job.find({ company: companyId }).distinct('_id');

    // Get basic stats
    const [
        totalJobs,
        activeJobs,
        totalApplications,
        shortlisted,
        hired,
        company
    ] = await Promise.all([
        Job.countDocuments({ company: companyId }),
        Job.countDocuments({ company: companyId, status: 'open' }),
        Application.countDocuments({ job: { $in: companyJobIds } }),
        Application.countDocuments({ job: { $in: companyJobIds }, status: 'shortlisted' }),
        Application.countDocuments({ job: { $in: companyJobIds }, status: 'hired' }),
        Company.findById(companyId).populate({
            path: 'collegeAccess.college',
            select: 'name'
        })
    ]);

    // Get unique students viewed (from applications)
    const uniqueStudents = await Application.distinct('student', { job: { $in: companyJobIds } });
    const studentsViewed = uniqueStudents.length;

    // Count approved colleges (for agencies) or all active colleges (for companies)
    let approvedColleges = 0;
    if (company.type === 'placement_agency') {
        approvedColleges = company.collegeAccess?.filter(ca => ca.status === 'approved').length || 0;
    } else {
        approvedColleges = await College.countDocuments({ isVerified: true, isActive: true });
    }

    // Shortlists by college
    const shortlistsByCollege = await Application.aggregate([
        { $match: { job: { $in: companyJobIds }, status: { $in: ['shortlisted', 'interviewed', 'offered', 'hired'] } } },
        {
            $lookup: {
                from: 'students',
                localField: 'student',
                foreignField: '_id',
                as: 'studentData'
            }
        },
        { $unwind: '$studentData' },
        {
            $lookup: {
                from: 'colleges',
                localField: 'studentData.college',
                foreignField: '_id',
                as: 'collegeData'
            }
        },
        { $unwind: '$collegeData' },
        {
            $group: {
                _id: '$collegeData._id',
                collegeName: { $first: '$collegeData.name' },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    // Shortlists by branch/department
    const shortlistsByBranch = await Application.aggregate([
        { $match: { job: { $in: companyJobIds }, status: { $in: ['shortlisted', 'interviewed', 'offered', 'hired'] } } },
        {
            $lookup: {
                from: 'students',
                localField: 'student',
                foreignField: '_id',
                as: 'studentData'
            }
        },
        { $unwind: '$studentData' },
        {
            $group: {
                _id: '$studentData.department',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    // Skills distribution from shortlisted students
    const skillsDistribution = await Application.aggregate([
        { $match: { job: { $in: companyJobIds }, status: { $in: ['shortlisted', 'interviewed', 'offered', 'hired'] } } },
        {
            $lookup: {
                from: 'students',
                localField: 'student',
                foreignField: '_id',
                as: 'studentData'
            }
        },
        { $unwind: '$studentData' },
        { $unwind: '$studentData.skills' },
        {
            $group: {
                _id: '$studentData.skills',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 15 }
    ]);

    // Recent activity timeline (last 10 activities)
    const recentActivity = await Application.find({ job: { $in: companyJobIds } })
        .populate('student', 'name email department')
        .populate('job', 'title')
        .sort({ updatedAt: -1 })
        .limit(10)
        .select('status updatedAt student job');

    // Recent jobs
    const recentJobs = await Job.find({ company: companyId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title type status stats applicationDeadline');

    res.json({
        success: true,
        data: {
            stats: {
                approvedColleges,
                studentsViewed,
                totalShortlisted: shortlisted,
                activeJobs,
                jobs: { total: totalJobs, active: activeJobs },
                applications: { total: totalApplications, shortlisted, hired }
            },
            charts: {
                shortlistsByCollege: shortlistsByCollege.map(item => ({
                    name: item.collegeName,
                    value: item.count
                })),
                shortlistsByBranch: shortlistsByBranch.map(item => ({
                    name: item._id || 'Not Specified',
                    value: item.count
                })),
                skillsDistribution: skillsDistribution.map(item => ({
                    name: item._id,
                    value: item.count
                }))
            },
            recentActivity: recentActivity.map(activity => ({
                id: activity._id,
                type: activity.status,
                student: activity.student,
                job: activity.job,
                timestamp: activity.updatedAt
            })),
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
        experience,
        keyword,
        sortBy = 'cgpa',
        order = 'desc',
        page = 1,
        limit = 12
    } = req.query;

    const companyId = req.user.companyProfile._id;
    const company = await Company.findById(companyId);

    // Base query - only verified students
    const query = { isVerified: true };

    // Filter by approved colleges only
    if (company.type === 'placement_agency') {
        // For agencies, only show students from colleges they have access to
        const allowedCollegeIds = company.collegeAccess
            ?.filter(ca => ca.status === 'approved')
            .map(ca => ca.college) || [];
            
        if (allowedCollegeIds.length > 0) {
            query.college = { $in: allowedCollegeIds };
        } else {
            // No access to any college
            return res.json({
                success: true,
                data: {
                    students: [],
                    pagination: { current: 1, pages: 0, total: 0 }
                }
            });
        }
    } else {
        // For companies, show students from all verified colleges
        const verifiedColleges = await College.find({ isVerified: true, isActive: true }).distinct('_id');
        query.college = { $in: verifiedColleges };
    }

    // Apply filters
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

    // Experience filter (internships/projects)
    if (experience === 'internship') {
        query['internships.0'] = { $exists: true };
    } else if (experience === 'projects') {
        query['projects.0'] = { $exists: true };
    }

    // Keyword search across multiple fields
    if (keyword || search) {
        const searchTerm = keyword || search;
        query.$or = [
            { 'name.firstName': { $regex: searchTerm, $options: 'i' } },
            { 'name.lastName': { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { rollNumber: { $regex: searchTerm, $options: 'i' } },
            { skills: { $regex: searchTerm, $options: 'i' } },
            { department: { $regex: searchTerm, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [students, total] = await Promise.all([
        Student.find(query)
            .populate('college', 'name code city')
            .select('name email department batch cgpa skills placementStatus resumeUrl linkedinUrl githubUrl phone')
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
    const { ActivityLog } = require('../models');
    const companyId = req.user.companyProfile._id;
    const company = await Company.findById(companyId);

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

    // Check if company has access to this student's college
    if (company.type === 'placement_agency') {
        const allowedCollegeIds = company.collegeAccess
            ?.filter(ca => ca.status === 'approved')
            .map(ca => ca.college.toString()) || [];
            
        if (!allowedCollegeIds.includes(student.college._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to students from this college'
            });
        }
    }

    // Log profile view activity
    await ActivityLog.create({
        user: req.userId,
        action: 'view_student',
        targetModel: 'Student',
        targetId: student._id,
        metadata: {
            companyId,
            companyName: company.name,
            studentName: `${student.name.firstName} ${student.name.lastName}`,
            college: student.college.name
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

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
        // Prevent duplicate shortlisting
        if (application.status === 'shortlisted') {
            return res.status(400).json({
                success: false,
                message: 'Student is already shortlisted for this job'
            });
        }

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
            .populate({
                path: 'student',
                select: 'name email phone department batch cgpa skills resumeUrl college',
                populate: { path: 'college', select: 'name code' }
            })
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
    const { checkDownloadLimits, incrementDownloadCount } = require('../utils/downloadLimits');
    const { ActivityLog } = require('../models');
    const companyId = req.user.companyProfile._id;
    const company = await Company.findById(companyId);
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

    // Check download limits
    const limits = await checkDownloadLimits(companyId);
    const exportCount = applications.length;

    if (exportCount > limits.dailyRemaining || exportCount > limits.monthlyRemaining) {
        return res.status(429).json({
            success: false,
            message: `Cannot export ${exportCount} records. Daily remaining: ${limits.dailyRemaining}, Monthly remaining: ${limits.monthlyRemaining}`,
            limits: {
                dailyRemaining: limits.dailyRemaining,
                monthlyRemaining: limits.monthlyRemaining,
                requested: exportCount
            }
        });
    }

    // Track export
    await incrementDownloadCount(
        companyId,
        null,
        req.userId,
        'csv_export',
        {
            recordCount: exportCount,
            jobId: jobId || 'all',
            status: status || 'all'
        }
    );

    // Log export activity
    await ActivityLog.create({
        user: req.userId,
        action: 'export_data',
        targetModel: 'Application',
        metadata: {
            companyId,
            companyName: company.name,
            exportType: 'shortlist_csv',
            recordCount: exportCount,
            jobId: jobId || 'all',
            status: status || 'all'
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    const formattedData = formatApplicationData(applications);
    const filename = `shortlist_${Date.now()}`;
    sendCSVResponse(res, formattedData, filename);
});

/**
 * @desc    Save search filter
 * @route   POST /api/company/search-filters
 * @access  Company (Approved)
 */
const saveSearchFilter = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { name, filters } = req.body;

    if (!name || !filters) {
        return res.status(400).json({
            success: false,
            message: 'Filter name and filters are required'
        });
    }

    const company = await Company.findById(companyId);
    
    // Initialize savedSearchFilters if not exists
    if (!company.savedSearchFilters) {
        company.savedSearchFilters = [];
    }

    // Check if filter with same name exists
    const existingIndex = company.savedSearchFilters.findIndex(f => f.name === name);
    
    if (existingIndex >= 0) {
        // Update existing filter
        company.savedSearchFilters[existingIndex] = {
            name,
            filters,
            updatedAt: new Date()
        };
    } else {
        // Add new filter
        company.savedSearchFilters.push({
            name,
            filters,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    await company.save();

    res.json({
        success: true,
        message: 'Search filter saved successfully',
        data: company.savedSearchFilters
    });
});

/**
 * @desc    Get saved search filters
 * @route   GET /api/company/search-filters
 * @access  Company (Approved)
 */
const getSavedSearchFilters = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const company = await Company.findById(companyId).select('savedSearchFilters');

    res.json({
        success: true,
        data: company.savedSearchFilters || []
    });
});

/**
 * @desc    Delete saved search filter
 * @route   DELETE /api/company/search-filters/:name
 * @access  Company (Approved)
 */
const deleteSearchFilter = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { name } = req.params;

    const company = await Company.findById(companyId);
    
    if (!company.savedSearchFilters) {
        return res.status(404).json({
            success: false,
            message: 'No saved filters found'
        });
    }

    company.savedSearchFilters = company.savedSearchFilters.filter(f => f.name !== name);
    await company.save();

    res.json({
        success: true,
        message: 'Search filter deleted successfully',
        data: company.savedSearchFilters
    });
});

/**
 * @desc    Get shortlist with enhanced details
 * @route   GET /api/company/shortlist/:id
 * @access  Company (Approved)
 */
const getShortlistDetails = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { id } = req.params;

    const application = await Application.findById(id)
        .populate({
            path: 'student',
            populate: { path: 'college', select: 'name code' }
        })
        .populate('job', 'title type')
        .populate('statusHistory.changedBy', 'email')
        .populate('lastUpdatedBy', 'email');

    if (!application) {
        return res.status(404).json({
            success: false,
            message: 'Shortlist not found'
        });
    }

    // Verify job belongs to company
    const job = await Job.findById(application.job._id);

    if (job.company.toString() !== companyId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }

    res.json({
        success: true,
        data: application
    });
});

/**
 * @desc    Request access to a college
 * @route   POST /api/company/request-access
 * @access  Company
 */
const requestCollegeAccess = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { collegeId } = req.body;

    if (!collegeId) {
        return res.status(400).json({ success: false, message: 'College ID is required' });
    }

    const company = await Company.findById(companyId);
    
    // Check if already requested
    const existingRequest = company.collegeAccess.find(ca => ca.college.toString() === collegeId);
    if (existingRequest) {
        return res.status(400).json({ 
            success: false, 
            message: `Request already exists with status: ${existingRequest.status}` 
        });
    }

    company.collegeAccess.push({
        college: collegeId,
        status: 'pending',
        requestedAt: new Date()
    });

    await company.save();

    res.json({
        success: true,
        message: 'Access request sent successfully'
    });
});

/**
 * @desc    Get list of colleges with access status
 * @route   GET /api/company/my-colleges
 * @access  Company
 */
const getRequestedColleges = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    
    const company = await Company.findById(companyId)
        .populate('collegeAccess.college', 'name code city state logo');

    res.json({
        success: true,
        data: company.collegeAccess
    });
});



/**
 * @desc    Update shortlist status with notes
 * @route   PATCH /api/company/shortlist/:id/status
 * @access  Company (Approved)
 */
const updateShortlistStatus = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { id } = req.params;
    const { status, notes, round, interviewDetails } = req.body;

    const application = await Application.findById(id)
        .populate('job')
        .populate('student');

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

    // Update status
    if (status) {
        application.status = status;
        application.lastUpdatedBy = req.userId;

        // Add to status history with notes
        application.statusHistory.push({
            status,
            changedAt: new Date(),
            changedBy: req.userId,
            remarks: notes || ''
        });
    }

    // Add interview details if provided
    if (interviewDetails) {
        application.interviews.push({
            ...interviewDetails,
            round: round || application.interviews.length + 1
        });
    }

    // Update company notes
    if (notes) {
        application.companyNotes = application.companyNotes 
            ? `${application.companyNotes}\n\n[${new Date().toLocaleString()}] ${notes}`
            : `[${new Date().toLocaleString()}] ${notes}`;
    }

    await application.save();

    // Update student placement status
    if (status === 'hired') {
        await Student.findByIdAndUpdate(application.student._id, {
            placementStatus: 'placed',
            'placementDetails.company': application.job.company,
            'placementDetails.role': application.job.title,
            'placementDetails.placedAt': new Date()
        });
    }

    res.json({
        success: true,
        message: 'Shortlist updated successfully',
        data: application
    });
});

/**
 * @desc    Add note to shortlist
 * @route   POST /api/company/shortlist/:id/notes
 * @access  Company (Approved)
 */
const addShortlistNote = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Note content is required'
        });
    }

    const application = await Application.findById(id).populate('job');

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

    // Add timestamped note
    const timestamp = new Date().toLocaleString();
    const newNote = `[${timestamp}] ${note}`;
    
    application.companyNotes = application.companyNotes 
        ? `${application.companyNotes}\n\n${newNote}`
        : newNote;
    
    application.lastUpdatedBy = req.userId;
    await application.save();

    res.json({
        success: true,
        message: 'Note added successfully',
        data: { companyNotes: application.companyNotes }
    });
});

/**
 * @desc    Remove from shortlist (undo shortlist)
 * @route   DELETE /api/company/shortlist/:id
 * @access  Company (Approved)
 */
const removeFromShortlist = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { id } = req.params;

    const application = await Application.findById(id).populate('job');

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

    // Delete the application
    await Application.findByIdAndDelete(id);

    // Update job stats
    await Job.findByIdAndUpdate(application.job._id, {
        $inc: { 'stats.shortlisted': -1 }
    });

    // Update student status if they have no other active applications
    const otherApplications = await Application.countDocuments({
        student: application.student,
        status: { $in: ['shortlisted', 'interviewed', 'offered'] }
    });

    if (otherApplications === 0) {
        await Student.findByIdAndUpdate(application.student, {
            placementStatus: 'not_placed'
        });
    }

    res.json({
        success: true,
        message: 'Removed from shortlist successfully'
    });
});

/**
 * @desc    Log resume download
 * @route   POST /api/company/students/:id/log-resume-view
 * @access  Company (Approved)
 */
const logResumeView = asyncHandler(async (req, res) => {
    const { ActivityLog } = require('../models');
    const { checkDownloadLimits, incrementDownloadCount } = require('../utils/downloadLimits');
    const companyId = req.user.companyProfile._id;
    const company = await Company.findById(companyId);
    const student = await Student.findById(req.params.id).populate('college', 'name');

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    // Check download limits
    const limits = await checkDownloadLimits(companyId);
    
    if (!limits.canDownload) {
        return res.status(429).json({
            success: false,
            message: 'Download limit reached. Daily or monthly limit exceeded.',
            limits: {
                dailyRemaining: limits.dailyRemaining,
                monthlyRemaining: limits.monthlyRemaining
            }
        });
    }

    // Increment download count
    await incrementDownloadCount(
        companyId,
        student._id,
        req.userId,
        'resume',
        {
            studentName: `${student.name.firstName} ${student.name.lastName}`,
            college: student.college.name,
            resumeUrl: student.resumeUrl
        }
    );

    // Log resume view activity
    await ActivityLog.create({
        user: req.userId,
        action: 'view_resume',
        targetModel: 'Student',
        targetId: student._id,
        metadata: {
            companyId,
            companyName: company.name,
            studentName: `${student.name.firstName} ${student.name.lastName}`,
            college: student.college.name,
            resumeUrl: student.resumeUrl
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.json({
        success: true,
        message: 'Resume view logged',
        limits: {
            dailyRemaining: limits.dailyRemaining - 1,
            monthlyRemaining: limits.monthlyRemaining - 1
        }
    });
});

/**
 * @desc    Get download limits and statistics
 * @route   GET /api/company/download-stats
 * @access  Company (Approved)
 */
const getDownloadStatistics = asyncHandler(async (req, res) => {
    const { getDownloadStats } = require('../utils/downloadLimits');
    const companyId = req.user.companyProfile._id;

    const stats = await getDownloadStats(companyId);

    res.json({
        success: true,
        data: stats
    });
});

/**
 * @desc    Bulk download student data (with limits)
 * @route   POST /api/company/bulk-download
 * @access  Company (Approved)
 */
const bulkDownloadStudents = asyncHandler(async (req, res) => {
    const { checkDownloadLimits, incrementDownloadCount } = require('../utils/downloadLimits');
    const { ActivityLog } = require('../models');
    const companyId = req.user.companyProfile._id;
    const company = await Company.findById(companyId);
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Student IDs array is required'
        });
    }

    // Check download limits
    const limits = await checkDownloadLimits(companyId);
    
    // Check if bulk download would exceed limits
    const requestedCount = studentIds.length;
    if (requestedCount > limits.dailyRemaining || requestedCount > limits.monthlyRemaining) {
        return res.status(429).json({
            success: false,
            message: `Cannot download ${requestedCount} profiles. Daily remaining: ${limits.dailyRemaining}, Monthly remaining: ${limits.monthlyRemaining}`,
            limits: {
                dailyRemaining: limits.dailyRemaining,
                monthlyRemaining: limits.monthlyRemaining,
                requested: requestedCount
            }
        });
    }

    // Fetch students
    const students = await Student.find({ _id: { $in: studentIds } })
        .populate('college', 'name code')
        .lean();

    // Track each download
    for (const student of students) {
        await incrementDownloadCount(
            companyId,
            student._id,
            req.userId,
            'profile_data',
            {
                studentName: `${student.name.firstName} ${student.name.lastName}`,
                college: student.college?.name
            }
        );
    }

    // Log bulk download activity
    await ActivityLog.create({
        user: req.userId,
        action: 'download_student_data',
        targetModel: 'Student',
        metadata: {
            companyId,
            companyName: company.name,
            studentCount: students.length,
            studentIds: studentIds
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.json({
        success: true,
        data: students,
        downloaded: students.length,
        limits: {
            dailyRemaining: limits.dailyRemaining - students.length,
            monthlyRemaining: limits.monthlyRemaining - students.length
        }
    });
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
    exportShortlist,
    saveSearchFilter,
    getSavedSearchFilters,
    deleteSearchFilter,
    getShortlistDetails,
    requestCollegeAccess,
    getRequestedColleges,
    updateShortlistStatus,
    addShortlistNote,
    removeFromShortlist,
    logResumeView,
    getDownloadStatistics,
    bulkDownloadStudents
};
