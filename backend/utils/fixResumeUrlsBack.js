const mongoose = require('mongoose');
const { Student } = require('../models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Revert resume URLs back to raw format since the files were uploaded as raw
 */
const revertResumeUrls = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all students with resume URLs using image resource type
        const students = await Student.find({
            resumeUrl: { $regex: '/image/upload/' }
        });

        console.log(`Found ${students.length} students with image resume URLs`);

        let reverted = 0;
        for (const student of students) {
            const oldUrl = student.resumeUrl;
            
            // Revert from image back to raw
            const newUrl = oldUrl.replace('/image/upload/', '/raw/upload/');
            
            student.resumeUrl = newUrl;
            await student.save();
            
            console.log(`Reverted: ${student.email}`);
            console.log(`  Old: ${oldUrl}`);
            console.log(`  New: ${newUrl}`);
            reverted++;
        }

        console.log(`\nSuccessfully reverted ${reverted} resume URLs`);
        process.exit(0);
    } catch (error) {
        console.error('Error reverting resume URLs:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    revertResumeUrls();
}

module.exports = revertResumeUrls;
