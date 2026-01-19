const { auth, optionalAuth } = require('./auth');
const { authorize, isSuperAdmin, isCollegeAdmin, isCompany, isStudent, isApproved, ROLES } = require('./rbac');
const { errorHandler, notFound, asyncHandler } = require('./errorHandler');
const { requireFields, validateEmail, validateObjectId, sanitizeInput, validatePagination } = require('./validate');

module.exports = {
    // Auth
    auth,
    optionalAuth,

    // RBAC
    authorize,
    isSuperAdmin,
    isCollegeAdmin,
    isCompany,
    isStudent,
    isApproved,
    ROLES,

    // Error handling
    errorHandler,
    notFound,
    asyncHandler,

    // Validation
    requireFields,
    validateEmail,
    validateObjectId,
    sanitizeInput,
    validatePagination
};
