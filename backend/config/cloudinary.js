const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for resumes (PDF, DOC, DOCX)
const resumeStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Get student ID - handle both ObjectId and populated object
        let studentId = 'unknown';
        if (req.user?.studentProfile) {
            studentId = typeof req.user.studentProfile === 'object' 
                ? req.user.studentProfile._id?.toString() || req.user.studentProfile.toString()
                : req.user.studentProfile.toString();
        } else if (req.params?.id) {
            studentId = req.params.id;
        } else if (req.body?.studentId) {
            studentId = req.body.studentId;
        } else if (req.query?.studentId) {
            studentId = req.query.studentId;
        }
        
        // Create a short, clean filename
        const timestamp = Date.now();
        
        return {
            folder: 'placement-system/resumes',
            resource_type: 'raw',
            public_id: `resume_${studentId}_${timestamp}`
        };
    }
});

const certificateStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let studentId = 'unknown';
        if (req.user?.studentProfile) {
            studentId = typeof req.user.studentProfile === 'object' 
                ? req.user.studentProfile._id?.toString() || req.user.studentProfile.toString()
                : req.user.studentProfile.toString();
        } else if (req.body?.studentId) {
            studentId = req.body.studentId;
        }
        
        return {
            folder: 'placement-system/certificates',
            resource_type: 'raw',
            public_id: `cert_${studentId}_${Date.now()}`
        };
    }
});

// Storage for logos (images)
const logoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'placement-system/logos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// Storage for student profile pictures
const studentImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'placement-system/students',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
    }
});

// Multer upload instances
const uploadResume = multer({
    storage: resumeStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'), false);
        }
    }
});

const uploadLogo = multer({
    storage: logoStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

const uploadStudentImage = multer({
    storage: studentImageStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

const uploadCertificate = multer({
    storage: certificateStorage,
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    }
});

// Delete file from Cloudinary
const deleteFile = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        return true;
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return false;
    }
};

module.exports = {
    cloudinary,
    uploadResume,
    uploadLogo,
    uploadStudentImage,
    uploadCertificate,
    deleteFile
};
