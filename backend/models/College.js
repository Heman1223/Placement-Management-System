const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'College name is required'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'College code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    university: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        pincode: String,
        country: {
            type: String,
            default: 'India'
        }
    },
    contactEmail: {
        type: String,
        required: [true, 'Contact email is required'],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    website: {
        type: String,
        trim: true
    },
    logo: {
        type: String // URL to logo image
    },
    // Admin user reference
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Approval & verification
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Active status
    isActive: {
        type: Boolean,
        default: true
    },
    deactivatedAt: {
        type: Date
    },
    deactivatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Statistics (will be updated via aggregation)
    stats: {
        totalStudents: { type: Number, default: 0 },
        verifiedStudents: { type: Number, default: 0 },
        placedStudents: { type: Number, default: 0 }
    },
    // Departments offered
    departments: [{
        type: String,
        trim: true
    }],
    // Description
    description: {
        type: String,
        trim: true
    },
    // College-specific settings
    settings: {
        // Allow students to self-register
        allowStudentSelfSignup: {
            type: Boolean,
            default: false
        },
        // Placement rules
        placementRules: {
            minCGPA: {
                type: Number,
                default: 6.0,
                min: 0,
                max: 10
            },
            maxActiveBacklogs: {
                type: Number,
                default: 2,
                min: 0
            },
            allowMultipleOffers: {
                type: Boolean,
                default: true
            },
            requireResumeUpload: {
                type: Boolean,
                default: true
            }
        }
    }
}, {
    timestamps: true
});

// Indexes
collegeSchema.index({ code: 1 });
collegeSchema.index({ isVerified: 1 });
collegeSchema.index({ isActive: 1 });
collegeSchema.index({ isDeleted: 1 });
collegeSchema.index({ 'address.city': 1, 'address.state': 1 });

// Query helper to exclude soft-deleted records by default
collegeSchema.query.notDeleted = function() {
    return this.where({ isDeleted: false });
};

module.exports = mongoose.model('College', collegeSchema);
