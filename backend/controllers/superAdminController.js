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
 * @desc    Create new college
 * @route   POST /api/super-admin/colleges
 * @access  Super Admin
 */
const createCollege = asyncHandler(async (req, res) => {
    const { 
        collegeName, collegeCode, university, 
        city, state, pincode, country,
        contactEmail, phone, website, 
        departments,
        adminEmail, adminPassword 
    } = req.body;

    // Check if college code already exists
    const existingCollege = await College.findOne({ code: collegeCode });
    if (existingCollege) {
        return res.status(400).json({
            success: false,
            message: 'College code already exists'
        });
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'Admin email already exists'
        });
    }

    let adminUser;
    try {
        // Create admin user
        adminUser = await User.create({
            email: adminEmail,
            password: adminPassword,
            role: 'college_admin',
            isApproved: true, // Auto-approve when created by super admin
            isActive: true
        });

        // Create college
        const college = await College.create({
            name: collegeName,
            code: collegeCode,
            university,
            address: {
                street: '',
                city,
                state,
                pincode,
                country: country || 'India'
            },
            contactEmail,
            phone,
            website,
            departments: departments || [],
            admin: adminUser._id,
            isVerified: true, // Auto-verify when created by super admin
            verifiedAt: new Date(),
            verifiedBy: req.userId
        });

        // Link college to admin user
        adminUser.collegeProfile = college._id;
        await adminUser.save();

        res.status(201).json({
            success: true,
            message: 'College created successfully',
            data: { college, admin: { email: adminUser.email } }
        });
    } catch (error) {
        // If college creation fails, delete the admin user that was created
        if (adminUser) {
            await User.findByIdAndDelete(adminUser._id);
        }
        
        // Return the actual error message
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to create college'
        });
    }
});

/**
 * @desc    Get college details
 * @route   GET /api/super-admin/colleges/:id
 * @access  Super Admin
 */
const getCollegeDetails = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id)
        .populate('admin', 'email isActive createdAt');

    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    // Get student statistics
    const [totalStudents, verifiedStudents, placedStudents, departmentStats] = await Promise.all([
        Student.countDocuments({ college: college._id }),
        Student.countDocuments({ college: college._id, isVerified: true }),
        Student.countDocuments({ college: college._id, placementStatus: 'placed' }),
        Student.aggregate([
            { $match: { college: college._id } },
            {
                $group: {
                    _id: '$department',
                    total: { $sum: 1 },
                    placed: {
                        $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] }
                    }
                }
            },
            { $sort: { total: -1 } }
        ])
    ]);

    res.json({
        success: true,
        data: {
            college,
            stats: {
                totalStudents,
                verifiedStudents,
                placedStudents,
                placementRate: totalStudents > 0 
                    ? ((placedStudents / totalStudents) * 100).toFixed(1) 
                    : 0
            },
            departmentStats
        }
    });
});

/**
 * @desc    Create new company
 * @route   POST /api/super-admin/companies
 * @access  Super Admin
 */
const createCompany = asyncHandler(async (req, res) => {
    const {
        companyName, companyType, industry, description,
        website, contactPerson, contactEmail, phone,
        city, state, size,
        userEmail, userPassword
    } = req.body;

    // Check if user email already exists
    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User email already exists'
        });
    }

    let user;
    try {
        // Create user
        user = await User.create({
            email: userEmail,
            password: userPassword,
            role: 'company',
            isApproved: true, // Auto-approve when created by super admin
            isActive: true
        });

        // Create company
        const company = await Company.create({
            name: companyName,
            type: companyType || 'company',
            industry,
            description,
            website,
            contactPerson: {
                name: contactPerson,
                email: contactEmail,
                phone
            },
            headquarters: { city, state },
            size,
            user: user._id,
            isApproved: true, // Auto-approve when created by super admin
            approvedAt: new Date(),
            approvedBy: req.userId
        });

        // Link company to user
        user.companyProfile = company._id;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            data: { company, user: { email: user.email } }
        });
    } catch (error) {
        // If company creation fails, delete the user that was created
        if (user) {
            await User.findByIdAndDelete(user._id);
        }
        
        // Return the actual error message
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to create company'
        });
    }
});

/**
 * @desc    Add student to college (by super admin)
 * @route   POST /api/super-admin/colleges/:id/students
 * @access  Super Admin
 */
const addStudentToCollege = asyncHandler(async (req, res) => {
    const collegeId = req.params.id;

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    const studentData = {
        ...req.body,
        college: collegeId,
        addedBy: req.userId,
        source: 'manual',
        isVerified: true, // Auto-verify when added by super admin
        verifiedAt: new Date(),
        verifiedBy: req.userId
    };

    const student = await Student.create(studentData);

    // Update college stats
    await College.findByIdAndUpdate(collegeId, {
        $inc: { 
            'stats.totalStudents': 1,
            'stats.verifiedStudents': 1
        }
    });

    res.status(201).json({
        success: true,
        message: 'Student added successfully',
        data: student
    });
});

/**
 * @desc    Get students for a college
 * @route   GET /api/super-admin/colleges/:id/students
 * @access  Super Admin
 */
const getCollegeStudents = asyncHandler(async (req, res) => {
    const collegeId = req.params.id;
    const { page = 1, limit = 10, search } = req.query;

    const query = { college: collegeId };

    if (search) {
        query.$or = [
            { 'name.firstName': { $regex: search, $options: 'i' } },
            { 'name.lastName': { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { rollNumber: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
        Student.find(query)
            .select('name email rollNumber department batch cgpa placementStatus isVerified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Student.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            students,
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
    toggleUserStatus,
    createCollege,
    getCollegeDetails,
    createCompany,
    addStudentToCollege,
    getCollegeStudents
};
