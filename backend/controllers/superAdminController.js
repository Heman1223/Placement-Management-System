const { User, College, Company, Student, Job, Application } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/super-admin/stats
 * @access  Super Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalColleges,
        pendingColleges,
        totalCompanies,
        pendingCompanies,
        totalStudents,
        placedStudents,
        totalJobs,
        activeJobs
    ] = await Promise.all([
        User.countDocuments(),
        College.countDocuments(),
        College.countDocuments({ isVerified: false }),
        Company.countDocuments(),
        Company.countDocuments({ isApproved: false }),
        Student.countDocuments(),
        Student.countDocuments({ placementStatus: 'placed' }),
        Job.countDocuments(),
        Job.countDocuments({ status: 'open' })
    ]);

    // Recent registrations
    const recentColleges = await College.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name code isVerified createdAt');

    const recentCompanies = await Company.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name type isApproved createdAt');

    res.json({
        success: true,
        data: {
            stats: {
                users: totalUsers,
                colleges: { total: totalColleges, pending: pendingColleges },
                companies: { total: totalCompanies, pending: pendingCompanies },
                students: { total: totalStudents, placed: placedStudents },
                jobs: { total: totalJobs, active: activeJobs }
            },
            recent: {
                colleges: recentColleges,
                companies: recentCompanies
            }
        }
    });
});

/**
 * @desc    Get all colleges
 * @route   GET /api/super-admin/colleges
 * @access  Super Admin
 */
const getColleges = asyncHandler(async (req, res) => {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status === 'pending') query.isVerified = false;
    if (status === 'verified') query.isVerified = true;

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const [colleges, total] = await Promise.all([
        College.find(query)
            .populate('admin', 'email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        College.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            colleges,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }
    });
});

/**
 * @desc    Approve/Reject college
 * @route   PATCH /api/super-admin/colleges/:id/approve
 * @access  Super Admin
 */
const approveCollege = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { approved } = req.body;

    const college = await College.findById(id);
    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    college.isVerified = approved;
    if (approved) {
        college.verifiedAt = new Date();
        college.verifiedBy = req.userId;
    }
    await college.save();

    // Also update user approval status
    await User.findByIdAndUpdate(college.admin, { isApproved: approved });

    res.json({
        success: true,
        message: approved ? 'College approved successfully' : 'College rejected',
        data: college
    });
});

/**
 * @desc    Get all companies
 * @route   GET /api/super-admin/companies
 * @access  Super Admin
 */
const getCompanies = asyncHandler(async (req, res) => {
    const { status, type, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (type) query.type = type;

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { industry: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
        Company.find(query)
            .populate('user', 'email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Company.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            companies,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }
    });
});

/**
 * @desc    Approve/Reject company
 * @route   PATCH /api/super-admin/companies/:id/approve
 * @access  Super Admin
 */
const approveCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { approved } = req.body;

    const company = await Company.findById(id);
    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    company.isApproved = approved;
    if (approved) {
        company.approvedAt = new Date();
        company.approvedBy = req.userId;
    }
    await company.save();

    // Also update user approval status
    await User.findByIdAndUpdate(company.user, { isApproved: approved });

    res.json({
        success: true,
        message: approved ? 'Company approved successfully' : 'Company rejected',
        data: company
    });
});

/**
 * @desc    Get all users
 * @route   GET /api/super-admin/users
 * @access  Super Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const { role, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        User.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            users,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }
    });
});

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/super-admin/users/:id/toggle-status
 * @access  Super Admin
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Prevent deactivating self
    if (user._id.toString() === req.userId.toString()) {
        return res.status(400).json({
            success: false,
            message: 'Cannot deactivate your own account'
        });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { isActive: user.isActive }
    });
});

module.exports = {
    getDashboardStats,
    getColleges,
    approveCollege,
    getCompanies,
    approveCompany,
    getAllUsers,
    toggleUserStatus
};
