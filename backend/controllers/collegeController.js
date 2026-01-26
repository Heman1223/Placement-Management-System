const { Student, College, User } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Get college dashboard stats
 * @route   GET /api/college/stats
 * @access  College Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;

    const [
        totalStudents,
        activeStudents,
        verifiedStudents,
        pendingApprovals,
        placedStudents,
        inProcessStudents,
        shortlistedStudents
    ] = await Promise.all([
        Student.countDocuments({ college: collegeId }),
        Student.countDocuments({ college: collegeId, isVerified: true }),
        Student.countDocuments({ college: collegeId, isVerified: true }),
        Student.countDocuments({ college: collegeId, isVerified: false }),
        Student.countDocuments({ college: collegeId, placementStatus: 'placed' }),
        Student.countDocuments({ college: collegeId, placementStatus: 'in_process' }),
        Student.countDocuments({ college: collegeId, isShortlisted: true })
    ]);

    // Get agencies with access to this college
    const { Company } = require('../models');
    const agenciesWithAccess = await Company.countDocuments({
        type: 'placement_agency',
        isApproved: true,
        isActive: true,
        'collegeAccess': {
            $elemMatch: {
                college: collegeId,
                status: 'approved'
            }
        }
    }).select('name industry logo contactPerson size website');

    // Department-wise breakdown
    const departmentStats = await Student.aggregate([
        { $match: { college: collegeId } },
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
    ]);

    // Batch-wise breakdown
    const batchStats = await Student.aggregate([
        { $match: { college: collegeId } },
        {
            $group: {
                _id: '$batch',
                total: { $sum: 1 },
                placed: {
                    $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] }
                }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    // CGPA range breakdown
    const cgpaRangeStats = await Student.aggregate([
        { $match: { college: collegeId } },
        {
            $bucket: {
                groupBy: '$cgpa',
                boundaries: [0, 6.0, 7.0, 8.0, 9.0, 10.1],
                default: 'Unknown',
                output: {
                    count: { $sum: 1 },
                    placed: {
                        $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] }
                    }
                }
            }
        }
    ]);

    // Format CGPA ranges
    const cgpaLabels = {
        0: 'Below 6.0',
        6: '6.0 - 7.0',
        7: '7.0 - 8.0',
        8: '8.0 - 9.0',
        9: '9.0 - 10.0',
        'Unknown': 'Not Specified'
    };

    const formattedCgpaStats = cgpaRangeStats.map(stat => ({
        range: cgpaLabels[stat._id] || stat._id,
        count: stat.count,
        placed: stat.placed
    }));

    // Placement status overview
    const placementStatusStats = await Student.aggregate([
        { $match: { college: collegeId } },
        {
            $group: {
                _id: '$placementStatus',
                count: { $sum: 1 }
            }
        }
    ]);

    // Recent placements for the 3D slider (Specific to this college)
    let recentPlacements = await Student.find({ 
        college: collegeId, 
        placementStatus: 'placed' 
    })
    .sort({ 'placementDetails.joiningDate': -1, updatedAt: -1 })
    .limit(10)
    .select('name department batch placementDetails profilePicture profileCompleteness')
    .lean();

    // Fix company names if they are ObjectIds
    const { Company: CompanyModel } = require('../models');
    recentPlacements = await Promise.all(recentPlacements.map(async (p) => {
        if (p.placementDetails?.company && p.placementDetails.company.match(/^[0-9a-fA-F]{24}$/)) {
            const comp = await CompanyModel.findById(p.placementDetails.company).select('name logo');
            if (comp) {
                p.placementDetails.companyName = comp.name;
                p.placementDetails.companyLogo = comp.logo;
            }
        }
        return p;
    }));

    res.json({
        success: true,
        data: {
            overview: {
                total: totalStudents,
                active: activeStudents,
                verified: verifiedStudents,
                pendingApprovals: pendingApprovals,
                placed: placedStudents,
                inProcess: inProcessStudents,
                shortlisted: shortlistedStudents,
                agenciesWithAccess: agenciesWithAccess,
                placementRate: totalStudents > 0
                    ? ((placedStudents / totalStudents) * 100).toFixed(1)
                    : 0
            },
            departmentStats,
            batchStats,
            cgpaRangeStats: formattedCgpaStats,
            placementStatusStats,
            recentPlacements
        }
    });
});

/**
 * @desc    Get all students for this college
 * @route   GET /api/college/students
 * @access  College Admin
 */
