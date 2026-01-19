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
 * @access  Public
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

    // Create user
    const user = await User.create({
        email,
        password,
        role,
        isApproved: role === 'super_admin' // Only super admin is auto-approved
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
            admin: user._id
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
            user: user._id
        });

        user.companyProfile = profile._id;
        await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        message: role === 'super_admin'
            ? 'Registration successful'
            : 'Registration successful. Awaiting admin approval.',
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

    // Update last login
    user.lastLogin = new Date();
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

module.exports = {
    register,
    login,
    getProfile,
    updatePassword,
    logout
};
