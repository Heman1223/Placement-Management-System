/**
 * Input Validation Middleware
 * Basic validation helpers for common use cases
 */

/**
 * Validate required fields in request body
 * @param {string[]} fields - Array of required field names
 */
const requireFields = (fields) => {
    return (req, res, next) => {
        const missing = [];

        for (const field of fields) {
            if (!req.body[field] || (typeof req.body[field] === 'string' && !req.body[field].trim())) {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Validate email format
 */
const validateEmail = (req, res, next) => {
    const email = req.body.email;

    if (email) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
    }

    next();
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;

        if (!objectIdRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format`
            });
        }

        next();
    };
};

/**
 * Sanitize input - trim strings and remove empty values
 */
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // Enforce limits
    page = Math.max(1, page);
    limit = Math.min(100, Math.max(1, limit));

    req.pagination = {
        page,
        limit,
        skip: (page - 1) * limit
    };

    next();
};

module.exports = {
    requireFields,
    validateEmail,
    validateObjectId,
    sanitizeInput,
    validatePagination
};
