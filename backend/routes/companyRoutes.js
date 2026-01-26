const express = require('express');
const router = express.Router();
const { companyController } = require('../controllers');
const { auth, isCompany, isApproved, validateObjectId, validatePagination } = require('../middleware');

// All routes require company auth
router.use(auth, isCompany);

// Dashboard (doesn't require approval)
router.get('/stats', isApproved, companyController.getDashboardStats);

// Download statistics and limits
router.get('/download-stats', isApproved, companyController.getDownloadStatistics);
router.post('/bulk-download', isApproved, companyController.bulkDownloadStudents);

// Profile
router.get('/profile', companyController.getProfile);
router.put('/profile', companyController.updateProfile);

// College Access Management
router.post('/request-access', isApproved, companyController.requestCollegeAccess);
router.get('/my-colleges', isApproved, companyController.getRequestedColleges);

// Student search (requires approval)
router.get('/students/search', isApproved, validatePagination, companyController.searchStudents);
router.get('/students/:id', isApproved, validateObjectId('id'), companyController.getStudentProfile);
router.post('/students/:id/invite', isApproved, validateObjectId('id'), companyController.inviteToRegister);
router.post('/students/:id/log-resume-view', isApproved, validateObjectId('id'), companyController.logResumeView);

// Saved search filters
router.post('/search-filters', isApproved, companyController.saveSearchFilter);
router.get('/search-filters', isApproved, companyController.getSavedSearchFilters);
router.delete('/search-filters/:name', isApproved, companyController.deleteSearchFilter);

// Colleges list for filter
router.get('/colleges', isApproved, companyController.getColleges);

// Star students for dashboard
router.get('/star-students', isApproved, companyController.getStarStudents);

// Shortlisting - Enhanced
router.post('/shortlist', isApproved, companyController.shortlistStudent);
router.get('/shortlist', isApproved, validatePagination, companyController.getShortlistedCandidates);
router.get('/shortlist/:id', isApproved, validateObjectId('id'), companyController.getShortlistDetails);
router.patch('/shortlist/:id/status', isApproved, validateObjectId('id'), companyController.updateShortlistStatus);
router.post('/shortlist/:id/notes', isApproved, validateObjectId('id'), companyController.addShortlistNote);
router.delete('/shortlist/:id', isApproved, validateObjectId('id'), companyController.removeFromShortlist);
router.get('/shortlist/export', isApproved, companyController.exportShortlist);

// Applications
router.get('/applications', isApproved, validatePagination, companyController.getApplications);
router.patch('/applications/:id/status', isApproved, validateObjectId('id'), companyController.updateApplicationStatus);

module.exports = router;
