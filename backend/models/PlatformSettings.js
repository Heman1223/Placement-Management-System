const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
    // Registration Controls
    studentSelfSignup: {
        enabled: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: true
        },
        allowedDomains: [String], // Email domains allowed for self-signup
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastModifiedAt: Date
    },

    agencyRegistration: {
        enabled: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: true
        },
        autoApprove: {
            type: Boolean,
            default: false
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastModifiedAt: Date
    },

    collegeRegistration: {
        enabled: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: true
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastModifiedAt: Date
    },

    companyRegistration: {
        enabled: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: true
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastModifiedAt: Date
    },

    // Approval Rules
    approvalRules: {
        autoApproveColleges: {
            type: Boolean,
            default: false
        },
        autoApproveCompanies: {
            type: Boolean,
            default: false
        },
        autoApproveStudents: {
            type: Boolean,
            default: false
        },
        autoApproveAgencies: {
            type: Boolean,
            default: false
        },
        requireEmailVerification: {
            type: Boolean,
            default: false
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastModifiedAt: Date
    },

    // Maintenance Mode
    maintenanceMode: {
        enabled: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: 'System is under maintenance. Please check back later.'
        },
        allowedRoles: [{
            type: String,
            enum: ['super_admin', 'college_admin', 'company', 'student'],
            default: ['super_admin']
        }],
        scheduledStart: Date,
        scheduledEnd: Date,
        enabledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        enabledAt: Date
    },

    // Data Visibility Policies
    dataVisibility: {
        // Student data visibility
        studentDataVisibleToCompanies: {
            type: Boolean,
            default: true
        },
        studentDataVisibleToAgencies: {
            type: Boolean,
            default: true
        },
        requireCollegeApprovalForAccess: {
            type: Boolean,
            default: false
        },
        
        // What fields are visible
        visibleFields: {
            contactInfo: {
                type: Boolean,
                default: true
            },
            academicDetails: {
                type: Boolean,
                default: true
            },
            resume: {
                type: Boolean,
                default: true
            },
            personalInfo: {
                type: Boolean,
                default: false
            }
        },

        // Download restrictions
        allowBulkDownload: {
            type: Boolean,
            default: true
        },
        maxDownloadsPerDay: {
            type: Number,
            default: 100
        },

        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastModifiedAt: Date
    },

    // Job Posting Controls
    jobPosting: {
        requireApproval: {
            type: Boolean,
            default: false
        },
        allowCompanies: {
            type: Boolean,
            default: true
        },
        allowAgencies: {
            type: Boolean,
            default: true
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastModifiedAt: Date
    },

    // Notification Settings
    notifications: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        newRegistrationAlert: {
            type: Boolean,
            default: true
        },
        jobPostingAlert: {
            type: Boolean,
            default: false
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastModifiedAt: Date
    },

    // System Info
    version: {
        type: String,
        default: '1.0.0'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
platformSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
