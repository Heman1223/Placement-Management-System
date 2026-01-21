const mongoose = require('mongoose');
const { User, College, Student, Company } = require('../models');
require('dotenv').config();

const seedLPUData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create College Admin User for LPU
        const existingAdmin = await User.findOne({ email: 'admin@lpu.in' });
        let adminUser;
        
        if (existingAdmin) {
            console.log('LPU Admin already exists');
            adminUser = existingAdmin;
        } else {
            adminUser = await User.create({
                email: 'admin@lpu.in',
                password: 'lpu@123',
                role: 'college_admin',
                isApproved: true,
                isActive: true
            });
            console.log('✓ Created LPU Admin User');
        }

        // 2. Create Lovely Professional University
        const existingCollege = await College.findOne({ code: 'LPU' });
        let college;

        if (existingCollege) {
            console.log('LPU College already exists');
            college = existingCollege;
        } else {
            college = await College.create({
                name: 'Lovely Professional University',
                code: 'LPU',
                university: 'Lovely Professional University',
                address: {
                    street: 'Jalandhar-Delhi G.T. Road',
                    city: 'Phagwara',
                    state: 'Punjab',
                    pincode: '144411',
                    country: 'India'
                },
                contactEmail: 'info@lpu.in',
                phone: '+91-1824-517000',
                website: 'https://www.lpu.in',
                departments: [
                    'Computer Science and Engineering',
                    'Information Technology',
                    'Electronics and Communication',
                    'Mechanical Engineering',
                    'Civil Engineering',
                    'Business Administration'
                ],
                admin: adminUser._id,
                isVerified: true,
                verifiedAt: new Date(),
                isActive: true
            });

            // Link college to admin
            adminUser.collegeProfile = college._id;
            await adminUser.save();

            console.log('✓ Created Lovely Professional University');
        }

        // 3. Create 10 Students (Auto-verified, not placed)
        const students = [
            {
                name: { firstName: 'Rahul', lastName: 'Sharma' },
                email: 'rahul.sharma@lpu.in',
                rollNumber: 'LPU2021001',
                department: 'Computer Science and Engineering',
                batch: 2025,
                cgpa: 8.5,
                skills: ['Java', 'Python', 'React', 'Node.js', 'MongoDB']
            },
            {
                name: { firstName: 'Priya', lastName: 'Patel' },
                email: 'priya.patel@lpu.in',
                rollNumber: 'LPU2021002',
                department: 'Information Technology',
                batch: 2025,
                cgpa: 9.1,
                skills: ['JavaScript', 'Angular', 'SQL', 'AWS', 'Docker']
            },
            {
                name: { firstName: 'Amit', lastName: 'Kumar' },
                email: 'amit.kumar@lpu.in',
                rollNumber: 'LPU2021003',
                department: 'Computer Science and Engineering',
                batch: 2025,
                cgpa: 8.8,
                skills: ['C++', 'Data Structures', 'Algorithms', 'Machine Learning', 'TensorFlow']
            },
            {
                name: { firstName: 'Sneha', lastName: 'Reddy' },
                email: 'sneha.reddy@lpu.in',
                rollNumber: 'LPU2021004',
                department: 'Electronics and Communication',
                batch: 2025,
                cgpa: 8.3,
                skills: ['Embedded Systems', 'IoT', 'Python', 'MATLAB', 'Circuit Design']
            },
            {
                name: { firstName: 'Vikram', lastName: 'Singh' },
                email: 'vikram.singh@lpu.in',
                rollNumber: 'LPU2021005',
                department: 'Computer Science and Engineering',
                batch: 2025,
                cgpa: 9.0,
                skills: ['Full Stack Development', 'React', 'Node.js', 'PostgreSQL', 'Redis']
            },
            {
                name: { firstName: 'Anjali', lastName: 'Verma' },
                email: 'anjali.verma@lpu.in',
                rollNumber: 'LPU2021006',
                department: 'Information Technology',
                batch: 2025,
                cgpa: 8.7,
                skills: ['Python', 'Django', 'REST API', 'MySQL', 'Git']
            },
            {
                name: { firstName: 'Rohan', lastName: 'Gupta' },
                email: 'rohan.gupta@lpu.in',
                rollNumber: 'LPU2021007',
                department: 'Computer Science and Engineering',
                batch: 2025,
                cgpa: 8.4,
                skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Kubernetes']
            },
            {
                name: { firstName: 'Pooja', lastName: 'Joshi' },
                email: 'pooja.joshi@lpu.in',
                rollNumber: 'LPU2021008',
                department: 'Business Administration',
                batch: 2025,
                cgpa: 8.9,
                skills: ['Business Analytics', 'Excel', 'Power BI', 'SQL', 'Marketing']
            },
            {
                name: { firstName: 'Karan', lastName: 'Mehta' },
                email: 'karan.mehta@lpu.in',
                rollNumber: 'LPU2021009',
                department: 'Computer Science and Engineering',
                batch: 2025,
                cgpa: 8.6,
                skills: ['Mobile Development', 'React Native', 'Flutter', 'Firebase', 'GraphQL']
            },
            {
                name: { firstName: 'Divya', lastName: 'Nair' },
                email: 'divya.nair@lpu.in',
                rollNumber: 'LPU2021010',
                department: 'Information Technology',
                batch: 2025,
                cgpa: 9.2,
                skills: ['DevOps', 'CI/CD', 'Jenkins', 'Docker', 'Terraform', 'AWS']
            }
        ];

        let createdCount = 0;
        for (const studentData of students) {
            const existing = await Student.findOne({ email: studentData.email });
            if (!existing) {
                await Student.create({
                    ...studentData,
                    college: college._id,
                    phone: '+91-98765' + Math.floor(10000 + Math.random() * 90000),
                    dateOfBirth: new Date('2003-01-15'),
                    gender: ['male', 'female'][Math.floor(Math.random() * 2)],
                    placementStatus: 'not_placed',
                    isVerified: true, // Auto-verified as admin is creating
                    verifiedAt: new Date(),
                    source: 'manual',
                    addedBy: adminUser._id
                });
                createdCount++;
            }
        }
        console.log(`✓ Created ${createdCount} students (${10 - createdCount} already existed)`);

        // 4. Create Infosys Company User
        const existingCompanyUser = await User.findOne({ email: 'hr@infosys.com' });
        let companyUser;

        if (existingCompanyUser) {
            console.log('Infosys user already exists');
            companyUser = existingCompanyUser;
        } else {
            companyUser = await User.create({
                email: 'hr@infosys.com',
                password: 'infosys@123',
                role: 'company',
                isApproved: true,
                isActive: true
            });
            console.log('✓ Created Infosys User');
        }

        // 5. Create Infosys Company
        const existingCompany = await Company.findOne({ name: 'Infosys Limited' });
        let company;

        if (existingCompany) {
            console.log('Infosys company already exists');
            company = existingCompany;
        } else {
            company = await Company.create({
                name: 'Infosys Limited',
                type: 'company',
                industry: 'Information Technology',
                description: 'Infosys is a global leader in next-generation digital services and consulting. We enable clients in more than 50 countries to navigate their digital transformation.',
                website: 'https://www.infosys.com',
                contactPerson: {
                    name: 'Rajesh Kumar',
                    designation: 'HR Manager',
                    email: 'hr@infosys.com',
                    phone: '+91-80-2852-0261'
                },
                headquarters: {
                    city: 'Bangalore',
                    state: 'Karnataka',
                    country: 'India'
                },
                size: '1000+',
                foundedYear: 1981,
                user: companyUser._id,
                isApproved: true,
                approvedAt: new Date(),
                isActive: true,
                preferredDepartments: [
                    'Computer Science and Engineering',
                    'Information Technology',
                    'Electronics and Communication'
                ]
            });

            // Link company to user
            companyUser.companyProfile = company._id;
            await companyUser.save();

            console.log('✓ Created Infosys Limited');
        }

        console.log('\n=================================');
        console.log('✅ Seeding completed successfully!');
        console.log('=================================\n');
        console.log('📚 College Details:');
        console.log('   Name: Lovely Professional University');
        console.log('   Code: LPU');
        console.log('   Admin Email: admin@lpu.in');
        console.log('   Admin Password: lpu@123');
        console.log('   Students: 10 (all verified, not placed)');
        console.log('\n🏢 Company Details:');
        console.log('   Name: Infosys Limited');
        console.log('   Email: hr@infosys.com');
        console.log('   Password: infosys@123');
        console.log('   Type: Company');
        console.log('   Status: Approved & Active');
        console.log('\n=================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedLPUData();
