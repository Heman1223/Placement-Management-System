const mongoose = require('mongoose');
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
    const companyJobIds = await Job.find({ company: companyId, isDeleted: { $ne: true } }).distinct('_id');

    // Get basic stats
    const [
        totalJobs,
        activeJobs,
        totalApplications,
        shortlisted,
        hired,
        company
    ] = await Promise.all([
        Job.countDocuments({ company: companyId, isDeleted: { $ne: true } }),
        Job.countDocuments({ company: companyId, status: 'open', isDeleted: { $ne: true } }),
        Application.countDocuments({ job: { $in: companyJobIds } }),
        Application.countDocuments({ job: { $in: companyJobIds }, status: 'shortlisted' }),
        Application.countDocuments({ job: { $in: companyJobIds }, status: 'hired' }),
        Company.findById(companyId).populate({
            path: 'collegeAccess.college',
            select: 'name logo university code city state'
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
        approvedColleges = await College.countDocuments({ isVerified: true, isActive: true, isDeleted: { $ne: true } });
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

    // Hiring Funnel (Applied -> Shortlisted -> Interviewed -> Selected)
    const hiringFunnel = await Application.aggregate([
        { $match: { job: { $in: companyJobIds } } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // College-wise Activity Snapshot
    const collegeActivity = await Application.aggregate([
        { $match: { job: { $in: companyJobIds } } },
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
                applications: { $sum: 1 },
                shortlisted: {
                    $sum: { $cond: [{ $in: ['$status', ['shortlisted', 'interviewed', 'offered', 'hired']] }, 1, 0] }
                },
                selections: {
                    $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] }
                }
            }
        },
        { $sort: { applications: -1 } },
        { $limit: 10 }
    ]);

    // Recent jobs
    const recentJobs = await Job.find({ company: companyId, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title type status stats applicationDeadline');

    // Registered Jobs (applications by Job and College)
    const registeredJobsData = await Application.aggregate([
        { $match: { job: { $in: companyJobIds } } },
        {
            $lookup: {
                from: 'jobs',
                localField: 'job',
                foreignField: '_id',
                as: 'jobData'
            }
        },
        { $unwind: '$jobData' },
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
                _id: { job: '$jobData.title', college: '$collegeData.name' },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

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
            registeredJobs: registeredJobsData.map(item => ({
                jobName: item._id.job,
                collegeName: item._id.college,
                count: item.count
            })),
            hiringFunnel: hiringFunnel.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            collegeActivity,
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
    const query = { 
        isVerified: true
    };

    // Filter by approved colleges only
    if (company.type === 'placement_agency') {
        const allowedCollegeIds = company.collegeAccess
            ?.filter(ca => ca.status === 'approved')
            .map(ca => ca.college) || [];
            
        if (allowedCollegeIds.length > 0) {
            query.college = { $in: allowedCollegeIds };
        } else {
            return res.json({
                success: true,
                data: {
                    students: [],
                    pagination: { current: 1, pages: 0, total: 0 }
                }
            });
        }
    } else {
        const approvedCollegeIds = company.collegeAccess
            ?.filter(ca => ca.status === 'approved')
            .map(ca => ca.college.toString()) || [];

        const eligibleColleges = await College.find({
            isVerified: true,
            isActive: true,
            $or: [
                { 'settings.placementRules.showDataWithoutApproval': true },
                { _id: { $in: approvedCollegeIds } },
                { 'settings.placementRules.showDataWithoutApproval': { $exists: false } }
            ]
        }).distinct('_id');

        query.college = { $in: eligibleColleges };
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
        query.college = new mongoose.Types.ObjectId(college);
    }

    // Experience filter
    if (experience === 'internship') {
        query['internships.0'] = { $exists: true };
    } else if (experience === 'projects') {
        query['projects.0'] = { $exists: true };
    }

    // Keyword search
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

    // Use aggregation to find registered jobs for this company
    const pipeline = [
        { $match: query },
        {
            $lookup: {
                from: 'applications',
                let: { studentId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$student', '$$studentId'] }
                        }
                    },
                    {
                        $lookup: {
                            from: 'jobs',
                            localField: 'job',
                            foreignField: '_id',
                            as: 'jobData'
                        }
                    },
                    { $unwind: '$jobData' },
                    {
                        $match: {
                            'jobData.company': companyId
                        }
                    },
                    { $project: { 'jobData.title': 1, 'jobData._id': 1 } }
],
                as: 'registrations'
            }
        },
        {
            $lookup: {
                from: 'invitations',
                let: { studentId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$student', '$$studentId'] },
                                    { $eq: ['$company', companyId] }
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'jobs',
                            localField: 'job',
                            foreignField: '_id',
                            as: 'jobData'
                        }
                    },
                    { $unwind: '$jobData' },
                    { $project: { 'jobData.title': 1, 'jobData._id': 1, status: 1 } }
                ],
                as: 'invitations'
            }
        },
        {
            $addFields: {
                registeredJob: { $arrayElemAt: ['$registrations.jobData.title', 0] },
                registeredJobId: { $arrayElemAt: ['$registrations.jobData._id', 0] },
                hasInvitation: { $gt: [{ $size: '$invitations' }, 0] },
                invitationJob: { $arrayElemAt: ['$invitations.jobData.title', 0] },
                invitationJobId: { $arrayElemAt: ['$invitations.jobData._id', 0] }
            }
        },
        {
            $lookup: {
                from: 'colleges',
                localField: 'college',
                foreignField: '_id',
                as: 'college'
            }
        },
        { $unwind: '$college' },
        { 
            $project: { 
                name: 1, email: 1, department: 1, batch: 1, cgpa: 1, skills: 1, 
                placementStatus: 1, resumeUrl: 1, linkedinUrl: 1, githubUrl: 1, 
                phone: 1, profilePicture: 1, profileCompleteness: 1, registeredJob: 1, registeredJobId: 1,
                college: { name: 1, code: 1, city: 1, state: 1, logo: 1, university: 1 }
            } 
        },
        { $sort: { [sortBy]: sortOrder } },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [{ $skip: skip }, { $limit: parseInt(limit) }]
            }
        }
    ];

    const results = await Student.aggregate(pipeline);
    const students = results[0].data;
    const total = results[0].metadata[0]?.total || 0;

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
        .populate('college', 'name code city state logo university');

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    // Get applications from this student for THIS company
    const applications = await Application.find({
        student: student._id,
        job: { $in: await Job.find({ company: companyId }).distinct('_id') }
    }).populate('job', 'title type status');

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
        data: {
            ...student.toObject(),
            applications: applications.map(app => ({
                id: app._id,
                jobId: app.job?._id,
                jobTitle: app.job?.title,
                status: app.status,
                appliedAt: app.createdAt
            }))
        }
    });
});

