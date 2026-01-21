const mongoose = require('mongoose');
const { User, Company, Job } = require('../models');
require('dotenv').config();

const seedInfosysJob = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find Infosys company user
        const infosysUser = await User.findOne({ email: 'hr@infosys.com' });
        
        if (!infosysUser) {
            console.error('❌ Infosys user not found. Please run seedLPU.js first.');
            process.exit(1);
        }

        // Find Infosys company
        const infosysCompany = await Company.findOne({ user: infosysUser._id });
        
        if (!infosysCompany) {
            console.error('❌ Infosys company not found.');
            process.exit(1);
        }

        // Check if job already exists
        const existingJob = await Job.findOne({ 
            company: infosysCompany._id,
            title: 'Software Engineer - Full Stack Developer'
        });

        if (existingJob) {
            console.log('✓ Job already exists');
            console.log('\n=================================');
            console.log('Job Details:');
            console.log('   Title:', existingJob.title);
            console.log('   Type:', existingJob.type);
            console.log('   Status:', existingJob.status);
            console.log('   Package:', existingJob.package, 'LPA');
            console.log('=================================\n');
            process.exit(0);
        }

        // Create job
        const job = await Job.create({
            title: 'Software Engineer - Full Stack Developer',
            company: infosysCompany._id,
            type: 'full_time',
            category: 'Software Development',
            description: `Infosys is looking for talented Full Stack Developers to join our dynamic team. As a Software Engineer, you will be responsible for designing, developing, and maintaining web applications using modern technologies.

Key Responsibilities:
• Design and develop scalable web applications
• Work with both frontend and backend technologies
• Collaborate with cross-functional teams
• Write clean, maintainable code
• Participate in code reviews and technical discussions
• Troubleshoot and debug applications

What We Offer:
• Competitive salary package
• Health insurance and benefits
• Learning and development opportunities
• Work on cutting-edge technologies
• Global exposure and career growth`,
            
            locations: ['Bangalore', 'Hyderabad', 'Pune'],
            workMode: 'hybrid',

            salary: {
                min: 400000,
                max: 500000,
                currency: 'INR',
                period: 'per_annum'
            },

            eligibility: {
                minCgpa: 7.0,
                maxBacklogs: 0,
                allowedDepartments: [
                    'Computer Science and Engineering',
                    'Information Technology',
                    'Electronics and Communication'
                ],
                allowedBatches: [2025, 2024],
                requiredSkills: [
                    'JavaScript',
                    'React',
                    'Node.js',
                    'HTML',
                    'CSS'
                ],
                preferredSkills: [
                    'Express',
                    'MongoDB',
                    'Git',
                    'REST APIs',
                    'Problem Solving'
                ]
            },

            hiringProcess: [
                {
                    round: 1,
                    name: 'Online Assessment',
                    description: 'Coding test and aptitude'
                },
                {
                    round: 2,
                    name: 'Technical Interview',
                    description: 'Technical discussion and problem solving'
                },
                {
                    round: 3,
                    name: 'HR Interview',
                    description: 'Final HR discussion'
                }
            ],

            expectedHires: 25,
            applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            joiningDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            
            status: 'open',
            publishedAt: new Date(),
            
            createdBy: infosysUser._id,
            
            stats: {
                totalApplications: 0,
                shortlisted: 0,
                hired: 0
            }
        });

        console.log('✓ Job created successfully!');
        console.log('\n=================================');
        console.log('✅ Job Posted Successfully!');
        console.log('=================================\n');
        console.log('📋 Job Details:');
        console.log('   Company: Infosys Limited');
        console.log('   Title:', job.title);
        console.log('   Type:', job.type);
        console.log('   Category:', job.category);
        console.log('   Salary:', `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()} per annum`);
        console.log('   Locations:', job.locations.join(', '));
        console.log('   Work Mode:', job.workMode);
        console.log('   Expected Hires:', job.expectedHires);
        console.log('   Min CGPA:', job.eligibility.minCgpa);
        console.log('   Max Backlogs:', job.eligibility.maxBacklogs);
        console.log('   Status:', job.status);
        console.log('   Application Deadline:', job.applicationDeadline.toLocaleDateString());
        console.log('   Joining Date:', job.joiningDate.toLocaleDateString());
        console.log('\n📚 Required Skills:');
        job.eligibility.requiredSkills.forEach(skill => {
            console.log('   •', skill);
        });
        console.log('\n✨ Preferred Skills:');
        job.eligibility.preferredSkills.forEach(skill => {
            console.log('   •', skill);
        });
        console.log('\n🎓 Allowed Departments:');
        job.eligibility.allowedDepartments.forEach(dept => {
            console.log('   •', dept);
        });
        console.log('\n📅 Allowed Batches:');
        job.eligibility.allowedBatches.forEach(batch => {
            console.log('   •', batch);
        });
        console.log('\n🔄 Hiring Process:');
        job.hiringProcess.forEach(round => {
            console.log(`   Round ${round.round}: ${round.name}`);
            console.log(`      ${round.description}`);
        });
        console.log('\n=================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding job:', error);
        process.exit(1);
    }
};

seedInfosysJob();
