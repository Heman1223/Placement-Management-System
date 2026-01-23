import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { companyAPI, jobAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { ArrowLeft, User, Mail, Phone, GraduationCap, Award, FileText, Calendar, Filter, MapPin, Briefcase, DollarSign, Clock, Users, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Applicants.css';

const JobDetail = () => {
    const { id: jobId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [job, setJob] = useState(null);
    const [stats, setStats] = useState(null);
    const [applicantsData, setApplicantsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'applicants' ? 'applicants' : 'overview');
    
    // Applicants state
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    
    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    useEffect(() => {
        if (activeTab === 'applicants') {
            fetchApplicants();
        }
    }, [jobId, statusFilter, page, activeTab]);

    const fetchJobDetails = async () => {
        try {
            // Fetch job details
            const jobRes = await jobAPI.getJob(jobId);
            setJob(jobRes.data.data);
        } catch (error) {
            console.error('Failed to load job details', error);
            toast.error('Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async () => {
        try {
            const params = { page, limit: 20 };
            if (statusFilter !== 'all') params.status = statusFilter;
            
            const response = await companyAPI.getJobApplicants(jobId, params);
            setApplicantsData(response.data.data);
            // Updating stats from applicants response if available or calculate
        } catch (error) {
            console.error('Failed to load applicants', error);
            toast.error('Failed to load applicants');
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await companyAPI.updateApplicationStatus(applicationId, newStatus);
            toast.success('Application status updated');
            fetchApplicants(); // Refresh list
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Helper functions
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
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    if (!job) {
        return <div className="error-state">Job not found</div>;
    }

    return (
        <div className="applicants-page">
            <div className="page-header">
                <Link to="/company/jobs" className="back-link">
                    <ArrowLeft size={20} />
                    Back to Jobs
                </Link>
                <div className="header-content">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1>{job.title}</h1>
                            <div className="flex gap-4 text-gray-500 text-sm mt-1">
                                <span className="flex items-center gap-1"><MapPin size={14} /> {job.locations?.join(', ') || 'Not specified'}</span>
                                <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type?.replace('_', ' ')}</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> Posted: {formatDate(job.createdAt)}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {job.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container mb-6 border-b border-gray-200">
                <button 
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'applicants' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('applicants')}
                >
                    Applicants ({job.stats?.totalApplications || 0})
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="job-overview-content grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                            <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                                {job.description}
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                {job.requirements?.map((req, i) => (
                                    <li key={i}>{req}</li>
                                ))}
                            </ul>
                        </section>

                        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-3">Skills Required</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skillsRequired?.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Job Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 flex items-center gap-2"><Users size={16}/> Applied</span>
                                    <span className="font-semibold">{job.stats?.totalApplications || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 flex items-center gap-2"><CheckCircle size={16}/> Shortlisted</span>
                                    <span className="font-semibold">{job.stats?.shortlisted || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 flex items-center gap-2"><User size={16}/> Hired</span>
                                    <span className="font-semibold text-green-600">{job.stats?.hired || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Salary Package</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <DollarSign size={16} className="text-gray-400"/>
                                        {job.salary?.min ? `₹${job.salary.min} - ₹${job.salary.max} ${job.salary.period?.replace('_', ' ')}` : 'Not Disclosed'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Application Deadline</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Calendar size={16} className="text-gray-400"/>
                                        {formatDate(job.applicationDeadline)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Eligible Batches</div>
                                    <div className="flex gap-2 flex-wrap">
                                        {job.eligibility?.allowedBatches?.map(b => (
                                            <span key={b} className="text-sm bg-gray-50 px-2 py-1 rounded border border-gray-200">{b}</span>
                                        ))}
                                        {(!job.eligibility?.allowedBatches || job.eligibility.allowedBatches.length === 0) && <span className="text-sm text-gray-500">All Batches</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <Button 
                            variant="secondary" 
                            fullWidth 
                            onClick={() => navigate(`/company/jobs/${jobId}/edit`)}
                        >
                            Edit Job Details
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="applicants-section">
                     {/* Filters */}
                    <div className="filters-section mb-6">
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
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interviewed">Interviewed</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Applicants List */}
                    {applicantsData?.applications?.length === 0 ? (
                        <div className="empty-state">
                            <User size={48} />
                            <h3>No Applicants Yet</h3>
                            <p>No students have applied for this job yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="applicants-list">
                                {applicantsData?.applications?.map((application) => (
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
                                                <option value="interview_scheduled">Interview Sched.</option>
                                                <option value="interviewed">Interviewed</option>
                                                <option value="offered">Offered</option>
                                                <option value="hired">Hired</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {applicantsData?.pagination?.pages > 1 && (
                                <div className="pagination">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="page-info">
                                        Page {page} of {applicantsData.pagination.pages}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === applicantsData.pagination.pages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobDetail;
