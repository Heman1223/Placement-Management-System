import { useState, useEffect } from 'react';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { Award, Download, TrendingUp, Users, Building2, Star, BarChart3, Search, Filter, Eye, UserCheck, Briefcase, Clock, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    const [selectedCompany, setSelectedCompany] = useState(null);

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

    const [showFilters, setShowFilters] = useState(false);

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

    const getCompanyName = (companyIdOrName) => {
        if (!companyIdOrName) return 'N/A';
        // If it looks like an ID (24 chars hex), try to find it
        if (companyIdOrName.length === 24 && companyData?.companies) {
            const company = companyData.companies.find(c => c._id === companyIdOrName);
            if (company) return company.name;
        }
        return companyIdOrName;
    };

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
                        Export Report
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
                    {/* Premium Stats Grid - Matching Dashboard */}
                    <div className="premium-stat-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <div className="premium-stat-card" style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }}>
                            <div className="premium-stat-icon" style={{
                                width: '3rem',
                                height: '3rem',
                                borderRadius: '0.75rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#60a5fa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Users size={20} />
                            </div>
                            <div className="stat-v2-info" style={{ flex: 1 }}>
                                <span className="stat-label" style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.25rem'
                                }}>Total Students</span>
                                <span className="stat-value" style={{
                                    display: 'block',
                                    fontSize: '1.75rem',
                                    fontWeight: '900',
                                    color: 'white'
                                }}>{stats.overview.total}</span>
                            </div>
                        </div>

                        <div className="premium-stat-card" style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }}>
                            <div className="premium-stat-icon" style={{
                                width: '3rem',
                                height: '3rem',
                                borderRadius: '0.75rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#34d399',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Award size={20} />
                            </div>
                            <div className="stat-v2-info" style={{ flex: 1 }}>
                                <span className="stat-label" style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.25rem'
                                }}>Placed Students</span>
                                <span className="stat-value" style={{
                                    display: 'block',
                                    fontSize: '1.75rem',
                                    fontWeight: '900',
                                    color: 'white'
                                }}>{stats.overview.placed}</span>
                            </div>
                        </div>

                        <div className="premium-stat-card" style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }}>
                            <div className="premium-stat-icon" style={{
                                width: '3rem',
                                height: '3rem',
                                borderRadius: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#f87171',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Star size={20} />
                            </div>
                            <div className="stat-v2-info" style={{ flex: 1 }}>
                                <span className="stat-label" style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.25rem'
                                }}>Currently Shortlisted</span>
                                <span className="stat-value" style={{
                                    display: 'block',
                                    fontSize: '1.75rem',
                                    fontWeight: '900',
                                    color: 'white'
                                }}>{stats.overview.shortlisted}</span>
                            </div>
                        </div>

                        <div className="premium-stat-card" style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }}>
                            <div className="premium-stat-icon" style={{
                                width: '3rem',
                                height: '3rem',
                                borderRadius: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUp size={20} />
                            </div>
                            <div className="stat-v2-info" style={{ flex: 1 }}>
                                <span className="stat-label" style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.25rem'
                                }}>Placement Rate</span>
                                <span className="stat-value" style={{
                                    display: 'block',
                                    fontSize: '1.75rem',
                                    fontWeight: '900',
                                    color: 'white'
                                }}>{stats.overview.placementRate}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts - Matching Dashboard Style */}
                    <div className="charts-row">
                        <div className="chart-card" style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '2rem',
                            padding: '2rem',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)'
                        }}>
                            <div className="chart-header">
                                <h3 style={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: '800',
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>Placement by Branch</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.placementByBranch}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="_id" stroke="#94a3b8" style={{ fontSize: '0.75rem' }} />
                                    <YAxis stroke="#94a3b8" style={{ fontSize: '0.75rem' }} />
                                    <Tooltip 
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.5rem',
                                            color: 'white'
                                        }}
                                    />
                                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                    <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="placed" fill="#10b981" name="Placed" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="shortlisted" fill="#f59e0b" name="Shortlisted" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                         <div className="chart-card" style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '2rem',
                            padding: '2rem',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)'
                        }}>
                            <div className="chart-header">
                                <h3 style={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: '800',
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>Package Distribution</h3>
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
                                    <Tooltip 
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.5rem',
                                            color: 'white'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Additional Row: Top Companies + Placement Trend */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1.5fr', 
                        gap: '2rem',
                        marginTop: '2rem'
                    }}>
                        {/* Top Companies Card */}
                        <div className="chart-card" style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '2rem',
                            padding: '2rem',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)'
                        }}>
                            <div className="chart-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: '800',
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Building2 size={16} />
                                    Top Recruiting Companies
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {companyData?.companies?.slice(0, 5).map((company, index) => (
                                    <div key={company._id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: '1rem',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <div style={{
                                            width: '2.5rem',
                                            height: '2.5rem',
                                            borderRadius: '0.75rem',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {company.logo ? (
                                                <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '0.5rem' }} />
                                            ) : (
                                                <Building2 size={18} style={{ color: '#60a5fa' }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ 
                                                fontSize: '0.875rem', 
                                                fontWeight: '700', 
                                                color: 'white',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>{company.name}</div>
                                            <div style={{ 
                                                fontSize: '0.75rem', 
                                                color: '#64748b',
                                                marginTop: '0.125rem'
                                            }}>{company.industry || 'Technology'}</div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            gap: '0.25rem'
                                        }}>
                                            <span style={{
                                                fontSize: '1.125rem',
                                                fontWeight: '900',
                                                color: '#34d399'
                                            }}>{company.hired || 0}</span>
                                            <span style={{
                                                fontSize: '0.625rem',
                                                color: '#64748b',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                fontWeight: '700'
                                            }}>Hired</span>
                                        </div>
                                    </div>
                                ))}
                                {(!companyData?.companies || companyData.companies.length === 0) && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '2rem',
                                        color: '#64748b',
                                        fontSize: '0.875rem'
                                    }}>
                                        <Building2 size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                                        <p>No company data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Placement Trend Line Graph */}
                        <div className="chart-card" style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '2rem',
                            padding: '2rem',
                            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)'
                        }}>
                            <div className="chart-header">
                                <h3 style={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: '800',
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <TrendingUp size={16} />
                                    Placement Trend
                                </h3>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.placementByBranch?.map(item => ({
                                    name: item._id,
                                    placed: item.placed,
                                    total: item.total
                                })) || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#94a3b8" 
                                        style={{ fontSize: '0.75rem' }}
                                    />
                                    <YAxis 
                                        stroke="#94a3b8" 
                                        style={{ fontSize: '0.75rem' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '0.5rem',
                                            color: 'white'
                                        }}
                                    />
                                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="placed" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', r: 5 }}
                                        activeDot={{ r: 7 }}
                                        name="Placed Students"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="total" 
                                        stroke="#60a5fa" 
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ fill: '#60a5fa', r: 4 }}
                                        name="Total Students"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === 'students' && (
                <div className="students-content">
                    {/* Filters */}
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
                        
                        <Button 
                            variant="secondary" 
                            icon={Filter} 
                            onClick={() => setShowFilters(!showFilters)}
                            className={showFilters ? 'bg-blue-500/10 text-blue-500 !border-blue-500/30' : ''}
                        >
                            Filters
                        </Button>

                        {showFilters && (
                            <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
                        )}
                    </div>

                    {/* Optimized Table */}
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ minWidth: '100%', width: 'max-content' }}>
                            <thead>
                                <tr>
                                    <th style={{ minWidth: '100px' }}>Roll No</th>
                                    <th style={{ minWidth: '150px' }}>Name</th>
                                    <th style={{ minWidth: '120px' }}>Department</th>
                                    <th style={{ minWidth: '80px' }}>Batch</th>
                                    <th style={{ minWidth: '80px' }}>CGPA</th>
                                    <th style={{ minWidth: '120px' }}>Status</th>
                                    <th style={{ minWidth: '150px' }}>Company</th>
                                    <th style={{ minWidth: '100px' }}>Package</th>
                                    <th style={{ minWidth: '80px' }}>Actions</th>
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
                                                ? getCompanyName(student.placementDetails?.company)
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
                    {selectedCompany ? (
                        <div className="company-detail-view animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Detail Header */}
                            <div className="flex items-center gap-6 mb-8">
                                <Button 
                                    variant="secondary" 
                                    icon={ArrowLeft} 
                                    onClick={() => setSelectedCompany(null)}
                                >
                                    Back
                                </Button>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
                                        {selectedCompany.logo ? (
                                            <img src={selectedCompany.logo} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <Building2 size={32} className="text-blue-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">{selectedCompany.name}</h2>
                                        <div className="flex items-center gap-4 text-slate-400 text-sm">
                                            <span>{selectedCompany.industry}</span>
                                            <span>•</span>
                                            <span>{formatDate(selectedCompany.lastActivity)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Content - Student Lists */}
                            <div className="grid grid-cols-1 gap-8">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Award className="text-emerald-400" size={20} />
                                        Placed Students
                                        <span className="ml-auto text-sm font-normal text-slate-400 bg-white/5 px-2 py-1 rounded">
                                            {selectedCompany.hired} Total
                                        </span>
                                    </h3>
                                    
                                    <div className="table-container" style={{ overflowX: 'auto' }}>
                                        <table className="data-table" style={{ minWidth: '100%', width: 'max-content' }}>
                                            <thead>
                                                <tr>
                                                    <th>Roll No</th>
                                                    <th>Name</th>
                                                    <th>Department</th>
                                                    <th>Package</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students
                                                    .filter(s => 
                                                        s.placementStatus === 'placed' && 
                                                        (s.placementDetails?.company === selectedCompany._id || s.placementDetails?.company === selectedCompany.name)
                                                    )
                                                    .map(student => (
                                                    <tr key={student._id}>
                                                        <td>{student.rollNumber}</td>
                                                        <td>{student.name.firstName} {student.name.lastName}</td>
                                                        <td>{student.department}</td>
                                                        <td>{student.placementDetails?.package || 0} LPA</td>
                                                        <td>
                                                            <Link to={`/college/students/${student._id}`} className="text-blue-400 hover:underline text-sm">View Profile</Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {students.filter(s => s.placementStatus === 'placed' && (s.placementDetails?.company === selectedCompany._id || s.placementDetails?.company === selectedCompany.name)).length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-8 text-slate-400">
                                                            No placed students found in client records
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Premium Summary Row */}
                            <div className="premium-stat-grid" style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(4, 1fr)', 
                                gap: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                <div className="premium-stat-card" style={{
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '1.5rem',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div className="premium-stat-icon" style={{
                                        width: '3rem', height: '3rem', borderRadius: '0.75rem',
                                        background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Building2 size={20} />
                                    </div>
                                    <div className="stat-v2-info">
                                        <span className="stat-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Companies</span>
                                        <span className="stat-value" style={{ display: 'block', fontSize: '1.75rem', fontWeight: '900', color: 'white' }}>{companyData.summary.totalCompaniesEngaged}</span>
                                    </div>
                                </div>

                                <div className="premium-stat-card" style={{
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '1.5rem',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div className="premium-stat-icon" style={{
                                        width: '3rem', height: '3rem', borderRadius: '0.75rem',
                                        background: 'rgba(16, 185, 129, 0.1)', color: '#34d399',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Users size={20} />
                                    </div>
                                    <div className="stat-v2-info">
                                        <span className="stat-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Applications</span>
                                        <span className="stat-value" style={{ display: 'block', fontSize: '1.75rem', fontWeight: '900', color: 'white' }}>{companyData.summary.totalApplications}</span>
                                    </div>
                                </div>

                                <div className="premium-stat-card" style={{
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '1.5rem',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div className="premium-stat-icon" style={{
                                        width: '3rem', height: '3rem', borderRadius: '0.75rem',
                                        background: 'rgba(239, 68, 68, 0.1)', color: '#f87171',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Star size={20} />
                                    </div>
                                    <div className="stat-v2-info">
                                        <span className="stat-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Offers</span>
                                        <span className="stat-value" style={{ display: 'block', fontSize: '1.75rem', fontWeight: '900', color: 'white' }}>{companyData.summary.totalOffered}</span>
                                    </div>
                                </div>

                                <div className="premium-stat-card" style={{
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '1.5rem',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div className="premium-stat-icon" style={{
                                        width: '3rem', height: '3rem', borderRadius: '0.75rem',
                                        background: 'rgba(255, 255, 255, 0.1)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <UserCheck size={20} />
                                    </div>
                                    <div className="stat-v2-info">
                                        <span className="stat-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Hired</span>
                                        <span className="stat-value" style={{ display: 'block', fontSize: '1.75rem', fontWeight: '900', color: 'white' }}>{companyData.summary.totalHired}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Companies Grid */}
                            <div className="companies-grid">
                                {companyData.companies.map(company => (
                                    <div 
                                        key={company._id} 
                                        className="company-activity-card cursor-pointer hover:!border-blue-500/50"
                                        onClick={() => setSelectedCompany(company)}
                                    >
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
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlacementDashboard;
