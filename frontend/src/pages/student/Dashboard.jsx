import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
    RefreshCw, Briefcase, FileText, User,
    Bell, Star, CheckCircle, Clock,
    TrendingUp, Award, Zap, ChevronRight,
    MapPin, Building2, Calendar, Target, Activity
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    Tooltip as RechartsTooltip, PieChart as PieChartIcon,
    XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import { PrimaryButton, PremiumCard } from '../../components/common';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const COLORS = ['#5A3E2B', '#C6A969', '#8B6F5A', '#3E2A1E', '#D7C2AE', '#2C1B12'];

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

    if (loading) return <LoadingScreen message="Syncing Personalized Career Matrix..." />;

    const profileCompleteness = stats?.profileCompleteness || 0;

    // Prepare chart data
    const statusData = stats?.applicationsByStatus ?
        Object.entries(stats.applicationsByStatus).map(([name, value]) => ({
            name: name.replace('_', ' ').toUpperCase(),
            value
        })) : [];

    return (
        <div className="min-h-screen bg-cream p-8">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <User size={36} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-text tracking-tight uppercase">Welcome back, <span className="text-primary">{profile?.name?.firstName}</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted mt-2 flex items-center gap-2">
                            <Activity size={12} className="text-primary" /> Career Progression Hub
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="!rounded-xl"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Syncing...' : 'Sync Dashboard'}
                    </PrimaryButton>
                </div>
            </div>

            {/* Profile Strength Banner */}
            <PremiumCard className="mb-12 !p-8 border-none bg-primary text-white shadow-elevated relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex-1">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-cream/70">Profile Strength Index</span>
                            <span className="text-3xl font-black text-cream">{profileCompleteness}%</span>
                        </div>
                        <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(198,169,105,0.6)]"
                                style={{ width: `${profileCompleteness}%` }}
                            />
                        </div>
                    </div>
                    {profileCompleteness < 100 && (
                        <Link to="/student/profile" className="flex items-center gap-3 bg-cream text-primary px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all active:scale-95 whitespace-nowrap shadow-lg">
                            Optimize Profile <ChevronRight size={18} />
                        </Link>
                    )}
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full -ml-24 -mb-24 blur-2xl" />
            </PremiumCard>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Total Applications', value: stats?.totalApplications || 0, icon: Target, color: 'primary' },
                    { label: 'Shortlisted Status', value: stats?.applicationsByStatus?.shortlisted || 0, icon: CheckCircle, color: 'accent' },
                    { label: 'Eligible Vacancies', value: stats?.eligibleJobs || 0, icon: Zap, color: 'muted' }
                ].map((stat, i) => (
                    <PremiumCard key={i} className="!p-6 flex items-center gap-5 border-none shadow-soft hover:shadow-elevated transition-all group overflow-hidden relative">
                        <div className={`w-14 h-14 rounded-2xl bg-${stat.color} text-white flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 shadow-lg shadow-${stat.color}/20`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="relative z-10">
                            <span className="block text-3xl font-black text-text leading-none mb-1">{stat.value}</span>
                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted">{stat.label}</span>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cream rounded-full -mr-16 -mt-16 opacity-40 transition-transform group-hover:scale-110" />
                    </PremiumCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Left: Applications Chart */}
                <div className="lg:col-span-2">
                    <PremiumCard className="h-full shadow-elevated border-none overflow-hidden !p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <PieChartIcon size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text tracking-tight uppercase">Application Landscape</h3>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Success Metrics Distribution</p>
                            </div>
                        </div>

                        <div className="h-[300px] relative">
                            {statusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={105}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ background: '#F4EDE4', border: '1px solid #D7C2AE', borderRadius: '20px', padding: '15px' }}
                                            itemStyle={{ color: '#2C1B12', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted gap-4 opacity-40">
                                    <Target size={48} />
                                    <p className="font-black uppercase tracking-widest text-xs">No application metrics recorded</p>
                                </div>
                            )}
                        </div>
                    </PremiumCard>
                </div>

                {/* Right: Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    {[
                        { label: 'Explore Jobs', path: '/student/jobs', icon: Briefcase, color: 'bg-primary' },
                        { label: 'My Offers', path: '/student/offers', icon: Award, color: 'bg-accent' },
                        { label: 'Track Apps', path: '/student/applications', icon: FileText, color: 'bg-muted' },
                        { label: 'Profile Settings', path: '/student/profile', icon: User, color: 'bg-card' }
                    ].map((action, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(action.path)}
                            className="flex flex-col items-center justify-center gap-4 bg-white border border-border/10 p-6 rounded-[2.5rem] shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${action.color === 'bg-card' ? 'bg-card text-primary' : action.color + ' text-white'} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                                <action.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recommended Jobs */}
                <div className="lg:col-span-2">
                    <PremiumCard className="overflow-hidden !p-0 shadow-elevated border-none h-full">
                        <div className="p-10 border-b border-border/10 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-text tracking-tight uppercase">Curated Opportunities</h3>
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">Matched precisely to your profile</p>
                                </div>
                            </div>
                            <Link to="/student/jobs" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:tracking-[0.4em] transition-all">Explore All</Link>
                        </div>
                        <div className="p-6 space-y-4">
                            {recentJobs.length === 0 ? (
                                <div className="p-20 text-center text-muted font-black uppercase text-xs tracking-widest opacity-30">No matching placements detected</div>
                            ) : (
                                recentJobs.slice(0, 4).map((job) => (
                                    <div
                                        key={job._id}
                                        className="flex items-center gap-6 p-6 rounded-3xl bg-cream border border-border/10 hover:shadow-soft transition-all cursor-pointer group"
                                        onClick={() => navigate(`/student/jobs/${job._id}`)}
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-white border border-border/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm overflow-hidden p-2">
                                            {job.company?.logo ? <img src={job.company.logo} alt="" className="w-full h-full object-contain" /> : <Building2 size={28} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-black text-text truncate group-hover:text-primary transition-all uppercase">{job.title}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-muted uppercase tracking-widest">{job.company?.name}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1"><MapPin size={10} /> {job.location || 'Pan India'}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))
                            )}
                        </div>
                    </PremiumCard>
                </div>

                {/* Intelligence Alerts */}
                <PremiumCard className="!p-0 overflow-hidden shadow-elevated border-none h-full">
                    <div className="p-10 border-b border-border/10 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text tracking-tight uppercase">System Alerts</h3>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Real-time ecosystem updates</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-4 p-5 rounded-3xl bg-primary/5 border border-primary/10 hover:shadow-soft transition-all group">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shadow-[0_0_10px_rgba(90,62,43,0.5)]" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-text leading-snug">The premium <strong className="font-black text-primary">Brown-Cream Experience</strong> is now live!</p>
                                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted mt-2 block">System Notification</span>
                            </div>
                        </div>

                        {!profile?.isVerified && (
                            <div className="flex items-start gap-4 p-5 rounded-3xl bg-accent/5 border border-accent/10 hover:shadow-soft transition-all group">
                                <div className="w-2.5 h-2.5 rounded-full bg-accent mt-1.5 shadow-[0_0_10px_rgba(198,169,105,0.5)]" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-text leading-snug">Verification pending from college admin</p>
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-accent mt-2 block italic">Urgent Action Required</span>
                                </div>
                            </div>
                        )}

                        <div className="p-8 text-center bg-cream/50 rounded-3xl border border-dashed border-border/40 mt-6">
                            <Calendar size={32} className="mx-auto text-muted mb-4 opacity-50" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted">Up-to-date with institutional cycle</p>
                        </div>
                    </div>
                </PremiumCard>
            </div>
        </div>
    );
};

export default StudentDashboard;
