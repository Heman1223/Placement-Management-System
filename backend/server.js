require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware');
const { authRoutes, superAdminRoutes, collegeRoutes, companyRoutes, jobRoutes, studentRoutes, uploadRoutes, activityLogRoutes } = require('./routes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Placement Management System API is running',
        timestamp: new Date().toISOString()
    });
});

// API root route
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Placement Management System API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth (POST /login, /register)',
            superAdmin: '/api/super-admin',
            college: '/api/college',
            company: '/api/company',
            jobs: '/api/jobs',
            student: '/api/student',
            upload: '/api/upload',
            activityLogs: '/api/activity-logs'
        },
        documentation: 'See API_DOCUMENTATION.md for details'
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Placement Management System API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            superAdmin: '/api/super-admin',
            college: '/api/college',
            company: '/api/company',
            jobs: '/api/jobs',
            student: '/api/student',
            upload: '/api/upload',
            activityLogs: '/api/activity-logs'
        },
        documentation: 'See API_DOCUMENTATION.md for details'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
