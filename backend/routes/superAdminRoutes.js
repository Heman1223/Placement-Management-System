const express = require('express');
const router = express.Router();
const { superAdminController } = require('../controllers');
const { auth, isSuperAdmin, validateObjectId } = require('../middleware');

// All routes require super admin
router.use(auth, isSuperAdmin);

// Dashboard
router.get('/stats', superAdminController.getDashboardStats);

// Colleges
router.get('/colleges', superAdminController.getColleges);
router.post('/colleges', superAdminController.createCollege);
router.get('/colleges/:id', validateObjectId('id'), superAdminController.getCollegeDetails);
router.patch('/colleges/:id/approve', validateObjectId('id'), superAdminController.approveCollege);
router.get('/colleges/:id/students', validateObjectId('id'), superAdminController.getCollegeStudents);
router.post('/colleges/:id/students', validateObjectId('id'), superAdminController.addStudentToCollege);

// Companies
router.get('/companies', superAdminController.getCompanies);
router.post('/companies', superAdminController.createCompany);
router.patch('/companies/:id/approve', validateObjectId('id'), superAdminController.approveCompany);

// Users
router.get('/users', superAdminController.getAllUsers);
router.patch('/users/:id/toggle-status', validateObjectId('id'), superAdminController.toggleUserStatus);

module.exports = router;