const getStudents = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const {
        department,
        batch,
        status,
        verified,
        search,
        skills,
        cgpaMin,
        cgpaMax,
        profileCompleteness,
        sortBy = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 10
    } = req.query;

    const query = { college: collegeId };

    // Basic filters
    if (department) query.department = department;
    if (batch) query.batch = parseInt(batch);
    if (status) query.placementStatus = status;
    if (verified && verified !== '') query.isVerified = verified === 'true';

    // CGPA range filter
    if (cgpaMin || cgpaMax) {
        query.cgpa = {};
        if (cgpaMin) query.cgpa.$gte = parseFloat(cgpaMin);
        if (cgpaMax) query.cgpa.$lte = parseFloat(cgpaMax);
    }

    // Skills filter (match any of the provided skills)
    if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        query.skills = { $in: skillsArray };
    }

    // Text search
    if (search && search.trim() !== '') {
        query.$or = [
            { 'name.firstName': { $regex: search, $options: 'i' } },
            { 'name.lastName': { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { rollNumber: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    let students = await Student.find(query)
        .select('-projects -certifications -education')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    // Filter by profile completeness if specified
    if (profileCompleteness) {
        const minCompleteness = parseInt(profileCompleteness);
        students = students.filter(student => {
            const completeness = calculateProfileCompleteness(student);
            return completeness.percentage >= minCompleteness;
        });
    }

    const total = await Student.countDocuments(query);

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
 * @desc    Get single student details
 * @route   GET /api/college/students/:id
 * @access  College Admin
 */
const getStudent = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const student = await Student.findOne({
        _id: req.params.id,
        college: collegeId
    }).populate('user', 'email');

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    // Calculate profile completeness
    const profileCompleteness = calculateProfileCompleteness(student);

    res.json({
        success: true,
        data: {
            ...student.toObject(),
            profileCompleteness
        }
    });
});

/**
 * Calculate profile completeness percentage
 */
const calculateProfileCompleteness = (student) => {
    const fields = {
        // Basic Info (30%)
        basicInfo: [
            student.name?.firstName,
            student.name?.lastName,
            student.email,
            student.phone,
            student.dateOfBirth,
            student.gender
        ],
        // Academic Info (25%)
        academicInfo: [
            student.department,
            student.batch,
            student.rollNumber,
            student.cgpa,
            student.percentage
        ],
        // Education History (20%)
        educationHistory: [
            student.education?.tenth?.percentage,
            student.education?.twelfth?.percentage
        ],
        // Skills & Resume (15%)
        skillsResume: [
            student.skills?.length > 0,
            student.resumeUrl
        ],
        // Additional Info (10%)
        additionalInfo: [
            student.linkedinUrl,
            student.githubUrl,
            student.projects?.length > 0
        ]
    };

    const weights = {
        basicInfo: 30,
        academicInfo: 25,
        educationHistory: 20,
        skillsResume: 15,
        additionalInfo: 10
    };

    let totalScore = 0;

    Object.keys(fields).forEach(category => {
        const categoryFields = fields[category];
        const filledFields = categoryFields.filter(field => {
            if (typeof field === 'boolean') return field;
            return field !== null && field !== undefined && field !== '';
        }).length;
        
        const categoryScore = (filledFields / categoryFields.length) * weights[category];
        totalScore += categoryScore;
    });

    return {
        percentage: Math.round(totalScore),
        breakdown: {
            basicInfo: Math.round((fields.basicInfo.filter(f => f).length / fields.basicInfo.length) * 100),
            academicInfo: Math.round((fields.academicInfo.filter(f => f).length / fields.academicInfo.length) * 100),
            educationHistory: Math.round((fields.educationHistory.filter(f => f).length / fields.educationHistory.length) * 100),
            skillsResume: Math.round((fields.skillsResume.filter(f => f).length / fields.skillsResume.length) * 100),
            additionalInfo: Math.round((fields.additionalInfo.filter(f => f).length / fields.additionalInfo.length) * 100)
        }
    };
};

/**
 * @desc    Add new student manually
 * @route   POST /api/college/students
 * @access  College Admin
 */
const addStudent = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;

    // Check if user account already exists with this email
    const existingUser = await User.findOne({ email: req.body.email });
    
    let userAccount;
    if (existingUser) {
        // If user exists, check if they're already a student
        if (existingUser.role === 'student' && existingUser.studentProfile) {
            return res.status(400).json({
                success: false,
                message: 'A student account with this email already exists'
            });
        }
        userAccount = existingUser;
    } else {
        // Create user account with auto-generated password: FirstName@123
        const autoPassword = `${req.body.name.firstName}@123`;
        
        userAccount = await User.create({
            email: req.body.email,
            password: autoPassword,
            role: 'student',
            isApproved: true,
            isActive: true
        });
    }

    const studentData = {
        ...req.body,
        college: collegeId,
        addedBy: req.userId,
        source: 'manual',
        isVerified: true, // Auto-verify students added by college admin
        verifiedAt: new Date(),
        verifiedBy: req.userId,
        user: userAccount._id // Link to user account
    };

    const student = await Student.create(studentData);

    // Link student profile to user account
    userAccount.studentProfile = student._id;
    await userAccount.save();

    // Update college stats
    await College.findByIdAndUpdate(collegeId, {
        $inc: { 
            'stats.totalStudents': 1,
            'stats.verifiedStudents': 1 // Increment verified count
        }
    });

    res.status(201).json({
        success: true,
        message: 'Student added successfully. Login credentials created.',
        data: {
            student,
            credentials: {
                email: req.body.email,
                password: `${req.body.name.firstName}@123`
            }
        }
    });
});

/**
 * @desc    Update student
 * @route   PUT /api/college/students/:id
 * @access  College Admin
 */
const updateStudent = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;

    let student = await Student.findOne({
        _id: req.params.id,
        college: collegeId
    });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    // Prevent changing college
    delete req.body.college;

    student = await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Student updated successfully',
        data: student
    });
});

