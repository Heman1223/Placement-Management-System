import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../services/api';
import { StatsCard } from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { Users, Building2, Briefcase, GraduationCap, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentColleges, setRecentColleges] = useState([]);
    const [recentCompanies, setRecentCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await superAdminAPI.getStats();
            const { stats, recent } = response.data.data;
            setStats(stats);
            setRecentColleges(recent.colleges);
            setRecentCompanies(recent.companies);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
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

    const handleApproveCompany = async (id) => {
        try {
            await superAdminAPI.approveCompany(id, true);
            toast.success('Company approved successfully');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to approve company');
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
            render: (id, row) => !row.isVerified && (
                <Button size="sm" onClick={() => handleApproveCollege(id)}>
                    Approve
                </Button>
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
            render: (id, row) => !row.isApproved && (
                <Button size="sm" onClick={() => handleApproveCompany(id)}>
                    Approve
                </Button>
            )
        }
    ];

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Super Admin Dashboard</h1>
                <p>Platform overview and management</p>
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
