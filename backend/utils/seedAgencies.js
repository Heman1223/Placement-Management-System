const mongoose = require('mongoose');
const { User, Company } = require('../models');
require('dotenv').config();

const seedAgencies = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create placement agencies
        const agencies = [
            {
                name: 'TalentBridge Consultancy',
                email: 'contact@talentbridge.com',
                password: 'talent@123',
                industry: 'Recruitment & Staffing',
                description: 'Leading placement consultancy specializing in IT and Engineering placements across India.',
                contactPerson: {
                    name: 'Rajesh Kumar',
                    designation: 'Senior Placement Manager',
                    email: 'rajesh@talentbridge.com',
                    phone: '+91-9876543210'
                },
                headquarters: {
                    city: 'Bangalore',
                    state: 'Karnataka',
                    country: 'India'
                },
                size: '51-200'
            },
            {
                name: 'CareerPath Solutions',
                email: 'info@careerpath.com',
                password: 'career@123',
                industry: 'Human Resources',
                description: 'Connecting talented graduates with top companies. Specialized in campus placements.',
                contactPerson: {
                    name: 'Priya Sharma',
                    designation: 'Head of Campus Relations',
                    email: 'priya@careerpath.com',
                    phone: '+91-9876543211'
                },
                headquarters: {
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India'
                },
                size: '201-500'
            },
            {
                name: 'SkillMatch Recruiters',
                email: 'hello@skillmatch.com',
                password: 'skill@123',
                industry: 'Talent Acquisition',
                description: 'Expert placement agency with 15+ years of experience in graduate recruitment.',
                contactPerson: {
                    name: 'Amit Verma',
                    designation: 'Director - Campus Hiring',
                    email: 'amit@skillmatch.com',
                    phone: '+91-9876543212'
                },
                headquarters: {
                    city: 'Delhi',
                    state: 'Delhi',
                    country: 'India'
                },
                size: '51-200'
            }
        ];

        let createdCount = 0;

        for (const agencyData of agencies) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: agencyData.email });
            
            if (existingUser) {
                console.log(`Agency user ${agencyData.email} already exists`);
                continue;
            }

            // Create user account
            const user = await User.create({
                email: agencyData.email,
                password: agencyData.password,
                role: 'company',
                isApproved: true,
                isActive: true
            });

            // Create company profile as placement agency
            const company = await Company.create({
                name: agencyData.name,
                type: 'placement_agency',
                industry: agencyData.industry,
                description: agencyData.description,
                contactPerson: agencyData.contactPerson,
                headquarters: agencyData.headquarters,
                size: agencyData.size,
                user: user._id,
                isApproved: true,
                approvedAt: new Date(),
                isActive: true,
                agencyAccess: {
                    allowedColleges: [],
                    downloadLimit: 100,
                    downloadCount: 0
                }
            });

            // Link company profile to user
            user.companyProfile = company._id;
            await user.save();

            createdCount++;
            console.log(`✓ Created ${agencyData.name}`);
        }

        console.log('\n=================================');
        console.log('✅ Agency seeding completed!');
        console.log('=================================\n');
        console.log(`Created ${createdCount} placement agencies`);
        console.log('\n📋 Agency Login Credentials:');
        agencies.forEach(agency => {
            console.log(`   ${agency.email} / ${agency.password}`);
        });
        console.log('\n💡 Note: These agencies are approved but have no college access yet.');
        console.log('   College admins can grant them access from the Agencies page.');
        console.log('\n=================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding agencies:', error);
        process.exit(1);
    }
};

seedAgencies();
