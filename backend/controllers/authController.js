const jwt = require('jsonwebtoken');
const { User, College, Company, Student } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public (or Super Admin for creating college admins)
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, role, ...profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
        });
    }

    // Determine if user should be auto-approved
    let isAutoApproved = false;
    
    // Check if this is a super admin creating a college admin
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const adminUser = await User.findById(decoded.userId);
            
            // If super admin is creating a college admin, auto-approve
            if (adminUser && adminUser.role === 'super_admin' && role === 'college_admin') {
                isAutoApproved = true;
            }
        } catch (error) {
            // Token invalid or expired, treat as public registration
        }
    }
    
    // Super admin is always auto-approved
    if (role === 'super_admin') {
        isAutoApproved = true;
    }

    // Create user
    const user = await User.create({
        email,
        password,
        role,
        isApproved: isAutoApproved
    });

    // Create role-specific profile
    let profile = null;

    if (role === 'college_admin') {
        const { collegeName, collegeCode, university, city, state, contactEmail, phone, website, departments } = profileData;

        profile = await College.create({
            name: collegeName,
            code: collegeCode,
            university,
            address: { city, state },
            contactEmail: contactEmail || email,
            phone,
            website,
            departments,
            admin: user._id,
            isVerified: isAutoApproved // Auto-verify if created by super admin
        });

        user.collegeProfile = profile._id;
        await user.save();
    }

    if (role === 'company') {
        const { companyName, companyType, industry, description, website, contactPerson, contactEmail, phone, city, state, size } = profileData;

        profile = await Company.create({
            name: companyName,
            type: companyType || 'company',
            industry,
            description,
            website,
            contactPerson: {
                name: contactPerson,
                email: contactEmail || email,
                phone
            },
            headquarters: { city, state },
            size,
            user: user._id,
            isApproved: false // Companies always need approval
        });

        user.companyProfile = profile._id;
        await user.save();
    }

    if (role === 'student') {
        const { 
            firstName, lastName, phone, dateOfBirth, gender,
            collegeId, department, batch, rollNumber, cgpa
        } = profileData;

        // Find the college
        const college = await College.findById(collegeId);
        if (!college) {
            // Clean up user if college not found
            await User.findByIdAndDelete(user._id);
            return res.status(400).json({
                success: false,
                message: 'Invalid college selected'
            });
        }

        profile = await Student.create({
            name: {
                firstName,
                lastName
            },
            email,
            phone,
            dateOfBirth,
            gender,
            college: collegeId,
            department,
            batch,
            rollNumber,
            cgpa,
            addedBy: user._id, // Self-added
            source: 'self_registration',
            isVerified: false, // Needs college admin approval
            user: user._id
        });

        user.studentProfile = profile._id;
        await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Determine response message
    let message = 'Registration successful';
    if (!isAutoApproved) {
        if (role === 'college_admin') {
            message = 'Registration successful. Awaiting super admin approval.';
        } else if (role === 'company') {
            message = 'Registration successful. Awaiting admin approval.';
        } else if (role === 'student') {
            message = 'Registration successful. Awaiting college admin verification.';
        } else {
            message = 'Registration successful. Awaiting approval.';
        }
    }

    res.status(201).json({
        success: true,
        message,
        data: {
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved
            },
            profile
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email })
        .select('+password')
        .populate('collegeProfile')
        .populate('companyProfile')
        .populate('studentProfile');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check if user is active
    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            message: 'Account is deactivated. Please contact support.'
        });
    }

    // Update last login and login history
    user.lastLogin = new Date();
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({
        timestamp: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true
    });
    
    // Keep only last 20 login records
    if (user.loginHistory.length > 20) {
        user.loginHistory = user.loginHistory.slice(-20);
    }
    
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Get profile based on role
    let profile = null;
    if (user.role === 'college_admin') profile = user.collegeProfile;
    if (user.role === 'company') profile = user.companyProfile;
    if (user.role === 'student') profile = user.studentProfile;

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                lastLogin: user.lastLogin
            },
            profile
        }
    });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId)
        .populate('collegeProfile')
        .populate('companyProfile')
        .populate('studentProfile');

    let profile = null;
    if (user.role === 'college_admin') profile = user.collegeProfile;
    if (user.role === 'company') profile = user.companyProfile;
    if (user.role === 'student') profile = user.studentProfile;

    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                createdAt: user.createdAt
            },
            profile
        }
    });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password updated successfully'
    });
});

/**
 * @desc    Logout user (client-side token removal + optional server-side)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    // In a more advanced setup, we'd invalidate the refresh token here
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

/**
 * @desc    Get login history
 * @route   GET /api/auth/login-history
 * @access  Private
 */
const getLoginHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('loginHistory');

    res.json({
        success: true,
        data: user.loginHistory || []
    });
});

/**
 * @desc    Get public colleges list for registration
 * @route   GET /api/auth/colleges
 * @access  Public
 */
const getPublicColleges = asyncHandler(async (req, res) => {
    const colleges = await College.find({ 
        isDeleted: { $ne: true },
        isActive: true
    }).select('name _id code city state phone');

    res.json({
        success: true,
        data: colleges
    });
});

module.exports = {
    register,
    login,
    getProfile,
    updatePassword,
    logout,
    getLoginHistory,
    getPublicColleges
};
