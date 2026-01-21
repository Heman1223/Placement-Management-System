const { PlatformSettings } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Get platform settings
 * @route   GET /api/super-admin/settings
 * @access  Super Admin
 */
const getSettings = asyncHandler(async (req, res) => {
    const settings = await PlatformSettings.getSettings();
    
    res.json({
        success: true,
        data: settings
    });
});

/**
 * @desc    Update student self-signup settings
 * @route   PATCH /api/super-admin/settings/student-signup
 * @access  Super Admin
 */
const updateStudentSignup = asyncHandler(async (req, res) => {
    const { enabled, requireApproval, allowedDomains } = req.body;
    
    const settings = await PlatformSettings.getSettings();
    
    settings.studentSelfSignup.enabled = enabled !== undefined ? enabled : settings.studentSelfSignup.enabled;
    settings.studentSelfSignup.requireApproval = requireApproval !== undefined ? requireApproval : settings.studentSelfSignup.requireApproval;
    if (allowedDomains) settings.studentSelfSignup.allowedDomains = allowedDomains;
    settings.studentSelfSignup.lastModifiedBy = req.userId;
    settings.studentSelfSignup.lastModifiedAt = new Date();
    
    await settings.save();
    
    res.json({
        success: true,
        message: 'Student signup settings updated',
        data: settings.studentSelfSignup
    });
});

/**
 * @desc    Update agency registration settings
 * @route   PATCH /api/super-admin/settings/agency-registration
 * @access  Super Admin
 */
const updateAgencyRegistration = asyncHandler(async (req, res) => {
    const { enabled, requireApproval, autoApprove } = req.body;
    
    const settings = await PlatformSettings.getSettings();
    
    settings.agencyRegistration.enabled = enabled !== undefined ? enabled : settings.agencyRegistration.enabled;
    settings.agencyRegistration.requireApproval = requireApproval !== undefined ? requireApproval : settings.agencyRegistration.requireApproval;
    settings.agencyRegistration.autoApprove = autoApprove !== undefined ? autoApprove : settings.agencyRegistration.autoApprove;
    settings.agencyRegistration.lastModifiedBy = req.userId;
    settings.agencyRegistration.lastModifiedAt = new Date();
    
    await settings.save();
    
    res.json({
        success: true,
        message: 'Agency registration settings updated',
        data: settings.agencyRegistration
    });
});

/**
 * @desc    Update approval rules
 * @route   PATCH /api/super-admin/settings/approval-rules
 * @access  Super Admin
 */
const updateApprovalRules = asyncHandler(async (req, res) => {
    const {
        autoApproveColleges,
        autoApproveCompanies,
        autoApproveStudents,
        autoApproveAgencies,
        requireEmailVerification
    } = req.body;
    
    const settings = await PlatformSettings.getSettings();
    
    if (autoApproveColleges !== undefined) settings.approvalRules.autoApproveColleges = autoApproveColleges;
    if (autoApproveCompanies !== undefined) settings.approvalRules.autoApproveCompanies = autoApproveCompanies;
    if (autoApproveStudents !== undefined) settings.approvalRules.autoApproveStudents = autoApproveStudents;
    if (autoApproveAgencies !== undefined) settings.approvalRules.autoApproveAgencies = autoApproveAgencies;
    if (requireEmailVerification !== undefined) settings.approvalRules.requireEmailVerification = requireEmailVerification;
    
    settings.approvalRules.lastModifiedBy = req.userId;
    settings.approvalRules.lastModifiedAt = new Date();
    
    await settings.save();
    
    res.json({
        success: true,
        message: 'Approval rules updated',
        data: settings.approvalRules
    });
});

/**
 * @desc    Toggle maintenance mode
 * @route   PATCH /api/super-admin/settings/maintenance-mode
 * @access  Super Admin
 */
const toggleMaintenanceMode = asyncHandler(async (req, res) => {
    const { enabled, message, allowedRoles, scheduledStart, scheduledEnd } = req.body;
    
    const settings = await PlatformSettings.getSettings();
    
    settings.maintenanceMode.enabled = enabled !== undefined ? enabled : settings.maintenanceMode.enabled;
    if (message) settings.maintenanceMode.message = message;
    if (allowedRoles) settings.maintenanceMode.allowedRoles = allowedRoles;
    if (scheduledStart) settings.maintenanceMode.scheduledStart = new Date(scheduledStart);
    if (scheduledEnd) settings.maintenanceMode.scheduledEnd = new Date(scheduledEnd);
    
    if (enabled) {
        settings.maintenanceMode.enabledBy = req.userId;
        settings.maintenanceMode.enabledAt = new Date();
    }
    
    await settings.save();
    
    res.json({
        success: true,
        message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
        data: settings.maintenanceMode
    });
});

