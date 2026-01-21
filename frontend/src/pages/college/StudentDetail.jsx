import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { ArrowLeft, Edit, Mail, Phone, Calendar, Award, Briefcase, FileText, Github, Linkedin, Globe, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './StudentDetail.css';

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completeness, setCompleteness] = useState(null);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        try {
            const response = await collegeAPI.getStudent(id);
            setStudent(response.data.data);
            setCompleteness(response.data.data.profileCompleteness);
        } catch (error) {
            toast.error('Failed to load student details');
            navigate('/college/students');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    if (!student) {
        return <div className="error-state">Student not found</div>;
    }

    return (
        <div className="student-detail-page">
            {/* Header */}
            <div className="detail-header">
                <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/college/students')}>
                    Back to Students
                </Button>
                <Link to={`/college/students/${id}/edit`}>
                    <Button icon={Edit}>Edit Profile</Button>
                </Link>
            </div>

            {/* Profile Overview */}
            <div className="profile-overview">
                <div className="profile-main">
                    <div className="profile-avatar">
                        {student.name.firstName.charAt(0)}{student.name.lastName.charAt(0)}
                    </div>
                    <div className="profile-info">
                        <h1>{student.name.firstName} {student.name.lastName}</h1>
                        <p className="profile-subtitle">{student.department} • Batch {student.batch}</p>
                        <div className="profile-badges">
                            {student.isVerified ? (
                                <span className="badge badge-success">
                                    <CheckCircle size={14} /> Verified
                                </span>
                            ) : (
                                <span className="badge badge-warning">
                                    <XCircle size={14} /> Pending Verification
                                </span>
                            )}
                            <span className={`badge badge-${student.placementStatus}`}>
                                {student.placementStatus.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Completeness */}
                <div className="profile-completeness-card">
                    <div className="completeness-circle-small">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="10"
                                strokeDasharray={`${(completeness?.percentage || 0) * 2.827} 282.7`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="completeness-text-small">
                            <span className="percentage">{completeness?.percentage || 0}%</span>
                        </div>
                    </div>
                    <div>
                        <h3>Profile Complete</h3>
                        <p>Keep profile updated for better opportunities</p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="detail-grid">
                {/* Contact Information */}
                <div className="detail-card">
                    <h2>Contact Information</h2>
                    <div className="info-list">
                        <div className="info-item">
                            <Mail size={18} />
                            <div>
                                <span className="info-label">Email</span>
                                <span className="info-value">{student.email}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <Phone size={18} />
                            <div>
                                <span className="info-label">Phone</span>
                                <span className="info-value">{student.phone || 'Not provided'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <Calendar size={18} />
                            <div>
                                <span className="info-label">Date of Birth</span>
                                <span className="info-value">
                                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="detail-card">
                    <h2>Academic Information</h2>
                    <div className="info-list">
                        <div className="info-item">
                            <Award size={18} />
                            <div>
                                <span className="info-label">Roll Number</span>
                                <span className="info-value">{student.rollNumber}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <Award size={18} />
                            <div>
                                <span className="info-label">CGPA</span>
                                <span className="info-value">{student.cgpa?.toFixed(2) || 'Not provided'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <Award size={18} />
                            <div>
                                <span className="info-label">Percentage</span>
                                <span className="info-value">{student.percentage ? `${student.percentage}%` : 'Not provided'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <Award size={18} />
                            <div>
                                <span className="info-label">Backlogs</span>
                                <span className="info-value">
                                    Active: {student.backlogs?.active || 0}, History: {student.backlogs?.history || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills */}
                {student.skills && student.skills.length > 0 && (
                    <div className="detail-card">
                        <h2>Skills</h2>
                        <div className="skills-list">
                            {student.skills.map((skill, index) => (
                                <span key={index} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Links */}
                <div className="detail-card">
                    <h2>Links & Resources</h2>
                    <div className="info-list">
                        {student.resumeUrl && (
                            <div className="info-item">
                                <FileText size={18} />
                                <div>
                                    <span className="info-label">Resume</span>
                                    <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" className="info-link">
                                        View Resume
                                    </a>
                                </div>
                            </div>
                        )}
                        {student.linkedinUrl && (
                            <div className="info-item">
                                <Linkedin size={18} />
                                <div>
                                    <span className="info-label">LinkedIn</span>
                                    <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="info-link">
                                        View Profile
                                    </a>
                                </div>
                            </div>
                        )}
                        {student.githubUrl && (
                            <div className="info-item">
                                <Github size={18} />
                                <div>
                                    <span className="info-label">GitHub</span>
                                    <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="info-link">
                                        View Profile
                                    </a>
                                </div>
                            </div>
                        )}
                        {student.portfolioUrl && (
                            <div className="info-item">
                                <Globe size={18} />
                                <div>
                                    <span className="info-label">Portfolio</span>
                                    <a href={student.portfolioUrl} target="_blank" rel="noopener noreferrer" className="info-link">
                                        View Portfolio
                                    </a>
                                </div>
                            </div>
                        )}
                        {!student.resumeUrl && !student.linkedinUrl && !student.githubUrl && !student.portfolioUrl && (
                            <p className="empty-text">No links provided</p>
                        )}
                    </div>
                </div>

                {/* Education History */}
                {student.education && (
                    <div className="detail-card full-width">
                        <h2>Education History</h2>
                        <div className="education-grid">
                            {student.education.tenth && (
                                <div className="education-item">
                                    <h4>10th Grade</h4>
                                    <p>Board: {student.education.tenth.board || 'Not provided'}</p>
                                    <p>Percentage: {student.education.tenth.percentage ? `${student.education.tenth.percentage}%` : 'Not provided'}</p>
                                    <p>Year: {student.education.tenth.yearOfPassing || 'Not provided'}</p>
                                </div>
                            )}
                            {student.education.twelfth && (
                                <div className="education-item">
                                    <h4>12th Grade</h4>
                                    <p>Board: {student.education.twelfth.board || 'Not provided'}</p>
                                    <p>Stream: {student.education.twelfth.stream || 'Not provided'}</p>
                                    <p>Percentage: {student.education.twelfth.percentage ? `${student.education.twelfth.percentage}%` : 'Not provided'}</p>
                                    <p>Year: {student.education.twelfth.yearOfPassing || 'Not provided'}</p>
                                </div>
                            )}
                            {student.education.diploma && (
                                <div className="education-item">
                                    <h4>Diploma</h4>
                                    <p>Branch: {student.education.diploma.branch || 'Not provided'}</p>
                                    <p>Percentage: {student.education.diploma.percentage ? `${student.education.diploma.percentage}%` : 'Not provided'}</p>
                                    <p>Year: {student.education.diploma.yearOfPassing || 'Not provided'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {student.projects && student.projects.length > 0 && (
                    <div className="detail-card full-width">
                        <h2>Projects</h2>
                        <div className="projects-list">
                            {student.projects.map((project, index) => (
                                <div key={index} className="project-item">
                                    <h4>{project.title}</h4>
                                    <p>{project.description}</p>
                                    {project.technologies && project.technologies.length > 0 && (
                                        <div className="project-tech">
                                            {project.technologies.map((tech, i) => (
                                                <span key={i} className="tech-tag">{tech}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="project-links">
                                        {project.projectUrl && (
                                            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">View Project</a>
                                        )}
                                        {project.githubUrl && (
                                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Placement Details */}
                {student.placementStatus === 'placed' && student.placementDetails && (
                    <div className="detail-card full-width placement-card">
                        <h2><Briefcase size={20} /> Placement Details</h2>
                        <div className="placement-info">
                            <div className="placement-item">
                                <span className="placement-label">Company</span>
                                <span className="placement-value">{student.placementDetails.company}</span>
                            </div>
                            <div className="placement-item">
                                <span className="placement-label">Role</span>
                                <span className="placement-value">{student.placementDetails.role}</span>
                            </div>
                            <div className="placement-item">
                                <span className="placement-label">Package</span>
                                <span className="placement-value">{student.placementDetails.package} LPA</span>
                            </div>
                            {student.placementDetails.joiningDate && (
                                <div className="placement-item">
                                    <span className="placement-label">Joining Date</span>
                                    <span className="placement-value">
                                        {new Date(student.placementDetails.joiningDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetail;
