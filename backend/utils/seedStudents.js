/**
 * Seed Test Students
 * Run with: node backend/utils/seedStudents.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { Student, College, User } = require('../models');

// Realistic student data
const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Reyansh', 'Aadhya', 'Ananya', 'Pari', 'Anika', 'Ira',
    'Diya', 'Navya', 'Saanvi', 'Myra', 'Sara', 'Kiara', 'Riya', 'Prisha', 'Avni', 'Anvi',
    'Rohan', 'Aryan', 'Kabir', 'Dhruv', 'Karan', 'Advait', 'Vedant', 'Shivansh', 'Rudra', 'Aarush',
    'Neha', 'Pooja', 'Shreya', 'Tanvi', 'Ishita', 'Meera', 'Nisha', 'Simran', 'Kavya', 'Divya'
];

const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Rao', 'Nair', 'Iyer',
    'Joshi', 'Mehta', 'Shah', 'Desai', 'Kulkarni', 'Agarwal', 'Bansal', 'Malhotra', 'Kapoor', 'Chopra',
    'Bhatia', 'Sethi', 'Khanna', 'Arora', 'Sinha', 'Jain', 'Saxena', 'Pandey', 'Mishra', 'Tiwari'
];

const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
];

const skills = [
    ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
    ['Python', 'Django', 'Flask', 'PostgreSQL', 'REST API'],
    ['Java', 'Spring Boot', 'Hibernate', 'MySQL', 'Microservices'],
    ['C++', 'Data Structures', 'Algorithms', 'Problem Solving'],
    ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'Tailwind CSS'],
    ['React Native', 'Flutter', 'Mobile Development', 'Firebase'],
    ['AWS', 'Docker', 'Kubernetes', 'DevOps', 'CI/CD'],
    ['Machine Learning', 'Python', 'TensorFlow', 'Data Science'],
    ['Angular', 'TypeScript', 'RxJS', 'NgRx'],
    ['Vue.js', 'Nuxt.js', 'Vuex', 'JavaScript']
];

const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore'
];

const colleges = [
    'IIT Delhi', 'IIT Bombay', 'BITS Pilani', 'NIT Trichy', 'VIT Vellore',
    'SRM University', 'Manipal Institute', 'Delhi University', 'Mumbai University'
];

const generatePhone = () => {
    return `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`;
};

const generateEmail = (firstName, lastName, rollNumber) => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rollNumber.slice(-2)}@college.edu`;
};

const generateRollNumber = (year, dept, index) => {
    const deptCode = dept.substring(0, 2).toUpperCase();
    return `${year}${deptCode}${String(index).padStart(4, '0')}`;
};

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomCGPA = () => (6.5 + Math.random() * 3.5).toFixed(2);

const generateStudent = (college, adminUserId, index, batch) => {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const department = randomElement(departments);
    const rollNumber = generateRollNumber(batch, department, index);
    const email = generateEmail(firstName, lastName, rollNumber);
    const cgpa = parseFloat(randomCGPA());
    
    // Random placement status based on CGPA
    let placementStatus = 'not_placed';
    if (cgpa >= 8.5) {
        placementStatus = Math.random() > 0.3 ? 'placed' : 'in_process';
    } else if (cgpa >= 7.5) {
        placementStatus = Math.random() > 0.5 ? 'in_process' : 'not_placed';
    }

    return {
        name: {
            firstName,
            lastName
        },
        email,
        rollNumber,
        department,
        batch,
        college: college._id,
        phone: generatePhone(),
        dateOfBirth: new Date(2000 + (2024 - batch), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        address: {
            street: `${Math.floor(Math.random() * 999) + 1}, ${randomElement(['MG Road', 'Park Street', 'Main Road', 'Station Road'])}`,
            city: randomElement(cities),
            state: 'India',
            pincode: String(Math.floor(100000 + Math.random() * 899999))
        },
        cgpa,
        skills: randomElement(skills),
        placementStatus,
        isVerified: true, // Auto-verified since created by admin
        verifiedAt: new Date(),
        verifiedBy: adminUserId,
        addedBy: adminUserId,
        source: 'bulk_upload',
        education: [
            {
                degree: 'B.Tech',
                institution: college.name,
                fieldOfStudy: department,
                startDate: new Date(batch, 7, 1),
                endDate: new Date(batch + 4, 5, 30),
                grade: cgpa
            }
        ],
        experience: cgpa >= 8.0 ? [
            {
                title: randomElement(['Software Intern', 'Developer Intern', 'Tech Intern']),
                company: randomElement(['TCS', 'Infosys', 'Wipro', 'Tech Mahindra', 'Accenture']),
                startDate: new Date(batch + 2, 5, 1),
                endDate: new Date(batch + 2, 7, 31),
                description: 'Worked on various projects and gained hands-on experience'
            }
        ] : [],
        projects: [
            {
                title: randomElement([
                    'E-commerce Website',
                    'Social Media App',
                    'Task Management System',
                    'Weather App',
                    'Blog Platform'
                ]),
                description: 'Built a full-stack application with modern technologies',
                technologies: randomElement(skills).slice(0, 4),
                startDate: new Date(batch + 2, 0, 1),
                endDate: new Date(batch + 2, 3, 30)
            }
        ],
        certifications: cgpa >= 7.5 ? [
            {
                name: randomElement([
                    'AWS Certified Developer',
                    'Google Cloud Certified',
                    'MongoDB Certified',
                    'React Developer Certification'
                ]),
                issuingOrganization: randomElement(['AWS', 'Google', 'MongoDB', 'Meta']),
                issueDate: new Date(batch + 2, 6, 1)
            }
        ] : []
    };
};

const seedStudents = async () => {
    try {
        await connectDB();
        console.log('Connected to database');

        // Find or create a test college
        let college = await College.findOne({ name: 'Test Engineering College' });
        let adminUser;
        
        if (!college) {
            console.log('Creating test college...');
            
            // Check if admin user exists
            adminUser = await User.findOne({ email: 'college@test.com' });
            
            if (!adminUser) {
                // Create college admin user
                adminUser = await User.create({
                    email: 'college@test.com',
                    password: 'College@123',
                    role: 'college_admin',
                    isApproved: true,
                    isActive: true
                });
            }

            // Create college
            college = await College.create({
                name: 'Test Engineering College',
                code: 'TEC',
                address: {
                    street: '123 University Road',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    pincode: '560001',
                    country: 'India'
                },
                contactEmail: 'info@testcollege.edu',
                phone: '+91-9876543210',
                website: 'https://testcollege.edu',
                university: 'VTU',
                departments: departments,
                admin: adminUser._id,
                isVerified: true
            });

            // Link college to admin user
            adminUser.collegeProfile = college._id;
            await adminUser.save();

            console.log('✅ Test college created');
            console.log('College Admin Email: college@test.com');
            console.log('College Admin Password: College@123');
        } else {
            console.log('✅ Test college already exists');
            // Get the admin user
            adminUser = await User.findById(college.admin);
        }

        // Check existing students
        const existingCount = await Student.countDocuments({ college: college._id });
        console.log(`\nExisting students: ${existingCount}`);

        // Generate students for multiple batches
        const batches = [2021, 2022, 2023, 2024];
        const studentsPerBatch = 25; // 25 students per batch = 100 total
        
        let totalCreated = 0;
        let totalFailed = 0;

        for (const batch of batches) {
            console.log(`\nGenerating students for batch ${batch}...`);
            
            for (let i = 1; i <= studentsPerBatch; i++) {
                try {
                    const studentData = generateStudent(college, adminUser._id, existingCount + totalCreated + i, batch);
                    
                    // Check if user account exists
                    let userAccount = await User.findOne({ email: studentData.email });
                    
                    if (!userAccount) {
                        // Create user account with auto-generated password: FirstName@123
                        const autoPassword = `${studentData.name.firstName}@123`;
                        
                        userAccount = await User.create({
                            email: studentData.email,
                            password: autoPassword,
                            role: 'student',
                            isApproved: true,
                            isActive: true
                        });
                    }

                    // Create student record
                    const student = await Student.create({
                        ...studentData,
                        user: userAccount._id // Link to user account
                    });

                    // Link student profile to user account
                    userAccount.studentProfile = student._id;
                    await userAccount.save();

                    totalCreated++;
                    
                    if (i % 10 === 0) {
                        process.stdout.write(`  Created ${i}/${studentsPerBatch} students for batch ${batch}\r`);
                    }
                } catch (error) {
                    totalFailed++;
                    if (error.code === 11000) {
                        // Duplicate key error, skip
                        continue;
                    }
                    console.error(`\n  Error creating student: ${error.message}`);
                }
            }
            console.log(`  ✅ Batch ${batch} complete`);
        }

        // Update college stats
        const stats = await Student.aggregate([
            { $match: { college: college._id } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
                    placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } }
                }
            }
        ]);

        if (stats.length > 0) {
            await College.findByIdAndUpdate(college._id, {
                'stats.totalStudents': stats[0].total,
                'stats.verifiedStudents': stats[0].verified,
                'stats.placedStudents': stats[0].placed
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 SEEDING COMPLETE!');
        console.log('='.repeat(60));
        console.log(`✅ Successfully created: ${totalCreated} students`);
        console.log(`❌ Failed: ${totalFailed} students`);
        console.log(`📊 Total students in database: ${existingCount + totalCreated}`);
        console.log('\n📋 Login Credentials:');
        console.log('   College Admin:');
        console.log('   Email: college@test.com');
        console.log('   Password: College@123');
        console.log('\n   Super Admin:');
        console.log('   Email: admin@placement.com');
        console.log('   Password: Admin@123');
        console.log('\n   Students:');
        console.log('   Email: <student email from database>');
        console.log('   Password: <FirstName>@123');
        console.log('   Example: aarav.sharma@college.edu / Aarav@123');
        console.log('='.repeat(60));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedStudents();
