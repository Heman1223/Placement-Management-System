const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required']
    },
    
    // Placement Drive Details
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College' // If present, this job is a placement drive for this college
    },
    isPlacementDrive: {
        type: Boolean,
        default: false
    },
    driveDate: Date,
    registrationEndDate: Date,

    // Job Details
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    requirements: [{
        type: String,
        trim: true
    }],
    type: {
        type: String,
        enum: ['internship', 'full_time', 'part_time', 'contract'],
        required: [true, 'Job type is required']
    },
    category: {
        type: String,
        trim: true // e.g., 'Software Development', 'Data Science', etc.
    },

    // Location & Work Mode
    locations: [{
        type: String,
        trim: true
    }],
    workMode: {
        type: String,
        enum: ['onsite', 'remote', 'hybrid'],
        default: 'onsite'
    },

    // Compensation
    salary: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'INR'
        },
        period: {
            type: String,
            enum: ['per_month', 'per_annum'],
            default: 'per_annum'
        }
    },
    stipend: {
        amount: Number,
        currency: {
            type: String,
            default: 'INR'
        }
    },

    // Duration (for internships)
    duration: {
        value: Number,
        unit: {
            type: String,
            enum: ['days', 'weeks', 'months']
        }
    },

    // Eligibility Criteria
    eligibility: {
        minCgpa: {
            type: Number,
            min: 0,
            max: 10,
            default: 0
        },
        maxBacklogs: {
            type: Number,
            default: 0
        },
        allowedDepartments: [{
            type: String,
            trim: true
        }],
        allowedBatches: [{
            type: Number
        }],
        minTenthPercentage: Number,
        minTwelfthPercentage: Number,
        requiredSkills: [{
            type: String,
            trim: true
        }],
        preferredSkills: [{
            type: String,
            trim: true
        }]
    },

    // Hiring Process
    hiringProcess: [{
        round: Number,
        name: String, // e.g., 'Online Test', 'Technical Interview'
        description: String
    }],
    expectedHires: Number,

    // Timeline
    applicationDeadline: {
        type: Date,
        required: [true, 'Application deadline is required']
    },
    joiningDate: Date,

    // Status
    status: {
        type: String,
        enum: ['draft', 'open', 'closed', 'filled', 'cancelled'],
        default: 'draft'
    },
    publishedAt: Date,
    closedAt: Date,

    // Statistics
    stats: {
        totalApplications: { type: Number, default: 0 },
        shortlisted: { type: Number, default: 0 },
        hired: { type: Number, default: 0 }
    },

    // Created by
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ status: 1, applicationDeadline: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ 'eligibility.allowedDepartments': 1 });
jobSchema.index({ 'eligibility.allowedBatches': 1 });
jobSchema.index({ title: 'text', description: 'text' });

// Virtual to check if job is active
jobSchema.virtual('isActive').get(function () {
    return this.status === 'open' && new Date() < this.applicationDeadline;
});

module.exports = mongoose.model('Job', jobSchema);
