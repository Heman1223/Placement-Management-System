import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, studentAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { 
    ArrowLeft, Briefcase, MapPin, Calendar, DollarSign, Users, 
    Clock, CheckCircle, Building2, Award, Target, TrendingUp,
    FileText, Send, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import './JobDetail.css';

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        setLoading(true);
        try {
            const response = await jobAPI.getJob(id);
            setJob(response.data.data);
            
            // Check if already applied
            checkApplicationStatus();
        } catch (error) {
            toast.error('Failed to load job details');
            navigate('/student/jobs');
        } finally {
            setLoading(false);
        }
    };

    const checkApplicationStatus = async () => {
        try {
            const response = await studentAPI.getApplications();
            const applications = response.data.data.applications;
            const applied = applications.some(app => app.job._id === id);
            setHasApplied(applied);
        } catch (error) {
            console.error('Failed to check application status');
        }
    };

    const handleApply = async () => {
        if (!job) return;

        setApplying(true);
        try {
            await studentAPI.applyJob(job._id);
            toast.success('Application submitted successfully!');
            setHasApplied(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply for job');
        } finally {
            setApplying(false);
        }
    };

    const formatSalary = (salary) => {
        if (!salary) return 'Not specified';
        const min = salary.min ? `₹${(salary.min / 100000).toFixed(1)}L` : '';
        const max = salary.max ? `₹${(salary.max / 100000).toFixed(1)}L` : '';
        if (min && max) return `${min} - ${max}`;
        return min || max || 'Not specified';
    };

    const formatDate = (date) => {
        if (!date) return 'Not specified';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getDaysRemaining = (deadline) => {
        if (!deadline) return null;
        const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="error-screen">
                <AlertCircle size={48} />
                <h2>Job not found</h2>
                <Button onClick={() => navigate('/student/jobs')}>
                    Back to Jobs
                </Button>
            </div>
        );
    }

    const daysRemaining = getDaysRemaining(job.applicationDeadline);
    const isExpired = daysRemaining === 0;

    return (
        <div className="job-detail-page">
            {/* Header */}
            <div className="job-detail-header">
                <Button 
                    variant="secondary" 
                    icon={ArrowLeft}
                    onClick={() => navigate('/student/jobs')}
                    className="back-btn"
                >
                    Back to Jobs
                </Button>

                <div className="job-header-content">
                    <div className="job-header-left">
                        <div className="company-logo">
                            <Building2 size={32} />
                        </div>
                        <div className="job-header-info">
                            <h1>{job.title}</h1>
                            <div className="job-meta">
                                <span className="company-name">
                                    <Building2 size={16} />
                                    {job.company?.name || 'Company'}
                                </span>
                                <span className="job-type-badge">{job.type?.replace('_', ' ')}</span>
                                <span className={`job-status-badge status-${job.status}`}>
                                    {job.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="job-header-actions">
                        {hasApplied ? (
                            <Button disabled className="applied-btn">
                                <CheckCircle size={18} />
                                Already Applied
                            </Button>
                        ) : isExpired ? (
                            <Button disabled>
                                Application Closed
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleApply} 
                                disabled={applying}
                                icon={Send}
                                size="lg"
                            >
                                {applying ? 'Applying...' : 'Apply Now'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Info Cards */}
            <div className="quick-info-grid">
                <div className="info-card">
                    <div className="info-icon salary-icon">
                        <DollarSign size={20} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">Salary</span>
                        <span className="info-value">{formatSalary(job.salary)}</span>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon location-icon">
                        <MapPin size={20} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">Location</span>
                        <span className="info-value">
                            {job.locations?.join(', ') || 'Not specified'}
                        </span>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon mode-icon">
                        <Briefcase size={20} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">Work Mode</span>
                        <span className="info-value">{job.workMode || 'Not specified'}</span>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon deadline-icon">
                        <Calendar size={20} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">Deadline</span>
                        <span className="info-value">
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="job-detail-content">
                {/* Left Column */}
                <div className="job-detail-main">
                    {/* Description */}
                    <section className="detail-section">
                        <h2><FileText size={20} /> Job Description</h2>
                        <div className="description-content">
                            {job.description?.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </section>

                    {/* Eligibility */}
                    <section className="detail-section">
                        <h2><Target size={20} /> Eligibility Criteria</h2>
                        <div className="eligibility-grid">
                            <div className="eligibility-item">
                                <span className="eligibility-label">Minimum CGPA</span>
                                <span className="eligibility-value">{job.eligibility?.minCgpa || 'Not specified'}</span>
                            </div>
                            <div className="eligibility-item">
                                <span className="eligibility-label">Maximum Backlogs</span>
                                <span className="eligibility-value">{job.eligibility?.maxBacklogs ?? 'Not specified'}</span>
                            </div>
                            {job.eligibility?.minTenthPercentage && (
                                <div className="eligibility-item">
                                    <span className="eligibility-label">10th Percentage</span>
                                    <span className="eligibility-value">{job.eligibility.minTenthPercentage}%+</span>
                                </div>
                            )}
                            {job.eligibility?.minTwelfthPercentage && (
                                <div className="eligibility-item">
                                    <span className="eligibility-label">12th Percentage</span>
                                    <span className="eligibility-value">{job.eligibility.minTwelfthPercentage}%+</span>
                                </div>
                            )}
                        </div>

                        {job.eligibility?.allowedDepartments?.length > 0 && (
                            <div className="eligibility-section">
                                <h4>Allowed Departments</h4>
                                <div className="tags-list">
                                    {job.eligibility.allowedDepartments.map((dept, i) => (
                                        <span key={i} className="tag tag-department">{dept}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {job.eligibility?.allowedBatches?.length > 0 && (
                            <div className="eligibility-section">
                                <h4>Allowed Batches</h4>
                                <div className="tags-list">
                                    {job.eligibility.allowedBatches.map((batch, i) => (
                                        <span key={i} className="tag tag-batch">{batch}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Skills */}
                    {(job.eligibility?.requiredSkills?.length > 0 || job.eligibility?.preferredSkills?.length > 0) && (
                        <section className="detail-section">
                            <h2><Award size={20} /> Skills Required</h2>
                            
                            {job.eligibility?.requiredSkills?.length > 0 && (
                                <div className="skills-section">
                                    <h4>Required Skills</h4>
                                    <div className="tags-list">
                                        {job.eligibility.requiredSkills.map((skill, i) => (
                                            <span key={i} className="tag tag-required">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {job.eligibility?.preferredSkills?.length > 0 && (
                                <div className="skills-section">
                                    <h4>Preferred Skills</h4>
                                    <div className="tags-list">
                                        {job.eligibility.preferredSkills.map((skill, i) => (
                                            <span key={i} className="tag tag-preferred">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Hiring Process */}
                    {job.hiringProcess?.length > 0 && (
                        <section className="detail-section">
                            <h2><TrendingUp size={20} /> Hiring Process</h2>
                            <div className="hiring-process">
                                {job.hiringProcess.map((round, i) => (
                                    <div key={i} className="process-step">
                                        <div className="step-number">{round.round}</div>
                                        <div className="step-content">
                                            <h4>{round.name}</h4>
                                            <p>{round.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="job-detail-sidebar">
                    {/* Apply Card */}
                    <div className="sidebar-card apply-card">
                        <h3>Ready to Apply?</h3>
                        <p>Submit your application now and take the next step in your career.</p>
                        {hasApplied ? (
                            <Button disabled fullWidth className="applied-btn">
                                <CheckCircle size={18} />
                                Already Applied
                            </Button>
                        ) : isExpired ? (
                            <Button disabled fullWidth>
                                Application Closed
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleApply} 
                                disabled={applying}
                                icon={Send}
                                fullWidth
                            >
                                {applying ? 'Applying...' : 'Apply Now'}
                            </Button>
                        )}
                    </div>

                    {/* Job Info Card */}
                    <div className="sidebar-card">
                        <h3>Job Information</h3>
                        <div className="job-info-list">
                            <div className="job-info-item">
                                <span className="info-label">
                                    <Calendar size={16} />
                                    Posted On
                                </span>
                                <span className="info-value">{formatDate(job.publishedAt || job.createdAt)}</span>
                            </div>
                            <div className="job-info-item">
                                <span className="info-label">
                                    <Clock size={16} />
                                    Deadline
                                </span>
                                <span className="info-value">{formatDate(job.applicationDeadline)}</span>
                            </div>
                            {job.joiningDate && (
                                <div className="job-info-item">
                                    <span className="info-label">
                                        <Calendar size={16} />
                                        Joining Date
                                    </span>
                                    <span className="info-value">{formatDate(job.joiningDate)}</span>
                                </div>
                            )}
                            {job.expectedHires && (
                                <div className="job-info-item">
                                    <span className="info-label">
                                        <Users size={16} />
                                        Openings
                                    </span>
                                    <span className="info-value">{job.expectedHires} positions</span>
                                </div>
                            )}
                            <div className="job-info-item">
                                <span className="info-label">
                                    <Users size={16} />
                                    Applications
                                </span>
                                <span className="info-value">{job.stats?.totalApplications || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Company Card */}
                    <div className="sidebar-card">
                        <h3>About Company</h3>
                        <div className="company-info">
                            <div className="company-logo-large">
                                <Building2 size={40} />
                            </div>
                            <h4>{job.company?.name}</h4>
                            {job.company?.industry && (
                                <p className="company-industry">{job.company.industry}</p>
                            )}
                            {job.company?.description && (
                                <p className="company-description">{job.company.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
