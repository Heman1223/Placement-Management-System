import { useState, useEffect } from 'react';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { Award, Download, TrendingUp, Users, Building2, Star, BarChart3, Search, Filter, Eye, UserCheck, Briefcase, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import './Placements.css';
import '../college/CompanyActivity.css'; // Import company activity styles if needed

const PlacementDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, students, companies
    const [loading, setLoading] = useState(true);
    
    // Data States
    const [stats, setStats] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    const [students, setStudents] = useState([]);
    
    // Filters for Students Tab
    const [studentFilters, setStudentFilters] = useState({
        search: '',
        department: '',
        status: '',
        batch: ''
    });
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [statsRes, companiesRes, studentsRes, deptsRes] = await Promise.all([
                collegeAPI.getPlacementStats(),
                collegeAPI.getCompanyActivity(),
                collegeAPI.getStudents({ limit: 1000 }), // Get all for client-side filtering or implement server-side
                collegeAPI.getDepartments()
            ]);
            
            setStats(statsRes.data.data);
            setCompanyData(companiesRes.data.data);
            setStudents(studentsRes.data.data.students);
            setDepartments(deptsRes.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
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

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return d.toLocaleDateString();
    };

    // Filtered Students
    const filteredStudents = students.filter(student => {
        const matchesSearch = (
            student.name.firstName.toLowerCase().includes(studentFilters.search.toLowerCase()) ||
            student.name.lastName.toLowerCase().includes(studentFilters.search.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(studentFilters.search.toLowerCase())
        );
        const matchesDept = !studentFilters.department || student.department === studentFilters.department;
        const matchesStatus = !studentFilters.status || student.placementStatus === studentFilters.status;
        const matchesBatch = !studentFilters.batch || student.batch.toString() === studentFilters.batch;

        return matchesSearch && matchesDept && matchesStatus && matchesBatch;
    });

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="placements-page">
            <div className="page-header">
                <div>
                    <h1>Placement Dashboard</h1>
                    <p> comprehensive view of placement activities</p>
                </div>
                <div className="header-actions">
                    <Button variant="secondary" icon={Download} onClick={() => handleExport('all')}>
                        Export Unplaced Report
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <BarChart3 size={18} />
                    Overview
                </button>
                <button
                    className={`tab ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                >
                    <Users size={18} />
                    Student View
                </button>
                <button
                    className={`tab ${activeTab === 'companies' ? 'active' : ''}`}
                    onClick={() => setActiveTab('companies')}
                >
                    <Building2 size={18} />
                    Company View
                </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
                <div className="overview-content">
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card stat-primary">
                            <div className="stat-icon"><Users size={24} /></div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.overview.total}</span>
                                <span className="stat-label">Total Students</span>
                            </div>
                        </div>
                        <div className="stat-card stat-success">
                            <div className="stat-icon"><Award size={24} /></div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.overview.placed}</span>
                                <span className="stat-label">Placed Students</span>
                            </div>
                        </div>
                        <div className="stat-card stat-warning">
                            <div className="stat-icon"><Star size={24} /></div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.overview.shortlisted}</span>
                                <span className="stat-label">Currently Shortlisted</span>
                            </div>
                        </div>
                        <div className="stat-card stat-info">
                            <div className="stat-icon"><TrendingUp size={24} /></div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.overview.placementRate}%</span>
                                <span className="stat-label">Placement Rate</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="charts-row">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Placement by Branch</h3>
                            </div>
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
                        </div>
                         <div className="chart-card">
                            <div className="chart-header">
                                <h3>Package Distribution</h3>
                            </div>
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
                        </div>
                    </div>
                </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === 'students' && (
                <div className="students-content">
                    {/* Filters */}
                    <div className="filters-bar">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or roll no..."
                                value={studentFilters.search}
                                onChange={(e) => setStudentFilters({ ...studentFilters, search: e.target.value })}
                            />
                        </div>
                        <select
                            value={studentFilters.department}
                            onChange={(e) => setStudentFilters({ ...studentFilters, department: e.target.value })}
                            className="filter-select"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <select
                            value={studentFilters.status}
                            onChange={(e) => setStudentFilters({ ...studentFilters, status: e.target.value })}
                            className="filter-select"
                        >
                            <option value="">All Statuses</option>
                            <option value="placed">Placed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="in_process">In Process</option>
                            <option value="not_placed">Not Placed</option>
                        </select>
                        <select
                            value={studentFilters.batch}
                            onChange={(e) => setStudentFilters({ ...studentFilters, batch: e.target.value })}
                            className="filter-select"
                        >
                            <option value="">All Batches</option>
                            {[...new Set(students.map(s => s.batch))].sort().map(batch => (
                                <option key={batch} value={batch}>{batch}</option>
                            ))}
                        </select>
                    </div>

                    {/* Table */}
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
                                    <th>Company</th>
                                    <th>Package</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student._id}>
                                        <td>{student.rollNumber}</td>
                                        <td>{student.name.firstName} {student.name.lastName}</td>
                                        <td>{student.department}</td>
                                        <td>{student.batch}</td>
                                        <td>{student.cgpa?.toFixed(2) || '-'}</td>
                                        <td>
                                            <span className={`status-badge status-${student.placementStatus}`}>
                                                {student.placementStatus.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            {student.placementStatus === 'placed' 
                                                ? (student.placementDetails?.company || 'N/A') 
                                                : '-'}
                                        </td>
                                        <td>
                                            {student.placementStatus === 'placed' 
                                                ? `${student.placementDetails?.package || 0} LPA` 
                                                : '-'}
                                        </td>
                                        <td>
                                            <Link to={`/college/students/${student._id}`} className="action-link">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="9" style={{textAlign: 'center', padding: '2rem'}}>
                                            No students found matching filters
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* COMPANIES TAB */}
            {activeTab === 'companies' && companyData && (
                <div className="companies-content">
                    {/* Summary Row */}
                     <div className="stats-grid mb-6">
                         <div className="stat-card">
                             <div className="stat-content">
                                 <span className="stat-value">{companyData.summary.totalCompaniesEngaged}</span>
                                 <span className="stat-label">Companies</span>
                             </div>
                         </div>
                         <div className="stat-card">
                             <div className="stat-content">
                                 <span className="stat-value">{companyData.summary.totalApplications}</span>
                                 <span className="stat-label">Applications</span>
                             </div>
                         </div>
                         <div className="stat-card">
                             <div className="stat-content">
                                 <span className="stat-value">{companyData.summary.totalOffered}</span>
                                 <span className="stat-label">Offers</span>
                             </div>
                         </div>
                         <div className="stat-card">
                             <div className="stat-content">
                                 <span className="stat-value">{companyData.summary.totalHired}</span>
                                 <span className="stat-label">Hired</span>
                             </div>
                         </div>
                     </div>

                    {/* Companies List */}
                    <div className="companies-grid">
                        {companyData.companies.map(company => (
                            <div key={company._id} className="company-activity-card">
                                <div className="company-header">
                                    <div className="company-icon">
                                        {company.logo ? (
                                            <img src={company.logo} alt={company.name} />
                                        ) : (
                                            <Building2 size={24} />
                                        )}
                                    </div>
                                    <div className="company-info">
                                        <h3>{company.name}</h3>
                                        <p>{company.industry}</p>
                                    </div>
                                    <div className="last-activity">
                                        <Clock size={14} />
                                        <span>{formatDate(company.lastActivity)}</span>
                                    </div>
                                </div>
                                <div className="company-stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-label">Applied</span>
                                        <span className="stat-value">{company.applications}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Shortlisted</span>
                                        <span className="stat-value">{company.totalShortlisted}</span>
                                    </div>
                                     <div className="stat-item">
                                        <span className="stat-label">Offered</span>
                                        <span className="stat-value success">{company.offered}</span>
                                    </div>
                                     <div className="stat-item">
                                        <span className="stat-label">Hired</span>
                                        <span className="stat-value success">{company.hired}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                         {companyData.companies.length === 0 && (
                            <div className="empty-state">
                                <Building2 size={48} />
                                <p>No company activity yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlacementDashboard;
