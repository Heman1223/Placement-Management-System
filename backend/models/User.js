const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['super_admin', 'college_admin', 'company', 'student'],
        required: [true, 'Role is required']
    },
    isApproved: {
        type: Boolean,
        default: function () {
            // Super admins are auto-approved, others need approval
            return this.role === 'super_admin';
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Reference to role-specific profile
    collegeProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College'
    },
    companyProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    studentProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    lastLogin: {
        type: Date
    },
    loginHistory: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        userAgent: String,
        success: {
            type: Boolean,
            default: true
        }
    }],
    refreshToken: {
        type: String,
        select: false
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ role: 1, isApproved: 1 });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get profile based on role
userSchema.methods.getProfile = function () {
    switch (this.role) {
        case 'college_admin':
            return this.collegeProfile;
        case 'company':
            return this.companyProfile;
        case 'student':
            return this.studentProfile;
        default:
            return null;
    }
};

module.exports = mongoose.model('User', userSchema);
