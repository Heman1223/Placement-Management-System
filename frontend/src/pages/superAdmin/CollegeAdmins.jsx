import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../services/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { Users, Key, Lock, Unlock, Edit2, Activity } from 'lucide-react';
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

    useEffect(() => {
        fetchAdmins();
    }, [pagination.current]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await superAdminAPI.getUsers({ 
                role: 'college_admin',
                page: pagination.current,
                limit: 20
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
            header: 'Email',
            accessor: 'email'
        },
        {
            header: 'College',
            accessor: 'collegeProfile',
            render: (college) => college?.name || 'Not Assigned'
        },
        {
            header: 'Status',
            accessor: 'isActive',
            render: (isActive) => (
                <span className={`status-badge ${isActive ? 'status-success' : 'status-error'}`}>
                    {isActive ? 'Active' : 'Blocked'}
                </span>
            )
        },
        {
            header: 'Approved',
            accessor: 'isApproved',
            render: (isApproved) => (
                <span className={`status-badge ${isApproved ? 'status-success' : 'status-pending'}`}>
                    {isApproved ? 'Yes' : 'Pending'}
                </span>
            )
        },
        {
            header: 'Created',
            accessor: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (id, row) => (
                <div className="action-buttons">
                    <button
                        className="action-btn"
                        onClick={() => openEditModal(row)}
                        title="Edit Admin"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => openResetModal(row)}
                        title="Reset Password"
                    >
                        <Key size={16} />
                    </button>
                    <button
                        className={`action-btn ${row.isActive ? 'action-btn-danger' : 'action-btn-success'}`}
                        onClick={() => handleToggleBlock(id, row.isActive)}
                        title={row.isActive ? 'Block Admin' : 'Unblock Admin'}
                    >
                        {row.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>College Admins</h1>
                    <p>Manage college administrator accounts</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="stats-summary">
                <span>Total Admins: <strong>{pagination.total}</strong></span>
                <span>Active: <strong>{admins.filter(a => a.isActive).length}</strong></span>
                <span>Blocked: <strong>{admins.filter(a => !a.isActive).length}</strong></span>
            </div>

            {/* Admins Table */}
            {loading ? (
                <div className="loading-screen"><div className="loading-spinner" /></div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={admins}
                        emptyMessage="No college admins found"
                    />

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <Button
                                variant="outline"
                                disabled={pagination.current === 1}
                                onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                            >
                                Previous
                            </Button>
                            <span>Page {pagination.current} of {pagination.pages}</span>
                            <Button
                                variant="outline"
                                disabled={pagination.current === pagination.pages}
                                onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, admin: null })}
                title="Edit College Admin"
                size="sm"
            >
                <form onSubmit={handleEditSubmit} className="form">
                    <Input
                        label="Email"
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                    <div className="modal-actions">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditModal({ open: false, admin: null })}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Update Admin
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={resetModal.open}
                onClose={() => setResetModal({ open: false, admin: null })}
                title="Reset Admin Password"
                size="sm"
            >
                {resetModal.admin && (
                    <form onSubmit={handleResetPassword} className="form">
                        <p className="modal-description">
                            Reset password for <strong>{resetModal.admin.email}</strong>
                        </p>
                        <Input
                            label="New Password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Enter new password (min 6 characters)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <div className="modal-actions">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setResetModal({ open: false, admin: null })}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Reset Password
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default CollegeAdmins;
