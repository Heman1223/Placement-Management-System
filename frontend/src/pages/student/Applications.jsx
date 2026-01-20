import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Applications.css';

const StudentApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({});
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, [filters]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            params.append('page', filters.page);
            params.append('limit', filters.limit);

            const response = await api.get(`/student/applications?${params}`);
            setApplications(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            applied: '#3b82f6',
            under_review: '#f59e0b',
            shortlisted: '#10b981',
            interview_scheduled: '#8b5cf6',
            interviewed: '#6366f1',
            offered: '#059669',
            offer_accepted: '#047857',
            hired: '#065f46',
            rejected: '#ef4444',
            withdrawn: '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            applied: '📝',
            under_review: '👀',
            shortlisted: '⭐',
            interview_scheduled: '📅',
            interviewed: '💬',
            offered: '🎉',
            offer_accepted: '✅',
            hired: '🎊',
            rejected: '❌',
            withdrawn: '↩️'
        };
        return icons[status] || '📄';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatStatus = (status) => {
        return status.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (loading && applications.length === 0) {
        return <div className="loading">Loading applications...</div>;
    }

    return (
        <div className="student-applications">
            <div className="applications-header">
                <h1>My Applications</h1>
                <p className="subtitle">Track your job application status</p>
            </div>

            {/* Status Filter */}
            <div className="filters-section">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="status-filter"
                >
                    <option value="">All Status</option>
                    <option value="applied">Applied</option>
                    <option value="under_review">Under Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="offered">Offered</option>
                    <option value="offer_accepted">Offer Accepted</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Applications List */}
            {applications.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No applications yet</h3>
                    <p>Start applying for jobs to see your applications here</p>
                    <button onClick={() => window.location.href = '/student/jobs'} className="btn btn-primary">
                        Browse Jobs
                    </button>
                </div>
            ) : (
                <>
                    <div className="applications-list">
                        {applications.map((app) => (
                            <div key={app._id} className="application-card">
                                <div className="app-header">
                                    <div className="job-info">
                                        {app.job?.company?.logo && (
                                            <img 
                                                src={app.job.company.logo} 
                                                alt={app.job.company.name} 
                                                className="company-logo"
                                            />
                                        )}
                                        <div>
                                            <h3>{app.job?.title}</h3>
                                            <p className="company-name">{app.job?.company?.name}</p>
                                        </div>
                                    </div>
                                    <div 
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(app.status) }}
                                    >
                                        <span className="status-icon">{getStatusIcon(app.status)}</span>
                                        <span>{formatStatus(app.status)}</span>
                                    </div>
                                </div>

                                <div className="app-details">
                                    <div className="detail-item">
                                        <span className="label">Applied on:</span>
                                        <span className="value">{formatDate(app.appliedAt)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Job Type:</span>
                                        <span className="value">{app.job?.type?.replace('_', ' ')}</span>
                                    </div>
                                    {app.job?.applicationDeadline && (
                                        <div className="detail-item">
                                            <span className="label">Deadline:</span>
                                            <span className="value">{formatDate(app.job.applicationDeadline)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status Timeline */}
                                {app.statusHistory && app.statusHistory.length > 0 && (
                                    <div className="timeline-preview">
                                        <span className="timeline-label">
                                            {app.statusHistory.length} status update{app.statusHistory.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}

                                <div className="app-actions">
                                    <button 
                                        onClick={() => setSelectedApp(app)}
                                        className="btn btn-outline"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                disabled={filters.page === 1}
                                className="btn btn-secondary"
                            >
                                Previous
                            </button>
                            <span className="page-info">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={filters.page === pagination.pages}
                                className="btn btn-secondary"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Application Details Modal */}
            {selectedApp && (
                <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedApp(null)}>×</button>
                        
                        <div className="modal-header">
                            <div className="job-info">
                                {selectedApp.job?.company?.logo && (
                                    <img 
                                        src={selectedApp.job.company.logo} 
                                        alt={selectedApp.job.company.name} 
                                        className="company-logo-large"
                                    />
                                )}
                                <div>
                                    <h2>{selectedApp.job?.title}</h2>
                                    <p className="company-name">{selectedApp.job?.company?.name}</p>
                                </div>
                            </div>
                            <div 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(selectedApp.status) }}
                            >
                                <span className="status-icon">{getStatusIcon(selectedApp.status)}</span>
                                <span>{formatStatus(selectedApp.status)}</span>
                            </div>
                        </div>

                        <div className="modal-body">
                            {/* Application Info */}
                            <section>
                                <h3>Application Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Applied on:</span>
                                        <span className="value">{formatDate(selectedApp.appliedAt)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Current Status:</span>
                                        <span className="value">{formatStatus(selectedApp.status)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Job Type:</span>
                                        <span className="value">{selectedApp.job?.type?.replace('_', ' ')}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Last Updated:</span>
                                        <span className="value">{formatDate(selectedApp.updatedAt)}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Status Timeline */}
                            {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                                <section>
                                    <h3>Status Timeline</h3>
                                    <div className="timeline">
                                        {selectedApp.statusHistory.slice().reverse().map((history, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-marker" style={{ backgroundColor: getStatusColor(history.status) }}>
                                                    {getStatusIcon(history.status)}
                                                </div>
                                                <div className="timeline-content">
                                                    <div className="timeline-status">{formatStatus(history.status)}</div>
                                                    <div className="timeline-date">{formatDate(history.changedAt)}</div>
                                                    {history.remarks && (
                                                        <div className="timeline-remarks">{history.remarks}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Interview Details */}
                            {selectedApp.interviews && selectedApp.interviews.length > 0 && (
                                <section>
                                    <h3>Interview Details</h3>
                                    {selectedApp.interviews.map((interview, index) => (
                                        <div key={index} className="interview-card">
                                            <h4>Round {interview.round}</h4>
                                            {interview.scheduledAt && (
                                                <p><strong>Scheduled:</strong> {formatDate(interview.scheduledAt)}</p>
                                            )}
                                            {interview.mode && (
                                                <p><strong>Mode:</strong> {interview.mode}</p>
                                            )}
                                            {interview.location && (
                                                <p><strong>Location:</strong> {interview.location}</p>
                                            )}
                                            {interview.meetingLink && (
                                                <p><strong>Meeting Link:</strong> <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">Join</a></p>
                                            )}
                                            {interview.feedback && (
                                                <p><strong>Feedback:</strong> {interview.feedback}</p>
                                            )}
                                            {interview.result && (
                                                <p><strong>Result:</strong> <span className={`result-${interview.result}`}>{interview.result}</span></p>
                                            )}
                                        </div>
                                    ))}
                                </section>
                            )}

                            {/* Offer Details */}
                            {selectedApp.offer && (
                                <section>
                                    <h3>Offer Details</h3>
                                    <div className="offer-card">
                                        {selectedApp.offer.package && (
                                            <p><strong>Package:</strong> ₹{selectedApp.offer.package} LPA</p>
                                        )}
                                        {selectedApp.offer.role && (
                                            <p><strong>Role:</strong> {selectedApp.offer.role}</p>
                                        )}
                                        {selectedApp.offer.joiningDate && (
                                            <p><strong>Joining Date:</strong> {formatDate(selectedApp.offer.joiningDate)}</p>
                                        )}
                                        {selectedApp.offer.offerLetterUrl && (
                                            <p>
                                                <a href={selectedApp.offer.offerLetterUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                                    View Offer Letter
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Resume Snapshot */}
                            {selectedApp.resumeSnapshot && (
                                <section>
                                    <h3>Application Snapshot</h3>
                                    <div className="snapshot-info">
                                        {selectedApp.resumeSnapshot.cgpa && (
                                            <p><strong>CGPA at application:</strong> {selectedApp.resumeSnapshot.cgpa}</p>
                                        )}
                                        {selectedApp.resumeSnapshot.skills && selectedApp.resumeSnapshot.skills.length > 0 && (
                                            <div>
                                                <strong>Skills:</strong>
                                                <div className="skills-list">
                                                    {selectedApp.resumeSnapshot.skills.map((skill, index) => (
                                                        <span key={index} className="skill-tag">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedApp.resumeSnapshot.url && (
                                            <p>
                                                <a href={selectedApp.resumeSnapshot.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                                                    View Resume
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentApplications;
