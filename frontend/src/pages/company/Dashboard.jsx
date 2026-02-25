import { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api';
import { StatsCard } from '../../components/common/Card';
import { Briefcase, Users, Star, CheckCircle, Building2, Eye, TrendingUp, Activity, RefreshCw, ClipboardList, PieChart as PieChartIcon, Plus, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { PrimaryButton, PremiumCard, LoadingScreen } from '../../components/common';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import ShiningStars from '../../components/common/ShiningStars';
import './CompanyDashboard.css';

// Premium color palette for charts
const COLORS = ['#5A3E2B', '#C6A969', '#8B6F5A', '#3E2A1E', '#D7C2AE', '#2C1B12'];

// Custom Tooltip component for a cleaner look
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-cream border border-border p-4 rounded-2xl shadow-elevated">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <p className="text-sm font-black text-text">
                            {entry.name}: <span className="text-primary">{entry.value}</span>
                        </p>
                    </div>
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

    if (loading) return <LoadingScreen message="Syncing Corporate Workspace..." />;

    return (
        <div className="min-h-screen bg-cream p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-text tracking-tight uppercase">{company?.name || 'Recruiter Portal'}</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mt-2 flex items-center gap-2">
                        <Activity size={12} /> Corporate Admin Dashboard
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {[
                        { label: 'Job Drives', path: '/company/jobs', icon: Briefcase, color: 'bg-primary' },
                        { label: 'Talent Pool', path: '/company/search', icon: Users, color: 'bg-accent' },
                        { label: 'Colleges', path: '/company/partnerships', icon: Building2, color: 'bg-muted' },
                        { label: 'Settings', path: '/company/settings', icon: Settings, color: 'bg-border' }
                    ].map((nav, i) => (
                        <Link
                            key={i}
                            to={nav.path}
                            className={`${nav.color} text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-soft active:scale-95`}
                        >
                            <nav.icon size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{nav.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { val: stats?.approvedColleges || 0, lab: 'Approved Colleges', icon: Building2, color: 'bg-primary' },
                    { val: stats?.activeJobs || 0, lab: 'Active Drives', icon: Briefcase, color: 'bg-accent' },
                    { val: stats?.applications?.total || 0, lab: 'Total Applications', icon: ClipboardList, color: 'bg-muted' },
                    { val: stats?.applications?.shortlisted || 0, lab: 'Shortlisted Students', icon: Star, color: 'bg-primary' }
                ].map((stat, i) => (
                    <PremiumCard key={i} className="!p-6 flex items-center gap-5 border-none shadow-soft hover:shadow-elevated transition-all group overflow-hidden relative">
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} text-white flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 shadow-lg`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="relative z-10">
                            <span className="block text-3xl font-black text-text leading-none mb-1">{stat.val}</span>
                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted">{stat.lab}</span>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cream rounded-full -mr-16 -mt-16 opacity-40 transition-transform group-hover:scale-110" />
                    </PremiumCard>
                ))}
            </div>

            {/* Shining Stars Section */}
            <ShiningStars students={starStudents} />

            {/* Main Content Sections Row 1: Drives & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Active Placement Drives */}
                <PremiumCard className="!p-0 overflow-hidden shadow-elevated border-none">
                    <div className="p-8 border-b border-border/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-text tracking-tight uppercase">Active Drives</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Currently accepting applications</p>
                        </div>
                        <Link to="/company/jobs" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primaryDark transition-all">Full Directory</Link>
                    </div>
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/5">
                                        <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-muted">Role & Type</th>
                                        <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest text-muted">Volume</th>
                                        <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-muted">Portal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentJobs.filter(j => j.status === 'open').length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-12 text-muted font-bold italic text-sm">No active ecosystems found</td></tr>
                                    ) : (
                                        recentJobs.filter(j => j.status === 'open').slice(0, 5).map((job) => (
                                            <tr key={job._id} className="group hover:bg-cream transition-all rounded-xl">
                                                <td className="py-4 px-2">
                                                    <div className="font-black text-text text-sm group-hover:text-primary transition-all uppercase">{job.title}</div>
                                                    <div className="text-[10px] text-muted font-bold uppercase tracking-tight">{job.type.replace('_', ' ')}</div>
                                                </td>
                                                <td className="text-center py-4">
                                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border/20 font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">{job.stats?.totalApplications || 0}</div>
                                                </td>
                                                <td className="text-right py-4 px-2">
                                                    <Link to={`/company/jobs/${job._id}/applicants`} className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary hover:text-white transition-all">Details</Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </PremiumCard>

                {/* Recent Activity Feed */}
                <PremiumCard className="!p-0 overflow-hidden shadow-elevated border-none">
                    <div className="p-8 border-b border-border/10">
                        <h3 className="text-xl font-black text-text tracking-tight uppercase">Activity Stream</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Real-time engagement events</p>
                    </div>
                    <div className="p-4 space-y-2">
                        {recentActivity.length === 0 ? (
                            <div className="p-12 text-center text-muted font-bold italic text-sm">No recent activity detected</div>
                        ) : (
                            recentActivity.slice(0, 5).map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-cream transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-card border border-border/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all text-xl font-bold">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-text truncate group-hover:text-primary transition-all uppercase text-sm">{activity.student?.name?.firstName} {activity.student?.name?.lastName}</span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-primary/10 text-primary">{activity.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-tight">
                                            <span>{activity.job?.title}</span>
                                            <span className="opacity-30">•</span>
                                            <span>{formatTimeAgo(activity.timestamp)}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
                                </div>
                            ))
                        )}
                    </div>
                </PremiumCard>
            </div>

            {/* Main Content Sections Row 2: Funnel & Engagement */}
            <div className="charts-section mt-8">
                {/* Hiring Funnel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Hiring Funnel */}
                    <PremiumCard className="shadow-elevated border-none overflow-hidden !p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-text tracking-tight uppercase">Hiring Funnel</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Conversion across stages</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                                <TrendingUp size={24} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Applied', key: 'pending', color: 'bg-primary' },
                                { label: 'Shortlisted', key: 'shortlisted', color: 'bg-accent' },
                                { label: 'Interviewed', key: 'interviewed', color: 'bg-muted' },
                                { label: 'Hired', key: 'hired', color: 'bg-primaryDark' }
                            ].map((stage, idx) => {
                                const count = hiringFunnel[stage.key] || 0;
                                const total = hiringFunnel['pending'] || 1;
                                const percentage = Math.round((count / total) * 100);
                                return (
                                    <div key={stage.label} className="relative group">
                                        <div className="flex justify-between items-center mb-1 px-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text">{stage.label}</span>
                                            <span className="text-sm font-black text-primary">{count}</span>
                                        </div>
                                        <div className="h-6 w-full bg-cream rounded-xl overflow-hidden shadow-inner border border-border/10">
                                            <div
                                                className={`h-full ${stage.color} transition-all duration-1000 ease-out flex items-center justify-end px-3 shadow-lg`}
                                                style={{ width: `${Math.max(percentage, 10)}%` }}
                                            >
                                                <span className="text-[8px] font-black text-white">{percentage}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </PremiumCard>

                    {/* College Activity Snapshot */}
                    <PremiumCard className="shadow-elevated border-none overflow-hidden !p-0">
                        <div className="p-8 border-b border-border/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-text tracking-tight uppercase">College Engagement</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Institutional success rates</p>
                            </div>
                            <Link to="/company/partnerships" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primaryDark transition-all">Colleges</Link>
                        </div>
                        <div className="p-4 space-y-2">
                            {collegeActivity.slice(0, 5).map((ca) => (
                                <div key={ca._id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-cream transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-card border border-border/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-black text-text text-sm uppercase group-hover:text-primary transition-all truncate">{ca.collegeName}</div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-tight">
                                            <span>{ca.applications} Apps</span>
                                            <span className="opacity-30">|</span>
                                            <span>{ca.shortlisted} Shortlisted</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-primary leading-none">{ca.applications > 0 ? Math.round((ca.selections / ca.applications) * 100) : 0}%</div>
                                        <div className="text-[8px] font-black text-muted uppercase tracking-widest mt-1">S-Rate</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </PremiumCard>
                </div>
            </div>

            <div className="charts-section mt-8">
                {/* Job Distribution Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Job Distribution Chart */}
                    <PremiumCard className="shadow-elevated border-none overflow-hidden !p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text tracking-tight uppercase">Campus Distribution</h3>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Active drives per ecosystem</p>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={registeredJobs} margin={{ top: 10, right: 30, left: 20, bottom: 50 }}>
                                    <defs>
                                        <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#5A3E2B" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#F4EDE4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                    <XAxis
                                        dataKey="jobName"
                                        tick={({ x, y, payload }) => (
                                            <g transform={`translate(${x},${y})`}>
                                                <text x={0} y={0} dy={16} textAnchor="end" fill="#8B6F5A" transform="rotate(-35)" fontSize={9} fontWeights={900}>
                                                    {payload.value}
                                                </text>
                                            </g>
                                        )}
                                        interval={0}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis tick={{ fontSize: 10, fill: '#8B6F5A', fontWeight: 800 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#5A3E2B"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorPrimary)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </PremiumCard>

                    {/* College Distribution Pie Chart */}
                    <PremiumCard className="shadow-elevated border-none overflow-hidden !p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                                <PieChartIcon size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text tracking-tight uppercase">Talent Sourcing</h3>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Application density by institute</p>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={collegeActivity}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={8}
                                        dataKey="applications"
                                        nameKey="collegeName"
                                        stroke="none"
                                    >
                                        {collegeActivity.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="circle"
                                        wrapperStyle={{
                                            paddingTop: '20px',
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* Floating Action Button */}
            <Link to="/company/jobs/new" className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-elevated hover:bg-primaryDark transition-all active:scale-90 z-50 group">
                <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
            </Link>
        </div>
    );
};

export default CompanyDashboard;
