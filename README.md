# 🎓 Placement Management System

A comprehensive, role-based placement management platform connecting colleges, students, and placement agencies. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Protected routes based on user roles

### 👑 Super Admin Features
- Create and manage colleges
- Approve/reject placement agencies
- Platform-wide analytics dashboard
- User management (activate/deactivate)
- Activity logs and audit trails
- Download platform reports

### 🏫 College Admin Features
- Student management (CRUD operations)
- Bulk student upload via CSV
- Approve/reject student registrations
- Verify student profiles
- Advanced student search and filtering
- Export student data to CSV
- View placement statistics
- Track company access to student data

### 👨‍🎓 Student Features
- Complete profile management
- Resume upload (PDF, max 5MB)
- Profile completeness tracking
- Browse eligible jobs
- Apply for jobs
- Track application status
- Receive notifications
- Manage skills and certifications
- Add professional links (LinkedIn, GitHub, Portfolio)

### 🏢 Company/Placement Agency Features
- Post job openings
- Advanced student search with filters
- Shortlist candidates
- Add timestamped notes to candidates
- Download shortlisted students (CSV)
- View hiring analytics
- Request access to college data

### 📊 System Features
- Activity logging for audit trails
- Notification system
- File upload with Cloudinary
- CSV/Excel import and export
- Responsive design (mobile-friendly)
- Real-time statistics
- Advanced search and filtering

---

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Cloudinary** - Cloud storage
- **XLSX** - Excel parsing

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Context API** - State management

### DevOps
- **Git** - Version control
- **npm** - Package manager
- **Nodemon** - Development server

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Super   │  │ College  │  │ Company  │  │ Student  │   │
│  │  Admin   │  │  Admin   │  │ Portal   │  │ Portal   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Authentication Middleware                │  │
│  │         (JWT Verification + Role-Based Access)        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │ Student  │  │ Company  │  │  Admin   │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers (Business Logic)             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Models (Mongoose Schemas + Validation)        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  ┌──────┐ ┌─────────┐ ┌─────────┐ ┌──────────────────┐    │
│  │Users │ │Colleges │ │Students │ │Jobs & Applications│    │
│  └──────┘ └─────────┘ └─────────┘ └──────────────────┘    │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────┐   │
│  │Companies │ │Notifications │ │Activity Logs         │   │
│  └──────────┘ └──────────────┘ └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudinary (File Storage)                 │
│              Resumes, Logos, Documents                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/placement-management-system.git
cd placement-management-system
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
```

4. **Configure environment variables**

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

5. **Create super admin account**
```bash
cd backend
npm run seed
```

Default credentials:
- Email: `admin@placement.com`
- Password: `admin123`

6. **Start the application**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 👥 User Roles

### 1. Super Admin (Platform Owner)
- Full system access
- Manages colleges and placement agencies
- Views platform-wide analytics
- Controls user approvals

### 2. College Admin
- Manages students for their college
- Uploads student data (manual/bulk)
- Verifies student profiles
- Exports student reports
- Views college placement statistics

### 3. Student
- Completes profile with resume
- Browses and applies for jobs
- Tracks application status
- Receives notifications
- Manages skills and certifications

### 4. Company/Placement Agency
- Posts job openings
- Searches and filters students
- Shortlists candidates
- Adds notes to candidates
- Downloads candidate reports

---

## 📚 API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick API Reference

**Base URL:** `http://localhost:5000/api`

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/profile` - Get user profile

#### Student Routes
- `GET /student/stats` - Dashboard statistics
- `GET /student/profile` - Get profile
- `PUT /student/profile` - Update profile
- `GET /student/jobs` - Browse jobs
- `POST /student/jobs/:id/apply` - Apply for job

#### College Routes
- `GET /college/students` - Get all students
- `POST /college/students` - Add student
- `POST /college/students/bulk` - Bulk upload
- `GET /college/students/export` - Export to CSV

#### Company Routes
- `GET /company/students` - Search students
- `POST /company/shortlist` - Shortlist student
- `GET /company/shortlist/export` - Export shortlist

#### Upload Routes
- `POST /upload/resume` - Upload resume
- `POST /upload/logo` - Upload logo

---

## 📸 Screenshots

### Student Dashboard
![Student Dashboard](./screenshots/student-dashboard.png)

### College Admin - Student Management
![Student Management](./screenshots/college-students.png)

### Company - Student Search
![Student Search](./screenshots/company-search.png)

### Super Admin Dashboard
![Super Admin](./screenshots/super-admin.png)

---

## 📁 Project Structure

```
placement-management-system/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── collegeController.js
│   │   ├── companyController.js
│   │   ├── jobController.js
│   │   └── superAdminController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── rbac.js               # Role-based access
│   │   ├── errorHandler.js
│   │   ├── validate.js
│   │   └── activityLogger.js
│   ├── models/
│   │   ├── User.js
│   │   ├── College.js
│   │   ├── Student.js
│   │   ├── Company.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── Notification.js
│   │   ├── Shortlist.js
│   │   └── ActivityLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── collegeRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── superAdminRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   ├── csvExporter.js
│   │   ├── excelParser.js
│   │   ├── notificationService.js
│   │   └── seedAdmin.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── Jobs.jsx
│   │   │   │   └── Applications.jsx
│   │   │   ├── college/
│   │   │   ├── company/
│   │   │   └── superAdmin/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── API_DOCUMENTATION.md
├── IMPLEMENTATION_SUMMARY.md
├── PROJECT_ANALYSIS.md
├── QUICK_START.md
└── README.md
```

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- File type and size validation
- Activity logging for audit trails
- Secure file storage with Cloudinary
- CORS protection
- Environment variable protection

---

## 🧪 Testing

### Manual Testing
1. Use Postman or Thunder Client
2. Import API collection
3. Test all endpoints
4. Verify role-based access

### Test Accounts
After running seed script:
- Super Admin: `admin@placement.com` / `admin123`

---

## 📈 Future Enhancements

- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Advanced analytics with charts
- [ ] Job recommendation engine
- [ ] Interview scheduling
- [ ] Video interview integration
- [ ] Mobile app (React Native)
- [ ] Real-time chat
- [ ] Push notifications
- [ ] AI-powered resume parsing
- [ ] Automated placement reports

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- MongoDB for the database
- Cloudinary for file storage
- React team for the amazing framework
- Express.js community
- All contributors and testers

---

## 📞 Support

For support, email support@placementsystem.com or open an issue in the repository.

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

**Made with ❤️ for better placement management**
