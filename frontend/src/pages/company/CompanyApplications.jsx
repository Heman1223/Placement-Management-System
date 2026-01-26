import { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api';
import { 
    Search, Filter, Download, FileText, User, 
    ChevronRight, ExternalLink, Calendar, Briefcase,
    Building2, CheckCircle, Clock, XCircle, MoreVertical, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './CompanyApplications.css';

const CompanyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, shortlisted: 0, hired: 0 });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchApplications();
    }, [filters.page, filters.status]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await companyAPI.getAllApplications(filters);
            setApplications(response.data.data.applications);
            setPagination(response.data.data.pagination);
            
            // Calculate quick stats from the full list if possible, or just use the current data
            const apps = response.data.data.applications;
            setStats({
                total: response.data.data.pagination.total,
                pending: apps.filter(a => a.status === 'pending').length,
                shortlisted: apps.filter(a => ['shortlisted', 'interviewed', 'offered'].includes(a.status)).length,
                hired: apps.filter(a => a.status === 'hired').length
            });
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchApplications();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'hired': return 'status-hired';
            case 'offered': return 'status-offered';
            case 'interviewed': return 'status-interviewed';
            case 'shortlisted': return 'status-shortlisted';
            case 'rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    return (
        <div className="company-apps-page">
            <header className="page-header-premium">
                <div className="header-left">
                    <h1>Direct Applicants</h1>
                    <p>Track student registrations across all your active job drives</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <Download size={18} />
                        Export Master List
                    </button>
                    <Link to="/company/jobs/new" className="btn-primary">
                        <Briefcase size={18} />
                        Launch New Drive
                    </Link>
                </div>
            </header>

            <div className="stats-strip">
                <div className="stat-pill">
                    <div className="stat-icon blue"><User size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{pagination.total}</span>
                        <span className="stat-label">Total Registrations</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <div className="stat-icon yellow"><Clock size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">New Applicants</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <div className="stat-icon purple"><CheckCircle size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.shortlisted}</span>
                        <span className="stat-label">In Selection</span>
                    </div>
                </div>
                <div className="stat-pill">
                    <div className="stat-icon green"><Award size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.hired}</span>
                        <span className="stat-label">Total Hired</span>
                    </div>
                </div>
            </div>

            <div className="content-card-premium">
                <div className="filter-bar">
                    <form onSubmit={handleSearch} className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by student name, email, or job title..." 
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </form>
                    <div className="filter-group">
                        <div className="filter-item">
                            <Filter size={16} />
                            <select 
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interviewed">Interviewed</option>
                                <option value="offered">Offered</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Student Detail</th>
                                <th>Job Drive</th>
                                <th>College</th>
                                <th>Applied Date</th>
                                <th>Selection Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="skeleton-row">
                                        <td colSpan="6"><div className="skeleton-line" /></td>
                                    </tr>
                                ))
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-table">
                                        <div className="empty-msg">
                                            <FileText size={40} />
                                            <p>No registers found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app._id} className="app-row">
                                        <td>
                                            <div className="student-profile-cell">
                                                <div className="student-avatar-small">
                                                    {app.studentData?.profilePicture ? (
                                                        <img src={app.studentData.profilePicture} alt="" />
                                                    ) : (
                                                        <User size={16} />
                                                    )}
                                                </div>
                                                <div className="student-base-info">
                                                    <span className="student-name-link">
                                                        {app.studentData?.name?.firstName} {app.studentData?.name?.lastName}
                                                    </span>
                                                    <span className="student-email-sub">{app.studentData?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="job-cell-info">
                                                <span className="job-title-pill">{app.jobData?.title}</span>
                                                <span className="job-type-sub">{app.jobData?.type?.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="college-cell-info">
                                                <Building2 size={14} />
                                                {app.studentData?.collegeName || 'Institutional Partner'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={14} />
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`status-pill ${getStatusStyle(app.status)}`}>
                                                <span className="dot" />
                                                {app.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons-cell">
                                                <Link 
                                                    to={`/company/students/${app.studentData?._id}`}
                                                    className="btn-action-view"
                                                    title="View Full Profile"
                                                >
                                                    <User size={16} />
                                                </Link>
                                                <Link 
                                                    to={`/company/jobs/${app.jobData?._id}`}
                                                    className="btn-action-job"
                                                    title="View Job Drive"
                                                >
                                                    <ExternalLink size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="pagination-premium">
                        <button 
                            disabled={filters.page === 1}
                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        >
                            Previous
                        </button>
                        <div className="page-numbers">
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(num => (
                                <button 
                                    key={num}
                                    className={filters.page === num ? 'active' : ''}
                                    onClick={() => setFilters({ ...filters, page: num })}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={filters.page === pagination.pages}
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyApplications;
