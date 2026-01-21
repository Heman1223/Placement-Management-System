const { Company } = require('../models');

/**
 * Check and reset download limits if needed
 * @param {ObjectId} companyId - Company ID
 * @returns {Object} - Current limits and counts
 */
const checkDownloadLimits = async (companyId) => {
    const company = await Company.findById(companyId);
    
    if (!company) {
        throw new Error('Company not found');
    }

    const now = new Date();
    let needsSave = false;

    // Initialize downloadTracking if not exists
    if (!company.downloadTracking) {
        company.downloadTracking = {
            dailyLimit: 50,
            monthlyLimit: 500,
            dailyCount: 0,
            monthlyCount: 0,
            lastDailyReset: now,
            lastMonthlyReset: now,
            totalDownloads: 0
        };
        needsSave = true;
    }

    // Check if daily reset is needed (24 hours)
    const lastDailyReset = new Date(company.downloadTracking.lastDailyReset);
    const hoursSinceDaily = (now - lastDailyReset) / (1000 * 60 * 60);
    
    if (hoursSinceDaily >= 24) {
        company.downloadTracking.dailyCount = 0;
        company.downloadTracking.lastDailyReset = now;
        needsSave = true;
    }

    // Check if monthly reset is needed (30 days)
    const lastMonthlyReset = new Date(company.downloadTracking.lastMonthlyReset);
    const daysSinceMonthly = (now - lastMonthlyReset) / (1000 * 60 * 60 * 24);
    
    if (daysSinceMonthly >= 30) {
        company.downloadTracking.monthlyCount = 0;
        company.downloadTracking.lastMonthlyReset = now;
        needsSave = true;
    }

    if (needsSave) {
        await company.save();
    }

    return {
        dailyLimit: company.downloadTracking.dailyLimit,
        dailyCount: company.downloadTracking.dailyCount,
        dailyRemaining: company.downloadTracking.dailyLimit - company.downloadTracking.dailyCount,
        monthlyLimit: company.downloadTracking.monthlyLimit,
        monthlyCount: company.downloadTracking.monthlyCount,
        monthlyRemaining: company.downloadTracking.monthlyLimit - company.downloadTracking.monthlyCount,
        totalDownloads: company.downloadTracking.totalDownloads || 0,
        canDownload: (company.downloadTracking.dailyCount < company.downloadTracking.dailyLimit) &&
                     (company.downloadTracking.monthlyCount < company.downloadTracking.monthlyLimit)
    };
};

/**
 * Increment download count
 * @param {ObjectId} companyId - Company ID
 * @param {ObjectId} studentId - Student ID
 * @param {ObjectId} userId - User ID who downloaded
 * @param {String} downloadType - Type of download
 * @param {Object} metadata - Additional metadata
 */
const incrementDownloadCount = async (companyId, studentId, userId, downloadType = 'resume', metadata = {}) => {
    const company = await Company.findById(companyId);
    
    if (!company) {
        throw new Error('Company not found');
    }

    // Initialize if needed
    if (!company.downloadTracking) {
        company.downloadTracking = {
            dailyLimit: 50,
            monthlyLimit: 500,
            dailyCount: 0,
            monthlyCount: 0,
            lastDailyReset: new Date(),
            lastMonthlyReset: new Date(),
            totalDownloads: 0
        };
    }

    // Increment counts
    company.downloadTracking.dailyCount += 1;
    company.downloadTracking.monthlyCount += 1;
    company.downloadTracking.totalDownloads = (company.downloadTracking.totalDownloads || 0) + 1;

    // Add to download history
    if (!company.downloadHistory) {
        company.downloadHistory = [];
    }

    company.downloadHistory.push({
        studentId,
        downloadType,
        downloadedBy: userId,
        downloadedAt: new Date(),
        metadata
    });

    // Keep only last 1000 downloads in history
    if (company.downloadHistory.length > 1000) {
        company.downloadHistory = company.downloadHistory.slice(-1000);
    }

    await company.save();

    return {
        dailyCount: company.downloadTracking.dailyCount,
        monthlyCount: company.downloadTracking.monthlyCount,
        totalDownloads: company.downloadTracking.totalDownloads
    };
};

/**
 * Get download statistics
 * @param {ObjectId} companyId - Company ID
 * @returns {Object} - Download statistics
 */
const getDownloadStats = async (companyId) => {
    const company = await Company.findById(companyId);
    
    if (!company) {
        throw new Error('Company not found');
    }

    const limits = await checkDownloadLimits(companyId);

    // Get recent downloads (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDownloads = company.downloadHistory?.filter(
        d => new Date(d.downloadedAt) >= thirtyDaysAgo
    ) || [];

    // Group by type
    const byType = recentDownloads.reduce((acc, d) => {
        acc[d.downloadType] = (acc[d.downloadType] || 0) + 1;
        return acc;
    }, {});

    // Group by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const last7Days = recentDownloads.filter(
        d => new Date(d.downloadedAt) >= sevenDaysAgo
    );

    const byDay = {};
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        byDay[dateStr] = 0;
    }

    last7Days.forEach(d => {
        const dateStr = new Date(d.downloadedAt).toISOString().split('T')[0];
        if (byDay[dateStr] !== undefined) {
            byDay[dateStr]++;
        }
    });

    return {
        limits,
        recentDownloads: recentDownloads.length,
        downloadsByType: byType,
        downloadsByDay: byDay,
        lastDownloads: company.downloadHistory?.slice(-10).reverse() || []
    };
};

module.exports = {
    checkDownloadLimits,
    incrementDownloadCount,
    getDownloadStats
};
