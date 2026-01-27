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
        College.countDocuments({ isDeleted: { $ne: true } }),
        College.countDocuments({ isVerified: false, isDeleted: { $ne: true } }),
        Company.countDocuments({ isDeleted: { $ne: true } }),
        Company.countDocuments({ isApproved: false, isDeleted: { $ne: true } }),
        Student.countDocuments({ isDeleted: { $ne: true } }),
        Student.countDocuments({ placementStatus: 'placed', isDeleted: { $ne: true } }),
        Job.countDocuments({ isDeleted: { $ne: true } }),
        Job.countDocuments({ status: 'open', isDeleted: { $ne: true } })
    ]);

    // Recent registrations
    const recentColleges = await College.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name code isVerified createdAt logo');

    const recentCompanies = await Company.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name type isApproved createdAt logo');

    // Recent placements for the 3D slider
    let recentPlacements = await Student.find({ placementStatus: 'placed', isDeleted: { $ne: true } })
        .sort({ 'placementDetails.joiningDate': -1, updatedAt: -1 })
        .limit(10)
        .populate('college', 'name logo')
        .select('name college placementDetails profilePicture')
        .lean();

    // Fetch star students for the dashboard
    const starStudents = await Student.find({ isStarStudent: true, isDeleted: { $ne: true } })
        .sort({ starredAt: -1, updatedAt: -1 })
        .limit(10)
        .populate('college', 'name logo')
        .select('name department batch cgpa skills profilePicture college')
        .lean();

    // Fix company names if they are ObjectIds (from previous bug)
    const { Company: CompanyModel } = require('../models');
    recentPlacements = await Promise.all(recentPlacements.map(async (p) => {
        if (p.placementDetails?.company && p.placementDetails.company.match(/^[0-9a-fA-F]{24}$/)) {
            const comp = await CompanyModel.findById(p.placementDetails.company).select('name');
            if (comp) p.placementDetails.company = comp.name;
        }
        return p;
    }));

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
                companies: recentCompanies,
                placements: recentPlacements,
                starStudents: starStudents
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

    if (status === 'pending') {
        query.isVerified = false;
        query.isRejected = false; // Pending means not verified AND not rejected
    }
    if (status === 'verified') query.isVerified = true;
    if (status === 'rejected') query.isRejected = true;

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const [colleges, total] = await Promise.all([
        College.find(query)
            .populate('admin', 'email isActive createdAt')
            .select('name code contactEmail phone isActive isVerified isDeleted isRejected createdAt logo')
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
    const { approved, rejectionReason } = req.body;

    const college = await College.findById(id);
    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    if (approved) {
        // Approve the college
        college.isVerified = true;
        college.verifiedAt = new Date();
        college.verifiedBy = req.userId;
        college.isRejected = false; // Clear rejection if previously rejected
        college.rejectedAt = null;
        college.rejectedBy = null;
        college.rejectionReason = null;
    } else {
        // Reject the college
        college.isVerified = false;
        college.isRejected = true;
        college.rejectedAt = new Date();
        college.rejectedBy = req.userId;
        college.rejectionReason = rejectionReason || 'No reason provided';
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
        query.isDeleted = { $ne: true };
    }

    if (status === 'pending') {
        query.isApproved = false;
        query.isRejected = false;
    }
    if (status === 'approved') query.isApproved = true;
    if (status === 'rejected') query.isRejected = true;
    
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
            .populate('user', 'email isActive createdAt')
            .select('name type industry contactPerson isActive isApproved isDeleted isRejected createdAt logo')
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
    const { approved, rejectionReason } = req.body;

    const company = await Company.findById(id);
    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    if (approved) {
        company.isApproved = true;
        company.approvedAt = new Date();
        company.approvedBy = req.userId;
        company.isRejected = false;
        company.rejectedAt = null;
        company.rejectedBy = null;
        company.rejectionReason = null;
    } else {
        company.isApproved = false;
        company.isRejected = true;
        company.rejectedAt = new Date();
        company.rejectedBy = req.userId;
        company.rejectionReason = rejectionReason || 'No reason provided';
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
    const { role, status, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    if (search) {
        query.email = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password -refreshToken')
            .populate('collegeProfile', 'name code')
            .populate('companyProfile', 'name type')
            .populate('studentProfile', 'name rollNumber college')
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
        Student.countDocuments({ college: college._id, isDeleted: { $ne: true } }),
        Student.countDocuments({ college: college._id, isVerified: true, isDeleted: { $ne: true } }),
        Student.countDocuments({ college: college._id, placementStatus: 'placed', isDeleted: { $ne: true } }),
        Student.aggregate([
            { $match: { college: college._id, isDeleted: { $ne: true } } },
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
    const { page = 1, limit = 10, search, includeDeleted } = req.query;

    const query = { college: collegeId };

    // Exclude soft-deleted by default unless explicitly requested
    if (includeDeleted !== 'true') {
        query.isDeleted = false;
    }

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
        { $match: { isDeleted: { $ne: true } } },
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
        { $match: { isDeleted: { $ne: true } } },
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
        { $match: { isDeleted: { $ne: true } } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        }
    ]);

    // Top skills in demand
    const topSkills = await Student.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $unwind: '$skills' },
        {
            $group: {
                _id: '$skills',
                count: { $sum: 1 }
            }
        },
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

        skills,
        isStarStudent,
        includeDeleted
    } = req.query;

    const query = {};

    // Exclude soft-deleted by default unless explicitly requested
    if (includeDeleted !== 'true') {
        query.isDeleted = false;
    }

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

    // Star Student filter
    if (isStarStudent === 'true') query.isStarStudent = true;


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

    const existingCollegeIds = company.collegeAccess.map(
        ca => ca.college.toString()
    );

    const newColleges = collegeIds
        .filter(id => !existingCollegeIds.includes(id))
        .map(collegeId => ({
            college: collegeId,
            status: 'approved',
            requestedAt: new Date(),
            respondedAt: new Date()
        }));

    company.collegeAccess.push(...newColleges);
    await company.save();

    await company.populate('collegeAccess.college', 'name code');

    res.json({
        success: true,
        message: 'Colleges assigned successfully',
        data: company.collegeAccess
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

    company.collegeAccess = company.collegeAccess.filter(
        ca => ca.college.toString() !== collegeId
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
    // Feature temporarily disabled or check schema
    return res.status(501).json({
        success: false,
        message: 'Feature not implemented for new schema'
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

    company.downloadTracking.dailyLimit = parseInt(limit);
    await company.save();

    res.json({
        success: true,
        message: 'Download limit updated successfully',
        data: { 
            dailyLimit: company.downloadTracking.dailyLimit
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
        .populate('collegeAccess.college', 'name code');

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


/**
 * @desc    Verify student
 * @route   PATCH /api/super-admin/students/:id/verify
 * @access  Super Admin
 */
const verifyStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    if (student.isVerified) {
        return res.status(400).json({
            success: false,
            message: 'Student is already verified'
        });
    }

    student.isVerified = true;
    student.verifiedAt = new Date();
    student.verifiedBy = req.userId;
    await student.save();

    // Update user status
    await User.findByIdAndUpdate(student.user, { isApproved: true });

    res.json({
        success: true,
        message: 'Student verified successfully',
        data: { isVerified: student.isVerified }
    });
});

/**
 * @desc    Reject student
 * @route   PATCH /api/super-admin/students/:id/reject
 * @access  Super Admin
 */
const rejectStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body; // Optional reason for rejection

    const student = await Student.findById(id);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    if (student.isRejected) {
        return res.status(400).json({
            success: false,
            message: 'Student is already rejected'
        });
    }

    student.isRejected = true;
    student.rejectedAt = new Date();
    student.rejectedBy = req.userId;
    student.rejectionReason = reason || 'Rejected by Super Admin';
    student.isVerified = false; // Ensure student is not verified if rejected
    await student.save();

    // Update user status to not approved and inactive
    await User.findByIdAndUpdate(student.user, { isApproved: false, isActive: false });

    res.json({
        success: true,
        message: 'Student rejected successfully',
        data: { isRejected: student.isRejected }
    });
});


/**
 * @desc    Get single student details
 * @route   GET /api/super-admin/students/:id
 * @access  Super Admin
 */
const getStudentDetails = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id)
        .populate('college', 'name city state')
        .populate('user', 'email isActive isApproved');

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    res.json({
        success: true,
        data: student
    });
});

/**
 * @desc    Toggle student star status
 * @route   PATCH /api/super-admin/students/:id/toggle-star
 * @access  Super Admin
 */
const toggleStarStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    // Toggle status
    student.isStarStudent = !student.isStarStudent;
    
    // Update metadata
    if (student.isStarStudent) {
        student.starredAt = new Date();
        student.starredBy = req.userId;
    } else {
        student.starredAt = null;
        student.starredBy = null;
    }
    
    await student.save();

    res.json({
        success: true,
        message: `Student ${student.isStarStudent ? 'marked as Star Student' : 'removed from Star Students'}`,
        data: { isStarStudent: student.isStarStudent }
    });
});

/**
 * @desc    Get all jobs (optionally filter by company)
 * @route   GET /api/super-admin/jobs
 * @access  Super Admin
 */
const getAllJobs = asyncHandler(async (req, res) => {
    const { company, status, page = 1, limit = 50, includeDeleted } = req.query;

    const query = {};
    
    // Exclude soft-deleted by default unless explicitly requested
    if (includeDeleted !== 'true') {
        query.isDeleted = false;
    }

    if (company) query.company = company;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
        Job.find(query)
            .populate('company', 'name type industry')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Job.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            jobs,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }
    });
});

