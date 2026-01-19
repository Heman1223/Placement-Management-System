/**
 * Role-Based Access Control Middleware
 * Restricts access to routes based on user roles
 */

/**
 * Check if user has one of the allowed roles
 * @param  {...string} allowedRoles - Roles that can access the route
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Check if user is Super Admin
 */
const isSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin privileges required.'
        });
    }
    next();
};

/**
 * Check if user is College Admin
 */
const isCollegeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'college_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. College Admin privileges required.'
        });
    }
    next();
};

/**
 * Check if user is Company/Agency
 */
const isCompany = (req, res, next) => {
    if (!req.user || req.user.role !== 'company') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Company privileges required.'
        });
    }
    next();
};

/**
 * Check if user is Student
 */
const isStudent = (req, res, next) => {
    if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Student privileges required.'
        });
    }
    next();
};

/**
 * Check if user is approved (for college/company)
 */
const isApproved = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    // Super admins are always approved
    if (req.user.role === 'super_admin') {
        return next();
    }

    if (!req.user.isApproved) {
        return res.status(403).json({
            success: false,
            message: 'Account pending approval. Please wait for admin verification.'
        });
    }

    next();
};

// Role constants for consistency
const ROLES = {
    SUPER_ADMIN: 'super_admin',
    COLLEGE_ADMIN: 'college_admin',
    COMPANY: 'company',
    STUDENT: 'student'
};

module.exports = {
    authorize,
    isSuperAdmin,
    isCollegeAdmin,
    isCompany,
    isStudent,
    isApproved,
    ROLES
};
