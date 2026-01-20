import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminPages.css';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        targetModel: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 50
    });
    const [pagination, setPagination] = useState({});
    const [activeTab, setActiveTab] = useState('logs'); // logs, stats

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
        } else {
            fetchStats();
        }
    }, [filters, activeTab]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.action) params.append('action', filters.action);
            if (filters.targetModel) params.append('targetModel', filters.targetModel);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            params.append('page', filters.page);
            params.append('limit', filters.limit);

            const response = await api.get(`/activity-logs?${params}`);
            setLogs(response.data.data.logs);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/activity-logs/stats?${params}`);
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.action) params.append('action', filters.action);
            if (filters.targetModel) params.append('targetModel', filters.targetModel);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/activity-logs/export?${params}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `activity_logs_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to export logs');
        }
    };

    const getActionIcon = (action) => {
        const icons = {
            view_student: '👁️',
            download_student_data: '⬇️',
            shortlist_student: '⭐',
            approve_college: '✅',
            approve_company: '✅',
            bulk_upload: '📤',
            export_data: '📊',
            update_student: '✏️',
            delete_student: '🗑️',
            post_job: '💼',
            update_job: '✏️',
            view_resume: '📄'
        };
        return icons[action] || '📝';
    };

    const formatAction = (action) => {
        return action.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const actionOptions = [
        'view_student',
        'download_student_data',
        'shortlist_student',
        'approve_college',
        'approve_company',
        'bulk_upload',
        'export_data',
        'update_student',
        'delete_student',
        'post_job',
        'update_job',
        'view_resume'
    ];

    const targetModelOptions = ['Student', 'College', 'Company', 'Job', 'Application'];

    if (loading && logs.length === 0 && !stats) {
        return <div className="loading">Loading activity logs...</div>;
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Activity Logs</h1>
                    <p className="subtitle">Monitor all platform activities</p>
                </div>
                <button onClick={handleExport} className="btn btn-primary">
                    Export to CSV
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Activity Logs
                </button>
                <button
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Statistics
                </button>
            </div>

            {activeTab === 'logs' ? (
                <>
                    {/* Filters */}
                    <div className="filters-section">
                        <div className="filter-group">
                            <label>Action</label>
                            <select
                                value={filters.action}
                                onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
                                className="filter-select"
                            >
                                <option value="">All Actions</option>
                                {actionOptions.map(action => (
                                    <option key={action} value={action}>
                                        {formatAction(action)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Target</label>
                            <select
                                value={filters.targetModel}
                                onChange={(e) => setFilters({ ...filters, targetModel: e.target.value, page: 1 })}
                                className="filter-select"
                            >
                                <option value="">All Targets</option>
                                {targetModelOptions.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                                className="filter-select"
                            />
                        </div>
                        <div className="filter-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                                className="filter-select"
                            />
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Target</th>
                                    <th>Date & Time</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="empty-state">
                                            No activity logs found
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id}>
                                            <td>
                                                <div className="action-cell">
                                                    <span className="action-icon">{getActionIcon(log.action)}</span>
                                                    <span>{formatAction(log.action)}</span>
                                                </div>
                                            </td>
                                            <td>{log.user?.email || 'Unknown'}</td>
                                            <td>
                                                <span className={`badge badge-${log.user?.role}`}>
                                                    {log.user?.role?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>{log.targetModel || '-'}</td>
                                            <td>{formatDate(log.createdAt)}</td>
                                            <td className="ip-address">{log.ipAddress || '-'}</td>
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
                </>
            ) : (
                /* Statistics Tab */
                <div className="stats-container">
                    {stats && (
                        <>
                            {/* Total Logs */}
                            <div className="stat-card">
                                <h3>Total Activities</h3>
                                <div className="stat-value">{stats.totalLogs}</div>
                            </div>

                            {/* Action Stats */}
                            <div className="stats-section">
                                <h3>Activities by Action</h3>
                                <div className="stats-grid">
                                    {stats.actionStats?.map((stat) => (
                                        <div key={stat._id} className="stat-item">
                                            <span className="stat-icon">{getActionIcon(stat._id)}</span>
                                            <div className="stat-info">
                                                <span className="stat-label">{formatAction(stat._id)}</span>
                                                <span className="stat-count">{stat.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Users */}
                            <div className="stats-section">
                                <h3>Most Active Users</h3>
                                <div className="stats-list">
                                    {stats.userStats?.map((stat, index) => (
                                        <div key={index} className="stat-item">
                                            <div className="stat-rank">{index + 1}</div>
                                            <div className="stat-info">
                                                <span className="stat-label">{stat._id?.email || 'Unknown'}</span>
                                                <span className="stat-sublabel">{stat._id?.role?.replace('_', ' ')}</span>
                                            </div>
                                            <span className="stat-count">{stat.count} activities</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Timeline */}
                            {stats.timeline && stats.timeline.length > 0 && (
                                <div className="stats-section">
                                    <h3>Activity Timeline (Last 7 Days)</h3>
                                    <div className="timeline-chart">
                                        {stats.timeline.map((day) => (
                                            <div key={day._id} className="timeline-bar">
                                                <div
                                                    className="timeline-bar-fill"
                                                    style={{
                                                        height: `${(day.count / Math.max(...stats.timeline.map(d => d.count))) * 100}%`
                                                    }}
                                                />
                                                <span className="timeline-label">{new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                <span className="timeline-count">{day.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityLogs;
