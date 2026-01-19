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
router.get('/students/:id', validateObjectId('id'), collegeController.getStudent);
router.post('/students', collegeController.addStudent);
router.put('/students/:id', validateObjectId('id'), collegeController.updateStudent);
router.delete('/students/:id', validateObjectId('id'), collegeController.deleteStudent);
router.patch('/students/:id/verify', validateObjectId('id'), collegeController.verifyStudent);

// Bulk upload
router.post('/students/bulk', collegeController.bulkUploadStudents);

// Departments
router.get('/departments', collegeController.getDepartments);

module.exports = router;
