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
    const { status, search, page = 1, limit = 10, includeDeleted } = req.query;

    const query = {};

    // Exclude soft-deleted by default unless explicitly requested
    if (includeDeleted !== 'true') {
        query.isDeleted = false;
    }

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
    const { status, type, search, page = 1, limit = 10, includeDeleted } = req.query;

    const query = {};

    // Exclude soft-deleted by default unless explicitly requested
    if (includeDeleted !== 'true') {
        query.isDeleted = false;
    }

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

/**
 * @desc    Get analytics data for charts
 * @route   GET /api/super-admin/analytics
 * @access  Super Admin
 */
const getAnalytics = asyncHandler(async (req, res) => {
    // Placement statistics by college
    const placementByCollege = await Student.aggregate([
        {
            $lookup: {
                from: 'colleges',
                localField: 'college',
                foreignField: '_id',
                as: 'collegeInfo'
            }
        },
        { $unwind: '$collegeInfo' },
        {
            $group: {
                _id: '$college',
                collegeName: { $first: '$collegeInfo.name' },
                total: { $sum: 1 },
                placed: {
                    $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                collegeName: 1,
                total: 1,
                placed: 1,
                placementRate: {
                    $cond: [
                        { $eq: ['$total', 0] },
                        0,
                        { $multiply: [{ $divide: ['$placed', '$total'] }, 100] }
                    ]
                }
            }
        },
        { $sort: { placementRate: -1 } },
        { $limit: 10 }
    ]);

    // Student distribution by department
    const studentsByDepartment = await Student.aggregate([
        {
            $group: {
                _id: '$department',
                count: { $sum: 1 },
                placed: {
                    $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] }
                }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // Monthly registrations trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Company type distribution
    const companyTypes = await Company.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        }
    ]);

    // Top skills in demand
    const topSkills = await Student.aggregate([
        { $unwind: '$skills' },
        {
            $group: {
                _id: '$skills',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    res.json({
        success: true,
        data: {
            placementByCollege,
            studentsByDepartment,
            monthlyTrend,
            companyTypes,
            topSkills
        }
    });
});

/**
 * @desc    Update college details
 * @route   PATCH /api/super-admin/colleges/:id
 * @access  Super Admin
 */
const updateCollege = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating admin or verification status through this endpoint
    delete updates.admin;
    delete updates.isVerified;
    delete updates.verifiedBy;
    delete updates.verifiedAt;

    const college = await College.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    ).populate('admin', 'email');

    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    res.json({
        success: true,
        message: 'College updated successfully',
        data: college
    });
});

/**
 * @desc    Update company details
 * @route   PATCH /api/super-admin/companies/:id
 * @access  Super Admin
 */
const updateCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating user or approval status through this endpoint
    delete updates.user;
    delete updates.isApproved;
    delete updates.approvedBy;
    delete updates.approvedAt;

    const company = await Company.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    ).populate('user', 'email');

    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    res.json({
        success: true,
        message: 'Company updated successfully',
        data: company
    });
});

/**
 * @desc    Get all students (platform-wide)
 * @route   GET /api/super-admin/students
 * @access  Super Admin
 */
const getAllStudents = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        search,
        college,
        department,
        batch,
        placementStatus,
        minCGPA,
        maxCGPA,
        skills
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
        query.$or = [
            { 'name.firstName': { $regex: search, $options: 'i' } },
            { 'name.lastName': { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { rollNumber: { $regex: search, $options: 'i' } }
        ];
    }

    // College filter
    if (college) query.college = college;

    // Department filter
    if (department) query.department = department;

    // Batch filter
    if (batch) query.batch = parseInt(batch);

    // Placement status filter
    if (placementStatus) query.placementStatus = placementStatus;

    // CGPA range filter
    if (minCGPA || maxCGPA) {
        query.cgpa = {};
        if (minCGPA) query.cgpa.$gte = parseFloat(minCGPA);
        if (maxCGPA) query.cgpa.$lte = parseFloat(maxCGPA);
    }

    // Skills filter
    if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        query.skills = { $in: skillsArray };
    }

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
        Student.find(query)
            .populate('college', 'name code')
            .select('name email rollNumber department batch cgpa placementStatus skills isVerified')
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
 * @desc    Reset user password
 * @route   POST /api/super-admin/users/:id/reset-password
 * @access  Super Admin
 */
const resetUserPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Prevent resetting super admin password
    if (user.role === 'super_admin' && user._id.toString() !== req.userId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Cannot reset another super admin password'
        });
    }

    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password reset successfully'
    });
});

/**
 * @desc    Toggle college active status
 * @route   PATCH /api/super-admin/colleges/:id/toggle-active
 * @access  Super Admin
 */
const toggleCollegeStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    college.isActive = !college.isActive;
    if (!college.isActive) {
        college.deactivatedAt = new Date();
        college.deactivatedBy = req.userId;
        
        // Also deactivate the admin user
        await User.findByIdAndUpdate(college.admin, { isActive: false });
    } else {
        college.deactivatedAt = null;
        college.deactivatedBy = null;
        
        // Reactivate the admin user
        await User.findByIdAndUpdate(college.admin, { isActive: true });
    }
    
    await college.save();

    res.json({
        success: true,
        message: `College ${college.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { isActive: college.isActive }
    });
});

/**
 * @desc    Soft delete college
 * @route   DELETE /api/super-admin/colleges/:id
 * @access  Super Admin
 */
const softDeleteCollege = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    if (college.isDeleted) {
        return res.status(400).json({
            success: false,
            message: 'College is already deleted'
        });
    }

    college.isDeleted = true;
    college.deletedAt = new Date();
    college.deletedBy = req.userId;
    college.isActive = false;
    await college.save();

    // Deactivate admin user
    await User.findByIdAndUpdate(college.admin, { isActive: false });

    res.json({
        success: true,
        message: 'College deleted successfully'
    });
});

/**
 * @desc    Restore soft-deleted college
 * @route   PATCH /api/super-admin/colleges/:id/restore
 * @access  Super Admin
 */
const restoreCollege = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    if (!college.isDeleted) {
        return res.status(400).json({
            success: false,
            message: 'College is not deleted'
        });
    }

    college.isDeleted = false;
    college.deletedAt = null;
    college.deletedBy = null;
    college.isActive = true;
    await college.save();

    // Reactivate admin user
    await User.findByIdAndUpdate(college.admin, { isActive: true });

    res.json({
        success: true,
        message: 'College restored successfully',
        data: college
    });
});

/**
 * @desc    Get college admin details
 * @route   GET /api/super-admin/college-admins/:id
 * @access  Super Admin
 */
const getCollegeAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id)
        .select('-password -refreshToken')
        .populate('collegeProfile', 'name code');

    if (!user || user.role !== 'college_admin') {
        return res.status(404).json({
            success: false,
            message: 'College admin not found'
        });
    }

    res.json({
        success: true,
        data: user
    });
});

/**
 * @desc    Update college admin details
 * @route   PATCH /api/super-admin/college-admins/:id
 * @access  Super Admin
 */
const updateCollegeAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== 'college_admin') {
        return res.status(404).json({
            success: false,
            message: 'College admin not found'
        });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }
        user.email = email;
    }

    await user.save();

    res.json({
        success: true,
        message: 'College admin updated successfully',
        data: user
    });
});

/**
 * @desc    Block/Unblock college admin
 * @route   PATCH /api/super-admin/college-admins/:id/toggle-block
 * @access  Super Admin
 */
const toggleCollegeAdminBlock = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== 'college_admin') {
        return res.status(404).json({
            success: false,
            message: 'College admin not found'
        });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
        success: true,
        message: `College admin ${user.isActive ? 'unblocked' : 'blocked'} successfully`,
        data: { isActive: user.isActive }
    });
});

/**
 * @desc    Toggle company/agency active status
 * @route   PATCH /api/super-admin/companies/:id/toggle-active
 * @access  Super Admin
 */
const toggleCompanyStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    company.isActive = !company.isActive;
    if (!company.isActive) {
        company.blockedAt = new Date();
        company.blockedBy = req.userId;
        await User.findByIdAndUpdate(company.user, { isActive: false });
    } else {
        company.blockedAt = null;
        company.blockedBy = null;
        company.blockReason = null;
        await User.findByIdAndUpdate(company.user, { isActive: true });
    }
    
    await company.save();

    res.json({
        success: true,
        message: `Company ${company.isActive ? 'activated' : 'blocked'} successfully`,
        data: { isActive: company.isActive }
    });
});

/**
 * @desc    Suspend/Unsuspend company/agency
 * @route   PATCH /api/super-admin/companies/:id/suspend
 * @access  Super Admin
 */
const toggleCompanySuspension = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason, endDate } = req.body;

    const company = await Company.findById(id);
    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    company.isSuspended = !company.isSuspended;
    if (company.isSuspended) {
        company.suspendedAt = new Date();
        company.suspendedBy = req.userId;
        company.suspensionReason = reason;
        company.suspensionEndDate = endDate ? new Date(endDate) : null;
        await User.findByIdAndUpdate(company.user, { isActive: false });
    } else {
        company.suspendedAt = null;
        company.suspendedBy = null;
        company.suspensionReason = null;
        company.suspensionEndDate = null;
        await User.findByIdAndUpdate(company.user, { isActive: true });
    }
    
    await company.save();

    res.json({
        success: true,
        message: `Company ${company.isSuspended ? 'suspended' : 'unsuspended'} successfully`,
        data: company
    });
});

/**
 * @desc    Soft delete company/agency
 * @route   DELETE /api/super-admin/companies/:id
 * @access  Super Admin
 */
const softDeleteCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    if (company.isDeleted) {
        return res.status(400).json({
            success: false,
            message: 'Company is already deleted'
        });
    }

    company.isDeleted = true;
    company.deletedAt = new Date();
    company.deletedBy = req.userId;
    company.isActive = false;
    await company.save();

    await User.findByIdAndUpdate(company.user, { isActive: false });

    res.json({
        success: true,
        message: 'Company deleted successfully'
    });
});

/**
 * @desc    Restore soft-deleted company
 * @route   PATCH /api/super-admin/companies/:id/restore
 * @access  Super Admin
 */
const restoreCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    if (!company.isDeleted) {
        return res.status(400).json({
            success: false,
            message: 'Company is not deleted'
        });
    }

    company.isDeleted = false;
    company.deletedAt = null;
    company.deletedBy = null;
    company.isActive = true;
    await company.save();

    await User.findByIdAndUpdate(company.user, { isActive: true });

    res.json({
        success: true,
        message: 'Company restored successfully',
        data: company
    });
});

/**
 * @desc    Assign colleges to agency
 * @route   POST /api/super-admin/companies/:id/assign-colleges
 * @access  Super Admin
 */
const assignCollegesToAgency = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { collegeIds } = req.body;

    const company = await Company.findById(id);
    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    if (company.type !== 'placement_agency') {
        return res.status(400).json({
            success: false,
            message: 'This operation is only for placement agencies'
        });
    }

    const newColleges = collegeIds.map(collegeId => ({
        college: collegeId,
        grantedAt: new Date(),
        grantedBy: req.userId
    }));

    const existingCollegeIds = company.agencyAccess.allowedColleges.map(
        ac => ac.college.toString()
    );
    const uniqueNewColleges = newColleges.filter(
        nc => !existingCollegeIds.includes(nc.college.toString())
    );

    company.agencyAccess.allowedColleges.push(...uniqueNewColleges);
    await company.save();

    await company.populate('agencyAccess.allowedColleges.college', 'name code');

    res.json({
        success: true,
        message: 'Colleges assigned successfully',
        data: company.agencyAccess
    });
});

/**
 * @desc    Remove college access from agency
 * @route   DELETE /api/super-admin/companies/:id/colleges/:collegeId
 * @access  Super Admin
 */
const removeCollegeFromAgency = asyncHandler(async (req, res) => {
    const { id, collegeId } = req.params;

    const company = await Company.findById(id);
    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    company.agencyAccess.allowedColleges = company.agencyAccess.allowedColleges.filter(
        ac => ac.college.toString() !== collegeId
    );
    await company.save();

    res.json({
        success: true,
        message: 'College access removed successfully'
    });
});

/**
 * @desc    Set agency access expiry
 * @route   PATCH /api/super-admin/companies/:id/access-expiry
 * @access  Super Admin
 */
const setAgencyAccessExpiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { expiryDate } = req.body;

    const company = await Company.findById(id);
    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    if (company.type !== 'placement_agency') {
        return res.status(400).json({
            success: false,
            message: 'This operation is only for placement agencies'
        });
    }

    company.agencyAccess.accessExpiryDate = expiryDate ? new Date(expiryDate) : null;
    await company.save();

    res.json({
        success: true,
        message: 'Access expiry date updated successfully',
        data: { accessExpiryDate: company.agencyAccess.accessExpiryDate }
    });
});

/**
 * @desc    Set agency download limit
 * @route   PATCH /api/super-admin/companies/:id/download-limit
 * @access  Super Admin
 */
const setAgencyDownloadLimit = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit } = req.body;

    const company = await Company.findById(id);
    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    if (company.type !== 'placement_agency') {
        return res.status(400).json({
            success: false,
            message: 'This operation is only for placement agencies'
        });
    }

    company.agencyAccess.downloadLimit = parseInt(limit);
    await company.save();

    res.json({
        success: true,
        message: 'Download limit updated successfully',
        data: { 
            downloadLimit: company.agencyAccess.downloadLimit,
            downloadCount: company.agencyAccess.downloadCount,
            remaining: company.agencyAccess.downloadLimit - company.agencyAccess.downloadCount
        }
    });
});

/**
 * @desc    Get agency details with access info
 * @route   GET /api/super-admin/companies/:id/agency-details
 * @access  Super Admin
 */
const getAgencyDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const company = await Company.findById(id)
        .populate('user', 'email isActive')
        .populate('agencyAccess.allowedColleges.college', 'name code')
        .populate('agencyAccess.allowedColleges.grantedBy', 'email');

    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    res.json({
        success: true,
        data: company
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
    getCollegeStudents,
    getAnalytics,
    updateCollege,
    updateCompany,
    getAllStudents,
    resetUserPassword,
    toggleCollegeStatus,
    softDeleteCollege,
    restoreCollege,
    getCollegeAdmin,
    updateCollegeAdmin,
    toggleCollegeAdminBlock,
    toggleCompanyStatus,
    toggleCompanySuspension,
    softDeleteCompany,
    restoreCompany,
    assignCollegesToAgency,
    removeCollegeFromAgency,
    setAgencyAccessExpiry,
    setAgencyDownloadLimit,
    getAgencyDetails
};
