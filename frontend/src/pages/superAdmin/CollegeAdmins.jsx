import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import {
    Users, Key, Lock, Unlock, Edit2, ShieldAlert,
    Shield, CheckCircle, XCircle, Search,
    ChevronLeft, ChevronRight, Building2,
    ShieldCheck, Activity, GraduationCap, Settings,
    Mail, Clock, Trash2, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
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
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        fetchAdmins(1);
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-dropdown-wrapper')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchAdmins = async (page = 1) => {
        try {
            setLoading(true);
            const response = await superAdminAPI.getUsers({
                role: 'college_admin',
                page,
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

    const columns = [
        {
            header: 'Authority Node',
            accessor: 'email',
            render: (email, admin) => (
                <div className="entity-cell">
                    <div className="entity-icon">
                        <Building2 size={16} />
                    </div>
                    <div>
                        <div className="entity-name uppercase">{email}</div>
                        <div className="entity-meta uppercase tracking-widest leading-none mt-1">
                            Commissioned {new Date(admin.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Institutional Mapping',
            accessor: 'collegeProfile.name',
            render: (collegeName) => (
                <div className="text-[10px] font-bold text-[#4a2c15] uppercase flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-[#6b3f1d]" /> {collegeName || 'Awaiting Sync'}
                </div>
            )
        },
        {
            header: 'Access Level',
            accessor: 'isActive',
            render: (isActive, admin) => (
                <div className="flex flex-col gap-1.5">
                    <span className={`status-badge ${isActive ? 'status-success' : 'status-pending'}`}>
                        {isActive ? 'Authorized' : 'Restricted'}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ml-1 ${admin.isApproved ? 'text-[#1e7d4d]' : 'text-[#b45309]'}`}>
                        {admin.isApproved ? 'Identity Verified' : 'Compliance Pending'}
                    </span>
                </div>
            )
        },
        {
            header: 'Command',
            accessor: '_id',
            render: (_, admin) => (
                <div className="flex gap-2 justify-end action-dropdown-wrapper">
                    <button
                        onClick={() => openEditModal(admin)}
                        className="w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#faf6ef] transition-colors"
                        title="Edit Signature"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        className="w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#faf6ef] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === admin._id ? null : admin._id);
                        }}
                    >
                        <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                        {openDropdown === admin._id && (
                            <motion.div
                                className="absolute right-0 mt-8 w-48 bg-white rounded-xl shadow-lg border border-[#e6d8c3] z-50 overflow-hidden"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="p-1">
                                    <button
                                        onClick={() => { openResetModal(admin); setOpenDropdown(null); }}
                                        className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#6b3f1d] hover:bg-[#faf6ef] rounded-lg mb-1 flex items-center gap-2"
                                    >
                                        <Key size={14} /> Reset Credentials
                                    </button>
                                    <button
                                        onClick={() => { handleToggleBlock(admin._id, admin.isActive); setOpenDropdown(null); }}
                                        className={`w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase rounded-lg flex items-center gap-2 ${admin.isActive ? 'text-[#b42318] hover:bg-[#fdeaea]' : 'text-[#1e7d4d] hover:bg-[#e6f4ea]'}`}
                                    >
                                        {admin.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                                        {admin.isActive ? 'Restrict Access' : 'Restore Authorization'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )
        }
    ];

    return (
        <div className="admin-page">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-1">Administrative Hierarchy</h1>
                    <p className="text-xs text-[#8b6f5a] font-medium uppercase tracking-widest leading-none">Global Institutional Authority Registry</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f5a]" />
                        <input
                            type="text"
                            placeholder="IDENTIFY ADMIN..."
                            className="admin-search-input-hardened theme-input pl-10 pr-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all"
                            style={{ backgroundColor: '#ffffff' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container shadow-sm">
                <Table
                    columns={columns}
                    data={admins}
                    loading={loading}
                />
            </div>

            {!loading && pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={pagination.current}
                        pages={pagination.pages}
                        onPageChange={(page) => fetchAdmins(page)}
                    />
                </div>
            )}

            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, admin: null })}
                title="Authorization Signature Override"
            >
                <form onSubmit={handleEditSubmit} className="p-6">
                    <div className="mb-8 space-y-2">
                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Official Authentication Email</label>
                        <Input
                            type="email"
                            required
                            className="admin-form-input-hardened theme-input"
                            style={{ backgroundColor: '#ffffff' }}
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            placeholder="ADMIN@INSTITUTION.EDU"
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 !border-[#e6d8c3]"
                            onClick={() => setEditModal({ open: false, admin: null })}
                        >
                            <span className="text-[11px] font-bold uppercase tracking-wider">Abort</span>
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1 !bg-[#6b3f1d]">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Synchronize Changes</span>
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={resetModal.open}
                onClose={() => setResetModal({ open: false, admin: null })}
                title="Credential Force Reset"
            >
                {resetModal.admin && (
                    <form onSubmit={handleResetPassword} className="p-6">
                        <div className="mb-6 p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3] flex gap-3">
                            <ShieldAlert size={20} className="text-[#c6a85e] shrink-0" />
                            <p className="text-[10px] font-bold text-[#8b6f5a] uppercase leading-relaxed tracking-wider">
                                Executing mandatory security override for authority node: <strong>{resetModal.admin.email}</strong>.
                                Current active sessions will be terminated.
                            </p>
                        </div>

                        <div className="space-y-2 mb-8">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">New Symmetric Access Key</label>
                            <Input
                                type="password"
                                required
                                minLength={6}
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                placeholder="MIN. 6 CHARACTERS..."
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 !border-[#e6d8c3]"
                                onClick={() => setResetModal({ open: false, admin: null })}
                            >
                                <span className="text-[11px] font-bold uppercase tracking-wider">Abort Protocol</span>
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1 !bg-[#6b3f1d]">
                                <span className="text-[11px] font-bold uppercase tracking-wider">Execute Override</span>
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default CollegeAdmins;
