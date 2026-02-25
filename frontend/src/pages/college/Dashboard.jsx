import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    GraduationCap, UserCheck, Briefcase, TrendingUp,
    Plus, Upload, Users, RefreshCw, Star, Trophy, Building2,
    BarChart3, PieChart as PieChartIcon,
    ShieldCheck, Clock, MapPin, ChevronRight, Activity
} from 'lucide-react';
import { PrimaryButton, PremiumCard, LoadingScreen } from '../../components/common';
import toast from 'react-hot-toast';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import RecentPlacements from '../../components/common/RecentPlacements';
import './CollegeDashboard.css';

const CollegeDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [collegeProfile, setCollegeProfile] = useState(null);
    const [starStudents, setStarStudents] = useState([]);

    // Debug: Log user object to see what we have
    console.log('Dashboard - Full user object:', user);
    console.log('Dashboard - user.profile:', user?.profile);
    console.log('Dashboard - user.profile?.name:', user?.profile?.name);

    // Fetch college profile if not available in user object
    useEffect(() => {
        const loadCollegeProfile = async () => {
            if (user?.profile) {
                setCollegeProfile(user.profile);
            } else if (user?.role === 'college_admin') {
                // Fallback: fetch profile separately if not in user object
                try {
                    const response = await collegeAPI.getProfile();
                    setCollegeProfile(response.data.data);
                } catch (error) {
                    console.error('Failed to load college profile:', error);
                }
            }
        };

        if (user) {
            loadCollegeProfile();
        }
    }, [user]);

    const collegeName = collegeProfile?.name || user?.profile?.name || 'College';

    // If auth is still loading, show loading screen
    if (authLoading) return <LoadingScreen message="Authenticating Institutional Proxy..." />;

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

            // Fetch star students
            const studentsRes = await collegeAPI.getStudents({ isStarStudent: true, limit: 5 });
            setStarStudents(studentsRes.data.data.students || []);

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

    if (loading) return <LoadingScreen message="Syncing Campus Metadata..." />;

    const quickActions = [
        { label: 'Add Student', icon: Plus, path: '/college/students/new', color: 'bg-primary' },
        { label: 'Bulk Upload', icon: Upload, path: '/college/upload', color: 'bg-accent' },
        { label: 'View Students', icon: Users, path: '/college/students', color: 'bg-muted' }
    ];

    // Prepare chart data
    const placementStatusData = stats?.placementStatusStats?.map(item => ({
        name: item._id.replace('_', ' ').toUpperCase(),
        value: item.count
    })) || [];

    const COLORS = ['#5A3E2B', '#C6A969', '#8B6F5A', '#3E2A1E', '#D7C2AE', '#2C1B12'];

    return (
        <div className="min-h-screen bg-cream p-8">
            {/* Premium Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-6">
                    {collegeProfile?.logo ? (
                        <div className="w-24 h-24 rounded-3xl bg-white overflow-hidden p-4 shadow-elevated border border-border/20">
                            <img src={collegeProfile.logo} alt={collegeName} className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-3xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <Building2 size={40} />
                        </div>
                    )}
                    <div>
                        <h1 className="text-4xl font-black text-text tracking-tight uppercase">{collegeName}</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mt-2 flex items-center gap-2">
                            <Activity size={12} /> Institutional Management Hub
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <PrimaryButton
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="!rounded-xl"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Syncing...' : 'Refresh Ecosystem'}
                    </PrimaryButton>

                    <div className="flex gap-2">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                to={action.path}
                                className={`${action.color} text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-soft active:scale-95`}
                                title={action.label}
                            >
                                <action.icon size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{action.label.split(' ')[0]}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Students', value: stats?.overview?.total || 0, icon: GraduationCap, color: 'primary' },
                    { label: 'Active Roster', value: stats?.overview?.active || 0, icon: UserCheck, color: 'accent' },
                    { label: 'Corporate Hires', value: stats?.overview?.placed || 0, icon: Briefcase, color: 'muted' },
                    { label: 'Placement Rate', value: stats?.overview?.placementRate || 0, unit: '%', icon: TrendingUp, color: 'primary' }
                ].map((stat, i) => (
                    <PremiumCard key={i} className="!p-6 flex items-center gap-5 border-none shadow-soft hover:shadow-elevated transition-all group overflow-hidden relative">
                        <div className={`w-14 h-14 rounded-2xl bg-${stat.color} text-white flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 shadow-lg shadow-${stat.color}/20`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="relative z-10">
                            <span className="block text-3xl font-black text-text leading-none mb-1">{stat.value}{stat.unit}</span>
                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted">{stat.label}</span>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cream rounded-full -mr-16 -mt-16 opacity-40 transition-transform group-hover:scale-110" />
                    </PremiumCard>
                ))}
            </div>

            {/* 3D Recent Placements Section (College Specific) */}
            <RecentPlacements
                placements={stats?.recentPlacements || []}
                title={`${collegeName} Recent Placements`}
            />

            {/* Star Students Section */}
            {starStudents.length > 0 && (
                <div className="mb-16 mt-8">
                    <div className="flex items-center gap-4 mb-10 text-muted">
                        <Trophy size={20} />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Performers</h2>
                        <div className="h-px bg-border flex-1 opacity-30" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {starStudents.map((student, index) => (
                            <PremiumCard key={student._id} className="group !p-6 border-none shadow-soft hover:shadow-elevated transition-all relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black">#{index + 1}</div>
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-card border-2 border-primary/20 p-1 relative overflow-hidden">
                                        {student.profilePicture ? (
                                            <img src={student.profilePicture} alt="" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                                                {student.name?.firstName?.[0]}{student.name?.lastName?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-text group-hover:text-primary transition-all truncate uppercase">{student.name?.firstName} {student.name?.lastName}</h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-tight mt-1">
                                            <GraduationCap size={12} className="text-primary" />
                                            <span className="truncate">{student.department}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-border/10 grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-lg font-black text-text">{student.cgpa}</div>
                                        <div className="text-[8px] font-black text-muted uppercase tracking-[0.2em]">CGPA Score</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-black text-primary">PLACED</div>
                                        <div className="text-[8px] font-black text-muted uppercase tracking-[0.2em]">Elite Status</div>
                                    </div>
                                </div>
                            </PremiumCard>
                        ))}
                    </div>
                </div>
            )}

            {/* Analytics Section */}
            <div className="mb-16">
                <div className="flex items-center gap-4 mb-10 text-muted">
                    <ShieldCheck size={20} />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Intelligence Matrix</h2>
                    <div className="h-px bg-border flex-1 opacity-30" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Department Performance Chart */}
                    <PremiumCard className="shadow-elevated border-none overflow-hidden !p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text tracking-tight uppercase">Department Statistics</h3>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Placement Distribution</p>
                            </div>
                        </div>
                        <div className="h-[320px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.departmentStats || []}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                    <XAxis
                                        dataKey="_id"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#8B6F5A', fontSize: 10, fontWeight: 900 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#8B6F5A', fontSize: 10, fontWeight: 800 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ background: '#F4EDE4', border: '1px solid #D7C2AE', borderRadius: '20px', padding: '15px' }}
                                        itemStyle={{ color: '#2C1B12', fontSize: '13px', fontWeight: '900' }}
                                        labelStyle={{ color: '#8B6F5A', fontSize: '10px', marginBottom: '5px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="total" fill="url(#primaryBarGradient)" name="Total" radius={[10, 10, 4, 4]} />
                                    <Bar dataKey="placed" fill="url(#accentBarGradient)" name="Placed" radius={[10, 10, 4, 4]} />
                                    <defs>
                                        <linearGradient id="primaryBarGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#5A3E2B" />
                                            <stop offset="100%" stopColor="#3E2A1E" />
                                        </linearGradient>
                                        <linearGradient id="accentBarGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#C6A969" />
                                            <stop offset="100%" stopColor="#8B6F5A" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </PremiumCard>

                    {/* Placement Status Overview */}
                    <PremiumCard className="shadow-elevated border-none overflow-hidden !p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                                <PieChartIcon size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text tracking-tight uppercase">Placement Status</h3>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Overall Distribution</p>
                            </div>
                        </div>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={placementStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={105}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {placementStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#F4EDE4', border: '1px solid #D7C2AE', borderRadius: '20px' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={40}
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* Detailed Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {/* CGPA Range Chart */}
                <PremiumCard className="shadow-elevated border-none overflow-hidden !p-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text tracking-tight uppercase">Academic Performance</h3>
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest">CGPA Distribution</p>
                        </div>
                    </div>
                    {stats?.cgpaRangeStats?.length > 0 ? (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.cgpaRangeStats}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#8B6F5A', fontSize: 10, fontWeight: 900 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B6F5A', fontSize: 10, fontWeight: 800 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ background: '#F4EDE4', border: '1px solid #D7C2AE', borderRadius: '20px', padding: '15px' }}
                                        itemStyle={{ color: '#2C1B12', fontSize: '12px', fontWeight: '900' }}
                                    />
                                    <Bar dataKey="count" fill="url(#primaryBarGradient)" name="Total" radius={[10, 10, 4, 4]} barSize={25} />
                                    <Bar dataKey="placed" fill="url(#accentBarGradient)" name="Placed" radius={[10, 10, 4, 4]} barSize={25} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-muted">
                            <TrendingUp size={40} className="mb-4 opacity-20" />
                            <p className="text-xs font-black uppercase tracking-widest">No academic metrics found</p>
                        </div>
                    )}
                </PremiumCard>

                {/* Department List */}
                <PremiumCard className="shadow-elevated border-none overflow-hidden !p-0">
                    <div className="p-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text tracking-tight uppercase">Department Breakdown</h3>
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest">Institutional Granularity</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {stats?.departmentStats?.length > 0 ? (
                            stats.departmentStats.map((dept) => (
                                <div key={dept._id} className="p-5 rounded-3xl bg-cream border border-border/10 hover:shadow-soft transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-black text-text uppercase text-sm group-hover:text-primary transition-all">{dept._id}</h4>
                                            <div className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">{dept.total} Students Matrixed</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-md font-black text-primary">{dept.placed} Placed</div>
                                            <div className="text-[8px] font-black text-muted uppercase tracking-[0.2em]">{dept.total > 0 ? Math.round((dept.placed / dept.total) * 100) : 0}% Yield</div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-border/20 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-primary rounded-full shadow-lg transition-all duration-1000"
                                            style={{ width: `${dept.total > 0 ? (dept.placed / dept.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted py-20 font-black uppercase text-xs tracking-widest opacity-30">No departmental datasets found</div>
                        )}
                    </div>
                </PremiumCard>
            </div>

            {/* Batch Statistics */}
            <div className="mb-0">
                <div className="flex items-center gap-4 mb-10 text-muted">
                    <Users size={20} />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Batch Performance Hub</h2>
                    <div className="h-px bg-border flex-1 opacity-30" />
                </div>
                {stats?.batchStats?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {stats.batchStats.map((batch) => (
                            <PremiumCard key={batch._id} className="!p-6 border-none shadow-soft hover:shadow-elevated transition-all text-center group">
                                <div className="text-2xl font-black text-text mb-4 group-hover:text-primary transition-colors tracking-tighter">{batch._id}</div>
                                <div className="grid grid-cols-2 gap-2 mb-6 text-[9px] font-black uppercase tracking-widest text-muted">
                                    <div className="p-2 bg-cream rounded-xl border border-border/10">
                                        <div className="text-text text-sm mb-1">{batch.total}</div>
                                        <div>Matrix</div>
                                    </div>
                                    <div className="p-2 bg-primary/5 rounded-xl border border-primary/10">
                                        <div className="text-primary text-sm mb-1">{batch.placed}</div>
                                        <div>Hires</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-border/10">
                                    <div className="text-xl font-black text-primary">
                                        {batch.total > 0 ? Math.round((batch.placed / batch.total) * 100) : 0}%
                                    </div>
                                    <div className="text-[8px] font-black text-muted uppercase tracking-[0.2em] mt-1">Success Yield</div>
                                </div>
                            </PremiumCard>
                        ))}
                    </div>
                ) : (
                    <PremiumCard className="!p-20 text-center text-muted opacity-30 border-none shadow-soft">
                        <Users size={60} className="mx-auto mb-6" />
                        <p className="font-black uppercase tracking-[0.2em] text-sm">No historical batch cycles detected</p>
                    </PremiumCard>
                )}
            </div>
        </div>
    );
};

export default CollegeDashboard;
