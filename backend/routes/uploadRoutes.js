const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadResume, uploadLogo, uploadStudentImage, uploadCertificate } = require('../config/cloudinary');
const { auth, isStudent, isCollegeAdmin, isCompany } = require('../middleware');
const { Student, College, Company } = require('../models');

/**
 * @route   POST /api/upload/image
 * @desc    Upload student profile picture
 * @access  Private (Student or College Admin)
 */
router.post('/image', auth, uploadStudentImage.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const imageUrl = req.file.path;

        // If student is uploading their own image
        if (req.user.role === 'student') {
            await Student.findOneAndUpdate(
                { user: req.user._id },
                { profilePicture: imageUrl }
            );
        } else if (req.body.studentId) {
            // If college admin is uploading/editing for a student
            await Student.findByIdAndUpdate(
                req.body.studentId,
                { profilePicture: imageUrl }
            );
        }

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                url: imageUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/upload/resume
 * @desc    Upload student resume
 * @access  Private (Student or College Admin)
 */
router.post('/resume', auth, (req, res, next) => {
    uploadResume.single('resume')(req, res, (err) => {
        if (err) {
            console.error('Resume upload error:', err);
            
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File size too large. Maximum size is 5MB.'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                });
            }
            
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file'
            });
        }
        
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        let resumeUrl = req.file.path;
        
        // For PDFs uploaded with 'auto' resource type, Cloudinary stores them as 'image'
        // The URL will be correct as-is and PDFs will display in browser
        
        console.log('Resume uploaded successfully:');
        console.log('- File:', req.file.originalname);
        console.log('- URL:', resumeUrl);
        console.log('- Mimetype:', req.file.mimetype);
        console.log('- User role:', req.user.role);

        // If student is uploading their own resume
        if (req.user.role === 'student') {
            const updatedStudent = await Student.findOneAndUpdate(
                { user: req.user._id },
                { resumeUrl },
                { new: true }
            );
            console.log('- Updated student:', updatedStudent?.email);
            console.log('- Resume URL saved:', updatedStudent?.resumeUrl);
        }

        res.json({
            success: true,
            message: 'Resume uploaded successfully',
            data: {
                url: resumeUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading resume',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/upload/logo
 * @desc    Upload college/company logo
 * @access  Private (College Admin or Company)
 */
router.post('/logo', auth, uploadLogo.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const logoUrl = req.file.path;

        // Update logo based on user role
        if (req.user.role === 'college_admin') {
            await College.findOneAndUpdate(
                { admin: req.user._id },
                { logo: logoUrl }
            );
        } else if (req.user.role === 'company') {
            await Company.findOneAndUpdate(
                { user: req.user._id },
                { logo: logoUrl }
            );
        }

        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            data: {
                url: logoUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading logo',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/upload/certificate
 * @desc    Upload student certificate (PDF/Image)
 * @access  Private (Student)
 */
router.post('/certificate', auth, uploadCertificate.single('certificate'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'Certificate uploaded successfully',
            data: {
                url: req.file.path,
                filename: req.file.filename
            }
        });
    } catch (error) {
        console.error('Certificate upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading certificate',
            error: error.message
        });
    }
});

module.exports = router;
