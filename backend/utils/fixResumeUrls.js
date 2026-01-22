const mongoose = require('mongoose');
const { Student } = require('../models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Fix malformed resume URLs in the database
 * Removes the incorrect fl_attachment:false transformation
 */
const fixResumeUrls = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all students with resume URLs containing the malformed pattern
        const students = await Student.find({
            resumeUrl: { $regex: 'fl_attachment:false' }
        });

        console.log(`Found ${students.length} students with malformed resume URLs`);

        let fixed = 0;
        for (const student of students) {
            const oldUrl = student.resumeUrl;
            
            // Fix the URL by removing the malformed transformation
            // From: https://res.cloudinary.com/.../image/upload/fl_attachment:false/...
            // To: https://res.cloudinary.com/.../raw/upload/...
            const newUrl = oldUrl.replace('/image/upload/fl_attachment:false/', '/raw/upload/');
            
            student.resumeUrl = newUrl;
            await student.save();
            
            console.log(`Fixed: ${student.email}`);
            console.log(`  Old: ${oldUrl}`);
            console.log(`  New: ${newUrl}`);
            fixed++;
        }

        console.log(`\nSuccessfully fixed ${fixed} resume URLs`);
        process.exit(0);
    } catch (error) {
        console.error('Error fixing resume URLs:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    fixResumeUrls();
}

module.exports = fixResumeUrls;
