const express = require('express');
const router = express.Router();
const { jobController } = require('../controllers');
const { auth, isCompany, isApproved, validateObjectId, validatePagination } = require('../middleware');

// Public routes
router.get('/public', validatePagination, jobController.getPublicJobs);
router.get('/public/:id', validateObjectId('id'), jobController.getJob);

// Company routes (requires auth)
router.use(auth, isCompany, isApproved);

router.get('/', validatePagination, jobController.getJobs);
router.post('/', jobController.createJob);
router.get('/:id', validateObjectId('id'), jobController.getJob);
router.put('/:id', validateObjectId('id'), jobController.updateJob);
router.delete('/:id', validateObjectId('id'), jobController.deleteJob);
router.get('/:id/applicants', validateObjectId('id'), validatePagination, jobController.getApplicants);
router.patch('/:id/close', validateObjectId('id'), jobController.closeJob);

module.exports = router;
