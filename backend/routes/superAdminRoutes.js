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
router.patch('/colleges/:id/approve', validateObjectId('id'), superAdminController.approveCollege);

// Companies
router.get('/companies', superAdminController.getCompanies);
router.patch('/companies/:id/approve', validateObjectId('id'), superAdminController.approveCompany);

// Users
router.get('/users', superAdminController.getAllUsers);
router.patch('/users/:id/toggle-status', validateObjectId('id'), superAdminController.toggleUserStatus);

module.exports = router;
