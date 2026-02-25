import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Activity, Download, Search, Filter,
    BarChart3, Clock, User, Shield,
    Globe, Calendar, ChevronLeft, ChevronRight,
    Eye, Star, CheckCircle, Upload, Edit,
    Trash2, Briefcase, FileText, LayoutDashboard,
    TrendingUp, MousePointer2, UserCheck, ArrowUpRight, FilterX
} from 'lucide-react';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
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
        limit: 15
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

    const columns = [
        {
            header: 'Event Signature',
            accessor: 'action',
            render: (action, log) => (
                <div className="entity-cell">
                    <div className="entity-icon">
                        {getActionIcon(action)}
                    </div>
                    <div>
                        <div className="entity-name uppercase">{formatAction(action)}</div>
                        <div className="entity-meta uppercase tracking-widest leading-none mt-1">{log.targetModel || 'Core System'}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Operator Identity',
            accessor: 'user.email',
            render: (email, log) => (
                <div>
                    <div className="text-[10px] font-bold text-[#4a2c15] uppercase">{email || 'System Process'}</div>
                    <div className="text-[9px] text-[#8b6f5a] font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                        <Globe size={10} /> {log.ipAddress || 'Intranet'}
                    </div>
                </div>
            )
        },
        {
            header: 'Temporal Pulse',
            accessor: 'createdAt',
            render: (date) => (
                <div>
                    <div className="text-[10px] font-bold text-[#4a2c15] uppercase">{formatDate(date)}</div>
                    <div className="text-[9px] text-[#8b6f5a] font-bold uppercase tracking-widest leading-none mt-1">Operational Event</div>
                </div>
            )
        },
        {
            header: 'Visual',
            accessor: '_id',
            render: (id, log) => (
                <div className="flex justify-end">
                    <button
                        onClick={() => console.log('View log details', log)}
                        className="w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#faf6ef] transition-colors"
                    >
                        <ArrowUpRight size={14} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="admin-page">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-1">Audit Intelligence</h1>
                    <p className="text-xs text-[#8b6f5a] font-medium uppercase tracking-widest leading-none">Global System Activity Monitor</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="primary"
                        className="!rounded-lg !bg-[#6b3f1d]"
                        onClick={handleExport}
                    >
                        <Download size={16} className="mr-2" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Export Intelligence</span>
                    </Button>
                </div>
            </div>

            <div className="filter-tabs">
                <div
                    className={`filter-tab ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Live Audit Feed
                </div>
                <div
                    className={`filter-tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Forensic Analytics
                </div>
            </div>

            {activeTab === 'logs' ? (
                <>
                    <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] grid grid-cols-1 md:grid-cols-4 gap-6 shadow-sm mb-8">
                        <div>
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest mb-2 block">Event Signature</label>
                            <select
                                className="admin-form-input-hardened theme-input w-full px-3 py-2 text-[11px] font-bold text-[#4a2c15] uppercase tracking-wider focus:outline-none focus:border-[#c6a85e]"
                                style={{ backgroundColor: '#ffffff' }}
                                value={filters.action}
                                onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
                            >
                                <option value="">Full Protocol Registry</option>
                                {actionOptions.map(action => (
                                    <option key={action} value={action}>{formatAction(action)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest mb-2 block">Module Target</label>
                            <select
                                className="admin-form-input-hardened theme-input w-full px-3 py-2 text-[11px] font-bold text-[#4a2c15] uppercase tracking-wider focus:outline-none focus:border-[#c6a85e]"
                                style={{ backgroundColor: '#ffffff' }}
                                value={filters.targetModel}
                                onChange={(e) => setFilters({ ...filters, targetModel: e.target.value, page: 1 })}
                            >
                                <option value="">All Ecosystem Modules</option>
                                {targetModelOptions.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest mb-2 block">Temporal Start</label>
                            <input
                                type="date"
                                className="admin-form-input-hardened theme-input w-full px-3 py-2 text-[11px] font-bold text-[#4a2c15] uppercase tracking-wider focus:outline-none focus:border-[#c6a85e]"
                                style={{ backgroundColor: '#ffffff' }}
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest mb-2 block">Temporal End</label>
                            <input
                                type="date"
                                className="admin-form-input-hardened theme-input w-full px-3 py-2 text-[11px] font-bold text-[#4a2c15] uppercase tracking-wider focus:outline-none focus:border-[#c6a85e]"
                                style={{ backgroundColor: '#ffffff' }}
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                            />
                        </div>
                    </div>

                    <div className="table-container shadow-sm">
                        <Table
                            columns={columns}
                            data={logs}
                            loading={loading}
                        />
                    </div>

                    {pagination.pages > 1 && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                current={pagination.current}
                                pages={pagination.pages}
                                onPageChange={(page) => setFilters({ ...filters, page })}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-12">
                    {stats && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm flex items-center gap-4">
                                    <div className="bg-[#6b3f1d] p-3 rounded-lg text-white">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{stats.totalLogs.toLocaleString()}</div>
                                        <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-1">Total Pulses</div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm flex items-center gap-4">
                                    <div className="bg-[#c6a85e] p-3 rounded-lg text-white">
                                        <UserCheck size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{stats.userStats?.length || 0}</div>
                                        <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-1">Active Operators</div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm flex items-center gap-4">
                                    <div className="bg-[#4a2c15] p-3 rounded-lg text-white">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-[#4a2c15] tracking-tight">5 Nodes</div>
                                        <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-1">Module Integrity</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                                    <h3 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                                        <BarChart3 size={18} className="text-[#6b3f1d]" /> Event Signature Distribution
                                    </h3>
                                    <div className="space-y-6">
                                        {stats.actionStats?.map((stat) => (
                                            <div key={stat._id}>
                                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                                                    <span className="text-[#4a2c15]">{formatAction(stat._id)}</span>
                                                    <span className="text-[#8b6f5a]">{stat.count} Pulses</span>
                                                </div>
                                                <div className="h-1.5 bg-[#faf6ef] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#6b3f1d] rounded-full"
                                                        style={{ width: `${(stat.count / stats.totalLogs) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                                    <h3 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                                        <Shield size={18} className="text-[#c6a85e]" /> Operator Dominance Matrix
                                    </h3>
                                    <div className="space-y-4">
                                        {stats.userStats?.slice(0, 5).map((stat, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3] hover:border-[#c6a85e]/30 transition-all">
                                                <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-black text-[#6b3f1d] border border-[#e6d8c3] text-[10px]">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[11px] font-bold text-[#4a2c15] uppercase">{stat._id?.email || 'System Process'}</div>
                                                    <div className="text-[9px] text-[#8b6f5a] font-bold uppercase tracking-widest">{stat._id?.role?.replace('_', ' ') || 'Internal'}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-[#6b3f1d]">{stat.count}</div>
                                                    <div className="text-[9px] text-[#8b6f5a] font-bold uppercase tracking-widest">Events</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityLogs;
