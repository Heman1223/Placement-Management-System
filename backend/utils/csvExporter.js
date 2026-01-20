const XLSX = require('xlsx');

/**
 * Convert JSON data to CSV buffer
 */
const jsonToCSV = (data, columns = null) => {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    // If columns not specified, use all keys from first object
    if (!columns) {
        columns = Object.keys(data[0]);
    }

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, { header: columns });
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'csv' });
    
    return buffer;
};

/**
 * Convert JSON data to Excel buffer
 */
const jsonToExcel = (data, sheetName = 'Sheet1', columns = null) => {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, columns ? { header: columns } : {});
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return buffer;
};

/**
 * Format student data for export
 */
const formatStudentData = (students) => {
    return students.map(student => ({
        'Roll Number': student.rollNumber,
        'First Name': student.name?.firstName || '',
        'Last Name': student.name?.lastName || '',
        'Email': student.email,
        'Phone': student.phone,
        'Department': student.department,
        'Batch': student.batch,
        'CGPA': student.cgpa || 'N/A',
        'Percentage': student.percentage || 'N/A',
        'Active Backlogs': student.backlogs?.active || 0,
        'Skills': Array.isArray(student.skills) ? student.skills.join(', ') : '',
        'Placement Status': student.placementStatus,
        'Verified': student.isVerified ? 'Yes' : 'No',
        'College': student.college?.name || '',
        'Resume URL': student.resumeUrl || '',
        'LinkedIn': student.linkedinUrl || '',
        'GitHub': student.githubUrl || ''
    }));
};

/**
 * Format application data for export
 */
const formatApplicationData = (applications) => {
    return applications.map(app => ({
        'Student Name': app.student?.name ? `${app.student.name.firstName} ${app.student.name.lastName}` : '',
        'Email': app.student?.email || '',
        'Roll Number': app.student?.rollNumber || '',
        'Department': app.student?.department || '',
        'CGPA': app.student?.cgpa || 'N/A',
        'Job Title': app.job?.title || '',
        'Company': app.job?.company?.name || '',
        'Status': app.status,
        'Applied Date': app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '',
        'Resume URL': app.resumeSnapshot?.url || ''
    }));
};

/**
 * Format shortlist data for export
 */
const formatShortlistData = (shortlists) => {
    return shortlists.map(item => ({
        'Student Name': item.student?.name ? `${item.student.name.firstName} ${item.student.name.lastName}` : '',
        'Email': item.student?.email || '',
        'Phone': item.student?.phone || '',
        'Roll Number': item.student?.rollNumber || '',
        'Department': item.student?.department || '',
        'Batch': item.student?.batch || '',
        'CGPA': item.student?.cgpa || 'N/A',
        'Skills': Array.isArray(item.student?.skills) ? item.student.skills.join(', ') : '',
        'Status': item.status,
        'Rating': item.rating || 'N/A',
        'Tags': Array.isArray(item.tags) ? item.tags.join(', ') : '',
        'Added Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
        'Resume URL': item.student?.resumeUrl || '',
        'LinkedIn': item.student?.linkedinUrl || '',
        'GitHub': item.student?.githubUrl || ''
    }));
};

/**
 * Format activity log data for export
 */
const formatActivityLogData = (logs) => {
    return logs.map(log => ({
        'User': log.user?.email || '',
        'Role': log.user?.role || '',
        'Action': log.action,
        'Target': log.targetModel || '',
        'Date': log.createdAt ? new Date(log.createdAt).toLocaleString() : '',
        'IP Address': log.ipAddress || ''
    }));
};

/**
 * Send CSV response
 */
const sendCSVResponse = (res, data, filename) => {
    const buffer = jsonToCSV(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.send(buffer);
};

/**
 * Send Excel response
 */
const sendExcelResponse = (res, data, filename, sheetName = 'Data') => {
    const buffer = jsonToExcel(data, sheetName);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    res.send(buffer);
};

module.exports = {
    jsonToCSV,
    jsonToExcel,
    formatStudentData,
    formatApplicationData,
    formatShortlistData,
    formatActivityLogData,
    sendCSVResponse,
    sendExcelResponse
};
