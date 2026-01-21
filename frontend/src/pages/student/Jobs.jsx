import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
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
        if (!window.confirm('Are you sure you want to apply for this job?')) {
            return;
        }

        setApplying(true);
        try {
            await api.post(`/student/jobs/${jobId}/apply`);
            alert('Application submitted successfully!');
            fetchJobs(); // Refresh to update hasApplied status
            setSelectedJob(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to apply for job');
        } finally {
            setApplying(false);
        }
    };

    const formatSalary = (salary) => {
        if (!salary) return 'Not disclosed';
        const { min, max, currency, period } = salary;
        const periodText = period === 'per_annum' ? 'per annum' : 'per month';
        
        if (min && max) {
            return `${currency} ${(min / 100000).toFixed(1)} - ${(max / 100000).toFixed(1)} LPA ${periodText}`;
        }
        return 'Not disclosed';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isDeadlineSoon = (deadline) => {
        const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3 && daysLeft > 0;
    };

    const isDeadlinePassed = (deadline) => {
        return new Date(deadline) < new Date();
    };

    if (loading && jobs.length === 0) {
        return <div className="loading">Loading jobs...</div>;
    }

    return (
        <div className="student-jobs">
            <div className="jobs-header">
                <h1>Available Jobs</h1>
                <p className="subtitle">Browse and apply for jobs matching your profile</p>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Types</option>
                        <option value="internship">Internship</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                    </select>
                </div>
            </div>

            {/* Jobs List */}
            {jobs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No jobs found</h3>
                    <p>Try adjusting your filters or check back later for new opportunities</p>
                </div>
            ) : (
                <>
                    <div className="jobs-grid">
                        {jobs.map((job) => (
                            <div key={job._id} className="job-card">
                                <div className="job-header">
                                    <div className="company-info">
                                        {job.company?.logo && (
                                            <img src={job.company.logo} alt={job.company.name} className="company-logo" />
                                        )}
                                        <div>
                                            <h3>{job.title}</h3>
                                            <p className="company-name">{job.company?.name}</p>
                                        </div>
                                    </div>
                                    <span className={`job-type-badge ${job.type}`}>
                                        {job.type.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="job-details">
                                    <div className="detail-item">
                                        <span className="icon">💰</span>
                                        <span>{formatSalary(job.salary)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="icon">📍</span>
                                        <span>{job.locations?.join(', ') || 'Not specified'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="icon">💼</span>
                                        <span>{job.workMode}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="icon">📅</span>
                                        <span>Deadline: {formatDate(job.applicationDeadline)}</span>
                                        {isDeadlineSoon(job.applicationDeadline) && (
                                            <span className="deadline-warning">⚠️ Soon</span>
                                        )}
                                    </div>
                                </div>

                                {job.eligibility?.minCgpa && (
                                    <div className="eligibility-info">
                                        <span className="icon">🎓</span>
                                        <span>Min CGPA: {job.eligibility.minCgpa}</span>
                                    </div>
                                )}

                                <div className="job-actions">
                                    <button
                                        onClick={() => navigate(`/student/jobs/${job._id}`)}
                                        className="btn btn-outline"
                                    >
                                        View Details
                                    </button>
                                    {job.hasApplied ? (
                                        <button className="btn btn-applied" disabled>
                                            ✓ Applied
                                        </button>
                                    ) : isDeadlinePassed(job.applicationDeadline) ? (
                                        <button className="btn btn-disabled" disabled>
                                            Deadline Passed
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleApply(job._id)}
                                            className="btn btn-primary"
                                            disabled={applying}
                                        >
                                            {applying ? 'Applying...' : 'Apply Now'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => handleFilterChange('page', filters.page - 1)}
                                disabled={filters.page === 1}
                                className="btn btn-secondary"
                            >
                                Previous
                            </button>
                            <span className="page-info">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => handleFilterChange('page', filters.page + 1)}
                                disabled={filters.page === pagination.pages}
                                className="btn btn-secondary"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Job Details Modal */}
            {selectedJob && (
                <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedJob(null)}>×</button>
                        
                        <div className="modal-header">
                            <div className="company-info">
                                {selectedJob.company?.logo && (
                                    <img src={selectedJob.company.logo} alt={selectedJob.company.name} className="company-logo-large" />
                                )}
                                <div>
                                    <h2>{selectedJob.title}</h2>
                                    <p className="company-name">{selectedJob.company?.name}</p>
                                </div>
                            </div>
                            <span className={`job-type-badge ${selectedJob.type}`}>
                                {selectedJob.type.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="modal-body">
                            <section>
                                <h3>Job Details</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <strong>Salary:</strong>
                                        <span>{formatSalary(selectedJob.salary)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Location:</strong>
                                        <span>{selectedJob.locations?.join(', ')}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Work Mode:</strong>
                                        <span>{selectedJob.workMode}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Deadline:</strong>
                                        <span>{formatDate(selectedJob.applicationDeadline)}</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3>Description</h3>
                                <p className="description">{selectedJob.description}</p>
                            </section>

                            {selectedJob.eligibility && (
                                <section>
                                    <h3>Eligibility Criteria</h3>
                                    <ul className="eligibility-list">
                                        {selectedJob.eligibility.minCgpa && (
                                            <li>Minimum CGPA: {selectedJob.eligibility.minCgpa}</li>
                                        )}
                                        {selectedJob.eligibility.maxBacklogs !== undefined && (
                                            <li>Maximum Backlogs: {selectedJob.eligibility.maxBacklogs}</li>
                                        )}
                                        {selectedJob.eligibility.allowedDepartments?.length > 0 && (
                                            <li>Departments: {selectedJob.eligibility.allowedDepartments.join(', ')}</li>
                                        )}
                                        {selectedJob.eligibility.allowedBatches?.length > 0 && (
                                            <li>Batches: {selectedJob.eligibility.allowedBatches.join(', ')}</li>
                                        )}
                                    </ul>
                                </section>
                            )}

                            {selectedJob.eligibility?.requiredSkills?.length > 0 && (
                                <section>
                                    <h3>Required Skills</h3>
                                    <div className="skills-list">
                                        {selectedJob.eligibility.requiredSkills.map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {selectedJob.hiringProcess?.length > 0 && (
                                <section>
                                    <h3>Hiring Process</h3>
                                    <ol className="hiring-process">
                                        {selectedJob.hiringProcess.map((round, index) => (
                                            <li key={index}>
                                                <strong>{round.name}</strong>
                                                {round.description && <p>{round.description}</p>}
                                            </li>
                                        ))}
                                    </ol>
                                </section>
                            )}
                        </div>

                        <div className="modal-footer">
                            {selectedJob.hasApplied ? (
                                <button className="btn btn-applied" disabled>
                                    ✓ Already Applied
                                </button>
                            ) : isDeadlinePassed(selectedJob.applicationDeadline) ? (
                                <button className="btn btn-disabled" disabled>
                                    Deadline Passed
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleApply(selectedJob._id)}
                                    className="btn btn-primary btn-large"
                                    disabled={applying}
                                >
                                    {applying ? 'Applying...' : 'Apply for this Job'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentJobs;