/**
 * @desc    Shortlist a student for a job
 * @route   POST /api/company/shortlist
 * @access  Company (Approved)
 */
const shortlistStudent = asyncHandler(async (req, res) => {
    let { studentId, jobId, notes } = req.body;
    const companyId = req.user.companyProfile._id;

    // Validate IDs
    if (!studentId || !jobId) {
        return res.status(400).json({
            success: false,
            message: 'Student ID and Job ID are required'
        });
    }

    // STRICT CHECK: Student MUST have applied for this specific job
    const application = await Application.findOne({
        student: studentId,
        job: jobId
    });

    if (!application) {
        return res.status(400).json({
            success: false,
            message: 'Candidate must be registered for this job drive before they can be shortlisted for the selection pipeline.'
        });
    }

    // Verify job belongs to company
    const job = await Job.findOne({ _id: jobId, company: companyId });
    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job drive not found or access denied'
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

    // Prevent duplicate shortlisting
    if (application.status === 'shortlisted') {
        return res.status(400).json({
            success: false,
            message: 'Student is already shortlisted for this job'
        });
    }

    // Update application to shortlisted
    application.status = 'shortlisted';
    application.companyNotes = notes || '';
    application.lastUpdatedBy = req.userId;
    await application.save();

    // Update job stats if this is the first time they are being shortlisted
    await Job.findByIdAndUpdate(jobId, {
        $inc: { 'stats.shortlisted': 1 }
    });

    // Update student status if not placed
    if (student.placementStatus === 'not_placed') {
        await Student.findByIdAndUpdate(studentId, {
            placementStatus: 'in_process'
        });
    }

    res.json({
        success: true,
        message: 'Student shortlisted successfully'
    });
});