/**
 * @desc    Soft delete student
 * @route   DELETE /api/super-admin/students/:id
 * @access  Super Admin
 */
const softDeleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    if (student.isDeleted) {
        return res.status(400).json({
            success: false,
            message: 'Student is already deleted'
        });
    }

    student.isDeleted = true;
    student.deletedAt = new Date();
    student.deletedBy = req.userId;
    await student.save();

    // Deactivate user account if exists
    if (student.user) {
        await User.findByIdAndUpdate(student.user, { isActive: false });
    }

    // Update college stats
    await College.findByIdAndUpdate(student.college, {
        $inc: { 'stats.totalStudents': -1 }
    });

    res.json({
        success: true,
        message: 'Student deleted successfully'
    });
});

/**
 * @desc    Restore soft-deleted student
 * @route   PATCH /api/super-admin/students/:id/restore
 * @access  Super Admin
 */
const restoreStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    if (!student.isDeleted) {
        return res.status(400).json({
            success: false,
            message: 'Student is not deleted'
        });
    }

    student.isDeleted = false;
    student.deletedAt = null;
    student.deletedBy = null;
    await student.save();

    // Reactivate user account if exists
    if (student.user) {
        await User.findByIdAndUpdate(student.user, { isActive: true });
    }

    // Update college stats
    await College.findByIdAndUpdate(student.college, {
        $inc: { 'stats.totalStudents': 1 }
    });

    res.json({
        success: true,
        message: 'Student restored successfully',
        data: student
    });
});

