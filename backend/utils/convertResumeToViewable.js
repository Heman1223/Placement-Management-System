const mongoose = require('mongoose');
const { Student } = require('../models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Convert existing resume URLs from raw to image resource type
 * This allows PDFs to be viewed in browser instead of forcing download
 */
const convertResumeUrls = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all students with resume URLs using raw resource type
        const students = await Student.find({
            resumeUrl: { $regex: '/raw/upload/' }
        });

        console.log(`Found ${students.length} students with raw resume URLs`);

        let converted = 0;
        for (const student of students) {
            const oldUrl = student.resumeUrl;
            
            // Convert from raw to image resource type for PDF viewing
            // From: https://res.cloudinary.com/.../raw/upload/...
            // To: https://res.cloudinary.com/.../image/upload/...
            const newUrl = oldUrl.replace('/raw/upload/', '/image/upload/');
            
            student.resumeUrl = newUrl;
            await student.save();
            
            console.log(`Converted: ${student.email}`);
            console.log(`  Old: ${oldUrl}`);
            console.log(`  New: ${newUrl}`);
            converted++;
        }

        console.log(`\nSuccessfully converted ${converted} resume URLs`);
        console.log('PDFs should now be viewable in browser!');
        process.exit(0);
    } catch (error) {
        console.error('Error converting resume URLs:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    convertResumeUrls();
}

module.exports = convertResumeUrls;
