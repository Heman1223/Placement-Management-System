import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Key } from 'lucide-react';
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

    const getRoleBadgeClass = (role) => {
        const classes = {
            super_admin: 'badge-purple',
            college_admin: 'badge-blue',
            company: 'badge-green',
            student: 'badge-yellow'
        };
        return classes[role] || 'badge-gray';
    };

    const formatRole = (role) => {
        return role.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && users.length === 0) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p className="subtitle">Manage all platform users</p>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        className="search-input"
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                        className="filter-select"
                    >
                        <option value="">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="college_admin">College Admin</option>
                        <option value="company">Company</option>
                        <option value="student">Student</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Assignment</th>
                            <th>Status</th>
                            <th>Approved</th>
                            <th>Created</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-email">
                                            {user.email}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                            {formatRole(user.role)}
                                        </span>
                                    </td>
                                    <td>
                                        {user.role === 'college_admin' && user.collegeProfile ? (
                                            <span className="text-sm">
                                                {user.collegeProfile.name} ({user.collegeProfile.code})
                                            </span>
                                        ) : user.role === 'company' && user.companyProfile ? (
                                            <span className="text-sm">
                                                {user.companyProfile.name}
                                            </span>
                                        ) : user.role === 'student' && user.studentProfile ? (
                                            <span className="text-sm">
                                                {user.studentProfile.name?.firstName} {user.studentProfile.name?.lastName}
                                            </span>
                                        ) : (
                                            <span className="text-muted text-sm">Not Assigned</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.isApproved ? 'status-approved' : 'status-pending'}`}>
                                            {user.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                                                disabled={user.role === 'super_admin'}
                                            >
                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => openResetModal(user)}
                                                className="btn btn-sm btn-secondary"
                                                title="Reset Password"
                                            >
                                                <Key size={14} /> Reset
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        disabled={filters.page === 1}
                        className="btn btn-secondary"
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {pagination.current} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page === pagination.pages}
                        className="btn btn-secondary"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Reset Password Modal */}
            <Modal
                isOpen={resetModal.open}
                onClose={() => setResetModal({ open: false, user: null })}
                title="Reset User Password"
                size="sm"
            >
                {resetModal.user && (
                    <form onSubmit={handleResetPassword} className="form">
                        <p className="modal-description">
                            Reset password for <strong>{resetModal.user.email}</strong>
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
                                onClick={() => setResetModal({ open: false, user: null })}
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

export default Users;
