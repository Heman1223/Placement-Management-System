const XLSX = require('xlsx');

/**
 * Parse Excel file buffer to array of student objects
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Array} Array of student objects
 */
const parseExcel = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    // Map Excel columns to student schema
    return rawData.map((row, index) => {
        try {
            return {
                name: {
                    firstName: row['First Name'] || row['firstName'] || '',
                    lastName: row['Last Name'] || row['lastName'] || ''
                },
                email: row['Email'] || row['email'] || '',
                phone: row['Phone'] || row['phone'] || row['Mobile'] || '',
                gender: (row['Gender'] || row['gender'] || '').toLowerCase(),
                department: row['Department'] || row['department'] || row['Branch'] || '',
                batch: parseInt(row['Batch'] || row['batch'] || row['Year']) || new Date().getFullYear(),
                rollNumber: String(row['Roll Number'] || row['rollNumber'] || row['Roll No'] || ''),
                cgpa: parseFloat(row['CGPA'] || row['cgpa'] || 0),
                percentage: parseFloat(row['Percentage'] || row['percentage'] || 0),
                backlogs: {
                    active: parseInt(row['Active Backlogs'] || row['activeBacklogs'] || 0),
                    history: parseInt(row['Backlog History'] || row['totalBacklogs'] || 0)
                },
                education: {
                    tenth: {
                        percentage: parseFloat(row['10th %'] || row['tenthPercentage'] || 0),
                        board: row['10th Board'] || ''
                    },
                    twelfth: {
                        percentage: parseFloat(row['12th %'] || row['twelfthPercentage'] || 0),
                        board: row['12th Board'] || '',
                        stream: row['12th Stream'] || ''
                    }
                },
                skills: (row['Skills'] || row['skills'] || '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s),
                linkedinUrl: row['LinkedIn'] || row['linkedinUrl'] || '',
                githubUrl: row['GitHub'] || row['githubUrl'] || '',
                resumeUrl: row['Resume URL'] || row['resumeUrl'] || ''
            };
        } catch (error) {
            console.error(`Error parsing row ${index + 1}:`, error.message);
            return null;
        }
    }).filter(student => student && student.name.firstName && student.email);
};

/**
 * Generate sample Excel template
 */
const generateTemplate = () => {
    const headers = [
        'First Name', 'Last Name', 'Email', 'Phone', 'Gender',
        'Department', 'Batch', 'Roll Number', 'CGPA', 'Percentage',
        'Active Backlogs', 'Backlog History', '10th %', '10th Board',
        '12th %', '12th Board', '12th Stream', 'Skills', 'LinkedIn', 'GitHub'
    ];

    const sampleData = [
        headers,
        ['John', 'Doe', 'john@email.com', '9876543210', 'male',
            'Computer Science', 2024, 'CS001', 8.5, 85, 0, 0, 90, 'CBSE',
            88, 'CBSE', 'Science', 'JavaScript, React, Node.js', '', '']
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = { parseExcel, generateTemplate };
