/**
 * Reset Placement Status - Set all students to "not_placed"
 * Run with: node backend/utils/resetPlacementStatus.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { Student, College } = require('../models');

const resetPlacementStatus = async () => {
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
        const students = await Student.find({ college: college._id });

        console.log(`\nFound ${students.length} students`);
        console.log('Resetting placement status to "not_placed"...\n');

        // Update all students to not_placed
        const updateResult = await Student.updateMany(
            { college: college._id },
            {
                $set: {
                    placementStatus: 'not_placed',
                    placementDetails: {
                        company: null,
                        role: null,
                        package: null,
                        joiningDate: null,
                        offerLetterUrl: null
                    }
                }
            }
        );

        console.log(`✅ Updated ${updateResult.modifiedCount} students`);

        // Update college stats
        await College.findByIdAndUpdate(college._id, {
            'stats.placedStudents': 0
        });

        // Show updated students
        const updatedStudents = await Student.find({ college: college._id })
            .select('name rollNumber placementStatus')
            .sort({ rollNumber: 1 });

        console.log('\n' + '='.repeat(60));
        console.log('📋 UPDATED STUDENTS:');
        console.log('='.repeat(60));
        updatedStudents.forEach((student, index) => {
            console.log(`  ${index + 1}. ${student.name.firstName} ${student.name.lastName} (${student.rollNumber}) - ${student.placementStatus}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('🎉 RESET COMPLETE!');
        console.log('='.repeat(60));
        console.log(`✅ Total students: ${students.length}`);
        console.log(`✅ All students set to: not_placed`);
        console.log(`✅ Placement details cleared`);
        console.log(`✅ College stats updated`);
        console.log('='.repeat(60));

        process.exit(0);
    } catch (error) {
        console.error('❌ Reset error:', error);
        process.exit(1);
    }
};

resetPlacementStatus();
