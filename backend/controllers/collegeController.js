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
        type: 'agency',
        isApproved: true,
        isActive: true,
        'agencyAccess.allowedColleges': collegeId
    });

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
            placementStatusStats
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

    const studentData = {
        ...req.body,
        college: collegeId,
        addedBy: req.userId,
        source: 'manual',
        isVerified: true, // Auto-verify students added by college admin
        verifiedAt: new Date(),
        verifiedBy: req.userId
    };

    const student = await Student.create(studentData);

    // Update college stats
    await College.findByIdAndUpdate(collegeId, {
        $inc: { 
            'stats.totalStudents': 1,
            'stats.verifiedStudents': 1 // Increment verified count
        }
    });

    res.status(201).json({
        success: true,
        message: 'Student added successfully',
        data: student
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
            const student = await Student.create({
                ...studentData,
                college: collegeId,
                addedBy: req.userId,
                source: 'bulk_upload',
                isVerified: true, // Auto-verify bulk uploaded students
                verifiedAt: new Date(),
                verifiedBy: req.userId
            });
            results.success.push({
                rollNumber: student.rollNumber,
                name: `${student.name.firstName} ${student.name.lastName}`
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
    getDepartments
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
const getAgencies = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { Company } = require('../models');

    // Get all approved agencies that have access to this college
    const agencies = await Company.find({
        type: 'agency',
        isApproved: true,
        'agencyAccess.allowedColleges': collegeId
    }).select('name industry contactPerson agencyAccess isActive isSuspended');

    // Get agency activity from activity logs
    const { ActivityLog } = require('../models');
    
    const agenciesWithActivity = await Promise.all(agencies.map(async (agency) => {
        const agencyUser = await User.findOne({ companyProfile: agency._id });
        
        if (!agencyUser) {
            return {
                ...agency.toObject(),
                activity: {
                    profilesAccessed: 0,
                    shortlistsMade: 0,
                    downloadsCount: 0
                }
            };
        }

        const [profilesAccessed, shortlistsMade] = await Promise.all([
            ActivityLog.countDocuments({
                user: agencyUser._id,
                action: 'view_student',
                targetModel: 'Student'
            }),
            ActivityLog.countDocuments({
                user: agencyUser._id,
                action: 'shortlist_student'
            })
        ]);

        // Get access details for this college
        const accessDetails = agency.agencyAccess.allowedColleges.find(
            c => c.toString() === collegeId.toString()
        );

        return {
            ...agency.toObject(),
            activity: {
                profilesAccessed,
                shortlistsMade,
                downloadsCount: agency.agencyAccess.downloadCount || 0,
                downloadLimit: agency.agencyAccess.downloadLimit,
                accessExpiryDate: agency.agencyAccess.accessExpiryDate
            }
        };
    }));

    res.json({
        success: true,
        data: agenciesWithActivity
    });
});

/**
 * @desc    Get agency access requests for this college
 * @route   GET /api/college/agency-requests
 * @access  College Admin
 */
const getAgencyRequests = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const { Company } = require('../models');

    // Get agencies that are approved but don't have access to this college yet
    // Or agencies that have requested access (we'll track this via a pending status)
    const allAgencies = await Company.find({
        type: 'agency',
        isApproved: true,
        isActive: true,
        isDeleted: false
    }).select('name industry contactPerson agencyAccess');

    // Filter to show only agencies that don't have access yet
    const requestableAgencies = allAgencies.filter(agency => {
        const hasAccess = agency.agencyAccess?.allowedColleges?.some(
            ac => ac.college?.toString() === collegeId.toString()
        );
        return !hasAccess;
    });

    res.json({
        success: true,
        data: requestableAgencies
    });
});

/**
 * @desc    Grant agency access to college
 * @route   POST /api/college/agencies/:id/grant-access
 * @access  College Admin
 */
