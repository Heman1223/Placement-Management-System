import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import { StatsCard } from '../../components/common/Card';
import { GraduationCap, UserCheck, Briefcase, TrendingUp, Plus, Upload, BarChart3, Users, ArrowUpRight, Award, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './CollegeDashboard.css';

const CollegeDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await collegeAPI.getStats();
            setStats(response.data.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    const quickActions = [
        { label: 'Add Student', icon: Plus, path: '/college/students/new', color: 'primary' },
        { label: 'Bulk Upload', icon: Upload, path: '/college/upload', color: 'success' },
        { label: 'View Students', icon: Users, path: '/college/students', color: 'warning' }
    ];

    return (
        <div className="dashboard college-dashboard">
            {/* Premium Header */}
            <div className="dashboard-header premium-header">
                <div className="header-content">
                    <div className="header-icon">
                        <GraduationCap size={28} />
                    </div>
                    <div className="header-text">
                        <h1>College Dashboard</h1>
                        <p>Manage your students and track placement progress</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                {quickActions.map((action) => (
                    <Link key={action.label} to={action.path} className={`quick-action-card action-${action.color}`}>
                        <div className="action-icon">
                            <action.icon size={24} />
                        </div>
                        <span className="action-label">{action.label}</span>
                        <ArrowUpRight size={16} className="action-arrow" />
                    </Link>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="stats-grid enhanced-stats">
                <div className="stat-card stat-primary">
                    <div className="stat-icon">
                        <GraduationCap size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.overview?.total || 0}</span>
                        <span className="stat-label">Total Students</span>
                    </div>
                    <div className="stat-trend">
                        <Sparkles size={14} />
                    </div>
                </div>
                <div className="stat-card stat-success">
                    <div className="stat-icon">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.overview?.verified || 0}</span>
                        <span className="stat-label">Verified</span>
                    </div>
                    <div className="stat-badge">Active</div>
                </div>
                <div className="stat-card stat-warning">
                    <div className="stat-icon">
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.overview?.placed || 0}</span>
                        <span className="stat-label">Placed</span>
                    </div>
                    <div className="stat-badge success">Success</div>
                </div>
                <div className="stat-card stat-info">
                    <div className="stat-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.overview?.placementRate || 0}%</span>
                        <span className="stat-label">Placement Rate</span>
                    </div>
                    <div className="stat-trend up">
                        <TrendingUp size={14} />
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                {/* Department Stats */}
                <div className="dashboard-section glass-card">
                    <div className="section-header">
                        <BarChart3 size={20} />
                        <h2>Department-wise Statistics</h2>
                    </div>
                    {stats?.departmentStats?.length > 0 ? (
                        <div className="dept-stats">
                            {stats.departmentStats.map((dept) => (
                                <div key={dept._id} className="dept-stat-card">
                                    <div className="dept-info">
                                        <span className="dept-name">{dept._id}</span>
                                        <span className="dept-count">{dept.total} students</span>
                                    </div>
                                    <div className="dept-progress">
                                        <div
                                            className="dept-progress-bar"
                                            style={{ width: `${dept.total > 0 ? (dept.placed / dept.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <div className="dept-footer">
                                        <span className="dept-placed">
                                            <Award size={14} />
                                            {dept.placed} placed
                                        </span>
                                        <span className="dept-rate">
                                            {dept.total > 0 ? Math.round((dept.placed / dept.total) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <BarChart3 size={40} />
                            <p>No department data available yet</p>
                            <Link to="/college/students/new">
                                <Button size="sm" icon={Plus}>Add Students</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Batch Stats */}
                <div className="dashboard-section glass-card">
                    <div className="section-header">
                        <Users size={20} />
                        <h2>Batch-wise Statistics</h2>
                    </div>
                    {stats?.batchStats?.length > 0 ? (
                        <div className="batch-stats">
                            {stats.batchStats.map((batch) => (
                                <div key={batch._id} className="batch-card">
                                    <div className="batch-year">{batch._id}</div>
                                    <div className="batch-details">
                                        <div className="batch-stat">
                                            <span className="batch-value">{batch.total}</span>
                                            <span className="batch-label">Total</span>
                                        </div>
                                        <div className="batch-stat">
                                            <span className="batch-value placed">{batch.placed}</span>
                                            <span className="batch-label">Placed</span>
                                        </div>
                                        <div className="batch-stat">
                                            <span className="batch-value rate">
                                                {batch.total > 0 ? Math.round((batch.placed / batch.total) * 100) : 0}%
                                            </span>
                                            <span className="batch-label">Rate</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Users size={40} />
                            <p>No batch data available yet</p>
                            <Link to="/college/upload">
                                <Button size="sm" icon={Upload}>Bulk Upload</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-section">
                <div className="summary-card highlight">
                    <div className="summary-icon">
                        <Award size={28} />
                    </div>
                    <div className="summary-content">
                        <h3>Placement Progress</h3>
                        <p>
                            {stats?.overview?.placed || 0} out of {stats?.overview?.verified || 0} verified students have been placed.
                            {(stats?.overview?.placementRate || 0) >= 50 ? ' Great progress!' : ' Keep going!'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegeDashboard;
