import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Phone, Globe, MapPin, Briefcase, Users, DollarSign, Calendar, Building2 } from 'lucide-react';
import './AdminPages.css';

const CompanyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);

    useEffect(() => {
        fetchCompanyDetails();
        fetchCompanyJobs();
    }, [id]);

    const fetchCompanyDetails = async () => {
        try {
            const response = await superAdminAPI.getAgencyDetails(id);
            setCompany(response.data.data);
        } catch (error) {
            toast.error('Failed to load company details');
            navigate('/admin/companies');
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyJobs = async () => {
        setJobsLoading(true);
        try {
            // Get jobs for this company using super admin endpoint
            const response = await superAdminAPI.getAllJobs({ company: id, limit: 50 });
            setJobs(response.data.data.jobs || []);
        } catch (error) {
            console.error('Failed to load jobs');
        } finally {
            setJobsLoading(false);
        }
    };

    if (loading) {
        return <div className="admin-page"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <button onClick={() => navigate('/admin/companies')} className="back-btn">
                        <ArrowLeft size={20} />
                        Back to Companies
                    </button>
                    <h1>{company.name}</h1>
                    <p className="subtitle">{company.type?.replace('_', ' ')}</p>
                </div>
            </div>

            {/* Company Info */}
            <div className="info-cards">
                <div className="info-card">
                    <div className="info-card-header">
                        <h3>Company Information</h3>
                    </div>
                    <div className="info-card-body">
                        <div className="info-row">
                            <Briefcase size={18} />
                            <span><strong>Industry:</strong> {company.industry}</span>
                        </div>
                        <div className="info-row">
                            <Users size={18} />
                            <span><strong>Size:</strong> {company.size || 'Not specified'}</span>
                        </div>
                        {company.website && (
                            <div className="info-row">
                                <Globe size={18} />
                                <a href={company.website} target="_blank" rel="noopener noreferrer">
                                    {company.website}
                                </a>
                            </div>
                        )}
                        {company.headquarters && (
                            <div className="info-row">
                                <MapPin size={18} />
                                <span>{company.headquarters.city}, {company.headquarters.state}</span>
                            </div>
                        )}
                        {company.description && (
                            <div className="info-row">
                                <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                                    {company.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-card-header">
                        <h3>Contact Person</h3>
                    </div>
                    <div className="info-card-body">
                        <div className="info-row">
                            <Users size={18} />
                            <span>{company.contactPerson?.name || 'Not specified'}</span>
                        </div>
                        <div className="info-row">
                            <Mail size={18} />
                            <span>{company.contactPerson?.email || company.user?.email}</span>
                        </div>
                        {company.contactPerson?.phone && (
                            <div className="info-row">
                                <Phone size={18} />
                                <span>{company.contactPerson.phone}</span>
                            </div>
                        )}
                        <div className="info-row">
                            <span><strong>Status:</strong> {company.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        {company.isSuspended && (
                            <div className="info-row">
                                <span style={{ color: 'var(--error-600)' }}>
                                    <strong>Suspended</strong>
                                    {company.suspensionReason && `: ${company.suspensionReason}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Agency Access Info (if placement agency) */}
            {company.type === 'placement_agency' && company.agencyAccess && (
                <div className="card">
                    <div className="card-header">
                        <h3>Agency Access Details</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Colleges with Access</span>
                                <span className="value">{company.agencyAccess.allowedColleges?.length || 0}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Download Limit</span>
                                <span className="value">
                                    {company.agencyAccess.downloadCount || 0} / {company.agencyAccess.downloadLimit || 0}
                                </span>
                            </div>
                            {company.agencyAccess.accessExpiryDate && (
                                <div className="info-item">
                                    <span className="label">Access Expires</span>
                                    <span className="value">
                                        {new Date(company.agencyAccess.accessExpiryDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {company.agencyAccess.allowedColleges?.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <h4 style={{ marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
                                    Assigned Colleges:
                                </h4>
                                <div className="tags-list">
                                    {company.agencyAccess.allowedColleges.map((ac) => (
                                        <span key={ac.college._id} className="tag">
                                            <Building2 size={14} />
                                            {ac.college.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Job Postings */}
            <div className="card">
                <div className="card-header">
                    <h3>Job Postings</h3>
                    <span className="badge">{jobs.length} Jobs</span>
                </div>
                <div className="card-body">
                    {jobsLoading ? (
                        <div className="loading">Loading jobs...</div>
                    ) : jobs.length === 0 ? (
                        <div className="empty-state">No job postings yet</div>
                    ) : (
                        <div className="jobs-grid">
                            {jobs.map((job) => (
                                <div key={job._id} className="job-card">
                                    <div className="job-card-header">
                                        <h4>{job.title}</h4>
                                        <span className={`status-badge status-${job.status}`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="job-card-body">
                                        <div className="job-info-row">
                                            <MapPin size={16} />
                                            <span>{job.location}</span>
                                        </div>
                                        <div className="job-info-row">
                                            <Briefcase size={16} />
                                            <span>{job.type}</span>
                                        </div>
                                        {job.salary && (
                                            <div className="job-info-row">
                                                <DollarSign size={16} />
                                                <span>
                                                    ₹{job.salary.min?.toLocaleString()} - ₹{job.salary.max?.toLocaleString()} {job.salary.currency}
                                                </span>
                                            </div>
                                        )}
                                        <div className="job-info-row">
                                            <Calendar size={16} />
                                            <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {job.deadline && (
                                            <div className="job-info-row">
                                                <Calendar size={16} />
                                                <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="job-card-footer">
                                        <div className="job-stats">
                                            <span>
                                                <Users size={14} />
                                                {job.applicants?.length || 0} Applicants
                                            </span>
                                            {job.eligibility?.minCGPA && (
                                                <span>Min CGPA: {job.eligibility.minCGPA}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyDetail;
