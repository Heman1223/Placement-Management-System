import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    GraduationCap, UserCheck, Briefcase, TrendingUp, 
    Plus, Upload, Users, RefreshCw, Star, Trophy, Building2,
    BarChart3, PieChart as PieChartIcon, 
    ShieldCheck, Clock, MapPin
} from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    if (authLoading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

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
        <div className="dashboard college-dashboard p-8">
            {/* Premium Header Banner */}
            <div className="premium-header mb-12">
                <div className="header-content">
                    <h1 className="college-name">{collegeName}</h1>
                    <p className="dashboard-subtitle ">Admin Dashboard <br/> 
                    Institutional Performance & Placement Analytics</p>
                </div>
                <button 
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white font-bold text-sm" 
                    onClick={handleRefresh} 
                    disabled={refreshing}
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Syncing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Quick Actions - Floating Cards */}
            <div className="quick-actions mb-12">
                {quickActions.map((action, idx) => (
                    <motion.div
                        key={action.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                    >
                        <Link to={action.path} className={`quick-action-card action-${action.color}`}>
                            <div className="action-icon">
                                <action.icon size={24} />
                            </div>
                            <span className="action-label">{action.label}</span>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Premium Statistics Grid */}
            <div className="premium-stat-grid mb-16">
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="premium-stat-icon bg-blue-500/10 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <GraduationCap size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Total Students</span>
                        <span className="stat-value">{stats?.overview?.total || 0}</span>
                    </div>
                </motion.div>
                
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="premium-stat-icon bg-emerald-500/10 text-emerald-500">
                        <UserCheck size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Active Students</span>
                        <span className="stat-value">{stats?.overview?.active || 0}</span>
                    </div>
                </motion.div>

                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="premium-stat-icon bg-purple-500/10 text-purple-500">
                        <Briefcase size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Students Placed</span>
                        <span className="stat-value">{stats?.overview?.placed || 0}</span>
                    </div>
                </motion.div>

                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="premium-stat-icon bg-amber-500/10 text-amber-500">
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Placement Rate</span>
                        <span className="stat-value">{stats?.overview?.placementRate || 0}%</span>
                    </div>
                </motion.div>
            </div>

            {/* Star Students Section */}
            {starStudents.length > 0 && (
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-10">
                        <Trophy size={20} className="text-amber-500" />
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Top Institutional Performers</h2>
                        <div className="h-px bg-white/5 flex-1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {starStudents.map((student, index) => (
                            <div key={student._id} className="performer-card group">
                                <div className="performer-rank">#{index + 1}</div>
                                <div className="performer-content">
                                    <div className="performer-avatar">
                                        <div className="avatar-ring" />
                                        <div className="avatar-inner">
                                            {student.name?.firstName?.[0]}{student.name?.lastName?.[0]}
                                        </div>
                                    </div>
                                    <div className="performer-info">
                                        <h3 className="performer-name">{student.name?.firstName} {student.name?.lastName}</h3>
                                        <div className="performer-dept">
                                            <GraduationCap size={14} />
                                            <span>{student.department}</span>
                                        </div>
                                        <div className="performer-stats">
                                            <div className="p-stat">
                                                <span className="p-stat-val">{student.cgpa}</span>
                                                <span className="p-stat-lab">CGPA</span>
                                            </div>
                                            <div className="stat-divider" />
                                            <div className="p-stat">
                                                <span className="p-stat-val text-emerald-400">Placed</span>
                                                <span className="p-stat-lab">Status</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Analytics Section */}
            <div className="analytics-section mb-16">
                <div className="flex items-center gap-4 mb-10">
                    <ShieldCheck size={20} className="text-slate-500" />
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Performance Analytics</h2>
                    <div className="h-px bg-white/5 flex-1" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Department Performance Chart */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <BarChart3 size={22} className="text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">Department Statistics</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Placement Distribution</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[320px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.departmentStats || []}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis 
                                        dataKey="_id" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '15px' }}
                                        itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: '900' }}
                                        labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '5px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="placed" fill="#10b981" name="Placed" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Placement Status Overview */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <PieChartIcon size={22} className="text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">Placement Status</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overall Distribution</p>
                                </div>
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
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {placementStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={40} 
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Detailed Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {/* CGPA Range Chart */}
                    <div className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <TrendingUp size={22} className="text-purple-500" />
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Academic Performance</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CGPA Distribution</p>
                            </div>
                        </div>
                        {stats?.cgpaRangeStats?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.cgpaRangeStats}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '15px' }} />
                                    <Bar dataKey="count" fill="#8b5cf6" name="Total" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="placed" fill="#10b981" name="Placed" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-slate-600">
                                <TrendingUp size={40} className="mb-2 opacity-50" />
                                <p className="text-sm font-medium">No academic data available</p>
                            </div>
                        )}
                    </div>

                    {/* Department List */}
                    <div className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <BarChart3 size={22} className="text-blue-500" />
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Department Breakdown</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detailed Statistics</p>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {stats?.departmentStats?.length > 0 ? (
                                stats.departmentStats.map((dept) => (
                                    <div key={dept._id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{dept._id}</h4>
                                                <div className="text-xs text-slate-400 mt-1">{dept.total} Students</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-emerald-400">{dept.placed} Placed</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{dept.total > 0 ? Math.round((dept.placed / dept.total) * 100) : 0}% Rate</div>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dept.total > 0 ? (dept.placed / dept.total) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-600 py-10">No department data available</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Batch Statistics */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Users size={20} className="text-slate-500" />
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Batch Performance</h2>
                        <div className="h-px bg-white/5 flex-1" />
                    </div>
                    {stats?.batchStats?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {stats.batchStats.map((batch) => (
                                <div key={batch._id} className="bg-[#1e293b] border border-white/5 rounded-2xl p-5 hover:border-blue-500/30 transition-all text-center group">
                                    <div className="text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">{batch._id}</div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                        <div>
                                            <div className="text-white text-sm">{batch.total}</div>
                                            <div>Total</div>
                                        </div>
                                        <div>
                                            <div className="text-emerald-400 text-sm">{batch.placed}</div>
                                            <div>Placed</div>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-white/5">
                                        <div className="text-lg font-bold text-blue-500">
                                            {batch.total > 0 ? Math.round((batch.placed / batch.total) * 100) : 0}%
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-600 uppercase">Success Rate</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-600 py-10 bg-[#1e293b] rounded-[2rem] border border-white/5">
                            <Users size={40} className="mx-auto mb-4 opacity-50" />
                            <p>No batch data available</p>
                        </div>
                    )}
                </div>
        </div>
    );
};

export default CollegeDashboard;
