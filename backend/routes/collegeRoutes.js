const express = require('express');
const router = express.Router();
const { collegeController } = require('../controllers');
const { auth, isCollegeAdmin, isApproved, validateObjectId, validatePagination } = require('../middleware');

// All routes require college admin
router.use(auth, isCollegeAdmin, isApproved);

// Dashboard
router.get('/stats', collegeController.getDashboardStats);

// Students
router.get('/students', validatePagination, collegeController.getStudents);
router.get('/students/export', collegeController.exportStudents);
router.get('/students/:id', validateObjectId('id'), collegeController.getStudent);
router.post('/students', collegeController.addStudent);
router.put('/students/:id', validateObjectId('id'), collegeController.updateStudent);
router.delete('/students/:id', validateObjectId('id'), collegeController.deleteStudent);
router.patch('/students/:id/verify', validateObjectId('id'), collegeController.verifyStudent);
router.patch('/students/:id/reject', validateObjectId('id'), collegeController.rejectStudent);
router.post('/students/:id/reset-password', validateObjectId('id'), collegeController.resetStudentPassword);
router.get('/students/:id/placement-activity', validateObjectId('id'), collegeController.getStudentPlacementActivity);
router.patch('/students/:id/toggle-star', validateObjectId('id'), collegeController.toggleStarStudent);

// Bulk upload
router.post('/students/bulk', collegeController.bulkUploadStudents);

// Departments
router.get('/departments', collegeController.getDepartments);

// Agency Management
// Company Access Management
router.get('/companies', collegeController.getConnectedCompanies);
router.get('/company-requests', collegeController.getCompanyRequests);
router.post('/company-requests/:id/respond', validateObjectId('id'), collegeController.respondToCompanyRequest);
router.delete('/companies/:id/revoke', validateObjectId('id'), collegeController.revokeCompanyAccess);
router.patch('/companies/:id/settings', validateObjectId('id'), collegeController.updateCompanyAccessSettings);

// Placement Drives
router.get('/drives', collegeController.getPlacementDrives);

// Company Activity
router.get('/company-activity', collegeController.getCompanyActivity);

// Placement Tracking
router.get('/placements', collegeController.getPlacementTracking);
router.get('/placement-stats', collegeController.getPlacementStats);
router.get('/placement-report', collegeController.exportPlacementReport);

// Profile & Settings
router.get('/profile', collegeController.getCollegeProfile);
router.patch('/profile', collegeController.updateCollegeProfile);
router.get('/settings', collegeController.getCollegeSettings);
router.patch('/settings', collegeController.updateCollegeSettings);

module.exports = router;
