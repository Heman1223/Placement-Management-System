const express = require('express');
const router = express.Router();
const { uploadResume, uploadLogo } = require('../config/cloudinary');
const { auth, isStudent, isCollegeAdmin, isCompany } = require('../middleware');
const { Student, College, Company } = require('../models');

/**
 * @route   POST /api/upload/resume
 * @desc    Upload student resume
 * @access  Private (Student or College Admin)
 */
router.post('/resume', auth, uploadResume.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const resumeUrl = req.file.path;

        // If student is uploading their own resume
        if (req.user.role === 'student') {
            await Student.findOneAndUpdate(
                { user: req.user._id },
                { resumeUrl }
            );
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

module.exports = router;
