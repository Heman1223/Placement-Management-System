import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { companyAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { ArrowLeft, User, Mail, Phone, GraduationCap, Award, FileText, Calendar, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import './Applicants.css';
import './Applicants.css';

const Applicants = () => {
    const { id: jobId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchApplicants();
    }, [jobId, statusFilter, page]);

    const fetchApplicants = async () => {
        try {
            const params = { page, limit: 20 };
            if (statusFilter !== 'all') params.status = statusFilter;
            
            const response = await companyAPI.getJobApplicants(jobId, params);
            setData(response.data.data);
        } catch (error) {
            toast.error('Failed to load applicants');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await companyAPI.updateApplicationStatus(applicationId, newStatus);
            toast.success('Application status updated');
            fetchApplicants();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            applied: 'status-applied',
            under_review: 'status-review',
            shortlisted: 'status-shortlisted',
            interview_scheduled: 'status-interview',
            interviewed: 'status-interviewed',
            offered: 'status-offered',
            offer_accepted: 'status-accepted',
            hired: 'status-hired',
            rejected: 'status-rejected',
            withdrawn: 'status-withdrawn'
        };
        return statusMap[status] || 'status-default';
    };

    const getStatusLabel = (status) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="applicants-page">
            <div className="page-header">
                <Link to="/company/jobs" className="back-link">
                    <ArrowLeft size={20} />
                    Back to Jobs
                </Link>
                <div className="header-content">
                    <h1>Applicants for: {data?.job?.title}</h1>
                    <p>{data?.pagination?.total || 0} total applications</p>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <Filter size={18} />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
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
            </div>

            {/* Applicants List */}
            {data?.applications?.length === 0 ? (
                <div className="empty-state">
                    <User size={48} />
                    <h3>No Applicants Yet</h3>
                    <p>No students have applied for this job yet.</p>
                </div>
            ) : (
                <>
                    <div className="applicants-list">
                        {data?.applications?.map((application) => (
                            <div key={application._id} className="applicant-card">
                                <div className="applicant-header">
                                    <div className="applicant-avatar">
                                        <User size={24} />
                                    </div>
                                    <div className="applicant-info">
                                        <h3>
                                            {application.student?.name?.firstName} {application.student?.name?.lastName}
                                        </h3>
                                        <div className="applicant-meta">
                                            <span>
                                                <GraduationCap size={14} />
                                                {application.student?.department}
                                            </span>
                                            <span>
                                                <Calendar size={14} />
                                                Batch {application.student?.batch}
                                            </span>
                                            <span>
                                                <Award size={14} />
                                                CGPA: {application.student?.cgpa}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="applicant-status">
                                        <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                                            {getStatusLabel(application.status)}
                                        </span>
                                        <span className="applied-date">
                                            Applied: {formatDate(application.appliedAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className="applicant-details">
                                    <div className="detail-item">
                                        <Mail size={16} />
                                        <span>{application.student?.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Phone size={16} />
                                        <span>{application.student?.phone || 'Not provided'}</span>
                                    </div>
                                </div>

                                {application.student?.skills && application.student.skills.length > 0 && (
                                    <div className="applicant-skills">
                                        <strong>Skills:</strong>
                                        <div className="skills-list">
                                            {application.student.skills.map((skill, index) => (
                                                <span key={index} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="applicant-actions">
                                    {application.student?.resumeUrl && (
                                        <a 
                                            href={application.student.resumeUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="action-btn view-resume"
                                        >
                                            <FileText size={16} />
                                            View Resume
                                        </a>
                                    )}
                                    
                                    <select
                                        value={application.status}
                                        onChange={(e) => handleStatusChange(application._id, e.target.value)}
                                        className="status-select"
                                    >
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
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {data?.pagination?.pages > 1 && (
                        <div className="pagination">
                            <Button
                                variant="secondary"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="page-info">
                                Page {page} of {data.pagination.pages}
                            </span>
                            <Button
                                variant="secondary"
                                onClick={() => setPage(page + 1)}
                                disabled={page === data.pagination.pages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Applicants;
