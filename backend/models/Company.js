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
    }]
}, {
    timestamps: true
});

// Indexes
companySchema.index({ type: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ isApproved: 1 });
companySchema.index({ name: 'text', industry: 'text' });

module.exports = mongoose.model('Company', companySchema);
