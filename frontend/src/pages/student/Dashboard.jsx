import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
    RefreshCw, Briefcase, FileText, User, 
    Bell, Star, CheckCircle, Clock, 
    TrendingUp, Award, Zap, ChevronRight,
    MapPin, Building2, Calendar, Target
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, 
    Tooltip as RechartsTooltip, AreaChart, Area, 
    XAxis, YAxis, CartesianGrid 
} from 'recharts';
import toast from 'react-hot-toast';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#1d4ed8'];

    useEffect(() => {
        fetchDashboardData();
        
        const interval = setInterval(() => {
            fetchDashboardData(true);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [statsRes, profileRes, jobsRes] = await Promise.all([
                api.get('/student/stats'),
                api.get('/student/profile'),
                api.get('/student/jobs?limit=5')
            ]);
            setStats(statsRes.data.data);
            setProfile(profileRes.data.data);
            setRecentJobs(jobsRes.data.data);
        } catch (error) {
            if (!silent) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
        toast.success('Dashboard updated');
    };

    if (loading) {
        return <div className="loading-screen-premium"><div className="loader-ring"></div></div>;
    }

    const profileCompleteness = stats?.profileCompleteness || 0;
    
    // Prepare chart data
    const statusData = stats?.applicationsByStatus ? 
        Object.entries(stats.applicationsByStatus).map(([name, value]) => ({ 
            name: name.replace('_', ' ').toUpperCase(), 
            value 
        })) : [];

    return (
        <div className="premium-dashboard">
            {/* Glass Header */}
            <div className="glass-header">
                <div className="header-content">
                    <div className="welcome-section">
                        <h1>Welcome back, <span className="text-gradient-blue">{profile?.name?.firstName}</span>!</h1>
                        <p className="subtitle">LPU Placement Management Portal</p>
                    </div>
                    <div className="header-actions">
                        <button 
                            onClick={handleRefresh} 
                            disabled={refreshing}
                            className={`action-btn-circle ${refreshing ? 'spinning' : ''}`}
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                <div className="profile-progress-banner">
                    <div className="progress-info">
                        <span className="label">Profile Strength</span>
                        <span className="value">{profileCompleteness}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div 
                            className="progress-bar-fill" 
                            style={{ width: `${profileCompleteness}%` }}
                        ></div>
                    </div>
                    {profileCompleteness < 100 && (
                        <Link to="/student/profile" className="complete-btn">
                            Complete Profile <ChevronRight size={14} />
                        </Link>
                    )}
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="quick-actions-grid">
                {[
                    { label: 'Job Drives', path: '/student/jobs', icon: Briefcase, color: 'blue' },
                    { label: 'My Offers', path: '/student/offers', icon: Award, color: 'green' },
                    { label: 'Applications', path: '/student/applications', icon: FileText, color: 'amber' },
                    { label: 'Settings', path: '/student/profile', icon: User, color: 'slate' }
                ].map((action, i) => (
                    <button key={i} onClick={() => navigate(action.path)} className={`nav-card card-${action.color}`}>
                        <div className="nav-icon"><action.icon size={24} /></div>
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-main-grid">
                {/* Stats & Charts Section */}
                <div className="visual-section">
                    <div className="stats-row">
                        <div className="stat-glow-card">
                            <div className="icon-box blue"><Target size={20} /></div>
                            <div className="details">
                                <span className="val">{stats?.totalApplications || 0}</span>
                                <span className="lab">Applications</span>
                            </div>
                        </div>
                        <div className="stat-glow-card">
                            <div className="icon-box green"><CheckCircle size={20} /></div>
                            <div className="details">
                                <span className="val">{stats?.applicationsByStatus?.shortlisted || 0}</span>
                                <span className="lab">Shortlisted</span>
                            </div>
                        </div>
                        <div className="stat-glow-card">
                            <div className="icon-box info"><Zap size={20} /></div>
                            <div className="details">
                                <span className="val">{stats?.eligibleJobs || 0}</span>
                                <span className="lab">Eligible Jobs</span>
                            </div>
                        </div>
                    </div>

                    <div className="charts-container">
                        <div className="chart-box">
                            <h3>Application Landscape</h3>
                            <div className="h-[250px]">
                                {statusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="no-data">No application data yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Jobs & Notifications */}
                <div className="side-section">
                    <div className="section-card">
                        <div className="section-title">
                            <h3>Recommended for You</h3>
                            <Link to="/student/jobs" className="view-all">View All</Link>
                        </div>
                        <div className="jobs-list">
                            {recentJobs.length === 0 ? (
                                <div className="empty-list">No matches found</div>
                            ) : (
                                recentJobs.slice(0, 3).map((job) => (
                                    <div key={job._id} className="mini-job-card" onClick={() => navigate(`/student/jobs/${job._id}`)}>
                                        <div className="comp-logo-mini">
                                            {job.company?.logo ? <img src={job.company.logo} alt="" /> : <Building2 size={16} />}
                                        </div>
                                        <div className="job-info-mini">
                                            <h4>{job.title}</h4>
                                            <p>{job.company?.name}</p>
                                        </div>
                                        <ChevronRight size={16} className="arrow" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-title">
                            <h3>Important Alerts</h3>
                            <Link to="/student/notifications" className="view-all">See All</Link>
                        </div>
                        <div className="alerts-list">
                           <div className="alert-item">
                                <div className="dot blue"></div>
                                <div className="alert-content">
                                    <p>Welcome to your <strong>Redesigned Dashboard</strong>!</p>
                                    <span>Just now</span>
                                </div>
                           </div>
                           {!profile?.isVerified && (
                               <div className="alert-item">
                                    <div className="dot amber"></div>
                                    <div className="alert-content">
                                        <p>Verification pending from college admin</p>
                                        <span>Action Required</span>
                                    </div>
                               </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
