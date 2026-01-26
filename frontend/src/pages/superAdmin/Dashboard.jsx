import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import api from '../../services/api';
import { motion } from 'framer-motion';
import {
    Users, Building2, Briefcase, GraduationCap,
    TrendingUp, RefreshCw, ArrowUpRight,
    Search, Bell, MapPin, ShieldCheck, Clock
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import RecentPlacements from '../../components/common/RecentPlacements';
import './SuperAdminDashboard.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    const [recentData, setRecentData] = useState([]);
    const [recentPlacements, setRecentPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(() => fetchDashboardData(true), 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [statsRes, analyticsRes] = await Promise.all([
                superAdminAPI.getStats(),
                superAdminAPI.getAnalytics()
            ]);

            const { stats, recent } = statsRes.data.data;
            setStats(stats);
            setAnalytics(analyticsRes.data.data);

            const merged = [
                ...(recent.colleges || []).filter(c => !c.isDeleted).map(c => ({ ...c, type: 'College', date: c.createdAt })),
                ...(recent.companies || []).filter(c => !c.isDeleted).map(c => ({ ...c, type: 'Company', date: c.createdAt }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            setRecentData(merged);
            setRecentPlacements(recent.placements || []);
        } catch (error) {
            if (!silent) toast.error('Failed to load dashboard data');
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
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium">Syncing Platform Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard p-8">
            {/* Premium Header Banner */}
            <div className="premium-header-banner" style={{ marginBottom: '2rem' }}>
                <div className="premium-header-text">
                    <h1>Network Overview</h1>
                    <p>Comprehensive monitoring of university registrations and placement metrics.</p>
                </div>
                <button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white font-bold text-sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Refresh dashboard data"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Syncing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Premium Statistics Grid */}
            <div className="premium-stat-grid" style={{ marginBottom: '3rem' }}>
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="premium-stat-icon bg-blue-500/10 text-blue-500">
                        <Building2 size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Colleges</span>
                        <span className="stat-value">{stats?.colleges?.total || 0}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="premium-stat-icon bg-emerald-500/10 text-emerald-500">
                        <Briefcase size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Companies</span>
                        <span className="stat-value">{stats?.companies?.total || 0}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="premium-stat-icon bg-purple-500/10 text-purple-500">
                        <GraduationCap size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Students</span>
                        <span className="stat-value">{stats?.students?.total || 0}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="premium-stat-icon bg-amber-500/10 text-amber-500">
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Placement</span>
                        <span className="stat-value">{stats?.students?.total > 0 ? ((stats.students.placed / stats.students.total) * 100).toFixed(1) : 0}%</span>
                    </div>
                </motion.div>
            </div>

            {/* 3D Recent Placements Section */}
            <RecentPlacements 
                placements={recentPlacements} 
                title="Recent Placements (Network Wide)"
            />

            {/* Analytics Section - Charts First */}
            <div className="analytics-section mb-16">
                <div className="flex items-center gap-4 mb-10">
                    <ShieldCheck size={20} className="text-slate-500" />
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Intelligence Matrix</h2>
                    <div className="h-px bg-white/5 flex-1" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Placement Performance Chart Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <TrendingUp size={22} className="text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">Placement Velocity</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency by Academic Unit</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[320px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.placementByCollege?.slice(0, 5)}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis
                                        dataKey="collegeName"
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
                                    <Bar dataKey="placementRate" fill="url(#blueBarGradient)" radius={[10, 10, 4, 4]} barSize={40} />
                                    <defs>
                                        <linearGradient id="blueBarGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#60a5fa" />
                                            <stop offset="100%" stopColor="#2563eb" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Student Demographics Chart Card */}
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
                                    <Users size={22} className="text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">Talent Distribution</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Departmental Concentration</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics?.studentsByDepartment}
                                        dataKey="count"
                                        nameKey="_id"
                                        innerRadius={75}
                                        outerRadius={105}
                                        paddingAngle={10}
                                        stroke="none"
                                    >
                                        {analytics?.studentsByDepartment?.map((_, index) => (
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
                                        wrapperStyle={{ fontSize: '9px' }}
                                        formatter={(value) => <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Top Skills in Demand Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                    <GraduationCap size={22} className="text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">Top Skills in Demand</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Requirements</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[320px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.topSkills?.slice(0, 6) || []}>
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
                                    <Bar dataKey="count" fill="url(#purpleBarGradient)" radius={[10, 10, 4, 4]} barSize={40} />
                                    <defs>
                                        <linearGradient id="purpleBarGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#a78bfa" />
                                            <stop offset="100%" stopColor="#7c3aed" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Company Distribution Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <Briefcase size={22} className="text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">Company Distribution</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Industry Breakdown</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics?.companiesByIndustry || []}
                                        dataKey="count"
                                        nameKey="_id"
                                        innerRadius={75}
                                        outerRadius={105}
                                        paddingAngle={10}
                                        stroke="none"
                                    >
                                        {analytics?.companiesByIndustry?.map((_, index) => (
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
                                        wrapperStyle={{ fontSize: '9px' }}
                                        formatter={(value) => <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Recent Colleges and Companies Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
            >
                {/* Recent Colleges */}
                <div className="content-section bg-[#1e293b] border border-white/5 rounded-[2rem] p-10 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Building2 size={20} className="text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Recent Colleges</h2>
                        </div>
                        <button onClick={() => navigate('/admin/colleges')} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">View Directory</button>
                    </div>

                    <div className="recent-list space-y-5">
                        {recentData.filter(item => item.type === 'College').slice(0, 10).map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + idx * 0.05 }}
                                className="recent-item p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-5 cursor-pointer"
                                onClick={() => navigate(`/admin/colleges/${item._id}`)}
                            >
                                <div className="w-14 h-14 flex items-center justify-center bg-slate-900 border border-white/5 rounded-xl text-blue-400 shadow-inner">
                                    <Building2 size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[15px] font-bold text-white leading-tight mb-1">{item.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <MapPin size={12} />
                                        <span className="text-xs font-medium">{item.city || 'Remote'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${item.isVerified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                        {item.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-600 font-bold uppercase">
                                        <Clock size={10} />
                                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Companies */}
                <div className="content-section bg-[#1e293b] border border-white/5 rounded-[2rem] p-10 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Briefcase size={20} className="text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Recent Companies</h2>
                        </div>
                        <button onClick={() => navigate('/admin/companies')} className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">View Sector</button>
                    </div>

                    <div className="recent-list space-y-5">
                        {recentData.filter(item => item.type === 'Company').slice(0, 10).map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + idx * 0.05 }}
                                className="recent-item p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-5 cursor-pointer"
                                onClick={() => navigate(`/admin/companies/${item._id}`)}
                            >
                                <div className="w-14 h-14 flex items-center justify-center bg-slate-900 border border-white/5 rounded-xl text-emerald-400 shadow-inner">
                                    <Briefcase size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[15px] font-bold text-white leading-tight mb-1">{item.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <MapPin size={12} />
                                        <span className="text-xs font-medium">{item.industry || 'Professional Services'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${item.isApproved ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                        {item.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-600 font-bold uppercase">
                                        <Clock size={10} />
                                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>


        </div>
    );
};

export default SuperAdminDashboard;
