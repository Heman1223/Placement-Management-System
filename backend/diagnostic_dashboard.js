const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const { Student, College } = require('./models');

async function runDiagnostic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const placedStudents = await Student.find({ placementStatus: 'placed' })
            .limit(5)
            .select('name profilePicture placementStatus');
        
        console.log('--- Placed Students ---');
        console.log(`Placed Count: ${await Student.countDocuments({ placementStatus: 'placed' })}`);
        placedStudents.forEach(s => {
            console.log(JSON.stringify({
                name: `${s.name.firstName} ${s.name.lastName}`,
                image: s.profilePicture,
                status: s.placementStatus
            }));
        });

        const starStudents = await Student.find({ isStarStudent: true })
            .limit(5)
            .select('name isStarStudent profilePicture');
        
        console.log('--- Star Students ---');
        console.log(`Star Count: ${await Student.countDocuments({ isStarStudent: true })}`);
        starStudents.forEach(s => {
            console.log(JSON.stringify({
                name: `${s.name.firstName} ${s.name.lastName}`,
                image: s.profilePicture,
                isStar: s.isStarStudent
            }));
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

runDiagnostic();