/**
 * @desc    Update data visibility policies
 * @route   PATCH /api/super-admin/settings/data-visibility
 * @access  Super Admin
 */
const updateDataVisibility = asyncHandler(async (req, res) => {
    const {
        studentDataVisibleToCompanies,
        studentDataVisibleToAgencies,
        requireCollegeApprovalForAccess,
        visibleFields,
        allowBulkDownload,
        maxDownloadsPerDay
    } = req.body;
    
    const settings = await PlatformSettings.getSettings();
    
    if (studentDataVisibleToCompanies !== undefined) {
        settings.dataVisibility.studentDataVisibleToCompanies = studentDataVisibleToCompanies;
    }
    if (studentDataVisibleToAgencies !== undefined) {
        settings.dataVisibility.studentDataVisibleToAgencies = studentDataVisibleToAgencies;
    }
    if (requireCollegeApprovalForAccess !== undefined) {
        settings.dataVisibility.requireCollegeApprovalForAccess = requireCollegeApprovalForAccess;
    }
    if (visibleFields) {
        settings.dataVisibility.visibleFields = {
            ...settings.dataVisibility.visibleFields,
            ...visibleFields
        };
    }
    if (allowBulkDownload !== undefined) {
        settings.dataVisibility.allowBulkDownload = allowBulkDownload;
    }
    if (maxDownloadsPerDay !== undefined) {
        settings.dataVisibility.maxDownloadsPerDay = maxDownloadsPerDay;
    }
    
    settings.dataVisibility.lastModifiedBy = req.userId;
    settings.dataVisibility.lastModifiedAt = new Date();
    
    await settings.save();
    
    res.json({
        success: true,
        message: 'Data visibility policies updated',
        data: settings.dataVisibility
    });
});

/**
 * @desc    Update all settings at once
 * @route   PUT /api/super-admin/settings
 * @access  Super Admin
 */
const updateAllSettings = asyncHandler(async (req, res) => {
    const settings = await PlatformSettings.getSettings();
    
    // Update each section if provided
    if (req.body.studentSelfSignup) {
        Object.assign(settings.studentSelfSignup, req.body.studentSelfSignup);
        settings.studentSelfSignup.lastModifiedBy = req.userId;
        settings.studentSelfSignup.lastModifiedAt = new Date();
    }
    
    if (req.body.agencyRegistration) {
        Object.assign(settings.agencyRegistration, req.body.agencyRegistration);
        settings.agencyRegistration.lastModifiedBy = req.userId;
        settings.agencyRegistration.lastModifiedAt = new Date();
    }
    
    if (req.body.approvalRules) {
        Object.assign(settings.approvalRules, req.body.approvalRules);
        settings.approvalRules.lastModifiedBy = req.userId;
        settings.approvalRules.lastModifiedAt = new Date();
    }
    
    if (req.body.maintenanceMode) {
        Object.assign(settings.maintenanceMode, req.body.maintenanceMode);
        if (req.body.maintenanceMode.enabled) {
            settings.maintenanceMode.enabledBy = req.userId;
            settings.maintenanceMode.enabledAt = new Date();
        }
    }
    
    if (req.body.dataVisibility) {
        Object.assign(settings.dataVisibility, req.body.dataVisibility);
        settings.dataVisibility.lastModifiedBy = req.userId;
        settings.dataVisibility.lastModifiedAt = new Date();
    }
    
    settings.updatedBy = req.userId;
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    res.json({
        success: true,
        message: 'Platform settings updated successfully',
        data: settings
    });
});

/**
 * @desc    Reset settings to default
 * @route   POST /api/super-admin/settings/reset
 * @access  Super Admin
 */
const resetSettings = asyncHandler(async (req, res) => {
    await PlatformSettings.deleteMany({});
    const settings = await PlatformSettings.create({
        updatedBy: req.userId
    });
    
    res.json({
        success: true,
        message: 'Settings reset to default',
        data: settings
    });
});

module.exports = {
    getSettings,
    updateStudentSignup,
    updateAgencyRegistration,
    updateApprovalRules,
    toggleMaintenanceMode,
    updateDataVisibility,
    updateAllSettings,
    resetSettings
};
