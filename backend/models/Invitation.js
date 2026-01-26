const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    message: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['sent', 'viewed', 'accepted', 'declined'],
        default: 'sent'
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    viewedAt: Date,
    respondedAt: Date
}, {
    timestamps: true
});

// Compound index to prevent duplicate invitations
invitationSchema.index({ student: 1, job: 1, company: 1 }, { unique: true });
invitationSchema.index({ company: 1, status: 1 });
invitationSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
