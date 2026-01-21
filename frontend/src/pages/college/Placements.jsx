import { useState, useEffect } from 'react';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { Award, Download, TrendingUp, Users, Building2, Star, BarChart3 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import './Placements.css';

const Placements = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, shortlisted, placed
    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab !== 'overview') {
            fetchStudents(activeTab);
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const response = await collegeAPI.getPlacementStats();
            setStats(response.data.data);
        } catch (error) {
            toast.error('Failed to load placement stats');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (type) => {
        try {
            const response = await collegeAPI.getPlacementTracking(type);
            setStudents(response.data.data);
        } catch (error) {
            toast.error('Failed to load students');
        }
    };

    const handleExport = async (type) => {
        try {
            const response = await collegeAPI.exportPlacementReport(type);
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `placement_report_${type}_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success('Report exported successfully');
        } catch (error) {
            toast.error('Failed to export report');
        }
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="placements-page">
            <div className="page-header">
                <div>
                    <h1>Placement Tracking</h1>
                    <p>Monitor and analyze placement progress</p>
                </div>
                <div className="header-actions">
                    <Button variant="secondary" icon={Download} onClick={() => handleExport('all')}>
                        Export All
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <BarChart3 size={18} />
                    Overview
                </button>
                <button
                    className={`tab ${activeTab === 'shortlisted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shortlisted')}
                >
                    <Star size={18} />
                    Shortlisted ({stats?.overview?.shortlisted || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'placed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('placed')}
                >
                    <Award size={18} />
                    Placed ({stats?.overview?.placed || 0})
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
                <div className="overview-content">
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card stat-primary">
                            <div className="stat-icon">
                                <Users size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.overview.total}</span>
                                <span className="stat-label">Total Students</span>
                            </div>
                        </div>
                        <div className="stat-card stat-success">
                            <div className="stat-icon">
                                <Award size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.overview.placed}</span>
                                <span className="stat-label">Placed</span>
                            </div>
                        </div>
                        <div className="stat-card stat-warning">
                            <div className="stat-icon">
                                <Star size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.overview.shortlisted}</span>
                                <span className="stat-label">Shortlisted</span>
                            </div>
                        </div>
                        <div className="stat-card stat-info">
                            <div className="stat-icon">
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.overview.placementRate}%</span>
                                <span className="stat-label">Placement Rate</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="charts-row">
                        {/* Placement by Branch */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Placement by Branch</h3>
                                <Button variant="ghost" size="sm" icon={Download} onClick={() => handleExport('all')}>
                                    Export
                                </Button>
                            </div>
                            {stats.placementByBranch.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.placementByBranch}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="total" fill="#3b82f6" name="Total" />
                                        <Bar dataKey="placed" fill="#10b981" name="Placed" />
                                        <Bar dataKey="shortlisted" fill="#f59e0b" name="Shortlisted" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart">No data available</div>
                            )}
                        </div>

                        {/* Placement by Year */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Placement by Year</h3>
                            </div>
                            {stats.placementByYear.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.placementByYear}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="total" fill="#8b5cf6" name="Total" />
                                        <Bar dataKey="placed" fill="#10b981" name="Placed" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart">No data available</div>
                            )}
                        </div>
                    </div>

                    {/* Package Distribution */}
                    <div className="chart-card-full">
                        <div className="chart-header">
                            <h3>Package Distribution</h3>
                        </div>
                        {stats.packageDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.packageDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ range, count }) => `${range}: ${count}`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {stats.packageDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-chart">No data available</div>
                        )}
                    </div>

                    {/* Top Companies */}
                    <div className="companies-section">
                        <div className="section-header">
                            <h3>Top Recruiting Companies</h3>
                        </div>
                        {stats.placementByCompany.length > 0 ? (
                            <div className="companies-grid">
                                {stats.placementByCompany.map((company, index) => (
                                    <div key={index} className="company-card">
                                        <div className="company-rank">#{index + 1}</div>
                                        <div className="company-info">
                                            <h4>{company._id || 'Unknown'}</h4>
                                            <div className="company-stats">
                                                <span className="company-stat">
                                                    <Users size={14} />
                                                    {company.count} students
                                                </span>
                                                <span className="company-stat">
                                                    <Award size={14} />
                                                    Avg: {company.avgPackage?.toFixed(1) || 'N/A'} LPA
                                                </span>
                                                <span className="company-stat">
                                                    <TrendingUp size={14} />
                                                    Max: {company.maxPackage?.toFixed(1) || 'N/A'} LPA
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">No placement data available</div>
                        )}
                    </div>

                    {/* Branch-wise Details Table */}
                    <div className="details-section">
                        <div className="section-header">
                            <h3>Branch-wise Placement Details</h3>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Branch</th>
                                        <th>Total</th>
                                        <th>Placed</th>
                                        <th>Shortlisted</th>
                                        <th>Placement %</th>
                                        <th>Avg Package</th>
                                        <th>Max Package</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.placementByBranch.map((branch, index) => (
                                        <tr key={index}>
                                            <td><strong>{branch._id}</strong></td>
                                            <td>{branch.total}</td>
                                            <td className="text-success">{branch.placed}</td>
                                            <td className="text-warning">{branch.shortlisted}</td>
                                            <td>
                                                <span className="percentage-badge">
                                                    {branch.total > 0 ? ((branch.placed / branch.total) * 100).toFixed(1) : 0}%
                                                </span>
                                            </td>
                                            <td>{branch.avgPackage?.toFixed(2) || 'N/A'} LPA</td>
                                            <td><strong>{branch.maxPackage?.toFixed(2) || 'N/A'} LPA</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Shortlisted Tab */}
            {activeTab === 'shortlisted' && (
                <div className="students-content">
                    <div className="content-header">
                        <h3>Shortlisted Students</h3>
                        <Button icon={Download} onClick={() => handleExport('shortlisted')}>
                            Export CSV
                        </Button>
                    </div>
                    {students.length === 0 ? (
                        <div className="empty-state">
                            <Star size={48} />
                            <p>No shortlisted students yet</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Batch</th>
                                        <th>CGPA</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student._id}>
                                            <td>{student.rollNumber}</td>
                                            <td>{student.name.firstName} {student.name.lastName}</td>
                                            <td>{student.department}</td>
                                            <td>{student.batch}</td>
                                            <td>{student.cgpa?.toFixed(2) || 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge status-${student.placementStatus}`}>
                                                    {student.placementStatus.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Placed Tab */}
            {activeTab === 'placed' && (
                <div className="students-content">
                    <div className="content-header">
                        <h3>Placed Students</h3>
                        <Button icon={Download} onClick={() => handleExport('placed')}>
                            Export CSV
                        </Button>
                    </div>
                    {students.length === 0 ? (
                        <div className="empty-state">
                            <Award size={48} />
                            <p>No placed students yet</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Batch</th>
                                        <th>CGPA</th>
                                        <th>Company</th>
                                        <th>Role</th>
                                        <th>Package</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student._id}>
                                            <td>{student.rollNumber}</td>
                                            <td>{student.name.firstName} {student.name.lastName}</td>
                                            <td>{student.department}</td>
                                            <td>{student.batch}</td>
                                            <td>{student.cgpa?.toFixed(2) || 'N/A'}</td>
                                            <td><strong>{student.placementDetails?.company || 'N/A'}</strong></td>
                                            <td>{student.placementDetails?.role || 'N/A'}</td>
                                            <td className="package-cell">
                                                <span className="package-badge">
                                                    {student.placementDetails?.package || 'N/A'} LPA
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Placements;
