const { Notification } = require('../models');

/**
 * Create a notification
 */
const createNotification = async (data) => {
    try {
        const notification = await Notification.create(data);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Create multiple notifications
 */
const createBulkNotifications = async (notifications) => {
    try {
        return await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
        throw error;
    }
};

/**
 * Notification templates
 */
const notificationTemplates = {
    accountApproved: (role) => ({
        type: 'account_approved',
        title: 'Account Approved',
        message: `Your ${role} account has been approved. You can now access the platform.`,
        priority: 'high'
    }),
    
    accountRejected: (role, reason) => ({
        type: 'account_rejected',
        title: 'Account Rejected',
        message: `Your ${role} account has been rejected. ${reason || ''}`,
        priority: 'high'
    }),
    
    studentVerified: () => ({
        type: 'student_verified',
        title: 'Profile Verified',
        message: 'Your student profile has been verified by your college admin.',
        priority: 'medium'
    }),
    
    jobPosted: (jobTitle) => ({
        type: 'job_posted',
        title: 'New Job Posted',
        message: `A new job opportunity for ${jobTitle} has been posted.`,
        priority: 'medium'
    }),
    
    applicationStatus: (jobTitle, status) => ({
        type: 'application_status',
        title: 'Application Status Update',
        message: `Your application for ${jobTitle} has been ${status}.`,
        priority: 'high'
    }),
    
    shortlisted: (companyName, jobTitle) => ({
        type: 'shortlisted',
        title: 'You\'ve Been Shortlisted!',
        message: `${companyName} has shortlisted you for ${jobTitle}.`,
        priority: 'high'
    }),
    
    interviewScheduled: (jobTitle, date) => ({
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Your interview for ${jobTitle} has been scheduled for ${date}.`,
        priority: 'high'
    }),
    
    offerReceived: (companyName, jobTitle) => ({
        type: 'offer_received',
        title: 'Job Offer Received',
        message: `Congratulations! You have received an offer from ${companyName} for ${jobTitle}.`,
        priority: 'high'
    }),
    
    profileIncomplete: (percentage) => ({
        type: 'profile_incomplete',
        title: 'Complete Your Profile',
        message: `Your profile is ${percentage}% complete. Complete it to increase your chances.`,
        priority: 'low'
    })
};

/**
 * Send notification to user
 */
const notifyUser = async (userId, template, additionalData = {}) => {
    const notification = {
        recipient: userId,
        ...template,
        ...additionalData
    };
    
    return await createNotification(notification);
};

/**
 * Send notification to multiple users
 */
const notifyMultipleUsers = async (userIds, template, additionalData = {}) => {
    const notifications = userIds.map(userId => ({
        recipient: userId,
        ...template,
        ...additionalData
    }));
    
    return await createBulkNotifications(notifications);
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
    return await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
    );
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
    return await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
    );
};

/**
 * Get unread count for user
 */
const getUnreadCount = async (userId) => {
    return await Notification.countDocuments({
        recipient: userId,
        isRead: false
    });
};

module.exports = {
    createNotification,
    createBulkNotifications,
    notificationTemplates,
    notifyUser,
    notifyMultipleUsers,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};
