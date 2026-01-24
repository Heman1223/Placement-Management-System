import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { 
    ArrowLeft, Edit, Mail, Phone, Calendar, 
    Award, Briefcase, FileText, Github, 
    Linkedin, Globe, CheckCircle, XCircle,
    User, BookOpen, Link as LinkIcon, Plus,
    ShieldAlert, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import './StudentDetail.css';

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [placementActivity, setPlacementActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completeness, setCompleteness] = useState(null);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        try {
            const [studentRes, activityRes] = await Promise.all([
                collegeAPI.getStudent(id),
                collegeAPI.getStudentPlacementActivity(id)
            ]);
            setStudent(studentRes.data.data);
            setCompleteness(studentRes.data.data.profileCompleteness);
            setPlacementActivity(activityRes.data.data.timeline);
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

    const percentage = completeness?.percentage || 0;

    return (
        <div className="student-detail-page">
            {/* Design Header */}
            <div className="profile-header">
                <button className="back-circle-btn" onClick={() => navigate('/college/students')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="header-title">STUDENT PROFILE</h2>
                <Link to={`/college/students/${id}/edit`}>
                    <button className="edit-profile-btn">
                        <Edit size={16} />
                        <span>Edit Profile</span>
                    </button>
                </Link>
            </div>

            {/* Profile Summary Card */}
            <div className="profile-summary-card">
                <div className="summary-left">
                    <h1 className="student-fullname">{student.name.firstName} {student.name.lastName}</h1>
                    <p className="student-meta">{student.department} • Batch {student.batch}</p>
                    
                    <div className="summary-badges">
                        {student.isVerified ? (
                            <div className="p-badge badge-verified">
                                <div className="dot" />
                                <span>VERIFIED</span>
                            </div>
                        ) : (
                            <div className="p-badge badge-pending">
                                <div className="dot" />
                                <span>PENDING VERIFICATION</span>
                            </div>
                        )}
                        <div className="p-badge badge-status">
                            <span>{student.placementStatus?.replace('_', ' ') || 'NOT PLACED'}</span>
                        </div>
                    </div>
                </div>

                <div className="summary-right">
                    <div className="completeness-circle-lg">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="42"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="8"
                                strokeDasharray={`${percentage * 2.64} 264`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="circle-text">
                            <span className="p-val">{percentage}%</span>
                            <span className="p-lab">COMPLETE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Info Grid */}
            <div className="info-grid-v2">
                {/* Contact Card */}
                <div className="grid-card-v2">
                    <div className="card-header-v2">
                        <div className="card-icon-box blue">
                            <User size={20} />
                        </div>
                        <h3>CONTACT</h3>
                    </div>
                    <div className="card-body-v2">
                        <div className="data-item-v2">
                            <span className="data-label">EMAIL</span>
                            <span className="data-value">{student.email}</span>
                        </div>
                        <div className="data-item-v2">
                            <span className="data-label">PHONE</span>
                            <span className="data-value">{student.phone || 'Not provided'}</span>
                        </div>
                        <div className="data-item-v2">
                            <span className="data-label">DOB</span>
                            <span className="data-value">
                                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not provided'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Academic Card */}
                <div className="grid-card-v2">
                    <div className="card-header-v2">
                        <div className="card-icon-box emerald">
                            <BookOpen size={20} />
                        </div>
                        <h3>ACADEMIC</h3>
                    </div>
                    <div className="card-body-v2">
                        <div className="data-item-v2">
                            <span className="data-label">ROLL NO.</span>
                            <span className="data-value">{student.rollNumber}</span>
                        </div>
                        <div className="data-item-v2">
                            <span className="data-label">CGPA</span>
                            <span className="data-value">{student.cgpa?.toFixed(2) || 'Not provided'}</span>
                        </div>
                        <div className="data-item-v2">
                            <span className="data-label">BACKLOGS</span>
                            <span className="data-value">Active: {student.backlogs?.active || 0} • History: {student.backlogs?.history || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Links & Resources */}
                <div className="grid-card-v2 full-width">
                    <div className="card-header-v2">
                        <div className="card-icon-box purple">
                            <LinkIcon size={20} />
                        </div>
                        <h3 className="flex-1">LINKS & RESOURCES</h3>
                        <Link to={`/college/students/${id}/edit`} className="add-resource-btn">
                            <Plus size={14} />
                            <span>Add</span>
                        </Link>
                    </div>
                    <div className="card-body-v2">
                        {(student.resumeUrl || student.linkedinUrl || student.githubUrl || student.portfolioUrl) ? (
                            <div className="resources-list-v2">
                                {student.resumeUrl && (
                                    <div className="resource-item-v2">
                                        <FileText size={18} className="text-blue-400" />
                                        <div className="flex-1">
                                            <div className="res-label">RESUME</div>
                                            <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" className="res-link">View Student Resume</a>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-600" />
                                    </div>
                                )}
                                {student.linkedinUrl && (
                                    <div className="resource-item-v2">
                                        <Linkedin size={18} className="text-blue-500" />
                                        <div className="flex-1">
                                            <div className="res-label">LINKEDIN</div>
                                            <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="res-link">LinkedIn Profile</a>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-600" />
                                    </div>
                                )}
                                {student.githubUrl && (
                                    <div className="resource-item-v2">
                                        <Github size={18} className="text-slate-300" />
                                        <div className="flex-1">
                                            <div className="res-label">GITHUB</div>
                                            <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="res-link">GitHub Repository</a>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-600" />
                                    </div>
                                )}
                                {student.portfolioUrl && (
                                    <div className="resource-item-v2">
                                        <Globe size={18} className="text-emerald-400" />
                                        <div className="flex-1">
                                            <div className="res-label">PORTFOLIO</div>
                                            <a href={student.portfolioUrl} target="_blank" rel="noopener noreferrer" className="res-link">Personal Website</a>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-600" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="centered py-8">
                                <div className="empty-resource">
                                    <LinkIcon size={48} className="empty-icon" />
                                    <p>No links provided yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Next Steps Section */}
            <div className="next-steps-section">
                <h2 className="section-title">Next Steps</h2>
                <div className="steps-list">
                    <div className="step-item completed">
                        <div className="step-check">
                            <CheckCircle size={20} />
                        </div>
                        <span className="step-text">Verify Email Address</span>
                    </div>
                    <div className="step-item">
                        <div className="step-check empty" />
                        <span className="step-text">Upload Academic Resume</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
