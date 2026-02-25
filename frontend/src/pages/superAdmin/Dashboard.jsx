import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import { motion } from 'framer-motion';
import {
    Users, Building2, Briefcase, GraduationCap,
    TrendingUp, RefreshCw, ArrowUpRight,
    Search, Bell, MapPin, ShieldCheck, Clock, Activity
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, XAxis, YAxis, LineChart, Line,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import './AdminPages.css';

const COLORS = ['#6b3f1d', '#c6a85e', '#8b6f5a', '#4a2c15', '#e6d8c3', '#d1c1a9'];

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [recentData, setRecentData] = useState([]);
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-2 border-[#e6d8c3] border-t-[#6b3f1d] rounded-full animate-spin"></div>
            <p className="mt-4 text-[#8b6f5a] text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing Intelligence...</p>
        </div>
    );

    return (
        <div className="admin-page">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-1">Central Intelligence</h1>
                    <p className="text-xs text-[#8b6f5a] font-medium uppercase tracking-widest">Platform Operational Nexus</p>
                </div>
                <Button
                    variant="outline"
                    className="!rounded-lg !border-[#e6d8c3] !text-[#6b3f1d] hover:!bg-[#faf6ef] transition-all"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw size={16} className={`${refreshing ? 'animate-spin' : ''} mr-2`} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{refreshing ? 'Syncing' : 'Sync Matrix'}</span>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Academic Nodes', value: stats?.colleges?.total || 0, icon: Building2 },
                    { label: 'Corporate Partners', value: stats?.companies?.total || 0, icon: Briefcase },
                    { label: 'Global Talent', value: stats?.students?.total || 0, icon: GraduationCap },
                    { label: 'Success Velocity', value: stats?.students?.total > 0 ? ((stats.students.placed / stats.students.total) * 100).toFixed(1) : 0, unit: '%', icon: TrendingUp }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 bg-[#faf6ef] rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d]">
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#4a2c15] tracking-tight leading-none mb-1">
                                {stat.value}{stat.unit}
                            </div>
                            <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Placement Velocity */}
                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="flex items-center gap-2 mb-8 border-b border-[#faf6ef] pb-4">
                        <TrendingUp size={16} className="text-[#c6a85e]" />
                        <h3 className="text-[11px] font-bold text-[#4a2c15] uppercase tracking-[0.15em]">Placement Efficiency Index</h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.placementByCollege?.slice(0, 5)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#faf6ef" />
                                <XAxis
                                    dataKey="collegeName"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8b6f5a', fontSize: 9, fontWeight: 700 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8b6f5a', fontSize: 9, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#faf6ef' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e6d8c3', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="placementRate" fill="#6b3f1d" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Talent Distribution */}
                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="flex items-center gap-2 mb-8 border-b border-[#faf6ef] pb-4">
                        <Users size={16} className="text-[#c6a85e]" />
                        <h3 className="text-[11px] font-bold text-[#4a2c15] uppercase tracking-[0.15em]">Talent Sector Distribution</h3>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics?.studentsByDepartment}
                                    dataKey="count"
                                    nameKey="_id"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    stroke="#fff"
                                    strokeWidth={4}
                                >
                                    {analytics?.studentsByDepartment?.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Registrations */}
                <div className="bg-white rounded-xl border border-[#e6d8c3] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#faf6ef] flex justify-between items-center">
                        <h3 className="text-[11px] font-bold text-[#4a2c15] uppercase tracking-[0.15em]">Academic Node Registrations</h3>
                        <button
                            onClick={() => navigate('/admin/colleges')}
                            className="text-[10px] font-bold text-[#c6a85e] uppercase tracking-wider hover:text-[#6b3f1d] transition-colors"
                        >
                            View Registry
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#faf6ef]">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-bold text-[#6b3f1d] uppercase tracking-widest">Institution</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-[#6b3f1d] uppercase tracking-widest">Phase</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-[#6b3f1d] uppercase tracking-widest">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#faf6ef]">
                                {recentData.filter(item => item.type === 'College').slice(0, 5).map((item, idx) => (
                                    <tr key={idx} className="hover:bg-[#faf6ef] transition-colors cursor-pointer" onClick={() => navigate(`/admin/colleges/${item._id}`)}>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-[#4a2c15] uppercase">{item.name}</div>
                                            <div className="text-[9px] text-[#8b6f5a] font-medium uppercase tracking-tight">{item.city}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[9px] font-bold rounded-full uppercase tracking-tighter ${item.isVerified ? 'bg-[#e6f4ea] text-[#1e7d4d]' : 'bg-[#fffbeb] text-[#b45309]'
                                                }`}>
                                                {item.isVerified ? 'Verified' : 'Registry Review'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-medium text-[#8b6f5a]">
                                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Partnerships */}
                <div className="bg-white rounded-xl border border-[#e6d8c3] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#faf6ef] flex justify-between items-center">
                        <h3 className="text-[11px] font-bold text-[#4a2c15] uppercase tracking-[0.15em]">Corporate Intelligence Stream</h3>
                        <button
                            onClick={() => navigate('/admin/companies')}
                            className="text-[10px] font-bold text-[#c6a85e] uppercase tracking-wider hover:text-[#6b3f1d] transition-colors"
                        >
                            View Partners
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#faf6ef]">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-bold text-[#6b3f1d] uppercase tracking-widest">Entity</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-[#6b3f1d] uppercase tracking-widest">Sector</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-[#6b3f1d] uppercase tracking-widest">Auth</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#faf6ef]">
                                {recentData.filter(item => item.type === 'Company').slice(0, 5).map((item, idx) => (
                                    <tr key={idx} className="hover:bg-[#faf6ef] transition-colors cursor-pointer" onClick={() => navigate(`/admin/companies/${item._id}`)}>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-[#4a2c15] uppercase">{item.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-tighter">{item.industry}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[9px] font-bold rounded-full uppercase tracking-tighter ${item.isApproved ? 'bg-[#e6f4ea] text-[#1e7d4d]' : 'bg-[#fffbeb] text-[#b45309]'
                                                }`}>
                                                {item.isApproved ? 'Approved' : 'In Review'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
