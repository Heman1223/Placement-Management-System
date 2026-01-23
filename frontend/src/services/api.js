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
    logout: () => api.post('/auth/logout'),
    getLoginHistory: () => api.get('/auth/login-history'),
    getPublicColleges: () => api.get('/auth/colleges')
};

// Super Admin endpoints
export const superAdminAPI = {
    getStats: () => api.get('/super-admin/stats'),
    getAnalytics: () => api.get('/super-admin/analytics'),
    getColleges: (params) => api.get('/super-admin/colleges', { params }),
    createCollege: (data) => api.post('/super-admin/colleges', data),
    getCollegeDetails: (id) => api.get(`/super-admin/colleges/${id}`),
    updateCollege: (id, data) => api.patch(`/super-admin/colleges/${id}`, data),
    approveCollege: (id, approved) => api.patch(`/super-admin/colleges/${id}/approve`, { approved }),
    toggleCollegeStatus: (id) => api.patch(`/super-admin/colleges/${id}/toggle-active`),
    deleteCollege: (id) => api.delete(`/super-admin/colleges/${id}`),
    restoreCollege: (id) => api.patch(`/super-admin/colleges/${id}/restore`),
    getCollegeStudents: (id, params) => api.get(`/super-admin/colleges/${id}/students`, { params }),
    addStudentToCollege: (id, data) => api.post(`/super-admin/colleges/${id}/students`, data),
    getCompanies: (params) => api.get('/super-admin/companies', { params }),
    createCompany: (data) => api.post('/super-admin/companies', data),
    getAgencyDetails: (id) => api.get(`/super-admin/companies/${id}/agency-details`),
    updateCompany: (id, data) => api.patch(`/super-admin/companies/${id}`, data),
    approveCompany: (id, approved) => api.patch(`/super-admin/companies/${id}/approve`, { approved }),
    toggleCompanyStatus: (id) => api.patch(`/super-admin/companies/${id}/toggle-active`),
    toggleCompanySuspension: (id, reason, endDate) => api.patch(`/super-admin/companies/${id}/suspend`, { reason, endDate }),
    deleteCompany: (id) => api.delete(`/super-admin/companies/${id}`),
    restoreCompany: (id) => api.patch(`/super-admin/companies/${id}/restore`),
    assignCollegesToAgency: (id, collegeIds) => api.post(`/super-admin/companies/${id}/assign-colleges`, { collegeIds }),
    removeCollegeFromAgency: (id, collegeId) => api.delete(`/super-admin/companies/${id}/colleges/${collegeId}`),
    setAgencyAccessExpiry: (id, expiryDate) => api.patch(`/super-admin/companies/${id}/access-expiry`, { expiryDate }),
    setAgencyDownloadLimit: (id, limit) => api.patch(`/super-admin/companies/${id}/download-limit`, { limit }),

    getAllStudents: (params) => api.get('/super-admin/students', { params }),
    getStudent: (id) => api.get(`/super-admin/students/${id}`),
    toggleStarStudent: (id) => api.patch(`/super-admin/students/${id}/toggle-star`), // Adding this too since I used it
    getUsers: (params) => api.get('/super-admin/users', { params }),
    toggleUserStatus: (id) => api.patch(`/super-admin/users/${id}/toggle-status`),
    resetUserPassword: (id, newPassword) => api.post(`/super-admin/users/${id}/reset-password`, { newPassword }),
    getCollegeAdmin: (id) => api.get(`/super-admin/college-admins/${id}`),
    updateCollegeAdmin: (id, data) => api.patch(`/super-admin/college-admins/${id}`, data),
    toggleCollegeAdminBlock: (id) => api.patch(`/super-admin/college-admins/${id}/toggle-block`),
    // Jobs
    getAllJobs: (params) => api.get('/super-admin/jobs', { params }),
    // Settings
    getSettings: () => api.get('/super-admin/settings'),
    updateSettings: (data) => api.put('/super-admin/settings', data),
    resetSettings: () => api.post('/super-admin/settings/reset'),
    updateStudentSignup: (data) => api.patch('/super-admin/settings/student-signup', data),
    updateAgencyRegistration: (data) => api.patch('/super-admin/settings/agency-registration', data),
    updateApprovalRules: (data) => api.patch('/super-admin/settings/approval-rules', data),
    toggleMaintenanceMode: (data) => api.patch('/super-admin/settings/maintenance-mode', data),
    updateDataVisibility: (data) => api.patch('/super-admin/settings/data-visibility', data)
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
    resetStudentPassword: (id, newPassword) => api.post(`/college/students/${id}/reset-password`, { newPassword }),
    bulkUpload: (students) => api.post('/college/students/bulk', { students }),
    getDepartments: () => api.get('/college/departments'),
    exportStudents: (params) => api.get('/college/students/export', { params, responseType: 'blob' }),
    uploadResume: (formData) => api.post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getConnectedCompanies: () => api.get('/college/companies'),
    getCompanyRequests: () => api.get('/college/company-requests'),
    respondToCompanyRequest: (id, data) => api.post(`/college/company-requests/${id}/respond`, data),
    revokeCompanyAccess: (id) => api.delete(`/college/companies/${id}/revoke`),
    updateCompanyAccessSettings: (id, data) => api.patch(`/college/companies/${id}/settings`, data),
    getCompanyActivity: () => api.get('/college/company-activity'),
    getPlacementTracking: (type) => api.get('/college/placements', { params: { type } }),
    getPlacementStats: () => api.get('/college/placement-stats'),
    exportPlacementReport: (type) => api.get('/college/placement-report', { params: { type }, responseType: 'blob' }),
    getPlacementDrives: (params) => api.get('/college/drives', { params }), // Added
    getCollegeProfile: () => api.get('/college/profile'),
    updateCollegeProfile: (data) => api.patch('/college/profile', data),
    getCollegeSettings: () => api.get('/college/settings'),
    updateCollegeSettings: (data) => api.patch('/college/settings', data),
    getStudentPlacementActivity: (id) => api.get(`/college/students/${id}/placement-activity`)
};
// Company endpoints
export const companyAPI = {
    getStats: () => api.get('/company/stats'),
    updateProfile: (data) => api.put('/company/profile', data),
    searchStudents: (params) => api.get('/company/students/search', { params }),
    getStudent: (id) => api.get(`/company/students/${id}`),
    getColleges: () => api.get('/company/colleges'),
    requestCollegeAccess: (data) => api.post('/company/request-access', data), // Added
    getRequestedColleges: () => api.get('/company/my-colleges'), // Added
    shortlist: (studentId, jobId, notes) => api.post('/company/shortlist', { studentId, jobId, notes }),
    getShortlist: (params) => api.get('/company/shortlist', { params }),
    getShortlistDetails: (id) => api.get(`/company/shortlist/${id}`),
    updateShortlistStatus: (id, data) => api.patch(`/company/shortlist/${id}/status`, data),
    addShortlistNote: (id, note) => api.post(`/company/shortlist/${id}/notes`, { note }),
    removeFromShortlist: (id) => api.delete(`/company/shortlist/${id}`),
    updateApplicationStatus: (id, status) => api.patch(`/company/applications/${id}/status`, { status }),
    getJobApplicants: (jobId, params) => api.get(`/jobs/${jobId}/applicants`, { params }),
    exportShortlist: (params) => api.get('/company/shortlist/export', { params, responseType: 'blob' }),
    saveSearchFilter: (name, filters) => api.post('/company/search-filters', { name, filters }),
    getSavedFilters: () => api.get('/company/search-filters'),
    deleteSearchFilter: (name) => api.delete(`/company/search-filters/${name}`),
    logResumeView: (id) => api.post(`/company/students/${id}/log-resume-view`),
    getDownloadStats: () => api.get('/company/download-stats'),
    bulkDownload: (studentIds) => api.post('/company/bulk-download', { studentIds })
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

// Student endpoints
export const studentAPI = {
    getProfile: () => api.get('/student/profile'),
    updateProfile: (data) => api.put('/student/profile', data),
    uploadResume: (formData) => api.post('/student/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getJobs: (params) => api.get('/student/jobs', { params }),
    getJob: (id) => api.get(`/student/jobs/${id}`),
    applyJob: (jobId) => api.post(`/student/jobs/${jobId}/apply`),
    getApplications: (params) => api.get('/student/applications', { params }),
    withdrawApplication: (id) => api.delete(`/student/applications/${id}`),
    getNotifications: (params) => api.get('/student/notifications', { params }),
    markNotificationRead: (id) => api.patch(`/student/notifications/${id}/read`),
    markAllNotificationsRead: () => api.patch('/student/notifications/read-all')
};

export default api;
