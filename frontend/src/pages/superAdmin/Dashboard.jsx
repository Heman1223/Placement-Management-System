import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import { StatsCard } from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { Users, Building2, Briefcase, GraduationCap, CheckCircle, Clock, TrendingUp, RefreshCw, MoreVertical, Eye, XCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import './SuperAdminDashboard.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [recentColleges, setRecentColleges] = useState([]);
    const [recentCompanies, setRecentCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCharts, setShowCharts] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchDashboardData(true);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-dropdown-wrapper')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
            setRecentColleges(recent.colleges);
            setRecentCompanies(recent.companies);
            setAnalytics(analyticsRes.data.data);
            
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
        fetchDashboardData();
        toast.success('Dashboard refreshed');
    };

    const handleApproveCollege = async (id) => {
        try {
            await superAdminAPI.approveCollege(id, true);
            toast.success('College approved successfully');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to approve college');
        }
    };

    const handleRejectCollege = async (id) => {
        try {
            await superAdminAPI.approveCollege(id, false);
            toast.success('College rejected');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to reject college');
        }
    };

    const handleApproveCompany = async (id) => {
        try {
            await superAdminAPI.approveCompany(id, true);
            toast.success('Company approved successfully');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to approve company');
        }
    };

    const handleRejectCompany = async (id) => {
        try {
            await superAdminAPI.approveCompany(id, false);
            toast.success('Company rejected');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to reject company');
        }
    };

    const collegeColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Code', accessor: 'code' },
        {
            header: 'Status',
            accessor: 'isVerified',
            render: (val) => (
                <span className={`status-badge ${val ? 'status-success' : 'status-pending'}`}>
                    {val ? 'Verified' : 'Pending'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (id, row) => (
                <div className="action-dropdown-wrapper">
                    <button
                        className="action-dropdown-trigger"
                        onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
                    >
                        <MoreVertical size={18} />
                    </button>
                    {openDropdown === id && (
                        <div className="action-dropdown-menu">
                            <button
                                className="action-dropdown-item"
                                onClick={() => {
                                    navigate(`/admin/colleges/${id}`);
                                    setOpenDropdown(null);
                                }}
                            >
                                <Eye size={16} />
                                <span>View Details</span>
                            </button>
                            {!row.isVerified && (
                                <>
                                    <button
                                        className="action-dropdown-item success"
                                        onClick={() => {
                                            handleApproveCollege(id);
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        <CheckCircle size={16} />
                                        <span>Approve</span>
                                    </button>
                                    <button
                                        className="action-dropdown-item danger"
                                        onClick={() => {
                                            handleRejectCollege(id);
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        <XCircle size={16} />
                                        <span>Reject</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )
        }
    ];

    const companyColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Type', accessor: 'type', render: (val) => val?.replace('_', ' ') },
        {
            header: 'Status',
            accessor: 'isApproved',
            render: (val) => (
                <span className={`status-badge ${val ? 'status-success' : 'status-pending'}`}>
                    {val ? 'Approved' : 'Pending'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (id, row) => (
                <div className="action-dropdown-wrapper">
                    <button
                        className="action-dropdown-trigger"
                        onClick={() => setOpenDropdown(openDropdown === `company-${id}` ? null : `company-${id}`)}
                    >
                        <MoreVertical size={18} />
                    </button>
                    {openDropdown === `company-${id}` && (
                        <div className="action-dropdown-menu">
                            <button
                                className="action-dropdown-item"
                                onClick={() => {
                                    navigate(`/admin/companies/${id}`);
                                    setOpenDropdown(null);
                                }}
                            >
                                <Eye size={16} />
                                <span>View Details</span>
                            </button>
                            {!row.isApproved && (
                                <>
                                    <button
                                        className="action-dropdown-item success"
                                        onClick={() => {
                                            handleApproveCompany(id);
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        <CheckCircle size={16} />
                                        <span>Approve</span>
                                    </button>
                                    <button
                                        className="action-dropdown-item danger"
                                        onClick={() => {
                                            handleRejectCompany(id);
                                            setOpenDropdown(null);
                                        }}
                                    >
                                        <XCircle size={16} />
                                        <span>Reject</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )
        }
    ];

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Super Admin Dashboard</h1>
                    <p>Platform overview and management</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <Button 
                        variant="outline" 
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
                        Refresh
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => setShowCharts(!showCharts)}
                    >
                        <TrendingUp size={18} />
                        {showCharts ? 'Hide' : 'Show'} Analytics
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatsCard
                    title="Total Users"
                    value={stats?.users || 0}
                    icon={Users}
                    color="primary"
                />
                <StatsCard
                    title="Colleges"
                    value={stats?.colleges?.total || 0}
                    icon={Building2}
                    color="success"
                />
                <StatsCard
                    title="Companies"
                    value={stats?.companies?.total || 0}
                    icon={Briefcase}
                    color="warning"
                />
                <StatsCard
                    title="Students"
                    value={stats?.students?.total || 0}
                    icon={GraduationCap}
                    color="primary"
                />
            </div>

            {/* Pending Approvals Summary */}
            <div className="pending-summary">
                <div className="pending-item">
                    <Clock size={20} />
                    <span>{stats?.colleges?.pending || 0} colleges pending approval</span>
                </div>
                <div className="pending-item">
                    <Clock size={20} />
                    <span>{stats?.companies?.pending || 0} companies pending approval</span>
                </div>
                <div className="pending-item">
                    <CheckCircle size={20} />
                    <span>{stats?.students?.placed || 0} students placed</span>
                </div>
            </div>

            {/* Analytics Charts */}
            {showCharts && analytics && (
                <div className="analytics-section">
                    <h2>Analytics & Insights</h2>
                    
                    <div className="charts-grid">
                        {/* Placement by College */}
                        {analytics.placementByCollege?.length > 0 && (
                            <div className="chart-card">
                                <h3>Top Colleges by Placement Rate</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.placementByCollege.slice(0, 5)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="collegeName" angle={-45} textAnchor="end" height={100} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="placementRate" fill="#3b82f6" name="Placement %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Students by Department */}
                        {analytics.studentsByDepartment?.length > 0 && (
                            <div className="chart-card">
                                <h3>Students by Department</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={analytics.studentsByDepartment}
                                            dataKey="count"
                                            nameKey="_id"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {analytics.studentsByDepartment.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Company Types */}
                        {analytics.companyTypes?.length > 0 && (
                            <div className="chart-card">
                                <h3>Company Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.companyTypes}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#10b981" name="Companies" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Top Skills */}
                        {analytics.topSkills?.length > 0 && (
                            <div className="chart-card">
                                <h3>Top Skills in Demand</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics.topSkills.slice(0, 8)} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="_id" type="category" width={100} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#f59e0b" name="Students" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Tables */}
            <div className="dashboard-tables">
                <div className="dashboard-table-section">
                    <h2>Recent College Registrations</h2>
                    <Table
                        columns={collegeColumns}
                        data={recentColleges}
                        emptyMessage="No recent colleges"
                    />
                </div>

                <div className="dashboard-table-section">
                    <h2>Recent Company Registrations</h2>
                    <Table
                        columns={companyColumns}
                        data={recentCompanies}
                        emptyMessage="No recent companies"
                    />
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