/**
 * @desc    Invite a student to register for a job drive
 * @route   POST /api/company/students/:id/invite
 * @access  Company (Approved)
 */
const inviteToRegister = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { jobId, message } = req.body;
    const { Notification, Student, Job, ActivityLog, User, Invitation, Application } = require('../models');
    const companyId = req.user.companyProfile._id;

    if (!jobId) {
        return res.status(400).json({
            success: false,
            message: 'Job ID is required'
        });
    }

    const [student, job] = await Promise.all([
        Student.findById(id),
        Job.findOne({ _id: jobId, company: companyId })
    ]);

    if (!student || !job) {
        return res.status(404).json({
            success: false,
            message: 'Student or Job not found'
        });
    }

    // Check if student has already applied or been shortlisted for this job
    const existingApplication = await Application.findOne({
        student: id,
        job: jobId
    });

    if (existingApplication) {
        return res.status(400).json({
            success: false,
            message: 'This student has already registered for this job drive'
        });
    }

    // Check if invitation already sent
    const existingInvitation = await Invitation.findOne({
        student: id,
        job: jobId,
        company: companyId
    });

    if (existingInvitation) {
        return res.status(400).json({
            success: false,
            message: 'Recruitment offer already sent to this student for this job'
        });
    }

    // Find the user account linked to this student
    const studentUser = await User.findOne({ studentProfile: id });
    
    if (!studentUser) {
        return res.status(404).json({
            success: false,
            message: 'Student user account not found'
        });
    }

    // Create invitation record
    await Invitation.create({
        student: id,
        job: jobId,
        company: companyId,
        message: message,
        sentBy: req.userId
    });

    // Create notification for the student
    await Notification.create({
        recipient: studentUser._id,
        type: 'system_announcement',
        title: `Recruitment Offer: ${job.title}`,
        message: message || `${req.user.companyProfile.name} thinks you're a great fit for the ${job.title} role! Click to view details and register.`,
        link: `/student/jobs/${jobId}`,
        relatedModel: 'Job',
        relatedId: jobId,
        priority: 'high'
    });

    // Log the invitation as an activity
    await ActivityLog.create({
        user: req.userId,
        action: 'invite_student',
        targetModel: 'Student',
        targetId: id,
        metadata: { jobTitle: job.title, jobId: jobId }
    });

    res.json({
        success: true,
        message: 'Recruitment offer sent successfully'
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

        // Get company name
        const hiringCompany = await Company.findById(application.job.company);
        
        // Update student placement status
        await Student.findByIdAndUpdate(application.student, {
            placementStatus: 'placed',
            'placementDetails.company': hiringCompany ? hiringCompany.name : 'Unknown Company',
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
 * @desc    Get company profile
 * @route   GET /api/company/profile
 * @access  Company
 */
const getProfile = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const company = await Company.findById(companyId);

    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    res.json({
        success: true,
        data: company
    });
});

/**
 * @desc    Get all verified colleges for filter dropdown
 * @route   GET /api/company/colleges
 * @access  Company (Approved)
 */
const getColleges = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const company = await Company.findById(companyId);

    const colleges = await College.find({ isVerified: true })
        .select('name code city state logo university settings.placementRules.showDataWithoutApproval')
        .sort({ name: 1 })
        .lean();

    // Add access status to each college
    const collegesWithStatus = colleges.map(college => {
        const access = company.collegeAccess?.find(ca => ca.college.toString() === college._id.toString());
        
        // Determine visibility based on setting
        const showDataWithoutApproval = college.settings?.placementRules?.showDataWithoutApproval !== false; // Default true
        
        return {
            ...college,
            accessStatus: access ? access.status : 'none', // none, pending, approved, rejected
            isLocked: !showDataWithoutApproval && (!access || access.status !== 'approved')
        };
    });

    res.json({
        success: true,
        data: collegesWithStatus
    });
});