/**
 * @desc    Delete student
 * @route   DELETE /api/college/students/:id
 * @access  College Admin
 */
const deleteStudent = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;

    const student = await Student.findOne({
        _id: req.params.id,
        college: collegeId
    });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    await student.deleteOne();

    // Update college stats
    await College.findByIdAndUpdate(collegeId, {
        $inc: { 'stats.totalStudents': -1 }
    });

    res.json({
        success: true,
        message: 'Student deleted successfully'
    });
});

/**
 * @desc    Verify student
 * @route   PATCH /api/college/students/:id/verify
 * @access  College Admin
 */
const verifyStudent = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;

    const student = await Student.findOne({
        _id: req.params.id,
        college: collegeId
    });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    student.isVerified = true;
    student.verifiedAt = new Date();
    student.verifiedBy = req.userId;
    await student.save();

    // Update college stats
    await College.findByIdAndUpdate(collegeId, {
        $inc: { 'stats.verifiedStudents': 1 }
    });

    res.json({
        success: true,
        message: 'Student verified successfully',
        data: student
    });
});

/**
 * @desc    Reject student registration
 * @route   PATCH /api/college/students/:id/reject
 * @access  College Admin
 */
const rejectStudent = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { rejectionReason } = req.body;

    const student = await Student.findOne({
        _id: req.params.id,
        college: collegeId
    });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    student.isVerified = false;
    student.isRejected = true;
    student.rejectedAt = new Date();
    student.rejectedBy = req.userId;
    student.rejectionReason = rejectionReason || 'No reason provided';
    await student.save();

    // Also update user approval status if user exists
    if (student.user) {
        await User.findByIdAndUpdate(student.user, { isApproved: false });
    }

    res.json({
        success: true,
        message: 'Student registration rejected',
        data: student
    });
});

/**
 * @desc    Bulk upload students from Excel
 * @route   POST /api/college/students/bulk
 * @access  College Admin
 */
const bulkUploadStudents = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { students } = req.body; // Array of student objects from parsed Excel

    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No students data provided'
        });
    }

    const results = {
        success: [],
        failed: []
    };

    for (const studentData of students) {
        try {
            // Check if user account already exists
            const existingUser = await User.findOne({ email: studentData.email });
            
            let userAccount;
            if (existingUser) {
                // If user exists and is already a student, skip
                if (existingUser.role === 'student' && existingUser.studentProfile) {
                    results.failed.push({
                        rollNumber: studentData.rollNumber || 'Unknown',
                        name: studentData.name?.firstName || 'Unknown',
                        error: 'User account already exists'
                    });
                    continue;
                }
                userAccount = existingUser;
            } else {
                // Create user account with auto-generated password: FirstName@123
                const autoPassword = `${studentData.name.firstName}@123`;
                
                userAccount = await User.create({
                    email: studentData.email,
                    password: autoPassword,
                    role: 'student',
                    isApproved: true,
                    isActive: true
                });
            }

            // Create student record
            const student = await Student.create({
                ...studentData,
                college: collegeId,
                addedBy: req.userId,
                source: 'bulk_upload',
                isVerified: true, // Auto-verify bulk uploaded students
                verifiedAt: new Date(),
                verifiedBy: req.userId,
                user: userAccount._id // Link to user account
            });

            // Link student profile to user account
            userAccount.studentProfile = student._id;
            await userAccount.save();

            results.success.push({
                rollNumber: student.rollNumber,
                name: `${student.name.firstName} ${student.name.lastName}`,
                email: student.email,
                password: `${studentData.name.firstName}@123`
            });
        } catch (error) {
            results.failed.push({
                rollNumber: studentData.rollNumber || 'Unknown',
                name: studentData.name?.firstName || 'Unknown',
                error: error.message
            });
        }
    }

    // Update college stats
    await College.findByIdAndUpdate(collegeId, {
        $inc: { 
            'stats.totalStudents': results.success.length,
            'stats.verifiedStudents': results.success.length // All bulk uploaded are verified
        }
    });

    res.status(201).json({
        success: true,
        message: `Uploaded ${results.success.length} students. ${results.failed.length} failed.`,
        data: results
    });
});

/**
 * @desc    Get departments for this college
 * @route   GET /api/college/departments
 * @access  College Admin
 */
const getDepartments = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;

    const departments = await Student.distinct('department', { college: collegeId });
    const collegeDepts = req.user.collegeProfile.departments || [];

    // Merge unique departments
    const allDepts = [...new Set([...departments, ...collegeDepts])];

    res.json({
        success: true,
        data: allDepts.sort()
    });
});

module.exports = {
    getDashboardStats,
    getStudents,
    getStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    verifyStudent,
    bulkUploadStudents,
    getDepartments,
    rejectStudent
};

/**
 * @desc    Export students to CSV
 * @route   GET /api/college/students/export
 * @access  College Admin
 */
