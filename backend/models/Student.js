const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Personal Information
    name: {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },

    // Academic Information
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: [true, 'College is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    course: {
        type: String,
        trim: true
        // e.g., B.Tech, M.Tech, MBA, MCA, B.Sc, M.Sc, etc.
    },
    batch: {
        type: Number,
        required: [true, 'Batch year is required']
    },
    admissionYear: {
        type: Number
    },
    section: {
        type: String,
        trim: true
    },
    rollNumber: {
        type: String,
        required: [true, 'Roll number is required'],
        trim: true
    },
    cgpa: {
        type: Number,
        min: [0, 'CGPA cannot be negative'],
        max: [10, 'CGPA cannot exceed 10']
    },
    percentage: {
        type: Number,
        min: [0, 'Percentage cannot be negative'],
        max: [100, 'Percentage cannot exceed 100']
    },
    backlogs: {
        active: { type: Number, default: 0 },
        history: { type: Number, default: 0 }
    },
    
    // Contact & Location
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    
    // Enrollment Status
    enrollmentStatus: {
        type: String,
        enum: ['active', 'passed_out', 'on_hold', 'dropped'],
        default: 'active'
    },
    
    // Placement Eligibility
    placementEligible: {
        type: Boolean,
        default: true
    },

    // Education History
    education: {
        tenth: {
            board: String,
            percentage: Number,
            yearOfPassing: Number
        },
        twelfth: {
            board: String,
            stream: String,
            percentage: Number,
            yearOfPassing: Number
        },
        diploma: {
            branch: String,
            percentage: Number,
            yearOfPassing: Number
        }
    },

    // Skills & Certifications
    skills: [{
        type: String,
        trim: true
    }],
    certifications: [{
        name: String,
        issuer: String,
        issueDate: Date,
        credentialUrl: String,
        fileUrl: String // Added for PDF uploads
    }],
    about: {
        type: String,
        trim: true,
        maxLength: [1000, 'About section cannot exceed 1000 characters']
    },

    // Projects
    projects: [{
        title: String,
        description: String,
        technologies: [String],
        projectUrl: String,
        githubUrl: String
    }],

    // Links & Resume
    resumeUrl: String,
    portfolioUrl: String,
    linkedinUrl: String,
    githubUrl: String,
    profilePicture: String,

    // Placement Status
    placementStatus: {
        type: String,
        enum: ['not_placed', 'in_process', 'placed', 'not_interested', 'higher_studies'],
        default: 'not_placed'
    },
    isShortlisted: {
        type: Boolean,
        default: false
    },
    placementDetails: {
        company: String,
        role: String,
        package: Number, // In LPA
        joiningDate: Date,
        offerLetterUrl: String
    },

    // User account reference (if student has login)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Verification by college
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Rejection by college
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

    // Metadata
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    source: {
        type: String,
        enum: ['manual', 'bulk_upload', 'self_registration'],
        default: 'manual'
    },
    
    // Star Student Feature
    isStarStudent: {
        type: Boolean,
        default: false
    },
    starredAt: Date,
    starredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Soft Delete
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
    }

}, {
    timestamps: true
});

// Virtual for full name
studentSchema.virtual('fullName').get(function () {
    return `${this.name.firstName} ${this.name.lastName}`;
});

// Indexes for efficient querying
studentSchema.index({ college: 1, department: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ cgpa: -1 });
studentSchema.index({ placementStatus: 1 });
studentSchema.index({ isRejected: 1 });
studentSchema.index({ skills: 1 });
studentSchema.index({ isStarStudent: -1 }); // Priority sort
studentSchema.index({ 'name.firstName': 'text', 'name.lastName': 'text', skills: 'text' });

// Compound index for college uniqueness
studentSchema.index({ college: 1, rollNumber: 1 }, { unique: true });
studentSchema.index({ isDeleted: 1 });

// Query helper to exclude soft-deleted records by default
studentSchema.query.notDeleted = function () {
    return this.where({ isDeleted: { $ne: true } });
};

module.exports = mongoose.model('Student', studentSchema);
