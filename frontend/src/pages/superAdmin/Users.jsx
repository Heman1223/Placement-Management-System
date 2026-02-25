import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import {
    Key, Users as UsersIcon, Shield, Briefcase,
    GraduationCap, Search, Mail, Calendar,
    MoreVertical, Power, UserCheck, ShieldAlert,
    Clock, ShieldCheck, ChevronLeft, ChevronRight,
    ArrowUpRight, Lock, Unlock, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
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
            setUsers(response.data.data.users || response.data.data.results || response.data.data);
            setPagination(response.data.data.pagination || response.data.pagination || {});
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

    const formatRole = (role) => {
        return role?.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const columns = [
        {
            header: 'Identity Registry',
            accessor: 'email',
            render: (email, user) => (
                <div className="entity-cell">
                    <div className="entity-icon">
                        <UsersIcon size={16} />
                    </div>
                    <div>
                        <div className="entity-name uppercase">{email}</div>
                        <div className="entity-meta uppercase tracking-widest">{formatRole(user.role)}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Authorization Status',
            accessor: 'isActive',
            render: (isActive) => (
                <span className={`status-badge ${isActive ? 'status-success' : 'status-pending'}`}>
                    {isActive ? 'Authorized' : 'Restricted'}
                </span>
            )
        },
        {
            header: 'Network Assignment',
            accessor: 'role',
            render: (role, user) => {
                const name = role === 'college_admin' ? user.collegeProfile?.name :
                    role === 'company' ? user.companyProfile?.name :
                        role === 'student' ? `${user.studentProfile?.name?.firstName} ${user.studentProfile?.name?.lastName}` :
                            'Master Architecture';
                return <span className="text-[10px] font-bold text-[#4a2c15] uppercase tracking-wider">{name || 'N/A'}</span>;
            }
        },
        {
            header: 'Onboarding Date',
            accessor: 'createdAt',
            render: (date) => <span className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">{formatDate(date)}</span>
        },
        {
            header: 'Security Controls',
            accessor: '_id',
            render: (_, user) => (
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => openResetModal(user)}
                        className="w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#faf6ef] transition-colors"
                        title="Override Access Key"
                    >
                        <Key size={14} />
                    </button>
                    <button
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        className={`w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center transition-colors ${user.isActive ? 'text-[#b42318] hover:bg-[#fdeaea]' : 'text-[#1e7d4d] hover:bg-[#e6f4ea]'}`}
                        title={user.isActive ? 'Restrict Access' : 'Authorize Node'}
                    >
                        {user.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="admin-page">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-1">Access Management</h1>
                    <p className="text-xs text-[#8b6f5a] font-medium uppercase tracking-widest leading-none">Global Authorization Matrix</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f5a]" />
                        <input
                            type="text"
                            placeholder="SEARCH IDENTITY..."
                            className="admin-search-input-hardened theme-input pl-10 pr-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all w-64"
                            style={{ backgroundColor: '#ffffff' }}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        />
                    </div>
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                        className="admin-form-input-hardened theme-input px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#4a2c15]"
                        style={{ backgroundColor: '#ffffff' }}
                    >
                        <option value="">Full Tier Access</option>
                        <option value="super_admin">Central Admin</option>
                        <option value="college_admin">Institutional</option>
                        <option value="company">Corporate Entity</option>
                        <option value="student">Academic Talent</option>
                    </select>
                </div>
            </div>

            <div className="table-container shadow-sm mt-6">
                <Table
                    columns={columns}
                    data={users}
                    loading={loading}
                />
            </div>

            {pagination?.pages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={pagination.current}
                        pages={pagination.pages}
                        onPageChange={(page) => setFilters({ ...filters, page })}
                    />
                </div>
            )}

            <Modal
                isOpen={resetModal.open}
                onClose={() => setResetModal({ open: false, user: null })}
                title="Protocol Security Override"
            >
                {resetModal.user && (
                    <form onSubmit={handleResetPassword} className="p-6">
                        <div className="mb-6 p-4 bg-[#fffbeb] rounded-lg border border-[#fef3c7]">
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldAlert size={18} className="text-[#b45309]" />
                                <h4 className="font-bold text-[#b45309] uppercase text-[11px]">System Security Directive</h4>
                            </div>
                            <p className="text-[10px] text-[#92400e] font-medium uppercase tracking-tight">Executing master key reset for node: <span className="text-[#6b3f1d]">{resetModal.user.email}</span>.</p>
                        </div>

                        <div className="space-y-2 mb-8">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">New Authorization Key</label>
                            <Input
                                type="password"
                                required
                                minLength={6}
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                placeholder="ENTER SECURE KEY..."
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 !border-[#e6d8c3]"
                                onClick={() => setResetModal({ open: false, user: null })}
                            >
                                <span className="text-[11px] font-bold uppercase tracking-wider">Abort Protocol</span>
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1 !bg-[#6b3f1d]">
                                <span className="text-[11px] font-bold uppercase tracking-wider">Execute Reset</span>
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Users;