/**
 * @desc    Request access to a college
 * @route   POST /api/company/request-access
 * @access  Company (Approved)
 */
const requestCollegeAccess = asyncHandler(async (req, res) => {
    const { collegeId } = req.body;
    const companyId = req.user.companyProfile._id;

    if (!collegeId) {
        return res.status(400).json({
            success: false,
            message: 'College ID is required'
        });
    }

    const company = await Company.findById(companyId);

    // Check if request already exists
    const existingAccess = company.collegeAccess?.find(ca => ca.college.toString() === collegeId);
    if (existingAccess) {
        return res.status(400).json({
            success: false,
            message: `Request already exists with status: ${existingAccess.status}`
        });
    }

    // Add request
    company.collegeAccess = company.collegeAccess || [];
    company.collegeAccess.push({
        college: collegeId,
        status: 'pending',
        requestedAt: new Date()
    });

    await company.save();

    res.json({
        success: true,
        message: 'Partnership request sent successfully',
        data: {
            collegeId,
            status: 'pending'
        }
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

/**
 * @desc    Get star students for company dashboard
 * @route   GET /api/company/star-students
 * @access  Company (Approved)
 */
const getStarStudents = asyncHandler(async (req, res) => {
    const { Student, College } = require('../models');
    const companyId = req.user.companyProfile._id;
    
    // Get all star students (not filtered by college access for showcase purposes)
    const starStudents = await Student.find({
        isStarStudent: true,
        isRejected: false,
        isDeleted: { $ne: true }
    })
    .populate('college', 'name logo city state')
    .select('name email department batch cgpa skills profilePicture resumeUrl linkedinUrl githubUrl')
    .limit(20)
    .sort({ starredAt: -1 });

    res.json({
        success: true,
        data: starStudents
    });
});

/**
 * @desc    Get all applications (registrations) across all jobs for company
 * @route   GET /api/company/applications
 * @access  Company (Approved)
 */
const getApplications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, search } = req.query;
    const companyId = req.user.companyProfile._id;
    const skip = (page - 1) * limit;

    // Get all job IDs belonging to this company
    const jobIds = await Job.find({ company: companyId, isDeleted: { $ne: true } }).distinct('_id');

    const query = { job: { $in: jobIds } };
    if (status) query.status = status;

    // Base pipeline for search and population
    const pipeline = [
        { $match: query },
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
                from: 'jobs',
                localField: 'job',
                foreignField: '_id',
                as: 'jobData'
            }
        },
        { $unwind: '$jobData' }
    ];

    // Apply search if provided
    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { 'studentData.name.firstName': { $regex: search, $options: 'i' } },
                    { 'studentData.name.lastName': { $regex: search, $options: 'i' } },
                    { 'studentData.email': { $regex: search, $options: 'i' } },
                    { 'jobData.title': { $regex: search, $options: 'i' } }
                ]
            }
        });
    }

    // Sorting and Pagination
    pipeline.push(
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [{ $skip: skip }, { $limit: parseInt(limit) }]
            }
        }
    );

    const results = await Application.aggregate(pipeline);
    const applications = results[0].data;
    const total = results[0].metadata[0]?.total || 0;

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

module.exports = {
    getDashboardStats,
    searchStudents,
    getStudentProfile,
    shortlistStudent,
    inviteToRegister,
    updateApplicationStatus,
    getApplications,
    getShortlistedCandidates,
    getProfile,
    updateProfile,
    getColleges,
    exportShortlist,
    saveSearchFilter,
    getSavedSearchFilters,
    deleteSearchFilter,
    requestCollegeAccess,
    getShortlistDetails,
    getRequestedColleges,
    updateShortlistStatus,
    addShortlistNote,
    removeFromShortlist,
    logResumeView,
    getDownloadStatistics,
    bulkDownloadStudents,
    getStarStudents
};
