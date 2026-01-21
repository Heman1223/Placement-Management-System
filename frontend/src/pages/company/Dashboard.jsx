import { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api';
import { StatsCard } from '../../components/common/Card';
import { Briefcase, Users, Star, CheckCircle, Building2, Eye, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './CompanyDashboard.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const CompanyDashboard = () => {
    const [stats, setStats] = useState(null);
    const [charts, setCharts] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
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
            const response = await companyAPI.getStats();
            setStats(response.data.data.stats);
            setCharts(response.data.data.charts);
            setRecentActivity(response.data.data.recentActivity || []);
            setRecentJobs(response.data.data.recentJobs || []);
            
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

    const getActivityIcon = (type) => {
        switch (type) {
            case 'shortlisted': return '⭐';
            case 'interviewed': return '💼';
            case 'offered': return '🎉';
            case 'hired': return '✅';
            case 'rejected': return '❌';
            default: return '📝';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'shortlisted': return 'var(--warning-600)';
            case 'interviewed': return 'var(--info-600)';
            case 'offered': return 'var(--primary-600)';
            case 'hired': return 'var(--success-600)';
            case 'rejected': return 'var(--gray-500)';
            default: return 'var(--gray-600)';
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Company Dashboard</h1>
                    <p>Manage jobs and find talent</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <Button 
                        variant="outline" 
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
                        Refresh
                    </Button>
                    <Link to="/company/jobs/new">
                        <Button icon={Briefcase}>Post New Job</Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatsCard
                    title="Approved Colleges"
                    value={stats?.approvedColleges || 0}
                    icon={Building2}
                    color="primary"
                />
                <StatsCard
                    title="Students Viewed"
                    value={stats?.studentsViewed || 0}
                    icon={Eye}
                    color="info"
                />
                <StatsCard
                    title="Total Shortlisted"
                    value={stats?.totalShortlisted || 0}
                    icon={Star}
                    color="warning"
                />
                <StatsCard
                    title="Active Jobs"
                    value={stats?.activeJobs || 0}
                    icon={TrendingUp}
                    color="success"
                />
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                {/* Shortlists by College */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Shortlists by College</h3>
                    </div>
                    {charts?.shortlistsByCollege?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={charts.shortlistsByCollege}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-chart">No shortlist data available</div>
                    )}
                </div>

                {/* Shortlists by Branch */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Shortlists by Branch</h3>
                    </div>
                    {charts?.shortlistsByBranch?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={charts.shortlistsByBranch}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {charts.shortlistsByBranch.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-chart">No branch data available</div>
                    )}
                </div>

                {/* Skills Distribution */}
                <div className="chart-card chart-card-full">
                    <div className="chart-header">
                        <h3>Top Skills in Shortlisted Candidates</h3>
                    </div>
                    {charts?.skillsDistribution?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={charts.skillsDistribution} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={120}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip />
                                <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-chart">No skills data available</div>
                    )}
                </div>
            </div>

            <div className="dashboard-sections">
                {/* Recent Activity Timeline */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2><Activity size={18} /> Recent Activity</h2>
                    </div>

                    <div className="activity-timeline">
                        {recentActivity.length === 0 ? (
                            <p className="empty-message">No recent activity</p>
                        ) : (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <div 
                                        className="activity-icon"
                                        style={{ background: `${getActivityColor(activity.type)}20`, color: getActivityColor(activity.type) }}
                                    >
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-text">
                                            <strong>{activity.student?.name?.firstName} {activity.student?.name?.lastName}</strong>
                                            {' '}was <span className="activity-status">{activity.type}</span>
                                            {' '}for <strong>{activity.job?.title}</strong>
                                        </div>
                                        <div className="activity-meta">
                                            {activity.student?.department} • {formatTimeAgo(activity.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Jobs */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Recent Jobs</h2>
                        <Link to="/company/jobs">View All</Link>
                    </div>

                    <div className="jobs-list">
                        {recentJobs.length === 0 ? (
                            <p className="empty-message">No jobs posted yet</p>
                        ) : (
                            recentJobs.map((job) => (
                                <div key={job._id} className="job-card">
                                    <div className="job-info">
                                        <h3>{job.title}</h3>
                                        <span className={`job-type job-type-${job.type}`}>{job.type}</span>
                                    </div>
                                    <div className="job-stats">
                                        <span>{job.stats?.totalApplications || 0} applications</span>
                                        <span className={`job-status job-status-${job.status}`}>
                                            {job.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <Link to="/company/search" className="quick-action">
                            <Users size={24} />
                            <span>Search Talent</span>
                        </Link>
                        <Link to="/company/shortlist" className="quick-action">
                            <Star size={24} />
                            <span>View Shortlist</span>
                        </Link>
                        <Link to="/company/jobs/new" className="quick-action">
                            <Briefcase size={24} />
                            <span>Post Job</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;