const exportStudents = asyncHandler(async (req, res) => {
    const { formatStudentData, sendCSVResponse } = require('../utils/csvExporter');
    const collegeId = req.user.collegeProfile._id;
    
    const { department, batch, status, verified } = req.query;
    
    const query = { college: collegeId };
    if (department) query.department = department;
    if (batch) query.batch = parseInt(batch);
    if (status) query.placementStatus = status;
    if (verified !== undefined) query.isVerified = verified === 'true';

    const students = await Student.find(query)
        .populate('college', 'name')
        .lean();

    const formattedData = formatStudentData(students);
    
    // Track export count for activity logging
    req.exportCount = students.length;
    
    const filename = `students_${Date.now()}`;
    sendCSVResponse(res, formattedData, filename);
});

/**
 * @desc    Reset student password
 * @route   POST /api/college/students/:id/reset-password
 * @access  College Admin
 */
const resetStudentPassword = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    // Find student and verify it belongs to this college
    const student = await Student.findOne({
        _id: req.params.id,
        college: collegeId
    }).populate('user');

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    if (!student.user) {
        return res.status(400).json({
            success: false,
            message: 'Student does not have a user account'
        });
    }

    // Update password
    const user = await User.findById(student.user._id);
    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password reset successfully'
    });
});

/**
 * @desc    Get agencies with access to this college
 * @route   GET /api/college/agencies
 * @access  College Admin
 */
/**
 * @desc    Get companies/agencies with access to this college
 * @route   GET /api/college/companies
 * @access  College Admin
 */
const getConnectedCompanies = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { Company } = require('../models');

    // Get all approved companies that have access to this college
    const companies = await Company.find({
        isApproved: true,
        'collegeAccess': {
            $elemMatch: {
                college: collegeId,
                status: 'approved'
            }
        }
    }).select('name type industry contactPerson collegeAccess isActive logo');

    // Add access details to the response
    const companiesWithDetails = companies.map(company => {
        const access = company.collegeAccess.find(
            ca => ca.college.toString() === collegeId.toString()
        );
        return {
            _id: company._id,
            name: company.name,
            type: company.type,
            industry: company.industry,
            contactPerson: company.contactPerson,
            logo: company.logo,
            isActive: company.isActive,
            accessDetails: access
        };
    });

    res.json({
        success: true,
        data: companiesWithDetails
    });
});

/**
 * @desc    Get company access requests
 * @route   GET /api/college/company-requests
 * @access  College Admin
 */
const getCompanyRequests = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { Company } = require('../models');

    const requests = await Company.find({
        isApproved: true,
        'collegeAccess': {
            $elemMatch: {
                college: collegeId,
                status: 'pending'
            }
        }
    }).select('name type industry contactPerson collegeAccess logo website');

    const formattedRequests = requests.map(company => {
        const access = company.collegeAccess.find(
            ca => ca.college.toString() === collegeId.toString()
        );
        return {
            _id: company._id,
            name: company.name,
            type: company.type,
            industry: company.industry,
            website: company.website,
            logo: company.logo,
            contactPerson: company.contactPerson,
            requestedAt: access.requestedAt
        };
    });

    res.json({
        success: true,
        data: formattedRequests
    });
});

/**
 * @desc    Respond to company access request
 * @route   POST /api/college/company-request/:id/respond
 * @access  College Admin
 */
const respondToCompanyRequest = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const companyId = req.params.id;
    const { status, remarks } = req.body; // status: 'approved' or 'rejected'
    const { Company } = require('../models');

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be approved or rejected'
        });
    }

    const company = await Company.findById(companyId);

    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    // Find the access request
    const accessIndex = company.collegeAccess.findIndex(
        ca => ca.college.toString() === collegeId.toString()
    );

    if (accessIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Access request not found'
        });
    }

    // Update status
    company.collegeAccess[accessIndex].status = status;
    company.collegeAccess[accessIndex].respondedAt = new Date();
    company.collegeAccess[accessIndex].remarks = remarks || '';

    await company.save();

    res.json({
        success: true,
        message: `Request ${status} successfully`,
        data: {
            companyId: company._id,
            status,
            respondedAt: company.collegeAccess[accessIndex].respondedAt
        }
    });
});

/**
 * @desc    Revoke company access
 * @route   DELETE /api/college/companies/:id/revoke
 * @access  College Admin
 */
const revokeCompanyAccess = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const companyId = req.params.id;
    const { Company } = require('../models');

    const company = await Company.findById(companyId);

    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    // Remove the college from access list
    company.collegeAccess = company.collegeAccess.filter(
        ca => ca.college.toString() !== collegeId.toString()
    );

    await company.save();

    res.json({
        success: true,
        message: 'Access revoked successfully'
    });
});

/**
 * @desc    Update company access settings (limits)
 * @route   PATCH /api/college/companies/:id/settings
 * @access  College Admin
 */
const updateCompanyAccessSettings = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const companyId = req.params.id;
    const { downloadLimit, expiryDate } = req.body;
    const { Company } = require('../models');

    const company = await Company.findOne({
        _id: companyId,
        'collegeAccess.college': collegeId
    });

    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found or access not linked'
        });
    }

    const accessIndex = company.collegeAccess.findIndex(
        ca => ca.college.toString() === collegeId.toString()
    );

    if (downloadLimit !== undefined) {
        company.collegeAccess[accessIndex].downloadLimit = downloadLimit;
    }
    
    // Logic for expiry could be added if schema supports it, for now just limits
    
    await company.save();

    res.json({
        success: true,
        message: 'Settings updated successfully'
    });
});

