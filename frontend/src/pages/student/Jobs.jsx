import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
    Search, Filter, MapPin, Calendar, DollarSign, 
    Briefcase, GraduationCap, Building2, Clock, 
    ArrowRight, CheckCircle, AlertCircle, X, ChevronRight
} from 'lucide-react';
import './Jobs.css';

const StudentJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({});
    const [selectedJob, setSelectedJob] = useState(null);
    const [applying, setApplying] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, [filters]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.search) params.append('search', filters.search);
            params.append('page', filters.page);
            params.append('limit', filters.limit);

            const response = await api.get(`/student/jobs?${params}`);
            setJobs(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page on filter change
        }));
    };

    const handleApply = async (jobId) => {
        if (!window.confirm('Are you sure you want to register for this drive?')) {
            return;
        }

        setApplying(true);
        try {
            await api.post(`/student/jobs/${jobId}/apply`);
            alert('Registered successfully!');
            fetchJobs(); // Refresh to update hasApplied status
            setSelectedJob(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to register for job');
        } finally {
            setApplying(false);
        }
    };

    const formatSalary = (salary) => {
        if (!salary) return 'Not disclosed';
        const { min, max, currency, period } = salary;
        
        if (min && max) {
            const minLPA = (min / 100000).toFixed(1);
            const maxLPA = (max / 100000).toFixed(1);
            return `${minLPA} - ${maxLPA} LPA`;
        }
        return 'Not disclosed';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const isDeadlineSoon = (deadline) => {
        if (!deadline) return false;
        const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3 && daysLeft > 0;
    };

    const isDeadlinePassed = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    if (loading && jobs.length === 0) {
        return (
            <div className="jobs-loading-wrap">
                <div className="loader-spinner"></div>
            </div>
        );
    }

    return (
        <div className="student-jobs-page">
            <header className="jobs-page-header">
                <div className="header-text">
                    <h1>Active Job Drives</h1>
                    <p>Exclusive opportunities tailored for your profile</p>
                </div>
                
                <div className="header-filters">
                    <div className="search-box-wrap">
                        <Search size={18} className="search-icon-fixed" />
                        <input
                            type="text"
                            placeholder="Search by role or company..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-select-wrap">
                        <Filter size={16} className="filter-icon-fixed" />
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="">All Job Types</option>
                            <option value="internship">Internship</option>
                            <option value="full_time">Full Time</option>
                            <option value="part_time">Part Time</option>
                            <option value="contract">Contract</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Jobs Display */}
            {jobs.length === 0 ? (
                <div className="jobs-empty-state">
                    <div className="empty-icon-ring">
                        <Briefcase size={40} />
                    </div>
                    <h3>No drives currently active</h3>
                    <p>We'll notify you as soon as a new drive matching your profile opens up.</p>
                </div>
            ) : (
                <>
                    <div className="jobs-flex-grid">
                        {jobs.map((job) => (
                            <div key={job._id} className="job-drive-card">
                                <div className="card-top">
                                    <div className="comp-brand">
                                        <div className="comp-logo-box">
                                            {job.company?.logo ? (
                                                <img src={job.company.logo} alt={job.company.name} />
                                            ) : (
                                                <Building2 size={24} />
                                            )}
                                        </div>
                                        <div className="comp-meta-text">
                                            <h3>{job.title}</h3>
                                            <p>{job.company?.name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="job-badges-inline">
                                        {job.isPlacementDrive && (
                                            <span className="badge-drive">Campus Drive</span>
                                        )}
                                        <span className={`badge-type type-${job.type}`}>
                                            {job.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-mid">
                                    <div className="meta-point">
                                        <DollarSign size={14} />
                                        <span>{formatSalary(job.salary)}</span>
                                    </div>
                                    <div className="meta-point">
                                        <MapPin size={14} />
                                        <span>{job.locations?.join(', ') || 'Remote'}</span>
                                    </div>
                                    <div className="meta-point">
                                        <Briefcase size={14} />
                                        <span>{job.workMode}</span>
                                    </div>
                                    <div className={`meta-point ${isDeadlineSoon(job.applicationDeadline) ? 'deadline-near' : ''}`}>
                                        <Clock size={14} />
                                        <span>Ends {formatDate(job.applicationDeadline)}</span>
                                    </div>
                                </div>

                                <div className="card-bottom">
                                    <button
                                        onClick={() => navigate(`/student/jobs/${job._id}`)}
                                        className="btn-view-drive"
                                    >
                                        View Details
                                        <ChevronRight size={16} />
                                    </button>
                                    
                                    {job.hasApplied ? (
                                        <button className="btn-status-done" disabled>
                                            <CheckCircle size={16} />
                                            Registered
                                        </button>
                                    ) : isDeadlinePassed(job.applicationDeadline) ? (
                                        <button className="btn-status-closed" disabled>
                                            Closed
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleApply(job._id)}
                                            className="btn-register-accent"
                                            disabled={applying}
                                        >
                                            {applying ? 'Registering...' : 'Register'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Simple Pagination */}
                    {pagination.pages > 1 && (
                        <div className="jobs-pagination-bar">
                            <button
                                onClick={() => handleFilterChange('page', filters.page - 1)}
                                disabled={filters.page === 1}
                                className="pag-btn"
                            >
                                Previous
                            </button>
                            <span className="pag-count">
                                {pagination.page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => handleFilterChange('page', filters.page + 1)}
                                disabled={filters.page === pagination.pages}
                                className="pag-btn"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentJobs;
