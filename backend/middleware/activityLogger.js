const { ActivityLog } = require('../models');

/**
 * Middleware to log user activities
 */
const logActivity = (action, targetModel = null) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;

        // Override send to log after successful response
        res.send = function (data) {
            // Only log on successful responses (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Log activity asynchronously (don't block response)
                setImmediate(async () => {
                    try {
                        const logData = {
                            user: req.user._id,
                            action,
                            ipAddress: req.ip || req.connection.remoteAddress,
                            userAgent: req.get('user-agent')
                        };

                        // Add target information if available
                        if (targetModel) {
                            logData.targetModel = targetModel;
                            logData.targetId = req.params.id || req.body._id;
                        }

                        // Add metadata based on action
                        if (action === 'download_student_data' || action === 'export_data') {
                            logData.metadata = {
                                filters: req.query,
                                count: req.exportCount || 0
                            };
                        }

                        await ActivityLog.create(logData);
                    } catch (error) {
                        console.error('Activity logging error:', error);
                    }
                });
            }

            // Call original send
            originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Get activity logs with filters
 */
const getActivityLogs = async (filters = {}, options = {}) => {
    const {
        user,
        action,
        targetModel,
        targetId,
        startDate,
        endDate,
        page = 1,
        limit = 50
    } = { ...filters, ...options };

    const query = {};

    if (user) query.user = user;
    if (action) query.action = action;
    if (targetModel) query.targetModel = targetModel;
    if (targetId) query.targetId = targetId;
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
            .limit(limit)
            .lean(),
        ActivityLog.countDocuments(query)
    ]);

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    logActivity,
    getActivityLogs
};
