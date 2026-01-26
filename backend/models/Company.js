const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['company', 'placement_agency'],
        required: [true, 'Company type is required']
    },
    industry: {
        type: String,
        required: [true, 'Industry is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    logo: {
        type: String // URL to logo image
    },

    // Contact Information
    contactPerson: {
        name: {
            type: String,
            required: [true, 'Contact person name is required']
        },
        designation: String,
        email: {
            type: String,
            required: [true, 'Contact email is required'],
            lowercase: true
        },
        phone: {
            type: String,
            required: [true, 'Contact phone is required']
        }
    },

    // Address
    headquarters: {
        city: String,
        state: String,
        country: {
            type: String,
            default: 'India'
        }
    },

    // Company details
    size: {
        type: String,
        enum: ['1-50', '51-200', '201-500', '501-1000', '1000+']
    },
    foundedYear: Number,

    // User account reference
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Approval status
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedAt: Date,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Rejection tracking
    isRejected: {
        type: Boolean,
        default: false
    },
    rejectedAt: Date,
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String,
        trim: true
    },


    // Active/Blocked status
    isActive: {
        type: Boolean,
        default: true
    },
    blockedAt: Date,
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    blockReason: String,

    // Suspension
    isSuspended: {
        type: Boolean,
        default: false
    },
    suspendedAt: Date,
    suspendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    suspensionReason: String,
    suspensionEndDate: Date,

    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // College Access Control (for placement drives)
    collegeAccess: [{
        college: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College'
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        },
        respondedAt: Date,
        remarks: String
    }],

    // Download tracking for all companies
    downloadTracking: {
        dailyLimit: {
            type: Number,
            default: 50 // Daily resume download limit
        },
        monthlyLimit: {
            type: Number,
            default: 500 // Monthly resume download limit
        },
        dailyCount: {
            type: Number,
            default: 0
        },
        monthlyCount: {
            type: Number,
            default: 0
        },
        lastDailyReset: {
            type: Date,
            default: Date.now
        },
        lastMonthlyReset: {
            type: Date,
            default: Date.now
        },
        totalDownloads: {
            type: Number,
            default: 0
        }
    },

    // Download history
    downloadHistory: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        downloadType: {
            type: String,
            enum: ['resume', 'profile_data', 'csv_export']
        },
        downloadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        downloadedAt: {
            type: Date,
            default: Date.now
        },
        metadata: mongoose.Schema.Types.Mixed
    }],

    // Statistics
    stats: {
        totalJobsPosted: { type: Number, default: 0 },
        activeJobs: { type: Number, default: 0 },
        totalHires: { type: Number, default: 0 }
    },

    // Preferences
    preferredDepartments: [String],
    preferredColleges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College'
    }],

    // Saved Search Filters
    savedSearchFilters: [{
        name: {
            type: String,
            required: true
        },
        filters: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
companySchema.index({ type: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ isApproved: 1 });
companySchema.index({ isRejected: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ isSuspended: 1 });
companySchema.index({ isDeleted: 1 });
companySchema.index({ name: 'text', industry: 'text' });

// Query helper to exclude soft-deleted records by default
companySchema.query.notDeleted = function() {
    return this.where({ isDeleted: false });
};

module.exports = mongoose.model('Company', companySchema);
