const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'view_student',
            'download_student_data',
            'shortlist_student',
            'invite_student',
            'approve_college',
            'approve_company',
            'bulk_upload',
            'export_data',
            'update_student',
            'delete_student',
            'post_job',
            'update_job',
            'view_resume'
        ]
    },
    targetModel: {
        type: String,
        enum: ['Student', 'College', 'Company', 'Job', 'Application']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed // Additional context data
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

// Indexes for efficient querying
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ targetModel: 1, targetId: 1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
