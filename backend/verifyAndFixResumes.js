const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { Student } = require('./models');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const verifyAndFixResumes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const students = await Student.find({ resumeUrl: { $exists: true, $ne: '' } });
        console.log(`Checking ${students.length} resumes...`);

        let fixed = 0;
        let checked = 0;

        for (const student of students) {
            const oldUrl = student.resumeUrl;
            if (!oldUrl || !oldUrl.includes('cloudinary.com')) continue;

            checked++;
            console.log(`[${checked}/${students.length}] Processing ${student.email}...`);

            let newUrl = oldUrl;

            // 1. If it's an image/upload but doesn't have fl_attachment, add it
            if (oldUrl.includes('/image/upload/') && !oldUrl.includes('/fl_attachment')) {
                newUrl = oldUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
                console.log(`  - Added fl_attachment flag to IMAGE URL`);
            } 
            // 2. If it's a raw/upload, Cloudinary usually forces download, but we can ensure it
            else if (oldUrl.includes('/raw/upload/') && !oldUrl.includes('/fl_attachment')) {
                // For raw resources, fl_attachment is sometimes supported as a path part too
                newUrl = oldUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
                console.log(`  - Added fl_attachment flag to RAW URL`);
            }

            if (newUrl !== oldUrl) {
                student.resumeUrl = newUrl;
                await student.save();
                console.log(`  - FIXED: ${student.email}`);
                console.log(`    New URL: ${newUrl}`);
                fixed++;
            } else {
                console.log(`  - Already has fl_attachment or not a Cloudinary URL.`);
            }
        }

        console.log(`\nFinished! Checked ${checked}, Fixed ${fixed}.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

verifyAndFixResumes();
