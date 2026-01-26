import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, studentAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { 
    ArrowLeft, Briefcase, MapPin, Calendar, DollarSign, Users, 
    Clock, CheckCircle, Building2, Award, Target, TrendingUp,
    FileText, Send, AlertCircle, ChevronRight, MapPinned
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
            const response = await studentAPI.getJob(id);
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
            const applications = response.data.data;
            const applied = applications.some(app => app.job?._id === id);
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
            toast.success('Registered successfully!');
            setHasApplied(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register for job');
        } finally {
            setApplying(false);
        }
    };

    const formatSalary = (salary) => {
        if (!salary) return 'Not disclosed';
        const { min, max } = salary;
        
        if (min && max) {
            const minLPA = (min / 100000).toFixed(1);
            const maxLPA = (max / 100000).toFixed(1);
            return `${minLPA} - ${maxLPA} LPA`;
        }
        return 'Not disclosed';
    };

    const formatInternshipSalary = (stipend) => {
        if (!stipend || !stipend.amount) return 'Not specified';
        return `₹${stipend.amount.toLocaleString('en-IN')} / month`;
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
                <button className="back-btn" onClick={() => navigate('/student/jobs')}>
                    <ArrowLeft size={18} />
                    Back to Jobs
                </button>
            </div>
        );
    }

    const daysRemaining = getDaysRemaining(job.applicationDeadline);
    const isExpired = daysRemaining === 0;

    return (
        <div className="job-detail-page">
            <header className="job-detail-header">
                <button className="back-btn" onClick={() => navigate('/student/jobs')}>
                    <ArrowLeft size={18} />
                    Back to Jobs
                </button>

                <div className="job-header-content">
                    <div className="job-header-left">
                        <div className="company-logo">
                            {job.company?.logo ? (
                                <img src={job.company.logo} alt={job.company.name} />
                            ) : (
                                <Building2 size={32} color="#60a5fa" />
                            )}
                        </div>
                        <div className="job-header-info">
                            <h1>{job.title}</h1>
                            <div className="job-meta">
                                <span className="company-name">
                                    <Building2 size={18} />
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
                            <div className="btn-status-done">
                                <CheckCircle size={18} />
                                Registered
                            </div>
                        ) : isExpired ? (
                            <div className="btn-status-closed">
                                Registration Closed
                            </div>
                        ) : (
                            <Button 
                                onClick={handleApply} 
                                loading={applying}
                                className="btn-register-accent"
                            >
                                Register Now
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="quick-info-grid">
                <div className="info-card">
                    <div className="info-icon salary-icon">
                        <DollarSign size={20} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">Allowance</span>
                        <span className="info-value">
                            {job.type === 'internship' 
                                ? formatInternshipSalary(job.stipend) 
                                : formatSalary(job.salary)}
                        </span>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon location-icon">
                        <MapPinned size={20} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">Location</span>
                        <span className="info-value">
                            {job.locations?.join(', ') || 'Remote'}
                        </span>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon mode-icon">
                        <Briefcase size={20} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">Work Mode</span>
                        <span className="info-value">{job.workMode || 'Hybrid'}</span>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon deadline-icon">
                        <Clock size={20} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">{job.type === 'internship' ? 'Stint Duration' : 'Decision Date'}</span>
                        <span className="info-value">
                            {job.type === 'internship' && job.duration?.value 
                                ? `${job.duration.value} ${job.duration.unit}` 
                                : daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="job-detail-content">
                <div className="job-detail-main">
                    <section className="detail-section">
                        <h2><FileText size={22} color="#3b82f6" /> Job Description</h2>
                        <div className="description-content">
                            {job.description?.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </section>

                    {job.requirements?.length > 0 && (
                        <section className="detail-section">
                            <h2><Target size={22} color="#10b981" /> Full Requirements</h2>
                            <ul className="requirements-list-student">
                                {job.requirements.map((req, i) => (
                                    <li key={i}>{req}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className="detail-section">
                        <h2><Award size={22} color="#f59e0b" /> Eligibility Criteria</h2>
                        <div className="eligibility-grid">
                            <div className="eligibility-item">
                                <span className="eligibility-label">Minimum CGPA</span>
                                <span className="eligibility-value">{job.eligibility?.minCgpa || '6.0'}</span>
                            </div>
                            <div className="eligibility-item">
                                <span className="eligibility-label">Max Backlogs</span>
                                <span className="eligibility-value">{job.eligibility?.maxBacklogs ?? '0'}</span>
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
                        <h3>Ready to Register?</h3>
                        <p>Submit your registration now and take the next step in your career.</p>
                        {hasApplied ? (
                            <div className="btn-status-done" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                                <CheckCircle size={20} />
                                Already Registered
                            </div>
                        ) : isExpired ? (
                            <Button disabled fullWidth>
                                Registration Closed
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleApply} 
                                disabled={applying}
                                icon={Send}
                                fullWidth
                            >
                                {applying ? 'Registering...' : 'Register'}
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
                                {job.company?.logo ? (
                                    <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Building2 size={40} />
                                )}
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
