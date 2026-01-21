/**
 * Create User Accounts for Existing Students
 * Run with: node backend/utils/createStudentAccounts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Student } = require('../models');

const createStudentAccounts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Find all students without user accounts
        const studentsWithoutAccounts = await Student.find({ user: { $exists: false } });
        
        console.log(`Found ${studentsWithoutAccounts.length} students without user accounts\n`);

        if (studentsWithoutAccounts.length === 0) {
            console.log('✅ All students already have user accounts!');
            process.exit(0);
        }

        let created = 0;
        let skipped = 0;
        let failed = 0;

        console.log('Creating user accounts...\n');

        for (const student of studentsWithoutAccounts) {
            try {
                // Check if user with this email already exists
                const existingUser = await User.findOne({ email: student.email });
                
                if (existingUser) {
                    // Link existing user to student
                    student.user = existingUser._id;
                    existingUser.studentProfile = student._id;
                    await student.save();
                    await existingUser.save();
                    skipped++;
                    console.log(`⚠️  Linked existing user: ${student.email}`);
                    continue;
                }

                // Create new user account with auto-generated password
                const autoPassword = `${student.name.firstName}@123`;
                
                const userAccount = await User.create({
                    email: student.email,
                    password: autoPassword,
                    role: 'student',
                    isApproved: true,
                    isActive: true
                });

                // Link student to user account
                student.user = userAccount._id;
                userAccount.studentProfile = student._id;
                
                await student.save();
                await userAccount.save();

                created++;
                console.log(`✅ Created: ${student.name.firstName} ${student.name.lastName} | ${student.email} | ${autoPassword}`);
            } catch (error) {
                failed++;
                console.error(`❌ Failed for ${student.email}: ${error.message}`);
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('🎉 MIGRATION COMPLETE!');
        console.log('='.repeat(70));
        console.log(`✅ Created: ${created} user accounts`);
        console.log(`⚠️  Linked existing: ${skipped} accounts`);
        console.log(`❌ Failed: ${failed} accounts`);
        console.log('\n📋 Password Format: FirstName@123');
        console.log('   Example: Vikram Singh → Vikram@123');
        console.log('='.repeat(70));

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

createStudentAccounts();
