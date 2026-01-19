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
        verifiedStudents,
        placedStudents,
        inProcessStudents
    ] = await Promise.all([
        Student.countDocuments({ college: collegeId }),
        Student.countDocuments({ college: collegeId, isVerified: true }),
        Student.countDocuments({ college: collegeId, placementStatus: 'placed' }),
        Student.countDocuments({ college: collegeId, placementStatus: 'in_process' })
    ]);

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

    res.json({
        success: true,
        data: {
            overview: {
                total: totalStudents,
                verified: verifiedStudents,
                placed: placedStudents,
                inProcess: inProcessStudents,
                placementRate: totalStudents > 0
                    ? ((placedStudents / totalStudents) * 100).toFixed(1)
                    : 0
            },
            departmentStats,
            batchStats
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
        sortBy = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 10
    } = req.query;

    const query = { college: collegeId };

    if (department) query.department = department;
    if (batch) query.batch = parseInt(batch);
    if (status) query.placementStatus = status;
    if (verified !== undefined) query.isVerified = verified === 'true';

    if (search) {
        query.$or = [
            { 'name.firstName': { $regex: search, $options: 'i' } },
            { 'name.lastName': { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { rollNumber: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [students, total] = await Promise.all([
        Student.find(query)
            .select('-projects -certifications -education')
            .sort({ [sortBy]: sortOrder })
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
 * @desc    Get single student details
 * @route   GET /api/college/students/:id
 * @access  College Admin
 */
const getStudent = asyncHandler(async (req, res) => {
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

    res.json({
        success: true,
        data: student
    });
});

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
        source: 'manual'
    };

    const student = await Student.create(studentData);

    // Update college stats
    await College.findByIdAndUpdate(collegeId, {
        $inc: { 'stats.totalStudents': 1 }
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
                source: 'bulk_upload'
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
        $inc: { 'stats.totalStudents': results.success.length }
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
