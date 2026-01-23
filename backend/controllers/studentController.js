const { Student, Job, Application, Notification, User } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Get student dashboard stats
 * @route   GET /api/student/stats
 * @access  Private (Student)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user._id });
    
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    const [applications, eligibleJobs] = await Promise.all([
        Application.countDocuments({ student: student._id }),
        Job.countDocuments({
            status: 'open',
            applicationDeadline: { $gte: new Date() },
            'eligibility.allowedDepartments': student.department,
            'eligibility.allowedBatches': student.batch,
            'eligibility.minCgpa': { $lte: student.cgpa || 0 }
        })
    ]);

    const applicationStats = await Application.aggregate([
        { $match: { student: student._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = {
        totalApplications: applications,
        eligibleJobs,
        profileCompleteness: calculateProfileCompleteness(student),
        applicationsByStatus: applicationStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {})
    };

    res.json({
        success: true,
        data: stats
    });
});

/**
 * @desc    Get student profile
 * @route   GET /api/student/profile
 * @access  Private (Student)
 */
const getProfile = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user._id })
        .populate('college', 'name code city state')
        .lean();

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    student.profileCompleteness = calculateProfileCompleteness(student);

    res.json({
        success: true,
        data: student
    });
});

/**
 * @desc    Update student profile
 * @route   PUT /api/student/profile
 * @access  Private (Student)
 */
const updateProfile = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    // Fields that can be updated by student
    const allowedFields = [
        'phone', 'dateOfBirth', 'gender',
        'cgpa', 'percentage', 'backlogs',
        'education', 'skills', 'certifications', 'projects',
        'resumeUrl', 'portfolioUrl', 'linkedinUrl', 'githubUrl',
        'placementStatus', 'placementDetails'
    ];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            student[field] = req.body[field];
        }
    });

    await student.save();

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: student
    });
});

/**
 * @desc    Get eligible jobs for student
 * @route   GET /api/student/jobs
 * @access  Private (Student)
 */
const getEligibleJobs = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    const { page = 1, limit = 10, type, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {
        status: 'open',
        applicationDeadline: { $gte: new Date() },
        $or: [
            { isPlacementDrive: { $ne: true } },
            { isPlacementDrive: true, college: student.college }
        ],
        'eligibility.allowedDepartments': student.department,
        'eligibility.allowedBatches': student.batch,
        'eligibility.minCgpa': { $lte: student.cgpa || 0 },
        'eligibility.maxBacklogs': { $gte: student.backlogs?.active || 0 }
    };

    if (type) query.type = type;
    if (search) {
        query.$text = { $search: search };
    }

    const [jobs, total] = await Promise.all([
        Job.find(query)
            .populate('company', 'name logo industry')
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Job.countDocuments(query)
    ]);

    // Check which jobs student has applied to
    const appliedJobIds = await Application.find({
        student: student._id,
        job: { $in: jobs.map(j => j._id) }
    }).distinct('job');

    jobs.forEach(job => {
        job.hasApplied = appliedJobIds.some(id => id.equals(job._id));
    });

    res.json({
        success: true,
        data: jobs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

/**
 * @desc    Apply for a job
 * @route   POST /api/student/jobs/:id/apply
 * @access  Private (Student)
 */
const applyForJob = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    if (!student.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Your profile must be verified by college admin before applying'
        });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }

    if (job.status !== 'open') {
        return res.status(400).json({
            success: false,
            message: 'This job is no longer accepting applications'
        });
    }

    if (new Date() > job.applicationDeadline) {
        return res.status(400).json({
            success: false,
            message: 'Application deadline has passed'
        });
    }

    // Check eligibility
    if (!job.eligibility.allowedDepartments.includes(student.department)) {
        return res.status(403).json({
            success: false,
            message: 'You are not eligible for this job (department mismatch)'
        });
    }

    if (!job.eligibility.allowedBatches.includes(student.batch)) {
        return res.status(403).json({
            success: false,
            message: 'You are not eligible for this job (batch mismatch)'
        });
    }

    if (student.cgpa < job.eligibility.minCgpa) {
        return res.status(403).json({
            success: false,
            message: `Minimum CGPA required: ${job.eligibility.minCgpa}`
        });
    }

    // Check Backlogs
    if (job.eligibility.maxBacklogs !== undefined) {
        const studentBacklogs = student.backlogs?.active || 0;
        if (studentBacklogs > job.eligibility.maxBacklogs) {
            return res.status(403).json({
                success: false,
                message: `Too many active backlogs. Maximum allowed: ${job.eligibility.maxBacklogs}`
            });
        }
    }

    // Check Placement Drive Restriction
    if (job.isPlacementDrive && job.college) {
        if (student.college.toString() !== job.college.toString()) {
            return res.status(403).json({
                success: false,
                message: 'This placement drive is restricted to students of specific college'
            });
        }
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
        student: student._id,
        job: job._id
    });

    if (existingApplication) {
        return res.status(400).json({
            success: false,
            message: 'You have already applied for this job'
        });
    }

    // Create application
    const application = await Application.create({
        student: student._id,
        job: job._id,
        resumeSnapshot: {
            url: student.resumeUrl,
            cgpa: student.cgpa,
            skills: student.skills
        },
        lastUpdatedBy: req.user._id
    });

    // Update job stats
    await Job.findByIdAndUpdate(job._id, {
        $inc: { 'stats.totalApplications': 1 }
    });

    res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
    });
});

/**
 * @desc    Get student applications
 * @route   GET /api/student/applications
 * @access  Private (Student)
 */
const getApplications = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { student: student._id };
    if (status) query.status = status;

    const [applications, total] = await Promise.all([
        Application.find(query)
            .populate('job', 'title type company applicationDeadline')
            .populate({
                path: 'job',
                populate: { path: 'company', select: 'name logo' }
            })
            .sort({ appliedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Application.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: applications,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

/**
 * @desc    Get notifications
 * @route   GET /api/student/notifications
 * @access  Private (Student)
 */
const getNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (page - 1) * limit;

    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Notification.countDocuments(query),
        Notification.countDocuments({ recipient: req.user._id, isRead: false })
    ]);

    res.json({
        success: true,
        data: notifications,
        unreadCount,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/student/notifications/:id/read
 * @access  Private (Student)
 */
const markNotificationRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user._id },
        { isRead: true, readAt: new Date() },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: 'Notification not found'
        });
    }

    res.json({
        success: true,
        data: notification
    });
});

/**
 * Calculate profile completeness percentage
 */
function calculateProfileCompleteness(student) {
    const fields = {
        basic: ['name.firstName', 'name.lastName', 'email', 'phone', 'dateOfBirth', 'gender'],
        academic: ['department', 'batch', 'rollNumber', 'cgpa'],
        education: ['education.tenth.percentage', 'education.twelfth.percentage'],
        skills: ['skills'],
        resume: ['resumeUrl'],
        projects: ['projects'],
        certifications: ['certifications']
    };

    let completed = 0;
    let total = 0;

    Object.values(fields).forEach(fieldGroup => {
        fieldGroup.forEach(field => {
            total++;
            const value = field.split('.').reduce((obj, key) => obj?.[key], student);
            if (value && (Array.isArray(value) ? value.length > 0 : true)) {
                completed++;
            }
        });
    });

    return Math.round((completed / total) * 100);
}

module.exports = {
    getDashboardStats,
    getProfile,
    updateProfile,
    getEligibleJobs,
    applyForJob,
    getApplications,
    getNotifications,
    markNotificationRead
};
