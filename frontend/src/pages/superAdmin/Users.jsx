import { useState, useEffect } from 'react';
import api from '../../services/api';
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

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.role) params.append('role', filters.role);
            if (filters.search) params.append('search', filters.search);
            params.append('page', filters.page);
            params.append('limit', filters.limit);

            const response = await api.get(`/super-admin/users?${params}`);
            setUsers(response.data.data.users || response.data.data);
            setPagination(response.data.data.pagination || response.data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
            return;
        }

        try {
            await api.patch(`/super-admin/users/${userId}/toggle-status`);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update user status');
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
                                <td colSpan="7" className="empty-state">
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
        </div>
    );
};

export default Users;
