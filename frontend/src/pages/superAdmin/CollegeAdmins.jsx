import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { 
    Users, Key, Lock, Unlock, Edit2, ShieldAlert,
    Shield, CheckCircle, XCircle, Search, 
    ChevronLeft, ChevronRight, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPages.css';

const CollegeAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [editModal, setEditModal] = useState({ open: false, admin: null });
    const [resetModal, setResetModal] = useState({ open: false, admin: null });
    const [editForm, setEditForm] = useState({ email: '' });
    const [newPassword, setNewPassword] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, [pagination.current]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await superAdminAPI.getUsers({ 
                role: 'college_admin',
                page: pagination.current,
                limit: 10,
                search: searchTerm || undefined
            });
            setAdmins(response.data.data.users);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load college admins');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, current: 1 });
        fetchAdmins();
    };

    const handleToggleBlock = async (id, isActive) => {
        const action = isActive ? 'block' : 'unblock';
        if (!window.confirm(`Are you sure you want to ${action} this admin?`)) return;

        try {
            await superAdminAPI.toggleCollegeAdminBlock(id);
            toast.success(`Admin ${action}ed successfully`);
            fetchAdmins();
        } catch (error) {
            toast.error(`Failed to ${action} admin`);
        }
    };

    const openEditModal = (admin) => {
        setEditForm({ email: admin.email });
        setEditModal({ open: true, admin });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await superAdminAPI.updateCollegeAdmin(editModal.admin._id, editForm);
            toast.success('Admin updated successfully');
            setEditModal({ open: false, admin: null });
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update admin');
        }
    };

    const openResetModal = (admin) => {
        setResetModal({ open: true, admin });
        setNewPassword('');
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            await superAdminAPI.resetUserPassword(resetModal.admin._id, newPassword);
            toast.success('Password reset successfully');
            setResetModal({ open: false, admin: null });
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
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
                    <h1>Authority Controls</h1>
                    <p>Manage and audit security permissions for college administrators.</p>
                </div>
            </div>

            {/* Premium Stat Grid */}
            <div className="premium-stat-grid">
                <motion.div className="premium-stat-card" variants={itemVariants}>
                    <div className="premium-stat-icon bg-indigo-500/10 text-indigo-500">
                        <Shield size={24} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Total Admins</span>
                        <span className="stat-value">{pagination.total || 0}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" variants={itemVariants}>
                    <div className="premium-stat-icon bg-emerald-500/10 text-emerald-500">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Active</span>
                        <span className="stat-value">{admins.filter(a => a.isActive).length}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" variants={itemVariants}>
                    <div className="premium-stat-icon bg-rose-500/10 text-rose-500">
                        <Lock size={24} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Restricted</span>
                        <span className="stat-value">{admins.filter(a => !a.isActive).length}</span>
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
                            placeholder="Search admins by email address..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="premium-search-btn">
                        <Search size={18} />
                        Search
                    </button>
                </form>
            </motion.div>

            {/* Premium Table Wrapper */}
            <div className="premium-table-container">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Admin Identity</th>
                            <th>Institution</th>
                            <th>Status</th>
                            <th>Security</th>
                            <th>Onboarded</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-20">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                        <span className="text-slate-500 font-medium">Validating authority records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : admins.length > 0 ? (
                            admins.map((admin) => (
                                <tr key={admin._id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar-small bg-slate-800 border border-white/10 shrink-0">
                                                <Building2 size={14} className="text-indigo-400" />
                                            </div>
                                            <div className="user-info-text">
                                                <span className="user-name">{admin.email}</span>
                                                <span className="user-subtext">ID: {admin._id.slice(-8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-info-text">
                                            <span className="text-white font-medium">{admin.collegeProfile?.name || 'Unassigned'}</span>
                                            <span className="user-subtext">{admin.collegeProfile?.code || 'NO_CODE'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge-v2 ${admin.isActive ? 'placed' : 'not_placed'}`}>
                                            {admin.isActive ? 'Authorized' : 'Restricted'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={`verify-chip ${admin.isApproved ? 'yes' : 'no'}`}>
                                            {admin.isApproved ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {admin.isApproved ? 'Verified' : 'Pending'}
                                        </div>
                                    </td>
                                    <td className="text-xs font-mono text-slate-500">{new Date(admin.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="flex gap-1 justify-end">
                                            <button className="table-action-btn" onClick={() => openEditModal(admin)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="table-action-btn" onClick={() => openResetModal(admin)}>
                                                <Key size={16} />
                                            </button>
                                            <button 
                                                className={`table-action-btn ${admin.isActive ? 'hover:text-amber-500' : 'hover:text-emerald-500'}`}
                                                onClick={() => handleToggleBlock(admin._id, admin.isActive)}
                                            >
                                                {admin.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-20 text-slate-500">
                                    No administrative credentials found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="premium-pagination">
                    <span className="text-xs text-slate-500 font-medium">
                        Showing {admins.length} of {pagination.total} admins
                    </span>
                    <div className="pagination-controls">
                        <button 
                            className="page-nav-btn"
                            disabled={pagination.current === 1}
                            onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`page-num-btn ${pagination.current === i + 1 ? 'active' : ''}`}
                                onClick={() => setPagination({ ...pagination, current: i + 1 })}
                            >
                                {i + 1}
                            </button>
                        ))}
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

            {/* Edit Modal (Redesigned) */}
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, admin: null })}
                title="Edit Authority Profile"
                size="sm"
            >
                <form onSubmit={handleEditSubmit} className="p-2">
                    <Input
                        label="Official Email Address"
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="e.g. admin@college.edu"
                    />
                    <div className="flex gap-3 mt-8">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditModal({ open: false, admin: null })}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            Update
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal (Redesigned) */}
            <Modal
                isOpen={resetModal.open}
                onClose={() => setResetModal({ open: false, admin: null })}
                title="Credential Reset"
                size="sm"
            >
                {resetModal.admin && (
                    <form onSubmit={handleResetPassword} className="p-2">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex gap-3 text-amber-500">
                            <ShieldAlert size={20} className="shrink-0" />
                            <p className="text-xs leading-relaxed">
                                You are about to override the login credentials for <strong>{resetModal.admin.email}</strong>. 
                                This action is recorded in the system audit logs.
                            </p>
                        </div>
                        <Input
                            label="Temporary Password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Min. 6 alphanumeric characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <div className="flex gap-3 mt-8">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => setResetModal({ open: false, admin: null })}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20">
                                Reset
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </motion.div>
    );
};

export default CollegeAdmins;

