const express = require('express');
const router = express.Router();
const { companyController } = require('../controllers');
const { auth, isCompany, isApproved, validateObjectId, validatePagination } = require('../middleware');

// All routes require company auth
router.use(auth, isCompany);

// Dashboard (doesn't require approval)
router.get('/stats', isApproved, companyController.getDashboardStats);

// Profile
router.put('/profile', companyController.updateProfile);

// Student search (requires approval)
router.get('/students/search', isApproved, validatePagination, companyController.searchStudents);
router.get('/students/:id', isApproved, validateObjectId('id'), companyController.getStudentProfile);

// Colleges list for filter
router.get('/colleges', isApproved, companyController.getColleges);

// Shortlisting
router.post('/shortlist', isApproved, companyController.shortlistStudent);
router.get('/shortlist', isApproved, validatePagination, companyController.getShortlistedCandidates);
router.get('/shortlist/export', isApproved, companyController.exportShortlist);

// Applications
router.patch('/applications/:id/status', isApproved, validateObjectId('id'), companyController.updateApplicationStatus);

module.exports = router;
