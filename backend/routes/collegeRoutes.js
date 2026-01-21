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
router.post('/students/:id/reset-password', validateObjectId('id'), collegeController.resetStudentPassword);

// Bulk upload
router.post('/students/bulk', collegeController.bulkUploadStudents);

// Departments
router.get('/departments', collegeController.getDepartments);

// Agency Management
router.get('/agencies', collegeController.getAgencies);
router.get('/agency-requests', collegeController.getAgencyRequests);
router.get('/agencies/:id/activity', validateObjectId('id'), collegeController.getAgencyActivity);
router.post('/agencies/:id/grant-access', validateObjectId('id'), collegeController.grantAgencyAccess);
router.delete('/agencies/:id/revoke-access', validateObjectId('id'), collegeController.revokeAgencyAccess);
router.patch('/agencies/:id/access-settings', validateObjectId('id'), collegeController.updateAgencyAccessSettings);

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