/**
 * @desc    Soft delete job
 * @route   DELETE /api/super-admin/jobs/:id
 * @access  Super Admin
 */
const softDeleteJob = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }

    if (job.isDeleted) {
        return res.status(400).json({
            success: false,
            message: 'Job is already deleted'
        });
    }

    job.isDeleted = true;
    job.deletedAt = new Date();
    job.deletedBy = req.userId;
    job.status = 'cancelled';
    await job.save();

    res.json({
        success: true,
        message: 'Job deleted successfully'
    });
});

/**
 * @desc    Restore soft-deleted job
 * @route   PATCH /api/super-admin/jobs/:id/restore
 * @access  Super Admin
 */
const restoreJob = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }

    if (!job.isDeleted) {
        return res.status(400).json({
            success: false,
            message: 'Job is not deleted'
        });
    }

    job.isDeleted = false;
    job.deletedAt = null;
    job.deletedBy = null;
    job.status = 'open'; // Default back to open
    await job.save();

    res.json({
        success: true,
        message: 'Job restored successfully',
        data: job
    });
});

module.exports = {
    getDashboardStats,
    getAnalytics,
    getColleges,
    createCollege,
    getCollegeDetails,
    updateCollege,
    approveCollege,
    toggleCollegeStatus,
    softDeleteCollege,
    restoreCollege,
    getCollegeStudents,
    addStudentToCollege,
    getCompanies,
    createCompany,
    getAgencyDetails,
    updateCompany,
    approveCompany,
    toggleCompanyStatus,
    toggleCompanySuspension,
    softDeleteCompany,
    restoreCompany,
    assignCollegesToAgency,
    removeCollegeFromAgency,
    setAgencyAccessExpiry,
    setAgencyDownloadLimit,
    getAllStudents,
    getAllUsers,
    toggleUserStatus,
    resetUserPassword,
    getCollegeAdmin,
    updateCollegeAdmin,
    toggleCollegeAdminBlock,

    getAllJobs,
    softDeleteJob,
    restoreJob,
    toggleStarStudent,
    getStudentDetails,
    softDeleteStudent,
    restoreStudent
};
