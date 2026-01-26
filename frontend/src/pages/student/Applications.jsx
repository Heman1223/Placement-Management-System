import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
    Eye, Building2, Calendar, MapPin, Briefcase, 
    CheckCircle, Clock, XCircle, AlertCircle, 
    ExternalLink, ChevronRight, FileText, Info, Award, Target
} from 'lucide-react';
import './Applications.css';

const StudentApplications = () => {
    const navigate = useNavigate();
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

    const getStatusTheme = (status) => {
        const themes = {
            applied: { color: '#60a5fa', icon: <Clock size={16} />, bg: 'rgba(59, 130, 246, 0.1)' },
            under_review: { color: '#fbbf24', icon: <Eye size={16} />, bg: 'rgba(251, 191, 36, 0.1)' },
            shortlisted: { color: '#a78bfa', icon: <CheckCircle size={16} />, bg: 'rgba(167, 139, 250, 0.1)' },
            interview_scheduled: { color: '#34d399', icon: <Calendar size={16} />, bg: 'rgba(52, 211, 153, 0.1)' },
            interviewed: { color: '#2dd4bf', icon: <Info size={16} />, bg: 'rgba(45, 212, 191, 0.1)' },
            offered: { color: '#10b981', icon: <CheckCircle size={16} />, bg: 'rgba(16, 185, 129, 0.1)' },
            hired: { color: '#059669', icon: <Award size={16} />, bg: 'rgba(5, 150, 105, 0.1)' },
            rejected: { color: '#fb7185', icon: <XCircle size={16} />, bg: 'rgba(244, 63, 94, 0.1)' },
            withdrawn: { color: '#94a3b8', icon: <AlertCircle size={16} />, bg: 'rgba(148, 163, 184, 0.1)' }
        };
        return themes[status] || themes.applied;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatStatus = (status) => {
        return status.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (loading && applications.length === 0) {
        return (
            <div className="jobs-loading-wrap">
                <div className="loader-spinner"></div>
            </div>
        );
    }

    return (
        <div className="student-applications">
            <header className="applications-header">
                <h1>My Registrations</h1>
                <p className="subtitle">Track your placement drive registration status</p>
            </header>

            <div className="filters-section">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="status-filter"
                >
                    <option value="">All Status</option>
                    <option value="applied">Registered</option>
                    <option value="under_review">Under Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="offered">Offered</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {applications.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No registrations yet</h3>
                    <p>Start registering for job drives to see them here</p>
                    <button onClick={() => window.location.href = '/student/jobs'} className="btn btn-primary">
                        Browse Drives
                    </button>
                </div>
            ) : (
                <>
                    <div className="applications-list">
                        {applications.map((app) => {
                            const theme = getStatusTheme(app.status);
                            return (
                                <div key={app._id} className="application-card">
                                    <div className="app-header">
                                        <div className="job-info">
                                            <div className="company-logo" style={{ width: '50px', height: '50px' }}>
                                                {app.job?.company?.logo ? (
                                                    <img src={app.job.company.logo} alt={app.job.company.name} />
                                                ) : (
                                                    <Building2 size={24} color="#64748b" />
                                                )}
                                            </div>
                                            <div>
                                                <h3>{app.job?.title}</h3>
                                                <p className="company-name">{app.job?.company?.name}</p>
                                            </div>
                                        </div>
                                        <div 
                                            className="status-badge"
                                            style={{ backgroundColor: theme.bg, color: theme.color, border: `1px solid ${theme.color}33` }}
                                        >
                                            {theme.icon}
                                            <span>{formatStatus(app.status)}</span>
                                        </div>
                                    </div>

                                    <div className="app-details">
                                        <div className="detail-item">
                                            <span className="label">Registered on</span>
                                            <span className="value">{formatDate(app.appliedAt)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Job Type</span>
                                            <span className="value">{app.job?.type?.replace('_', ' ')}</span>
                                        </div>
                                        {app.job?.applicationDeadline && (
                                            <div className="detail-item">
                                                <span className="label">Deadline</span>
                                                <span className="value">{formatDate(app.job.applicationDeadline)}</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <span className="label">Rounds</span>
                                            <span className="value">{app.statusHistory?.length || 1} Updates</span>
                                        </div>
                                    </div>

                                    <div className="app-actions" style={{ display: 'flex', gap: '1rem' }}>
                                        <button 
                                            onClick={() => setSelectedApp(app)}
                                            className="btn btn-outline"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}
                                        >
                                            <FileText size={16} />
                                            View Progress
                                            <ChevronRight size={14} />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/student/jobs/${app.job._id}`)}
                                            className="btn btn-outline"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}
                                        >
                                            <ExternalLink size={16} />
                                            View Official Drive
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                disabled={filters.page === 1}
                                className="pag-btn"
                            >
                                Previous
                            </button>
                            <span className="page-info">
                                {pagination.page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={filters.page === pagination.pages}
                                className="pag-btn"
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
                        <button className="modal-close" onClick={() => setSelectedApp(null)}><XCircle size={24} /></button>
                        
                        <div className="modal-header">
                            <div className="job-info">
                                <div className="company-logo" style={{ width: '60px', height: '60px' }}>
                                    {selectedApp.job?.company?.logo ? (
                                        <img src={selectedApp.job.company.logo} alt={selectedApp.job.company.name} />
                                    ) : (
                                        <Building2 size={30} color="#64748b" />
                                    )}
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{selectedApp.job?.title}</h2>
                                    <p className="company-name" style={{ color: '#ffffff', fontWeight: 700, opacity: 0.9 }}>{selectedApp.job?.company?.name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-body">
                            <section>
                                <h3>
                                    <Target size={18} />
                                    Recruitment Journey
                                </h3>
                                {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 ? (
                                    <div className="timeline">
                                        {selectedApp.statusHistory.slice().reverse().map((history, index) => {
                                            const hTheme = getStatusTheme(history.status);
                                            return (
                                                <div key={index} className="timeline-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                                    <div className="timeline-marker" style={{ color: hTheme.color, borderColor: hTheme.color }}>
                                                        {hTheme.icon}
                                                    </div>
                                                    <div className="timeline-content">
                                                        <div className="timeline-status" style={{ color: hTheme.color, fontWeight: 700 }}>{formatStatus(history.status)}</div>
                                                        <div className="timeline-date">{formatDate(history.changedAt)}</div>
                                                        {history.remarks && (
                                                            <div className="timeline-remarks">{history.remarks}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-timeline">
                                        <Clock size={40} />
                                        <p>Your registration is currently being processed. Updates will appear here shortly.</p>
                                    </div>
                                )}
                            </section>

                            {/* Interview Details */}
                            {selectedApp.interviews && selectedApp.interviews.length > 0 && (
                                <section>
                                    <h3>
                                        <Calendar size={18} />
                                        Scheduled Interviews
                                    </h3>
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {selectedApp.interviews.map((interview, index) => (
                                            <div key={index} className="timeline-content" style={{ padding: '2rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                                    <div>
                                                        <h4 style={{ color: '#60a5fa', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                                            Round {interview.round}: {interview.name || 'Technical Discussion'}
                                                        </h4>
                                                        <div className="timeline-date">Scheduled on {formatDate(interview.scheduledAt)}</div>
                                                    </div>
                                                    <div className="status-badge" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>
                                                        <Clock size={14} />
                                                        Upcoming
                                                    </div>
                                                </div>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                                                    <div className="detail-item">
                                                        <span className="label">Location/Mode</span>
                                                        <span className="value">{interview.mode || 'Online Interactive Session'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="label">Instructions</span>
                                                        <span className="value">{interview.instructions || 'Check email for details'}</span>
                                                    </div>
                                                </div>

                                                {interview.meetingLink && (
                                                    <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
                                                        <ExternalLink size={18} /> 
                                                        Join Meeting
                                                    </a>
                                                )}
                                            </div>
                                        ))}
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
