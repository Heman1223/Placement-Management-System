const { ActivityLog, User } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Get activity logs (Super Admin - all, College Admin - college specific)
 * @route   GET /api/activity-logs
 * @access  Super Admin, College Admin
 */
const getActivityLogs = asyncHandler(async (req, res) => {
    const {
        action,
        targetModel,
        startDate,
        endDate,
        userId,
        page = 1,
        limit = 50
    } = req.query;

    const query = {};

    // If college admin, filter by college-related activities
    if (req.user.role === 'college_admin') {
        // Get students from their college
        const { Student } = require('../models');
        const collegeId = req.user.collegeProfile._id;
        const collegeStudents = await Student.find({ college: collegeId }).distinct('_id');
        
        query.$or = [
            { user: req.user._id }, // Their own actions
            { targetModel: 'Student', targetId: { $in: collegeStudents } } // Actions on their students
        ];
    }

    // Apply filters
    if (action) query.action = action;
    if (targetModel) query.targetModel = targetModel;
    if (userId) query.user = userId;
    
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        ActivityLog.find(query)
            .populate('user', 'email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        ActivityLog.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            logs,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }
    });
});

/**
 * @desc    Get activity log statistics
 * @route   GET /api/activity-logs/stats
 * @access  Super Admin, College Admin
 */
const getActivityStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const query = {};
    
    // If college admin, filter by college-related activities
    if (req.user.role === 'college_admin') {
        const { Student } = require('../models');
        const collegeId = req.user.collegeProfile._id;
        const collegeStudents = await Student.find({ college: collegeId }).distinct('_id');
        
        query.$or = [
            { user: req.user._id },
            { targetModel: 'Student', targetId: { $in: collegeStudents } }
        ];
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Aggregate by action type
    const actionStats = await ActivityLog.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // Aggregate by user
    const userStats = await ActivityLog.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$user',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    // Populate user details
    await User.populate(userStats, { path: '_id', select: 'email role' });

    // Activity over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const timelineQuery = { ...query, createdAt: { $gte: sevenDaysAgo } };
    
    const timeline = await ActivityLog.aggregate([
        { $match: timelineQuery },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({
        success: true,
        data: {
            actionStats,
            userStats,
            timeline,
            totalLogs: await ActivityLog.countDocuments(query)
        }
    });
});

/**
 * @desc    Get student access logs (who viewed a student)
 * @route   GET /api/activity-logs/student/:id
 * @access  College Admin
 */
const getStudentAccessLogs = asyncHandler(async (req, res) => {
    const { Student } = require('../models');
    const studentId = req.params.id;

    // Verify student belongs to college
    if (req.user.role === 'college_admin') {
        const student = await Student.findOne({
            _id: studentId,
            college: req.user.collegeProfile._id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found or access denied'
            });
        }
    }

    const logs = await ActivityLog.find({
        targetModel: 'Student',
        targetId: studentId,
        action: { $in: ['view_student', 'download_student_data', 'shortlist_student'] }
    })
        .populate('user', 'email role')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    res.json({
        success: true,
        data: logs
    });
});

/**
 * @desc    Export activity logs to CSV
 * @route   GET /api/activity-logs/export
 * @access  Super Admin, College Admin
 */
const exportActivityLogs = asyncHandler(async (req, res) => {
    const { formatActivityLogData, sendCSVResponse } = require('../utils/csvExporter');
    const { action, targetModel, startDate, endDate } = req.query;

    const query = {};

    // If college admin, filter by college-related activities
    if (req.user.role === 'college_admin') {
        const { Student } = require('../models');
        const collegeId = req.user.collegeProfile._id;
        const collegeStudents = await Student.find({ college: collegeId }).distinct('_id');
        
        query.$or = [
            { user: req.user._id },
            { targetModel: 'Student', targetId: { $in: collegeStudents } }
        ];
    }

    if (action) query.action = action;
    if (targetModel) query.targetModel = targetModel;
    
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(query)
        .populate('user', 'email role')
        .sort({ createdAt: -1 })
        .limit(1000) // Limit to prevent huge exports
        .lean();

    const formattedData = formatActivityLogData(logs);
    
    const filename = `activity_logs_${Date.now()}`;
    sendCSVResponse(res, formattedData, filename);
});

module.exports = {
    getActivityLogs,
    getActivityStats,
    getStudentAccessLogs,
    exportActivityLogs
};
