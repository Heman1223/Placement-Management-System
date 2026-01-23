import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { 
    Key, Users as UsersIcon, Shield, Briefcase, 
    GraduationCap, Search, Mail, Calendar, 
    MoreVertical, Power, UserCheck, ShieldAlert,
    Clock, ShieldCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPages.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        role: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({});
    const [resetModal, setResetModal] = useState({ open: false, user: null });
    const [newPassword, setNewPassword] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                role: filters.role || undefined,
                search: filters.search || undefined,
                page: filters.page,
                limit: filters.limit
            };

            const response = await superAdminAPI.getUsers(params);
            setUsers(response.data.data.users || response.data.data);
            setPagination(response.data.data.pagination || response.data.pagination);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
            return;
        }

        try {
            await superAdminAPI.toggleUserStatus(userId);
            toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const openResetModal = (user) => {
        setResetModal({ open: true, user });
        setNewPassword('');
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            await superAdminAPI.resetUserPassword(resetModal.user._id, newPassword);
            toast.success('Password reset successfully');
            setResetModal({ open: false, user: null });
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'super_admin': return <Shield size={16} />;
            case 'college_admin': return <GraduationCap size={16} />;
            case 'company': return <Briefcase size={16} />;
            case 'student': return <UsersIcon size={16} />;
            default: return <UsersIcon size={16} />;
        }
    };

    const formatRole = (role) => {
        return role.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getInitials = (email) => {
        return email.charAt(0).toUpperCase();
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
                    <h1>User Accounts</h1>
                    <p>Manage platform-wide user access, roles, and security credentials.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        className={`premium-search-btn rounded-xl bg-white/10 hover:bg-white/20 transition-all ${filters.role ? 'bg-white/20' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <ShieldCheck size={16} />
                        Filter Roles
                    </button>
                </div>
            </div>

            {/* Premium Stat Grid */}
            <div className="premium-stat-grid">
                <motion.div className="premium-stat-card" variants={itemVariants}>
                    <div className="premium-stat-icon bg-blue-500/10 text-blue-500">
                        <UsersIcon size={24} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Total Users</span>
                        <span className="stat-value">{pagination.total || 0}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" variants={itemVariants}>
                    <div className="premium-stat-icon bg-indigo-500/10 text-indigo-500">
                        <Shield size={24} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Administrators</span>
                        <span className="stat-value">{users.filter(u => u.role?.includes('admin')).length}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" variants={itemVariants}>
                    <div className="premium-stat-icon bg-emerald-500/10 text-emerald-500">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Active Now</span>
                        <span className="stat-value">{users.filter(u => u.isActive).length}</span>
                    </div>
                </motion.div>
            </div>

            {/* Premium Search Container */}
            <motion.div className="premium-search-container" variants={itemVariants}>
                <div className="search-input-wrapper flex-1">
                    <Search size={18} className="text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search by email address..." 
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                </div>
                <button className="premium-search-btn" onClick={fetchUsers}>
                    <Search size={18} />
                    Search
                </button>
            </motion.div>

            {/* Role Filter Tabs (Customized for Premium Look) */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mx-8 mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none"
                    >
                        {['', 'college_admin', 'company', 'student'].map((r) => (
                            <button
                                key={r}
                                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${filters.role === r ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/20'}`}
                                onClick={() => setFilters({ ...filters, role: r, page: 1 })}
                            >
                                {r === '' ? 'ALL USERS' : r.toUpperCase().replace('_', ' ')}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Table Wrapper */}
            <div className="premium-table-container">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>User Information</th>
                            <th>Role / Assignment</th>
                            <th>Security Status</th>
                            <th>Registration</th>
                            <th>Activity</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-20">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                        <span className="text-slate-500 font-medium">Retrieving master records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user, idx) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar-small bg-slate-800 border border-white/10 shrink-0">
                                                <Mail size={14} className="text-blue-400" />
                                            </div>
                                            <div className="user-info-text">
                                                <span className="user-name">{user.email}</span>
                                                <span className="user-subtext">UID: {user._id.slice(-8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-white">
                                                {getRoleIcon(user.role)}
                                                <span>{formatRole(user.role)}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500">
                                                {user.role === 'college_admin' ? user.collegeProfile?.name : 
                                                 user.role === 'company' ? user.companyProfile?.name : 
                                                 user.role === 'student' ? `${user.studentProfile?.name?.firstName} ${user.studentProfile?.name?.lastName}` : 
                                                 'Master Access'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <span className={`status-badge-v2 ${user.isActive ? 'placed' : 'not_placed'}`}>
                                                {user.isActive ? 'Active' : 'Locked'}
                                            </span>
                                            {!user.isApproved && (
                                                <span className="status-badge-v2 pending">Pending</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-xs font-mono text-slate-400">{formatDate(user.createdAt)}</td>
                                    <td className="text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} />
                                            {formatDate(user.lastLogin)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-1 justify-end">
                                            <button className="table-action-btn" onClick={() => openResetModal(user)} title="Reset Security">
                                                <Key size={16} />
                                            </button>
                                            <button 
                                                className={`table-action-btn ${user.isActive ? 'hover:text-red-400' : 'hover:text-emerald-400'}`}
                                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                <Power size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-20 text-slate-500">
                                    No user accounts matching the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="premium-pagination">
                    <span className="text-xs text-slate-500 font-medium">
                        Page {pagination.current} of {pagination.pages}
                    </span>
                    <div className="pagination-controls">
                        <button 
                            className="page-nav-btn"
                            disabled={pagination.current === 1}
                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`page-num-btn ${pagination.current === i + 1 ? 'active' : ''}`}
                                onClick={() => setFilters({ ...filters, page: i + 1 })}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            className="page-nav-btn"
                            disabled={pagination.current === pagination.pages}
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Reset Password Modal (Styled for V2) */}
            <Modal
                isOpen={resetModal.open}
                onClose={() => setResetModal({ open: false, user: null })}
                title="Security Parameter Reset"
                size="sm"
            >
                {resetModal.user && (
                    <form onSubmit={handleResetPassword} className="p-2">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex gap-3 text-amber-500">
                            <ShieldAlert size={20} className="shrink-0" />
                            <p className="text-xs leading-relaxed">
                                This will invalidate current security credentials for <strong>{resetModal.user.email}</strong>. 
                                Make sure the user is informed before proceeding.
                            </p>
                        </div>
                        <Input
                            label="New Secure Password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Must be at least 6 characters..."
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <div className="flex gap-3 mt-8">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => setResetModal({ open: false, user: null })}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                                Re-secure
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </motion.div>
    );
};

export default Users;

