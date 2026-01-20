# Database Seeding Guide

## Overview
This guide explains how to populate your database with test data for development and testing.

## Available Seed Scripts

### 1. Seed Super Admin Only
Creates the default super admin account.

```bash
npm run seed
```

**Credentials:**
- Email: `admin@placement.com`
- Password: `Admin@123`

---

### 2. Seed Test Students
Creates a test college with 100 realistic student profiles.

```bash
npm run seed:students
```

**What it creates:**
- 1 Test College (Test Engineering College)
- 1 College Admin account
- 100 Students across 4 batches (2021-2024)
- 25 students per batch
- Realistic data including:
  - Names, emails, phone numbers
  - Departments (CS, IT, ECE, Mech, Civil, EE)
  - Skills and technologies
  - CGPA (6.5 - 10.0)
  - Projects and certifications
  - Work experience (for high performers)
  - Placement status (based on CGPA)
  - 70% verified, 30% pending verification

**College Admin Credentials:**
- Email: `college@test.com`
- Password: `College@123`

---

### 3. Seed Everything
Creates both super admin and test students.

```bash
npm run seed:all
```

---

## Student Data Details

### Batches
- 2021 (Final year - 25 students)
- 2022 (Third year - 25 students)
- 2023 (Second year - 25 students)
- 2024 (First year - 25 students)

### Departments
- Computer Science
- Information Technology
- Electronics and Communication
- Mechanical Engineering
- Civil Engineering
- Electrical Engineering

### Skills Distribution
Students have realistic skill sets including:
- Web Development (React, Node.js, MongoDB)
- Backend (Python, Django, Java, Spring Boot)
- Mobile Development (React Native, Flutter)
- DevOps (AWS, Docker, Kubernetes)
- Data Science (ML, TensorFlow, Python)
- And more...

### Placement Status Logic
- CGPA >= 8.5: 70% placed, 30% in process
- CGPA >= 7.5: 50% in process, 50% not placed
- CGPA < 7.5: Mostly not placed

### Verification Status
- 70% of students are verified
- 30% are pending verification (for testing approval workflow)

---

## Testing Scenarios

### As Super Admin
1. Login with `admin@placement.com`
2. View all colleges
3. Approve/manage colleges and companies
4. View platform-wide statistics

### As College Admin
1. Login with `college@test.com`
2. View 100 students across departments
3. Test filters (department, batch, CGPA, verification)
4. Verify pending students
5. Export student data to CSV
6. View placement statistics

### As Student
Students are created without user accounts. To test:
1. Register a new student account
2. Get approved by college admin
3. Complete profile and apply for jobs

---

## Resetting Data

### Clear All Students
```bash
# Connect to MongoDB and run:
db.students.deleteMany({ source: 'seed' })
```

### Clear Test College
```bash
# Connect to MongoDB and run:
db.colleges.deleteOne({ name: 'Test Engineering College' })
db.users.deleteOne({ email: 'college@test.com' })
```

### Clear Everything
```bash
# Connect to MongoDB and run:
db.dropDatabase()
# Then run seed scripts again
```

---

## Customization

### Change Number of Students
Edit `backend/utils/seedStudents.js`:
```javascript
const studentsPerBatch = 25; // Change this number
```

### Add More Batches
Edit `backend/utils/seedStudents.js`:
```javascript
const batches = [2021, 2022, 2023, 2024, 2025]; // Add more years
```

### Modify Student Data
Edit the arrays in `seedStudents.js`:
- `firstNames` - Add more first names
- `lastNames` - Add more last names
- `departments` - Add/modify departments
- `skills` - Add more skill sets
- `cities` - Add more cities

---

## Troubleshooting

### Error: College already exists
The script checks for existing college. If you want to recreate:
1. Delete the existing college from database
2. Run the script again

### Error: Duplicate key error
Some students might have duplicate roll numbers or emails. The script will skip these and continue.

### Error: Connection failed
Make sure:
1. MongoDB is running
2. `.env` file has correct `MONGODB_URI`
3. Network connection is stable

---

## Production Warning

⚠️ **NEVER run these seed scripts in production!**

These scripts are for development and testing only. They create test data with:
- Default passwords
- Fake email addresses
- Random data

Always use proper data migration and user registration in production.

---

## Next Steps

After seeding:
1. Start the backend: `npm start`
2. Start the frontend: `cd ../frontend && npm run dev`
3. Login and explore the system
4. Test all features with realistic data
5. Verify workflows (student approval, job applications, etc.)

---

**Happy Testing! 🚀**
