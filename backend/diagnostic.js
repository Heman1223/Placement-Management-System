const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const { User, Student } = require('./models');

async function checkStudent() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'hariksha@lpu.in';
        const user = await User.findOne({ email }).select('+password');
        const student = await Student.findOne({ email });

        if (!user) {
            console.log('USER_NOT_FOUND');
        } else {
            console.log('USER_EXISTS');
            console.log('Role:', user.role);
            console.log('IsApproved:', user.isApproved);
            console.log('IsActive:', user.isActive);
        }

        if (!student) {
            console.log('STUDENT_NOT_FOUND');
        } else {
            console.log('STUDENT_EXISTS');
            console.log('FirstName:', student.name?.firstName);
            console.log('LastName:', student.name?.lastName);
        }

        // Just check password match manually for some case-sensitive variations
        if (user) {
            const variations = [
                'Hariksha@123',
                'hariksha@123',
                'hariksha Kumari@123', // if lastName was added as part of firstName
                ' कुमारी@123'
            ];
            
            for (const v of variations) {
                const isMatch = await user.comparePassword(v);
                console.log(`Password comparison for "${v}": ${isMatch}`);
            }
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkStudent();
