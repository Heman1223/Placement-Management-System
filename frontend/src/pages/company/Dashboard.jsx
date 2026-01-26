import { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api';
import { StatsCard } from '../../components/common/Card';
import { Briefcase, Users, Star, CheckCircle, Building2, Eye, TrendingUp, Activity, RefreshCw, ClipboardList, PieChart as PieChartIcon, Plus, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import ShiningStars from '../../components/company/ShiningStars';
import './CompanyDashboard.css';

// Premium color palette for charts
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#14b8a6', '#6366f1', '#f59e0b'];

// Custom Tooltip component for a cleaner look
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
                <p className="label font-bold text-white mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-semibold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const CompanyDashboard = () => {
    const [stats, setStats] = useState(null);
    const [charts, setCharts] = useState(null);
    const [registeredJobs, setRegisteredJobs] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [hiringFunnel, setHiringFunnel] = useState({});
    const [collegeActivity, setCollegeActivity] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [company, setCompany] = useState(null);
    const [starStudents, setStarStudents] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchCompany();
        fetchStarStudents();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchStats(true);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchCompany = async () => {
        try {
            const response = await companyAPI.getProfile();
            setCompany(response.data.data);
        } catch (error) {
            console.error('Failed to load company profile');
        }
    };

    const fetchStarStudents = async () => {
        try {
            const response = await companyAPI.getStarStudents();
            setStarStudents(response.data.data || []);
        } catch (error) {
            console.error('Failed to load star students');
        }
    };

    const fetchStats = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await companyAPI.getStats();
            const { data } = response.data;
            setStats(data.stats);
            setCharts(data.charts);
            setRegisteredJobs(data.registeredJobs || []);
            setRecentJobs(data.recentJobs || []);
            setHiringFunnel(data.hiringFunnel || {});
            setCollegeActivity(data.collegeActivity || []);
            setRecentActivity(data.recentActivity || []);
            
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
            <div className="dashboard-header-premium">
                <div className="header-title-section flex justify-between items-start">
                    <div className="title-branding">
                        <h1>{company?.name || 'Company Name'}</h1>
                        <p className="subtitle-admin">Admin Dashboard</p>
                        <div className="header-divider"></div>
                    </div>
                    
                    <div className="header-quick-nav">
                        <Link to="/company/jobs" className="quick-nav-btn btn-green">
                            <Briefcase size={16} />
                            <span>Job Drives</span>
                        </Link>
                        <Link to="/company/search" className="quick-nav-btn btn-red">
                            <Users size={16} />
                            <span>Talent Pool</span>
                        </Link>
                        <Link to="/company/partnerships" className="quick-nav-btn btn-blue">
                            <Building2 size={16} />
                            <span>Colleges</span>
                        </Link>
                        <Link to="/company/settings" className="quick-nav-btn btn-slate">
                            <Settings size={16} />
                            <span>Settings</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="summary-card">
                    <div className="sc-icon blue"><Building2 size={24} /></div>
                    <div className="sc-content">
                        <span className="sc-value">{stats?.approvedColleges || 0}</span>
                        <span className="sc-label">Approved Colleges</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="sc-icon green"><Briefcase size={24} /></div>
                    <div className="sc-content">
                        <span className="sc-value">{stats?.activeJobs || 0}</span>
                        <span className="sc-label">Active Placement Drives</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="sc-icon info"><ClipboardList size={24} /></div>
                    <div className="sc-content">
                        <span className="sc-value">{stats?.applications?.total || 0}</span>
                        <span className="sc-label">Total Applications Received</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="sc-icon warning"><Star size={24} /></div>
                    <div className="sc-content">
                        <span className="sc-value">{stats?.applications?.shortlisted || 0}</span>
                        <span className="sc-label">Shortlisted Students</span>
                    </div>
                </div>
            </div>

            {/* Shining Stars Section */}
            <ShiningStars students={starStudents} />

            {/* Main Content Sections Row 1: Drives & Activity */}
            <div className="charts-section">
                {/* Active Placement Drives */}
                <div className="chart-card">
                    <div className="section-header">
                        <h2>Active Placement Drives</h2>
                    </div>
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th className="text-left py-4">Drive Role</th>
                                    <th className="text-center py-4">Applications</th>
                                    <th className="text-right py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentJobs.filter(j => j.status === 'open').length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-8 text-slate-500">No active drives</td></tr>
                                ) : (
                                    recentJobs.filter(j => j.status === 'open').slice(0, 5).map((job) => (
                                        <tr key={job._id} className="border-b border-white/5">
                                            <td className="py-4">
                                                <div className="font-bold text-white text-sm">{job.title}</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{job.type.replace('_', ' ')}</div>
                                            </td>
                                            <td className="text-center py-4">
                                                <div className="font-bold text-blue-400 text-lg">{job.stats?.totalApplications || 0}</div>
                                            </td>
                                            <td className="text-right py-4">
                                                <Link to={`/company/jobs/${job._id}/applicants`} className="btn-small-link">View Details</Link>
                                            </td>
                                        </tr>
                                    ))
                                )                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="chart-card">
                    <div className="section-header">
                        <h2>Recent Activity</h2>
                    </div>
                    <div className="activity-feed-v2">
                        {recentActivity.length === 0 ? (
                            <p className="empty-message">No recent activity detected</p>
                        ) : (
                            recentActivity.slice(0, 5).map((activity) => (
                                <div key={activity.id} className="activity-row">
                                    <div className="a-info">
                                        <div className="a-title">
                                            <span className="a-name">{activity.student?.name?.firstName} {activity.student?.name?.lastName}</span>
                                            <span className="a-badge" style={{ color: getActivityColor(activity.type), background: `${getActivityColor(activity.type)}15` }}>
                                                {activity.type}
                                            </span>
                                        </div>
                                        <div className="a-meta">
                                            <span>{activity.job?.title}</span>
                                            <span className="a-dot">•</span>
                                            <span>{formatTimeAgo(activity.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Sections Row 2: Funnel & Engagement */}
            <div className="charts-section mt-8">
                {/* Hiring Funnel */}
                <div className="chart-card-funnel">
                    <div className="chart-header">
                        <h3>Hiring Funnel</h3>
                    </div>
                    <div className="funnel-v2">
                        <div className="funnel-line"></div>
                        {[
                            { label: 'Applied', key: 'pending', color: '#2563eb' },
                            { label: 'Shortlisted', key: 'shortlisted', color: '#1d4ed8' },
                            { label: 'Interviewed', key: 'interviewed', color: '#1e40af' },
                            { label: 'Hired', key: 'hired', color: '#1e3a8a' }
                        ].map((stage) => {
                            const count = hiringFunnel[stage.key] || 0;
                            return (
                                <div key={stage.label} className="funnel-pill-container">
                                    <div className="funnel-pill" style={{ backgroundColor: stage.color }}>
                                        <div className="p-label-group">
                                            <span className="p-label">{stage.label}</span>
                                        </div>
                                        <div className="p-count-group">
                                            <span className="p-count">{count}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* College Activity Snapshot */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>College Engagement</h3>
                    </div>
                    <div className="engagement-list-v2">
                        {collegeActivity.map((ca) => (
                            <div key={ca._id} className="engagement-row-new">
                                <div className="en-info">
                                    <div className="en-name">{ca.collegeName}</div>
                                    <div className="en-metrics">
                                        <span className="en-stat"><span className="val">{ca.applications}</span> Apps</span>
                                        <span className="en-sep">|</span>
                                        <span className="en-stat"><span className="val">{ca.shortlisted}</span> Shortlisted</span>
                                    </div>
                                </div>
                                <div className="en-rate">
                                    <div className="rate-val">{ca.applications > 0 ? Math.round((ca.selections/ca.applications)*100) : 0}%</div>
                                    <div className="rate-label">Success Rate</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="charts-section mt-8">
                {/* Job Distribution Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Registered Jobs by College</h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={registeredJobs} margin={{ top: 10, right: 30, left: 20, bottom: 50 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis 
                                    dataKey="jobName" 
                                    tick={({ x, y, payload }) => (
                                        <g transform={`translate(${x},${y})`}>
                                            <text x={0} y={0} dy={16} textAnchor="end" fill="#64748b" transform="rotate(-35)" fontSize={10} fontWeight={800}>
                                                {payload.value}
                                            </text>
                                        </g>
                                    )}
                                    interval={0}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorCount)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* College Distribution Pie Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Student Distribution by College</h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={collegeActivity}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="applications"
                                    nameKey="collegeName"
                                >
                                    {collegeActivity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        background: '#0f172a', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        padding: '10px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    align="center"
                                    wrapperStyle={{ 
                                        paddingTop: '20px', 
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase'
                                    }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <Link to="/company/jobs/new" className="floating-action-btn" title="Create New Drive">
                <Plus size={28} />
            </Link>
        </div>
    );
};

export default CompanyDashboard;
