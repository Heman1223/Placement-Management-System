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
router.put('/profile', companyController.updateProfile);

// Student search (requires approval)
router.get('/students/search', isApproved, validatePagination, companyController.searchStudents);
router.get('/students/:id', isApproved, validateObjectId('id'), companyController.getStudentProfile);
router.post('/students/:id/log-resume-view', isApproved, validateObjectId('id'), companyController.logResumeView);

// Saved search filters
router.post('/search-filters', isApproved, companyController.saveSearchFilter);
router.get('/search-filters', isApproved, companyController.getSavedSearchFilters);
router.delete('/search-filters/:name', isApproved, companyController.deleteSearchFilter);

// Colleges list for filter
router.get('/colleges', isApproved, companyController.getColleges);

// Shortlisting - Enhanced
router.post('/shortlist', isApproved, companyController.shortlistStudent);
router.get('/shortlist', isApproved, validatePagination, companyController.getShortlistedCandidates);
router.get('/shortlist/:id', isApproved, validateObjectId('id'), companyController.getShortlistDetails);
router.patch('/shortlist/:id/status', isApproved, validateObjectId('id'), companyController.updateShortlistStatus);
router.post('/shortlist/:id/notes', isApproved, validateObjectId('id'), companyController.addShortlistNote);
router.delete('/shortlist/:id', isApproved, validateObjectId('id'), companyController.removeFromShortlist);
router.get('/shortlist/export', isApproved, companyController.exportShortlist);

// Applications
router.patch('/applications/:id/status', isApproved, validateObjectId('id'), companyController.updateApplicationStatus);

module.exports = router;
