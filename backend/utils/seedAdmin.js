/**
 * Seed Super Admin User
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const { User } = require('../models');

const seedAdmin = async () => {
    try {
        await connectDB();

        // Check if super admin exists
        const existingAdmin = await User.findOne({ role: 'super_admin' });

        if (existingAdmin) {
            console.log('Super Admin already exists:', existingAdmin.email);
            process.exit(0);
        }

        // Create super admin
        const admin = await User.create({
            email: 'admin@placement.com',
            password: 'Admin@123',
            role: 'super_admin',
            isApproved: true,
            isActive: true
        });

        console.log('Super Admin created successfully!');
        console.log('Email: admin@placement.com');
        console.log('Password: Admin@123');
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
