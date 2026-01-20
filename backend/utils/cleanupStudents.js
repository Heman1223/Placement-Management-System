/**
 * Cleanup Students - Keep only 10, delete the rest
 * Run with: node backend/utils/cleanupStudents.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { Student, College } = require('../models');

const cleanupStudents = async () => {
    try {
        await connectDB();
        console.log('Connected to database');

        // Find the test college
        const college = await College.findOne({ name: 'Test Engineering College' });
        
        if (!college) {
            console.log('❌ Test college not found');
            process.exit(1);
        }

        // Get all students for this college
        const allStudents = await Student.find({ college: college._id })
            .sort({ createdAt: 1 }); // Oldest first

        console.log(`\nFound ${allStudents.length} students`);

        if (allStudents.length <= 10) {
            console.log('✅ Already 10 or fewer students. No cleanup needed.');
            process.exit(0);
        }

        // Keep first 10, delete the rest
        const studentsToKeep = allStudents.slice(0, 10);
        const studentsToDelete = allStudents.slice(10);

        console.log(`\nKeeping ${studentsToKeep.length} students:`);
        studentsToKeep.forEach((student, index) => {
            console.log(`  ${index + 1}. ${student.name.firstName} ${student.name.lastName} (${student.rollNumber})`);
        });

        console.log(`\nDeleting ${studentsToDelete.length} students...`);

        // Delete students
        const studentIdsToDelete = studentsToDelete.map(s => s._id);
        const deleteResult = await Student.deleteMany({ _id: { $in: studentIdsToDelete } });

        console.log(`✅ Deleted ${deleteResult.deletedCount} students`);

        // Update college stats
        const remainingCount = await Student.countDocuments({ college: college._id });
        const verifiedCount = await Student.countDocuments({ 
            college: college._id, 
            isVerified: true 
        });
        const placedCount = await Student.countDocuments({ 
            college: college._id, 
            placementStatus: 'placed' 
        });

        await College.findByIdAndUpdate(college._id, {
            'stats.totalStudents': remainingCount,
            'stats.verifiedStudents': verifiedCount,
            'stats.placedStudents': placedCount
        });

        console.log('\n' + '='.repeat(60));
        console.log('🎉 CLEANUP COMPLETE!');
        console.log('='.repeat(60));
        console.log(`✅ Remaining students: ${remainingCount}`);
        console.log(`✅ Verified students: ${verifiedCount}`);
        console.log(`✅ Placed students: ${placedCount}`);
        console.log('='.repeat(60));

        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup error:', error);
        process.exit(1);
    }
};

cleanupStudents();