const grantAgencyAccess = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const agencyId = req.params.id;
    const { accessExpiryDate, downloadLimit } = req.body;
    const { Company } = require('../models');

    // Find the agency
    const agency = await Company.findOne({
        _id: agencyId,
        type: 'agency',
        isApproved: true,
        isActive: true
    });

    if (!agency) {
        return res.status(404).json({
            success: false,
            message: 'Agency not found or not approved'
        });
    }

    // Check if agency already has access
    const hasAccess = agency.agencyAccess?.allowedColleges?.some(
        ac => ac.college?.toString() === collegeId.toString()
    );

    if (hasAccess) {
        return res.status(400).json({
            success: false,
            message: 'Agency already has access to your college'
        });
    }

    // Grant access
    if (!agency.agencyAccess) {
        agency.agencyAccess = {
            allowedColleges: [],
            downloadLimit: downloadLimit || 100,
            downloadCount: 0
        };
    }

    agency.agencyAccess.allowedColleges.push({
        college: collegeId,
        grantedAt: new Date(),
        grantedBy: req.userId
    });

    if (accessExpiryDate) {
        agency.agencyAccess.accessExpiryDate = new Date(accessExpiryDate);
    }

    if (downloadLimit) {
        agency.agencyAccess.downloadLimit = downloadLimit;
    }

    await agency.save();

    res.json({
        success: true,
        message: 'Agency access granted successfully',
        data: agency
    });
});

/**
 * @desc    Revoke agency access from college
 * @route   DELETE /api/college/agencies/:id/revoke-access
 * @access  College Admin
 */
const revokeAgencyAccess = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const agencyId = req.params.id;
    const { Company } = require('../models');

    // Find the agency
    const agency = await Company.findOne({
        _id: agencyId,
        type: 'agency'
    });

    if (!agency) {
        return res.status(404).json({
            success: false,
            message: 'Agency not found'
        });
    }

    // Check if agency has access
    const accessIndex = agency.agencyAccess?.allowedColleges?.findIndex(
        ac => ac.college?.toString() === collegeId.toString()
    );

    if (accessIndex === -1 || accessIndex === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Agency does not have access to your college'
        });
    }

    // Remove access
    agency.agencyAccess.allowedColleges.splice(accessIndex, 1);
    await agency.save();

    res.json({
        success: true,
        message: 'Agency access revoked successfully'
    });
});

/**
 * @desc    Update agency access settings
 * @route   PATCH /api/college/agencies/:id/access-settings
 * @access  College Admin
 */
const updateAgencyAccessSettings = asyncHandler(async (req, res) => {
    const collegeId = req.user.collegeProfile._id;
    const agencyId = req.params.id;
    const { accessExpiryDate, downloadLimit } = req.body;
    const { Company } = require('../models');

    // Find the agency
    const agency = await Company.findOne({
        _id: agencyId,
        type: 'agency',
        'agencyAccess.allowedColleges.college': collegeId
    });

    if (!agency) {
        return res.status(404).json({
            success: false,
            message: 'Agency not found or does not have access to your college'
        });
    }

    // Update settings
    if (accessExpiryDate !== undefined) {
        agency.agencyAccess.accessExpiryDate = accessExpiryDate ? new Date(accessExpiryDate) : null;
    }

    if (downloadLimit !== undefined) {
        agency.agencyAccess.downloadLimit = downloadLimit;
    }

    await agency.save();

    res.json({
        success: true,
        message: 'Agency access settings updated successfully',
        data: agency
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
    const { Company, ActivityLog } = require('../models');

    // Verify agency has access to this college
    const agency = await Company.findOne({
        _id: agencyId,
        type: 'agency',
        'agencyAccess.allowedColleges': collegeId
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
                    downloadsCount: 0
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
                downloadsCount: agency.agencyAccess.downloadCount || 0,
                downloadLimit: agency.agencyAccess.downloadLimit
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
        'contactEmail',
        'phone',
        'website',
        'address',
        'departments',
        'description'
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
    getAgencies,
    getAgencyRequests,
    getAgencyActivity,
    grantAgencyAccess,
    revokeAgencyAccess,
    updateAgencyAccessSettings,
    getPlacementTracking,
    getPlacementStats,
    exportPlacementReport,
    getCollegeProfile,
    updateCollegeProfile,
    getCollegeSettings,
    updateCollegeSettings
};