/**
 * @desc    Get agency activity details
 * @route   GET /api/college/agencies/:id/activity
 * @access  College Admin
 */
const getAgencyActivity = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const agencyId = req.params.id;
    const { Company, ActivityLog, Student } = require('../models');

    // Verify agency has access to this college
    const agency = await Company.findOne({
        _id: agencyId,
        type: 'placement_agency',
        'agencyAccess.allowedColleges.college': collegeId
    });

    if (!agency) {
        return res.status(404).json({
            success: false,
            message: 'Agency not found or does not have access to your college'
        });
    }

    // Get agency user
    const agencyUser = await User.findOne({ companyProfile: agencyId });

    if (!agencyUser) {
        return res.json({
            success: true,
            data: {
                agency: agency.name,
                recentActivity: [],
                stats: {
                    profilesAccessed: 0,
                    shortlistsMade: 0,
                    downloadsCount: 0,
                    downloadLimit: agency.agencyAccess?.downloadLimit || 0
                }
            }
        });
    }

    // Get students from this college
    const collegeStudents = await Student.find({ college: collegeId }).distinct('_id');

    // Get recent activity logs
    const recentActivity = await ActivityLog.find({
        user: agencyUser._id,
        $or: [
            { action: 'view_student', targetModel: 'Student', targetId: { $in: collegeStudents } },
            { action: 'shortlist_student', targetModel: 'Student', targetId: { $in: collegeStudents } },
            { action: 'download_student_data' }
        ]
    })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user', 'email')
        .lean();

    // Get stats
    const [profilesAccessed, shortlistsMade] = await Promise.all([
        ActivityLog.countDocuments({
            user: agencyUser._id,
            action: 'view_student',
            targetModel: 'Student',
            targetId: { $in: collegeStudents }
        }),
        ActivityLog.countDocuments({
            user: agencyUser._id,
            action: 'shortlist_student',
            targetModel: 'Student',
            targetId: { $in: collegeStudents }
        })
    ]);

    res.json({
        success: true,
        data: {
            agency: agency.name,
            recentActivity,
            stats: {
                profilesAccessed,
                shortlistsMade,
                downloadsCount: agency.agencyAccess?.downloadCount || 0,
                downloadLimit: agency.agencyAccess?.downloadLimit || 0
            }
        }
    });
});

/**
 * @desc    Get placement tracking data
 * @route   GET /api/college/placements
 * @access  College Admin
 */
const getPlacementTracking = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { type = 'all' } = req.query; // all, shortlisted, placed

    let query = { college: collegeId };

    if (type === 'shortlisted') {
        query.isShortlisted = true;
    } else if (type === 'placed') {
        query.placementStatus = 'placed';
    }

    const students = await Student.find(query)
        .select('name email department batch rollNumber cgpa placementStatus placementDetails isShortlisted')
        .sort({ 'placementDetails.package': -1, createdAt: -1 })
        .lean();

    res.json({
        success: true,
        data: students
    });
});

/**
 * @desc    Get placement statistics
 * @route   GET /api/college/placement-stats
 * @access  College Admin
 */
