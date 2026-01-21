import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import { StatsCard } from '../../components/common/Card';
import { GraduationCap, UserCheck, Briefcase, TrendingUp, Plus, Upload, BarChart3, Users, ArrowUpRight, Award, Sparkles, Clock, Building2, Star, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './CollegeDashboard.css';

const CollegeDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStats();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchStats(true);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchStats = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await collegeAPI.getStats();
            setStats(response.data.data);
            
            if (silent) {
                console.log('Dashboard data refreshed');
            }
        } catch (error) {
            if (!silent) {
                toast.error('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
        toast.success('Dashboard refreshed');
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    const quickActions = [
        { label: 'Add Student', icon: Plus, path: '/college/students/new', color: 'primary' },
        { label: 'Bulk Upload', icon: Upload, path: '/college/upload', color: 'success' },
        { label: 'View Students', icon: Users, path: '/college/students', color: 'warning' }
    ];

    // Prepare chart data
    const placementStatusData = stats?.placementStatusStats?.map(item => ({
        name: item._id.replace('_', ' ').toUpperCase(),
        value: item.count
    })) || [];

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

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
                <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
                    Refresh
                </Button>
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

            {/* Stats Grid - Enhanced with new metrics */}
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
                        <span className="stat-value">{stats?.overview?.active || 0}</span>
                        <span className="stat-label">Active Students</span>
                    </div>
                    <div className="stat-badge">Active</div>
                </div>
                <div className="stat-card stat-warning">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.overview?.pendingApprovals || 0}</span>
                        <span className="stat-label">Pending Approvals</span>
                    </div>
                    <div className="stat-badge warning">Pending</div>
                </div>
                <div className="stat-card stat-info">
                    <div className="stat-icon">
                        <Building2 size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.overview?.agenciesWithAccess || 0}</span>
                        <span className="stat-label">Agencies with Access</span>
                    </div>
                </div>
                <div className="stat-card stat-purple">
                    <div className="stat-icon">
                        <Star size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.overview?.shortlisted || 0}</span>
                        <span className="stat-label">Students Shortlisted</span>
                    </div>
                    <div className="stat-badge">Shortlisted</div>
                </div>
                <div className="stat-card stat-success-alt">
                    <div className="stat-icon">
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.overview?.placed || 0}</span>
                        <span className="stat-label">Students Placed</span>
                    </div>
                    <div className="stat-badge success">Success</div>
                </div>
                <div className="stat-card stat-gradient">
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
                {/* Charts Section */}
                <div className="charts-row">
                    {/* Students by Branch Chart */}
                    <div className="dashboard-section glass-card chart-card">
                        <div className="section-header">
                            <BarChart3 size={20} />
                            <h2>Students by Branch</h2>
                        </div>
                        {stats?.departmentStats?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.departmentStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="_id" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total" fill="#3b82f6" name="Total Students" />
                                    <Bar dataKey="placed" fill="#10b981" name="Placed" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <BarChart3 size={40} />
                                <p>No department data available</p>
                            </div>
                        )}
                    </div>

                    {/* Placement Status Overview Chart */}
                    <div className="dashboard-section glass-card chart-card">
                        <div className="section-header">
                            <Award size={20} />
                            <h2>Placement Status Overview</h2>
                        </div>
                        {placementStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={placementStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {placementStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <Award size={40} />
                                <p>No placement data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Students by CGPA Range Chart */}
                <div className="dashboard-section glass-card chart-card-full">
                    <div className="section-header">
                        <TrendingUp size={20} />
                        <h2>Students by CGPA Range</h2>
                    </div>
                    {stats?.cgpaRangeStats?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.cgpaRangeStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8b5cf6" name="Total Students" />
                                <Bar dataKey="placed" fill="#10b981" name="Placed" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <TrendingUp size={40} />
                            <p>No CGPA data available</p>
                        </div>
                    )}
                </div>

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
                            {stats?.overview?.placed || 0} out of {stats?.overview?.active || 0} active students have been placed.
                            {(stats?.overview?.placementRate || 0) >= 50 ? ' Great progress!' : ' Keep going!'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegeDashboard;
