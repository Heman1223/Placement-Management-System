const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student is required']
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true, 'Job is required']
    },

    // Application Status
    status: {
        type: String,
        enum: [
            'applied',
            'under_review',
            'shortlisted',
            'interview_scheduled',
            'interviewed',
            'offered',
            'offer_accepted',
            'hired',
            'rejected',
            'withdrawn'
        ],
        default: 'applied'
    },

    // Status History for tracking
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        remarks: String
    }],

    // Interview Details
    interviews: [{
        round: Number,
        scheduledAt: Date,
        mode: {
            type: String,
            enum: ['online', 'in_person', 'phone']
        },
        location: String,
        meetingLink: String,
        feedback: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        result: {
            type: String,
            enum: ['passed', 'failed', 'pending']
        }
    }],

    // Offer Details
    offer: {
        package: Number, // In LPA
        role: String,
        joiningDate: Date,
        offerLetterUrl: String,
        offeredAt: Date,
        respondedAt: Date,
        response: {
            type: String,
            enum: ['accepted', 'rejected', 'pending']
        }
    },

    // Notes & Remarks
    companyNotes: String, // Internal notes by company
    studentNotes: String, // Notes by student

    // Resume snapshot (at time of application)
    resumeSnapshot: {
        url: String,
        cgpa: Number,
        skills: [String]
    },

    // Timestamps
    appliedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound unique index - one student can apply once per job
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

// Other indexes
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });

// Pre-save hook to add status to history
applicationSchema.pre('save', async function () {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
            changedBy: this.lastUpdatedBy || null
        });
    }
});

module.exports = mongoose.model('Application', applicationSchema);
