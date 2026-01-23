const express = require('express');
const router = express.Router();
const { superAdminController } = require('../controllers');
const { auth, isSuperAdmin, validateObjectId } = require('../middleware');

// All routes require super admin
router.use(auth, isSuperAdmin);

// Dashboard & Analytics
router.get('/stats', superAdminController.getDashboardStats);
router.get('/analytics', superAdminController.getAnalytics);

// Settings
const settingsController = require('../controllers/settingsController');
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateAllSettings);
router.post('/settings/reset', settingsController.resetSettings);
router.patch('/settings/student-signup', settingsController.updateStudentSignup);
router.patch('/settings/agency-registration', settingsController.updateAgencyRegistration);
router.patch('/settings/approval-rules', settingsController.updateApprovalRules);
router.patch('/settings/maintenance-mode', settingsController.toggleMaintenanceMode);
router.patch('/settings/data-visibility', settingsController.updateDataVisibility);

// Colleges
router.get('/colleges', superAdminController.getColleges);
router.post('/colleges', superAdminController.createCollege);
router.get('/colleges/:id', validateObjectId('id'), superAdminController.getCollegeDetails);
router.patch('/colleges/:id', validateObjectId('id'), superAdminController.updateCollege);
router.patch('/colleges/:id/approve', validateObjectId('id'), superAdminController.approveCollege);
router.patch('/colleges/:id/toggle-active', validateObjectId('id'), superAdminController.toggleCollegeStatus);
router.delete('/colleges/:id', validateObjectId('id'), superAdminController.softDeleteCollege);
router.patch('/colleges/:id/restore', validateObjectId('id'), superAdminController.restoreCollege);
router.get('/colleges/:id/students', validateObjectId('id'), superAdminController.getCollegeStudents);
router.post('/colleges/:id/students', validateObjectId('id'), superAdminController.addStudentToCollege);

// College Admins
router.get('/college-admins/:id', validateObjectId('id'), superAdminController.getCollegeAdmin);
router.patch('/college-admins/:id', validateObjectId('id'), superAdminController.updateCollegeAdmin);
router.patch('/college-admins/:id/toggle-block', validateObjectId('id'), superAdminController.toggleCollegeAdminBlock);

// Companies
router.get('/companies', superAdminController.getCompanies);
router.post('/companies', superAdminController.createCompany);
router.get('/companies/:id/agency-details', validateObjectId('id'), superAdminController.getAgencyDetails);
router.patch('/companies/:id', validateObjectId('id'), superAdminController.updateCompany);
router.patch('/companies/:id/approve', validateObjectId('id'), superAdminController.approveCompany);
router.patch('/companies/:id/toggle-active', validateObjectId('id'), superAdminController.toggleCompanyStatus);
router.patch('/companies/:id/suspend', validateObjectId('id'), superAdminController.toggleCompanySuspension);
router.delete('/companies/:id', validateObjectId('id'), superAdminController.softDeleteCompany);
router.patch('/companies/:id/restore', validateObjectId('id'), superAdminController.restoreCompany);
router.post('/companies/:id/assign-colleges', validateObjectId('id'), superAdminController.assignCollegesToAgency);
router.delete('/companies/:id/colleges/:collegeId', validateObjectId('id'), superAdminController.removeCollegeFromAgency);
router.patch('/companies/:id/access-expiry', validateObjectId('id'), superAdminController.setAgencyAccessExpiry);
router.patch('/companies/:id/download-limit', validateObjectId('id'), superAdminController.setAgencyDownloadLimit);

// Students (Platform-wide)
router.get('/students', superAdminController.getAllStudents);
router.get('/students/:id', validateObjectId('id'), superAdminController.getStudentDetails);
router.patch('/students/:id/toggle-star', validateObjectId('id'), superAdminController.toggleStarStudent); // Also ensure this route exists if I missed it earlier

// Jobs (Platform-wide)
router.get('/jobs', superAdminController.getAllJobs);

// Users
router.get('/users', superAdminController.getAllUsers);
router.patch('/users/:id/toggle-status', validateObjectId('id'), superAdminController.toggleUserStatus);
router.post('/users/:id/reset-password', validateObjectId('id'), superAdminController.resetUserPassword);

module.exports = router;
