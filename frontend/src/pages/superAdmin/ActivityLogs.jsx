import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Button from '../../components/common/Button';
import { 
    Activity, Download, Search, Filter, 
    BarChart3, Clock, User, Shield, 
    Globe, Calendar, ChevronLeft, ChevronRight,
    Eye, Star, CheckCircle, Upload, Edit, 
    Trash2, Briefcase, FileText, LayoutDashboard,
    TrendingUp, MousePointer2, UserCheck
} from 'lucide-react';
import './AdminPages.css';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        targetModel: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 20 // Reduced for premium density
    });
    const [pagination, setPagination] = useState({});
    const [activeTab, setActiveTab] = useState('logs'); 

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
        } else {
            fetchStats();
        }
    }, [filters, activeTab]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.action) params.append('action', filters.action);
            if (filters.targetModel) params.append('targetModel', filters.targetModel);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            params.append('page', filters.page);
            params.append('limit', filters.limit);

            const response = await api.get(`/activity-logs?${params}`);
            setLogs(response.data.data.logs);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/activity-logs/stats?${params}`);
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.action) params.append('action', filters.action);
            if (filters.targetModel) params.append('targetModel', filters.targetModel);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/activity-logs/export?${params}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `system_activity_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const getActionIcon = (action) => {
        const icons = {
            view_student: <Eye size={12} />,
            download_student_data: <Download size={12} />,
            shortlist_student: <Star size={12} />,
            approve_college: <CheckCircle size={12} />,
            approve_company: <CheckCircle size={12} />,
            bulk_upload: <Upload size={12} />,
            export_data: <Download size={12} />,
            update_student: <Edit size={12} />,
            delete_student: <Trash2 size={12} />,
            post_job: <Briefcase size={12} />,
            update_job: <Edit size={12} />,
            view_resume: <FileText size={12} />
        };
        return icons[action] || <MousePointer2 size={12} />;
    };

    const formatAction = (action) => {
        return action.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const actionOptions = [
        'view_student', 'download_student_data', 'shortlist_student', 
        'approve_college', 'approve_company', 'bulk_upload', 
        'export_data', 'update_student', 'delete_student', 
        'post_job', 'update_job', 'view_resume'
    ];

    const targetModelOptions = ['Student', 'College', 'Company', 'Job', 'Application'];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            className="admin-page-v2"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Premium Header Banner */}
            <div className="premium-header-banner">
                <div className="premium-header-text">
                    <h1>System Activity Audit</h1>
                    <p>Real-time forensic monitoring and volumetric operational analysis.</p>
                </div>
                <div className="flex gap-2">
                    <button className="premium-search-btn rounded-xl bg-white/10 hover:bg-white/20 transition-all shadow-none" onClick={handleExport}>
                        <Download size={16} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Premium Tab System */}
            <div className="mx-8 mb-6 flex gap-4 border-b border-white/5">
                <button
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'logs' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                    onClick={() => setActiveTab('logs')}
                >
                    <div className="flex items-center gap-2">
                        <Activity size={18} />
                        Live Feed
                    </div>
                    {activeTab === 'logs' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />}
                </button>
                <button
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'stats' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                    onClick={() => setActiveTab('stats')}
                >
                    <div className="flex items-center gap-2">
                        <BarChart3 size={18} />
                        Intelligence 
                    </div>
                    {activeTab === 'stats' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'logs' ? (
                    <motion.div 
                        key="logs-view"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        variants={itemVariants}
                    >
                        {/* Premium Filter Strip */}
                        <div className="mx-8 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <select
                                value={filters.action}
                                onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
                                className="bg-[#1e293b] border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                            >
                                <option value="">All Action Types</option>
                                {actionOptions.map(action => (
                                    <option key={action} value={action}>{formatAction(action)}</option>
                                ))}
                            </select>
                            <select
                                value={filters.targetModel}
                                onChange={(e) => setFilters({ ...filters, targetModel: e.target.value, page: 1 })}
                                className="bg-[#1e293b] border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                            >
                                <option value="">All Module Targets</option>
                                {targetModelOptions.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                                className="bg-[#1e293b] border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                            />
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                                className="bg-[#1e293b] border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Premium Table */}
                        <div className="premium-table-container">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Action Type</th>
                                        <th>Initiator</th>
                                        <th>Target</th>
                                        <th>Timestamp</th>
                                        <th>Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-20">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                                    <span className="text-slate-500 font-medium text-xs uppercase tracking-widest">Tracing System Events...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-20 text-slate-500 text-sm font-medium">
                                                No activity signatures detected for the selected period.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log._id}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                            {getActionIcon(log.action)}
                                                        </div>
                                                        <span className="text-xs font-bold text-white uppercase tracking-tight">{formatAction(log.action)}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="user-cell">
                                                        <div className="user-avatar-small bg-slate-800 border border-white/5 shrink-0">
                                                            <UserCheck size={12} className="text-slate-400" />
                                                        </div>
                                                        <div className="user-info-text">
                                                            <span className="user-name text-[11px]">{log.user?.email || 'System'}</span>
                                                            <span className={`text-[9px] font-bold uppercase ${log.user?.role === 'super_admin' ? 'text-blue-400' : 'text-slate-500'}`}>
                                                                {log.user?.role?.replace('_', ' ') || 'Process'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] font-bold text-slate-300 uppercase">
                                                        {log.targetModel || 'Global'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                                                        <Clock size={12} className="text-slate-600" />
                                                        {formatDate(log.createdAt)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                                                        <Globe size={12} className="text-slate-700" />
                                                        {log.ipAddress || 'Internal'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="premium-pagination">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                    Forensic Analysis: {logs.length} Recent Events
                                </span>
                                <div className="pagination-controls">
                                    <button 
                                        className="page-nav-btn"
                                        disabled={filters.page === 1}
                                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-xs font-bold text-white px-2">
                                        Sequence {pagination.current} / {pagination.pages}
                                    </span>
                                    <button 
                                        className="page-nav-btn"
                                        disabled={filters.page === pagination.pages}
                                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* Statistics Intelligence View (Refined for Premium) */
                    <motion.div 
                        key="stats-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-8 pb-12"
                    >
                        {stats && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="premium-stat-card border-l-4 border-l-blue-500">
                                        <div className="premium-stat-icon bg-blue-500/10 text-blue-500">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div className="stat-v2-info">
                                            <span className="stat-label">Event Throughput</span>
                                            <span className="stat-value">{stats.totalLogs.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="premium-stat-card border-l-4 border-l-indigo-500">
                                        <div className="premium-stat-icon bg-indigo-500/10 text-indigo-500">
                                            <Shield size={24} />
                                        </div>
                                        <div className="stat-v2-info">
                                            <span className="stat-label">Active Operators</span>
                                            <span className="stat-value">{stats.userStats?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className="premium-stat-card border-l-4 border-l-emerald-500">
                                        <div className="premium-stat-icon bg-emerald-500/10 text-emerald-500">
                                            <LayoutDashboard size={24} />
                                        </div>
                                        <div className="stat-v2-info">
                                            <span className="stat-label">Modules Captured</span>
                                            <span className="stat-value">5 Targets</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Action Distribution */}
                                    <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
                                        <div className="flex items-center gap-3 mb-8">
                                            <MousePointer2 size={18} className="text-blue-500" />
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Activity Distribution</h3>
                                        </div>
                                        <div className="flex flex-col gap-6">
                                            {stats.actionStats?.map((stat) => (
                                                <div key={stat._id} className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{formatAction(stat._id)}</span>
                                                        <span className="text-[11px] font-mono text-white">{stat.count} <span className="text-slate-600">Events</span></span>
                                                    </div>
                                                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                                        <motion.div 
                                                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(stat.count / stats.totalLogs) * 100}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Power Users */}
                                    <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
                                        <div className="flex items-center gap-3 mb-8">
                                            <Shield size={18} className="text-indigo-500" />
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Operator Matrix</h3>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            {stats.userStats?.slice(0, 6).map((stat, index) => (
                                                <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-500 border border-indigo-500/20">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 flex flex-col">
                                                        <span className="text-[11px] font-bold text-white">{stat._id?.email || 'Internal Service'}</span>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase">{stat._id?.role?.replace('_', ' ') || 'Process'}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-black text-white">{stat.count}</div>
                                                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Actions</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Heatmap Timeline (Full Width) */}
                                    {stats.timeline && (
                                        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 lg:col-span-2">
                                            <div className="flex items-center gap-3 mb-12">
                                                <Calendar size={18} className="text-emerald-500" />
                                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operational Flux (7-Day Metric)</h3>
                                            </div>
                                            <div className="flex justify-between items-end h-40 gap-3 px-2">
                                                {stats.timeline.map((day) => {
                                                    const height = (day.count / Math.max(...stats.timeline.map(d => d.count))) * 100;
                                                    return (
                                                        <div key={day._id} className="flex-1 flex flex-col items-center gap-4 group">
                                                            <div className="w-full relative flex flex-col justify-end h-full">
                                                                <motion.div 
                                                                    className="w-full bg-emerald-500/20 border border-emerald-500/20 rounded-t-lg relative group-hover:bg-emerald-500/40 transition-colors"
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: `${height}%` }}
                                                                >
                                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-white">
                                                                        {day.count}
                                                                    </div>
                                                                </motion.div>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter w-full text-center">
                                                                {new Date(day._id).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ActivityLogs;

