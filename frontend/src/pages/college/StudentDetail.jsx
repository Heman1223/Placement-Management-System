import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { 
    ArrowLeft, Edit, Mail, Phone, Calendar, 
    Award, Briefcase, FileText, Github, 
    Linkedin, Globe, CheckCircle, XCircle,
    User, BookOpen, Link as LinkIcon, Plus,
    ShieldAlert, ChevronRight, Eye, Star
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

    const handleToggleStar = async () => {
        try {
            await collegeAPI.toggleStarStudent(id);
            const newStatus = !student.isStarStudent;
            setStudent({ ...student, isStarStudent: newStatus });
            toast.success(newStatus ? 'Marked as Star Student' : 'Removed from Star Students');
        } catch (error) {
            toast.error('Failed to update star status');
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
                <div className="flex gap-2">
                    <button 
                        className={`edit-profile-btn ${student.isStarStudent ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}`}
                        onClick={handleToggleStar}
                    >
                        <Star size={16} className={student.isStarStudent ? 'fill-current' : ''} />
                        <span>{student.isStarStudent ? 'Star Student' : 'Mark Star'}</span>
                    </button>
                    <Link to={`/college/students/${id}/edit`}>
                        <button className="edit-profile-btn">
                            <Edit size={16} />
                            <span>Edit Profile</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Profile Summary Card */}
            <div className="profile-summary-card">
                <div className="summary-left-group flex items-center gap-10">
                    <div className="summary-avatar-container">
                        <div className="summary-avatar">
                            {student.profilePicture ? (
                                <img src={student.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {student.name?.firstName?.[0] || 'S'}{student.name?.lastName?.[0] || 'T'}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="summary-info">
                        <div className="flex items-center gap-3">
                            <h1 className="student-fullname">{student.name?.firstName || ''} {student.name?.lastName || ''}</h1>
                            {student.isStarStudent && (
                                <div className="p-1 px-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                                    <Star size={10} className="fill-current" />
                                    STAR
                                </div>
                            )}
                        </div>
                        <p className="student-meta">{student.department || 'N/A'} • Batch {student.batch || 'N/A'}</p>
                        
                        <div className="summary-badges">
                            {student.isVerified ? (
                                <div className="p-badge badge-verified">
                                    <div className="dot" />
                                    <span>VERIFIED</span>
                                </div>
                            ) : student.isRejected ? (
                                <div className="p-badge badge-rejected" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <div className="dot" style={{ background: '#ef4444' }} />
                                    <span>REJECTED</span>
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
                </div>

                {student.isRejected && student.rejectionReason && (
                    <div className="rejection-reason-note mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg max-w-md">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">Rejection Note:</span>
                        <p className="text-sm text-slate-300">{student.rejectionReason}</p>
                    </div>
                )}

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
                                        <Eye size={18} className="text-blue-400" />
                                        <div className="flex-1">
                                            <div className="res-label">RESUME</div>
                                            <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" className="res-link">View Resume</a>
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

                {/* About Me Card */}
                {student.about && (
                    <div className="grid-card-v2 full-width">
                        <div className="card-header-v2">
                            <div className="card-icon-box blue">
                                <FileText size={20} />
                            </div>
                            <h3>ABOUT ME</h3>
                        </div>
                        <div className="card-body-v2">
                            <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                                {student.about}
                            </p>
                        </div>
                    </div>
                )}

                {/* Projects Card */}
                {student.projects?.length > 0 && (
                    <div className="grid-card-v2 full-width">
                        <div className="card-header-v2">
                            <div className="card-icon-box purple">
                                <Briefcase size={20} />
                            </div>
                            <h3>PROJECTS</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="space-y-6">
                                {student.projects.map((project, index) => (
                                    <div key={index} className="resource-item-v2 block">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-xl font-bold text-white">{project.title}</h4>
                                            <div className="flex gap-3">
                                                {project.githubUrl && (
                                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                                                        <Github size={18} />
                                                    </a>
                                                )}
                                                {project.projectUrl && (
                                                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                                                        <Globe size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-slate-400 mb-4">{project.description}</p>
                                        {project.technologies && (
                                            <div className="flex flex-wrap gap-2">
                                                {(typeof project.technologies === 'string' 
                                                    ? project.technologies.split(',') 
                                                    : Array.isArray(project.technologies) 
                                                        ? project.technologies 
                                                        : []
                                                ).map((tech, i) => (
                                                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-slate-400">
                                                        {typeof tech === 'string' ? tech.trim() : tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Certificates Card */}
                {student.certifications?.length > 0 && (
                    <div className="grid-card-v2 full-width">
                        <div className="card-header-v2">
                            <div className="card-icon-box emerald">
                                <Award size={20} />
                            </div>
                            <h3>CERTIFICATIONS</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.certifications.map((cert, index) => (
                                    <div key={index} className="resource-item-v2 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Award size={24} className="text-emerald-400" />
                                            <div className="flex-1">
                                                <div className="res-label">CERTIFICATE</div>
                                                <div className="font-bold text-white">{cert.name}</div>
                                            </div>
                                        </div>
                                        {cert.fileUrl && (
                                            <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all">
                                                <Eye size={18} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
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
