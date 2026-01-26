const express = require('express');
const router = express.Router();
const { studentController } = require('../controllers');
const { auth, isStudent, isApproved, validateObjectId } = require('../middleware');

// All routes require student authentication
router.use(auth, isStudent, isApproved);

// Dashboard
router.get('/stats', studentController.getDashboardStats);

// Profile
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

// Jobs
router.get('/jobs', studentController.getEligibleJobs);
router.get('/jobs/:id', validateObjectId('id'), studentController.getJobDetail);
router.post('/jobs/:id/apply', validateObjectId('id'), studentController.applyForJob);

// Applications
router.get('/applications', studentController.getApplications);
router.get('/invitations', studentController.getInvitations);

// Notifications
router.get('/notifications', studentController.getNotifications);
router.patch('/notifications/:id/read', validateObjectId('id'), studentController.markNotificationRead);

module.exports = router;
