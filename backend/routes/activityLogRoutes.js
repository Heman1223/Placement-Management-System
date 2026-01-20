const express = require('express');
const router = express.Router();
const { activityLogController } = require('../controllers');
const { auth, authorize, ROLES, validateObjectId } = require('../middleware');

// All routes require authentication and specific roles
router.use(auth);

// Activity logs (Super Admin and College Admin)
router.get('/',
    authorize([ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN]),
    activityLogController.getActivityLogs
);

router.get('/stats',
    authorize([ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN]),
    activityLogController.getActivityStats
);

router.get('/export',
    authorize([ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN]),
    activityLogController.exportActivityLogs
);

// Student-specific access logs (College Admin only)
router.get('/student/:id',
    authorize([ROLES.COLLEGE_ADMIN]),
    validateObjectId('id'),
    activityLogController.getStudentAccessLogs
);

module.exports = router;