const getPlacementStats = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;

    // Overall stats
    const [totalStudents, placedStudents, shortlistedStudents, inProcessStudents] = await Promise.all([
        Student.countDocuments({ college: collegeId, isVerified: true }),
        Student.countDocuments({ college: collegeId, placementStatus: 'placed' }),
        Student.countDocuments({ college: collegeId, isShortlisted: true }),
        Student.countDocuments({ college: collegeId, placementStatus: 'in_process' })
    ]);

    // Placement by branch/department
    const placementByBranch = await Student.aggregate([
        { $match: { college: collegeId, isVerified: true } },
        {
            $group: {
                _id: '$department',
                total: { $sum: 1 },
                placed: {
                    $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] }
                },
                shortlisted: {
                    $sum: { $cond: ['$isShortlisted', 1, 0] }
                },
                avgPackage: {
                    $avg: {
                        $cond: [
                            { $eq: ['$placementStatus', 'placed'] },
                            '$placementDetails.package',
                            null
                        ]
                    }
                },
                maxPackage: {
                    $max: {
                        $cond: [
                            { $eq: ['$placementStatus', 'placed'] },
                            '$placementDetails.package',
                            0
                        ]
                    }
                }
            }
        },
        { $sort: { placed: -1 } }
    ]);

    // Placement by year/batch
    const placementByYear = await Student.aggregate([
        { $match: { college: collegeId, isVerified: true } },
        {
            $group: {
                _id: '$batch',
                total: { $sum: 1 },
                placed: {
                    $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] }
                },
                shortlisted: {
                    $sum: { $cond: ['$isShortlisted', 1, 0] }
                },
                avgPackage: {
                    $avg: {
                        $cond: [
                            { $eq: ['$placementStatus', 'placed'] },
                            '$placementDetails.package',
                            null
                        ]
                    }
                }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    // Placement by company
    const placementByCompany = await Student.aggregate([
        { $match: { college: collegeId, placementStatus: 'placed' } },
        {
            $group: {
                _id: '$placementDetails.company',
                count: { $sum: 1 },
                avgPackage: { $avg: '$placementDetails.package' },
                maxPackage: { $max: '$placementDetails.package' },
                roles: { $addToSet: '$placementDetails.role' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
    ]);

    // Package distribution
    const packageDistribution = await Student.aggregate([
        { $match: { college: collegeId, placementStatus: 'placed' } },
        {
            $bucket: {
                groupBy: '$placementDetails.package',
                boundaries: [0, 3, 5, 7, 10, 15, 100],
                default: 'Unknown',
                output: {
                    count: { $sum: 1 },
                    students: {
                        $push: {
                            name: { $concat: ['$name.firstName', ' ', '$name.lastName'] },
                            company: '$placementDetails.company',
                            package: '$placementDetails.package'
                        }
                    }
                }
            }
        }
    ]);

    // Format package ranges
    const packageLabels = {
        0: 'Below 3 LPA',
        3: '3-5 LPA',
        5: '5-7 LPA',
        7: '7-10 LPA',
        10: '10-15 LPA',
        15: 'Above 15 LPA',
        'Unknown': 'Not Specified'
    };

    const formattedPackageDistribution = packageDistribution.map(stat => ({
        range: packageLabels[stat._id] || stat._id,
        count: stat.count,
        students: stat.students
    }));

    res.json({
        success: true,
        data: {
            overview: {
                total: totalStudents,
                placed: placedStudents,
                shortlisted: shortlistedStudents,
                inProcess: inProcessStudents,
                placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0
            },
            placementByBranch,
            placementByYear,
            placementByCompany,
            packageDistribution: formattedPackageDistribution
        }
    });
});

/**
 * @desc    Export placement report
 * @route   GET /api/college/placement-report
 * @access  College Admin
 */
const exportPlacementReport = asyncHandler(async (req, res) => {
    const { formatPlacementData, sendCSVResponse } = require('../utils/csvExporter');
    const collegeId = req.user.collegeProfile._id;
    const { type = 'all' } = req.query; // all, placed, shortlisted

    let query = { college: collegeId, isVerified: true };

    if (type === 'placed') {
        query.placementStatus = 'placed';
    } else if (type === 'shortlisted') {
        query.isShortlisted = true;
    }

    const students = await Student.find(query)
        .populate('college', 'name')
        .lean();

    const formattedData = formatPlacementData(students);
    
    const filename = `placement_report_${type}_${Date.now()}`;
    sendCSVResponse(res, formattedData, filename);
});

/**
 * @desc    Get college profile and settings
 * @route   GET /api/college/profile
 * @access  College Admin
 */
const getCollegeProfile = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;

    const college = await College.findById(collegeId)
        .select('-stats -createdAt -updatedAt');

    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    res.json({
        success: true,
        data: college
    });
});

/**
 * @desc    Update college profile (limited fields)
 * @route   PATCH /api/college/profile
 * @access  College Admin
 */
const updateCollegeProfile = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;

    // Only allow updating specific fields
    const allowedFields = [
        'university',
        'contactEmail',
        'phone',
        'website',
        'address',
        'departments',
        'description',
        'logo'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
            updates[key] = req.body[key];
        }
    });

    const college = await College.findByIdAndUpdate(
        collegeId,
        updates,
        { new: true, runValidators: true }
    );

    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    res.json({
        success: true,
        message: 'College profile updated successfully',
        data: college
    });
});

/**
 * @desc    Get college settings
 * @route   GET /api/college/settings
 * @access  College Admin
 */
const getCollegeSettings = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;

    const college = await College.findById(collegeId)
        .select('settings');

    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    // Initialize settings if not exists
    if (!college.settings) {
        college.settings = {
            allowStudentSelfSignup: false,
            placementRules: {
                minCGPA: 6.0,
                maxActiveBacklogs: 2,
                allowMultipleOffers: true,
                requireResumeUpload: true
            }
        };
        await college.save();
    }

    res.json({
        success: true,
        data: college.settings
    });
});

/**
 * @desc    Update college settings
 * @route   PATCH /api/college/settings
 * @access  College Admin
 */
const updateCollegeSettings = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { allowStudentSelfSignup, placementRules } = req.body;

    const college = await College.findById(collegeId);

    if (!college) {
        return res.status(404).json({
            success: false,
            message: 'College not found'
        });
    }

    // Initialize settings if not exists
    if (!college.settings) {
        college.settings = {};
    }

    // Update settings
    if (allowStudentSelfSignup !== undefined) {
        college.settings.allowStudentSelfSignup = allowStudentSelfSignup;
    }

    if (placementRules) {
        if (!college.settings.placementRules) {
            college.settings.placementRules = {};
        }

        if (placementRules.minCGPA !== undefined) {
            college.settings.placementRules.minCGPA = placementRules.minCGPA;
        }
        if (placementRules.maxActiveBacklogs !== undefined) {
            college.settings.placementRules.maxActiveBacklogs = placementRules.maxActiveBacklogs;
        }
        if (placementRules.allowMultipleOffers !== undefined) {
            college.settings.placementRules.allowMultipleOffers = placementRules.allowMultipleOffers;
        }
        if (placementRules.requireResumeUpload !== undefined) {
            college.settings.placementRules.requireResumeUpload = placementRules.requireResumeUpload;
        }
    }

    await college.save();

    res.json({
        success: true,
        message: 'Settings updated successfully',
        data: college.settings
    });
});

