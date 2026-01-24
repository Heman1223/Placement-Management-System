import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
    Search, Filter, GraduationCap,
    CheckCircle, XCircle, MoreVertical,
    ChevronLeft, ChevronRight, UserCheck,
    Star, Eye, Building2, Briefcase, Mail, Phone, Sparkles, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './AdminPages.css';

const Students = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filters, setFilters] = useState({
        search: '',
        college: '',
        department: '',
        batch: '',
        placementStatus: '',
        isStarStudent: '',
        minCGPA: '',
        maxCGPA: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        fetchStudents();
        fetchColleges();

        const handleClickOutside = (event) => {
            if (!event.target.closest('.table-action-btn') && !event.target.closest('.inline-dropdown')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [pagination.current]);

    const fetchColleges = async () => {
        try {
            const response = await superAdminAPI.getColleges({ limit: 100 });
            setColleges(response.data.data.colleges);
        } catch (error) {
            console.error('Failed to load colleges');
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: 10,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                )
            };

            const response = await superAdminAPI.getAllStudents(params);
            setStudents(response.data.data.students);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStar = async (student) => {
        try {
            await superAdminAPI.toggleStarStudent(student._id);
            toast.success(student.isStarStudent ? 'Removed from Star Students' : 'Marked as Star Student');
            fetchStudents();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;

        try {
            await superAdminAPI.deleteStudent(id);
            toast.success('Student deleted successfully');
            fetchStudents();
        } catch (error) {
            toast.error('Failed to delete student');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, current: 1 });
        fetchStudents();
    };

    const handleFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            college: '',
            department: '',
            batch: '',
            placementStatus: '',
            isStarStudent: '',
            minCGPA: '',
            maxCGPA: ''
        });
        setPagination({ ...pagination, current: 1 });
        setTimeout(fetchStudents, 100);
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getAvatarColor = (index) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        return colors[index % colors.length];
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="admin-page-v2"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Premium Header Banner */}
            <div className="premium-header-banner">
                <div className="premium-header-text">
                    <h1>All Students</h1>
                    <p>Comprehensive overview of students across all registered universities.</p>
                </div>
                <button
                    className={`premium-search-btn rounded-xl bg-white/10 hover:bg-white/20 transition-all ${showFilters ? 'bg-white/20' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                    title="Toggle advanced filters"
                >
                    <Filter size={16} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {/* Premium Stat Grid */}
            <div className="premium-stat-grid">
                <motion.div className="premium-stat-card" variants={itemVariants}>
                    <div className="premium-stat-icon bg-blue-500/10 text-blue-500">
                        <GraduationCap size={24} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Total Students</span>
                        <span className="stat-value">{pagination.total.toLocaleString()}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" variants={itemVariants}>
                    <div className="premium-stat-icon bg-emerald-500/10 text-emerald-500">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Placed</span>
                        <span className="stat-value">
                            {students.filter(s => s.placementStatus === 'placed').length}
                        </span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" variants={itemVariants}>
                    <div className="premium-stat-icon bg-amber-500/10 text-amber-500">
                        <XCircle size={24} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Unplaced</span>
                        <span className="stat-value">
                            {students.filter(s => s.placementStatus !== 'placed').length}
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Premium Search Container */}
            <motion.div className="premium-search-container" variants={itemVariants}>
                <form onSubmit={handleSearch} className="flex-1 flex">
                    <div className="search-input-wrapper flex-1">
                        <Search size={18} className="text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or roll number..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <button type="submit" className="premium-search-btn">
                        <Search size={18} />
                        Search
                    </button>
                </form>
            </motion.div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="filters-panel-premium mx-8 mb-6 overflow-hidden"
                    >
                        <div className="p-6 bg-[#1e293b] rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">College</label>
                                <select
                                    className="bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                                    value={filters.college}
                                    onChange={(e) => handleFilterChange('college', e.target.value)}
                                >
                                    <option value="">All Colleges</option>
                                    {colleges.map(college => (
                                        <option key={college._id} value={college._id}>{college.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                                <input
                                    className="bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                                    placeholder="e.g. CSE, IT"
                                    value={filters.department}
                                    onChange={(e) => handleFilterChange('department', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Placement Status</label>
                                <select
                                    className="bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                                    value={filters.placementStatus}
                                    onChange={(e) => handleFilterChange('placementStatus', e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="placed">Placed</option>
                                    <option value="not_placed">Not Placed</option>
                                    <option value="in_process">In Process</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Star Students</label>
                                <select
                                    className="bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500"
                                    value={filters.isStarStudent}
                                    onChange={(e) => handleFilterChange('isStarStudent', e.target.value)}
                                >
                                    <option value="">All Students</option>
                                    <option value="true">Star Students Only</option>
                                    <option value="false">Non-Star Students</option>
                                </select>
                            </div>
                            <div className="flex items-end gap-3">
                                <Button className="flex-1" onClick={fetchStudents}>Apply Filters</Button>
                                <Button variant="outline" onClick={clearFilters} title="Clear all filters">Clear</Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Table Wrapper */}
            <div className="premium-table-container">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Roll Number</th>
                            <th>College</th>
                            <th>Department</th>
                            <th>CGPA</th>
                            <th>Status</th>
                            <th>Verified</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-20">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                        <span className="text-slate-500 font-medium">Syncing student data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : students.length > 0 ? (
                            students.map((student, idx) => (
                                <tr
                                    key={student._id}
                                    onClick={() => navigate(`/admin/students/${student._id}`)}
                                    style={{ cursor: 'pointer' }}
                                    className="hover:bg-slate-800/50 transition-colors"
                                >
                                    <td>
                                        <div className="user-cell">
                                            <div className="relative">
                                                <div
                                                    className="user-avatar-small shrink-0"
                                                    style={{ backgroundColor: getAvatarColor(idx) }}
                                                >
                                                    {getInitials(student.name?.firstName, student.name?.lastName)}
                                                </div>
                                                {student.isStarStudent && (
                                                    <div className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-1 border border-amber-500 shadow-sm z-20">
                                                        <Star size={12} className="text-amber-500 fill-amber-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="user-info-text">
                                                <div className="flex items-center gap-2">
                                                    <span className="user-name">{student.name?.firstName} {student.name?.lastName}</span>
                                                    {student.isStarStudent && (
                                                        <Star size={14} className="text-amber-400 fill-amber-400" />
                                                    )}
                                                </div>
                                                <span className="user-subtext">{student.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-mono text-xs">{student.rollNumber}</td>
                                    <td>
                                        <div className="user-info-text">
                                            <span className="text-white font-medium">{student.college?.name}</span>
                                            <span className="user-subtext">{student.college?.city || 'Campus'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="px-2 py-1 bg-white/5 rounded text-[11px] font-bold text-slate-400">
                                            {student.department}
                                        </span>
                                    </td>
                                    <td className="font-bold text-blue-400">{student.cgpa?.toFixed(2) || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge-v2 ${student.placementStatus}`}>
                                            {student.placementStatus?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={`verify-chip ${student.isVerified ? 'yes' : 'no'}`}>
                                            {student.isVerified ? <UserCheck size={14} /> : <XCircle size={14} />}
                                            {student.isVerified ? 'Yes' : 'No'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="relative">
                                            <button
                                                className="table-action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdown(openDropdown === student._id ? null : student._id);
                                                }}
                                                title="More actions"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            <AnimatePresence>
                                                {openDropdown === student._id && (
                                                    <motion.div
                                                        className="inline-dropdown right-0"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        style={{ right: '100%', top: 0, marginRight: '8px' }}
                                                    >

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/admin/students/${student._id}`);
                                                                setOpenDropdown(null);
                                                            }}
                                                            title="View student profile"
                                                        >
                                                            <Eye size={16} /> View Profile
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                handleToggleStar(student);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className={student.isStarStudent ? 'danger' : 'warning'}
                                                            title={student.isStarStudent ? 'Remove star status' : 'Mark as star student'}
                                                        >
                                                            <Star size={16} className={student.isStarStudent ? 'fill-current' : ''} />
                                                            {student.isStarStudent ? 'Remove Star' : 'Mark as Star'}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(student._id);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="danger"
                                                            title="Delete student permanently"
                                                        >
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-20 text-slate-500">
                                    No students found matching your search criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="premium-pagination">
                    <span className="text-xs text-slate-500 font-medium">
                        Showing {students.length} of {pagination.total} students
                    </span>
                    <div className="pagination-controls">
                        <button
                            className="page-nav-btn"
                            disabled={pagination.current === 1}
                            onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    className={`page-num-btn ${pagination.current === pageNum ? 'active' : ''}`}
                                    onClick={() => setPagination({ ...pagination, current: pageNum })}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {pagination.pages > 5 && <span className="text-slate-700 px-2">...</span>}
                        {pagination.pages > 5 && (
                            <button
                                className={`page-num-btn ${pagination.current === pagination.pages ? 'active' : ''}`}
                                onClick={() => setPagination({ ...pagination, current: pagination.pages })}
                            >
                                {pagination.pages}
                            </button>
                        )}

                        <button
                            className="page-nav-btn"
                            disabled={pagination.current === pagination.pages}
                            onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>


        </motion.div>
    );
};

export default Students;

