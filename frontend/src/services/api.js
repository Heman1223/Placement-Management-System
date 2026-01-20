import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';

        // Handle authentication errors
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
                toast.error('Session expired. Please login again.');
            }
        } else if (error.response?.status === 403) {
            toast.error('Access denied');
        } else if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.');
        }

        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updatePassword: (data) => api.put('/auth/password', data),
    logout: () => api.post('/auth/logout')
};

// Super Admin endpoints
export const superAdminAPI = {
    getStats: () => api.get('/super-admin/stats'),
    getColleges: (params) => api.get('/super-admin/colleges', { params }),
    createCollege: (data) => api.post('/super-admin/colleges', data),
    getCollegeDetails: (id) => api.get(`/super-admin/colleges/${id}`),
    approveCollege: (id, approved) => api.patch(`/super-admin/colleges/${id}/approve`, { approved }),
    getCollegeStudents: (id, params) => api.get(`/super-admin/colleges/${id}/students`, { params }),
    addStudentToCollege: (id, data) => api.post(`/super-admin/colleges/${id}/students`, data),
    getCompanies: (params) => api.get('/super-admin/companies', { params }),
    createCompany: (data) => api.post('/super-admin/companies', data),
    approveCompany: (id, approved) => api.patch(`/super-admin/companies/${id}/approve`, { approved }),
    getUsers: (params) => api.get('/super-admin/users', { params }),
    toggleUserStatus: (id) => api.patch(`/super-admin/users/${id}/toggle-status`)
};

// College Admin endpoints
export const collegeAPI = {
    getStats: () => api.get('/college/stats'),
    getStudents: (params) => api.get('/college/students', { params }),
    getStudent: (id) => api.get(`/college/students/${id}`),
    addStudent: (data) => api.post('/college/students', data),
    updateStudent: (id, data) => api.put(`/college/students/${id}`, data),
    deleteStudent: (id) => api.delete(`/college/students/${id}`),
    verifyStudent: (id) => api.patch(`/college/students/${id}/verify`),
    bulkUpload: (students) => api.post('/college/students/bulk', { students }),
    getDepartments: () => api.get('/college/departments')
};

// Company endpoints
export const companyAPI = {
    getStats: () => api.get('/company/stats'),
    updateProfile: (data) => api.put('/company/profile', data),
    searchStudents: (params) => api.get('/company/students/search', { params }),
    getStudent: (id) => api.get(`/company/students/${id}`),
    shortlist: (studentId, jobId, notes) => api.post('/company/shortlist', { studentId, jobId, notes }),
    getShortlist: (params) => api.get('/company/shortlist', { params }),
    updateApplication: (id, data) => api.patch(`/company/applications/${id}/status`, data)
};

// Job endpoints
export const jobAPI = {
    getPublicJobs: (params) => api.get('/jobs/public', { params }),
    getJobs: (params) => api.get('/jobs', { params }),
    getJob: (id) => api.get(`/jobs/${id}`),
    createJob: (data) => api.post('/jobs', data),
    updateJob: (id, data) => api.put(`/jobs/${id}`, data),
    deleteJob: (id) => api.delete(`/jobs/${id}`),
    getApplicants: (id, params) => api.get(`/jobs/${id}/applicants`, { params }),
    closeJob: (id, reason) => api.patch(`/jobs/${id}/close`, { reason })
};

export default api;