/**
 * @desc    Get company recruitment activity for college
 * @route   GET /api/college/company-activity
 * @access  College Admin
 */
const getCompanyActivity = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { Company, Application, Job, Shortlist, ActivityLog } = require('../models');

    // Get all students from this college
    const collegeStudents = await Student.find({ college: collegeId }).distinct('_id');

    // Get companies that have interacted with college students
    // 1. Companies with applications from college students
    const applicationsData = await Application.aggregate([
        {
            $match: {
                student: { $in: collegeStudents }
            }
        },
        {
            $lookup: {
                from: 'jobs',
                localField: 'job',
                foreignField: '_id',
                as: 'jobData'
            }
        },
        { $unwind: '$jobData' },
        {
            $group: {
                _id: '$jobData.company',
                totalApplications: { $sum: 1 },
                shortlisted: {
                    $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] }
                },
                interviewed: {
                    $sum: { $cond: [{ $eq: ['$status', 'interviewed'] }, 1, 0] }
                },
                offered: {
                    $sum: { $cond: [{ $eq: ['$status', 'offered'] }, 1, 0] }
                },
                hired: {
                    $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] }
                },
                lastActivity: { $max: '$updatedAt' }
            }
        },
        { $sort: { lastActivity: -1 } },
        { $limit: 20 }
    ]);

    // 2. Companies that shortlisted college students
    const shortlistData = await Shortlist.aggregate([
        {
            $match: {
                student: { $in: collegeStudents }
            }
        },
        {
            $group: {
                _id: '$company',
                totalShortlisted: { $sum: 1 },
                lastActivity: { $max: '$createdAt' }
            }
        },
        { $sort: { lastActivity: -1 } }
    ]);

    // Populate company details
    const companyIds = [...new Set([
        ...applicationsData.map(a => a._id),
        ...shortlistData.map(s => s._id)
    ])];

    const companies = await Company.find({
        _id: { $in: companyIds }
    }).select('name industry logo contactPerson');

    // Merge data
    const companyActivityMap = {};
    
    companies.forEach(company => {
        companyActivityMap[company._id] = {
            _id: company._id,
            name: company.name,
            industry: company.industry,
            logo: company.logo,
            contactPerson: company.contactPerson,
            applications: 0,
            shortlisted: 0,
            interviewed: 0,
            offered: 0,
            hired: 0,
            totalShortlisted: 0,
            lastActivity: null
        };
    });

    applicationsData.forEach(app => {
        if (companyActivityMap[app._id]) {
            companyActivityMap[app._id].applications = app.totalApplications;
            companyActivityMap[app._id].shortlisted = app.shortlisted;
            companyActivityMap[app._id].interviewed = app.interviewed;
            companyActivityMap[app._id].offered = app.offered;
            companyActivityMap[app._id].hired = app.hired;
            companyActivityMap[app._id].lastActivity = app.lastActivity;
        }
    });

    shortlistData.forEach(short => {
        if (companyActivityMap[short._id]) {
            companyActivityMap[short._id].totalShortlisted = short.totalShortlisted;
            if (!companyActivityMap[short._id].lastActivity || 
                short.lastActivity > companyActivityMap[short._id].lastActivity) {
                companyActivityMap[short._id].lastActivity = short.lastActivity;
            }
        }
    });

    // Convert to array and sort by last activity
    const companyActivity = Object.values(companyActivityMap)
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    // Get summary stats
    const summary = {
        totalCompaniesEngaged: companyActivity.length,
        totalApplications: companyActivity.reduce((sum, c) => sum + c.applications, 0),
        totalShortlisted: companyActivity.reduce((sum, c) => sum + c.totalShortlisted, 0),
        totalOffered: companyActivity.reduce((sum, c) => sum + c.offered, 0),
        totalHired: companyActivity.reduce((sum, c) => sum + c.hired, 0)
    };

    // Get recent activity logs
    const recentActivity = await ActivityLog.find({
        targetModel: 'Student',
        targetId: { $in: collegeStudents },
        action: { $in: ['view_student', 'shortlist_student', 'download_student_data'] }
    })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('user', 'email role')
        .populate({
            path: 'user',
            populate: {
                path: 'companyProfile',
                select: 'name'
            }
        })
        .lean();

    res.json({
        success: true,
        data: {
            summary,
            companies: companyActivity,
            recentActivity
        }
    });
});

/**
 * @desc    Get student placement activity timeline
 * @route   GET /api/college/students/:id/placement-activity
 * @access  College Admin
 */
