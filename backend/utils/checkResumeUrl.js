const mongoose = require('mongoose');
const { Student } = require('../models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkResumeUrl = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const student = await Student.findOne({
            resumeUrl: { $exists: true, $ne: '' }
        }).select('email resumeUrl');
        
        if (student) {
            console.log('Student:', student.email);
            console.log('Resume URL:', student.resumeUrl);
        } else {
            console.log('No student with resume found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkResumeUrl();