const getStudentPlacementActivity = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const studentId = req.params.id;

    // Verify student belongs to this college
    const student = await Student.findOne({
        _id: studentId,
        college: collegeId
    }).populate('user', 'email');

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
    }

    const { Application, Job, Company, Shortlist } = require('../models');

    // Get all applications by this student
    const applications = await Application.find({ student: studentId })
        .populate({
            path: 'job',
            select: 'title location jobType salary',
            populate: {
                path: 'company',
                select: 'name logo industry contactPerson website'
            }
        })
        .sort({ createdAt: -1 })
        .lean();

    // Get all shortlists for this student
    const shortlists = await Shortlist.find({ student: studentId })
        .populate('company', 'name logo industry')
        .populate('job', 'title location')
        .sort({ createdAt: -1 })
        .lean();

    // Build timeline combining applications and shortlists
    const timeline = [];

    // Add applications to timeline
    applications.forEach(app => {
        if (app.job && app.job.company) {
            timeline.push({
                type: 'application',
                action: getApplicationAction(app.status),
                company: app.job.company,
                job: {
                    title: app.job.title,
                    location: app.job.location,
                    jobType: app.job.jobType,
                    salary: app.job.salary
                },
                status: app.status,
                date: app.updatedAt || app.createdAt,
                details: {
                    appliedAt: app.createdAt,
                    currentStatus: app.status
                }
            });
        }
    });

    // Add shortlists to timeline
    shortlists.forEach(shortlist => {
        timeline.push({
            type: 'shortlist',
            action: 'SHORTLISTED',
            company: shortlist.company,
            job: shortlist.job ? {
                title: shortlist.job.title,
                location: shortlist.job.location
            } : null,
            status: shortlist.status,
            date: shortlist.createdAt,
            details: {
                notes: shortlist.notes,
                shortlistedAt: shortlist.createdAt
            }
        });
    });

    // Add placement details if student is placed
    if (student.placementStatus === 'placed' && student.placementDetails) {
        timeline.push({
            type: 'placement',
            action: 'PLACED',
            company: {
                name: student.placementDetails.company
            },
            status: 'placed',
            date: student.placementDetails.joiningDate || student.updatedAt,
            details: {
                role: student.placementDetails.role,
                package: student.placementDetails.package,
                joiningDate: student.placementDetails.joiningDate
            }
        });
    }

    // Sort timeline by date (newest first)
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
        success: true,
        data: {
            student: {
                _id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                email: student.email,
                department: student.department,
                batch: student.batch,
                placementStatus: student.placementStatus
            },
            timeline,
            summary: {
                totalApplications: applications.length,
                totalShortlists: shortlists.length,
                isPlaced: student.placementStatus === 'placed',
                placementDetails: student.placementStatus === 'placed' ? student.placementDetails : null
            }
        }
    });
});

// Helper function to get action text based on application status
function getApplicationAction(status) {
    const actionMap = {
        'pending': 'APPLIED',
        'reviewed': 'UNDER REVIEW',
        'shortlisted': 'SHORTLISTED',
        'interviewed': 'INTERVIEWED',
        'offered': 'OFFERED',
        'hired': 'HIRED',
        'rejected': 'REJECTED',
        'withdrawn': 'WITHDRAWN'
    };
    return actionMap[status] || 'APPLIED';
}



/**
 * @desc    Get placement drives
 * @route   GET /api/college/drives
 * @access  College Admin
 */
const getPlacementDrives = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { status } = req.query;
    const { Job, Application } = require('../models');

    const query = { 
        college: collegeId,
        isPlacementDrive: true 
    };

    if (status) {
        if (status === 'upcoming') {
            query.driveDate = { $gte: new Date() };
        } else if (status === 'past') {
            query.driveDate = { $lt: new Date() };
        }
    }

    const drives = await Job.find(query)
        .sort({ driveDate: 1 })
        .populate('company', 'name logo industry description website')
        .lean();

    // Get stats for each drive
    const drivesWithStats = await Promise.all(drives.map(async (drive) => {
        const stats = await Application.aggregate([
            { $match: { job: drive._id } },
            { 
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const applicationCount = stats.reduce((sum, s) => sum + s.count, 0);
        
        return {
            ...drive,
            stats: {
                totalApplications: applicationCount,
                breakdown: stats.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {})
            }
        };
    }));

    res.json({
        success: true,
        data: drivesWithStats
    });
});

/**
 * @desc    Toggle student star status
 * @route   PATCH /api/college/students/:id/toggle-star
 * @access  College Admin
 */
const toggleStarStudent = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { id } = req.params;

    const student = await Student.findOne({
        _id: id,
        college: collegeId
    });

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

module.exports = {
    getDashboardStats,
    getStudents,
    getStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    verifyStudent,
    bulkUploadStudents,
    getDepartments,
    exportStudents,
    resetStudentPassword,
    getConnectedCompanies,
    getCompanyRequests,
    respondToCompanyRequest,
    revokeCompanyAccess,
    updateCompanyAccessSettings,
    getAgencyActivity,
    getCompanyActivity,
    getPlacementTracking,
    getPlacementStats,
    exportPlacementReport,
    getCollegeProfile,
    updateCollegeProfile,
    getCollegeSettings,
    updateCollegeSettings,
    getStudentPlacementActivity,
    getPlacementDrives,
    toggleStarStudent,
    rejectStudent
};
