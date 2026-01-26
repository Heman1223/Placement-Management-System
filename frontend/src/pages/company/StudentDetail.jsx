import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyAPI, jobAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { 
    ArrowLeft, Mail, Phone, Calendar, 
    Award, Briefcase, FileText, Github, 
    Linkedin, Globe, CheckCircle, XCircle,
    GraduationCap, BookOpen, Link as LinkIcon, 
    Eye, Star, ExternalLink, Sparkles, User, ChevronRight, Plus, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import './StudentDetail.css';

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [shortlistModal, setShortlistModal] = useState(false);
    const [inviteModal, setInviteModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState('');
    const [selectedJobForInvite, setSelectedJobForInvite] = useState('');
    const [shortlistNotes, setShortlistNotes] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [isShortlisting, setIsShortlisting] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        fetchStudent();
        fetchJobs();
    }, [id]);

    const fetchJobs = async () => {
        try {
            const response = await jobAPI.getJobs({ status: 'open' });
            setJobs(response.data.data.jobs);
        } catch (error) {
            console.error('Failed to fetch jobs');
        }
    };

    const fetchStudent = async () => {
        try {
            const response = await companyAPI.getStudent(id);
            setStudent(response.data.data);
        } catch (error) {
            toast.error('Failed to load student details');
            navigate('/company/shortlist');
        } finally {
            setLoading(false);
        }
    };

    const handleShortlist = async () => {
        if (!selectedJob) {
            toast.error('Please select a job drive');
            return;
        }

        setIsShortlisting(true);
        try {
            await companyAPI.shortlist(id, selectedJob, shortlistNotes);
            toast.success('Student moved to selection pipeline!');
            setShortlistModal(false);
            fetchStudent();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to shortlist');
        } finally {
            setIsShortlisting(false);
        }
    };

    const handleInvite = async () => {
        if (!selectedJobForInvite) {
            toast.error('Please select a job drive');
            return;
        }

        setIsInviting(true);
        try {
            await companyAPI.inviteToRegister(id, selectedJobForInvite, inviteMessage);
            toast.success('Recruitment offer sent successfully!');
            setInviteModal(false);
        } catch (error) {
            toast.error('Failed to send recruitment offer');
        } finally {
            setIsInviting(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    if (!student) {
        return <div className="error-state">Student not found</div>;
    }

    const percentage = student.profileCompleteness || 0;

    return (
        <div className="student-detail-page">
            {/* Header */}
            <header className="profile-header">
                <button className="back-circle-btn" onClick={() => navigate('/company/shortlist')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="header-title">STUDENT DOSSIER</h2>
                <div className="flex gap-3">
                    {student.applications?.length > 0 ? (
                        <Button 
                            onClick={() => {
                                setSelectedJob(student.applications[0].jobId);
                                setShortlistModal(true);
                            }}
                            icon={Star}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6"
                        >
                            Shortlist Candidate
                        </Button>
                    ) : (
                        <Button 
                            onClick={() => setInviteModal(true)}
                            icon={Sparkles}
                            className="bg-slate-700 hover:bg-slate-600 text-white rounded-2xl px-6"
                        >
                            Send Recruitment Offer
                        </Button>
                    )}
                </div>
            </header>

            {/* Profile Summary Card */}
            <div className="profile-summary-card">
                <div className="summary-left-group">
                    <div className="summary-avatar">
                        {student.profilePicture ? (
                            <img src={student.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="avatar-placeholder">
                                {student.name?.firstName?.[0] || 'S'}{student.name?.lastName?.[0] || 'T'}
                            </div>
                        )}
                    </div>
                    
                    <div className="summary-info">
                        <h1 className="student-fullname">{student.name?.firstName} {student.name?.lastName}</h1>
                        <p className="student-meta">{student.department} • Batch {student.batch}</p>
                        
                        <div className="summary-badges">
                            <div className="p-badge badge-verified">
                                <div className="dot" />
                                <span>VERIFIED PROFILE</span>
                            </div>
                            <div className="p-badge badge-status">
                                <span>{student.placementStatus?.replace('_', ' ') || 'AVAILABLE'}</span>
                            </div>
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
                                stroke="#3b82f6"
                                strokeWidth="8"
                                strokeDasharray={`${percentage * 2.64} 264`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="circle-text">
                            <span className="p-val">{percentage}%</span>
                            <span className="p-lab">PROFILE COMPLETE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Info Grid */}
            <div className="info-grid-v2">
                {/* About Section */}
                {student.about && (
                    <div className="grid-card-v2 full-width">
                        <div className="card-header-v2">
                            <div className="card-icon-box blue">
                                <FileText size={20} />
                            </div>
                            <h3>PROFESSIONAL SUMMARY</h3>
                        </div>
                        <div className="card-body-v2">
                            <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                                {student.about}
                            </p>
                        </div>
                    </div>
                )}

                {/* Contact & Professional Links */}
                <div className="grid-card-v2">
                    <div className="card-header-v2">
                        <div className="card-icon-box blue">
                            <Mail size={20} />
                        </div>
                        <h3>CONTACT & REACH</h3>
                    </div>
                    <div className="card-body-v2">
                        <div className="data-item-v2">
                            <span className="data-label">Official Email</span>
                            <span className="data-value">{student.email}</span>
                        </div>
                        <div className="data-item-v2">
                            <span className="data-label">Phone Connection</span>
                            <span className="data-value">{student.phone || 'N/A'}</span>
                        </div>
                        
                        <div className="resources-list-v2 mt-4">
                            {student.linkedinUrl && (
                                <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="resource-item-v2">
                                    <Linkedin size={20} className="text-blue-500" />
                                    <div className="flex-1">
                                        <div className="res-label">LINKEDIN</div>
                                        <div className="res-link">Professional Profile</div>
                                    </div>
                                    <ExternalLink size={16} className="text-slate-600" />
                                </a>
                            )}
                            {student.githubUrl && (
                                <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="resource-item-v2">
                                    <Github size={20} className="text-slate-200" />
                                    <div className="flex-1">
                                        <div className="res-label">GITHUB</div>
                                        <div className="res-link">Code Portfolio</div>
                                    </div>
                                    <ExternalLink size={16} className="text-slate-600" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Academic Background */}
                <div className="grid-card-v2">
                    <div className="card-header-v2">
                        <div className="card-icon-box emerald">
                            <GraduationCap size={20} />
                        </div>
                        <h3>ACADEMIC RECORD</h3>
                    </div>
                    <div className="card-body-v2">
                        <div className="data-item-v2">
                            <span className="data-label">Cumulative GPA</span>
                            <span className="data-value">{student.cgpa?.toFixed(2) || 'N/A'} Score</span>
                        </div>
                        <div className="data-item-v2">
                            <span className="data-label">Institutional ID</span>
                            <span className="data-value">{student.rollNumber}</span>
                        </div>
                        <div className="data-item-v2">
                            <span className="data-label">Standing</span>
                            <span className="data-value">
                                {student.backlogs?.active === 0 ? 'Clear Record' : `${student.backlogs?.active} Active Backlogs`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                {student.skills?.length > 0 && (
                    <div className="grid-card-v2 full-width">
                        <div className="card-header-v2">
                            <div className="card-icon-box blue">
                                <Sparkles size={20} />
                            </div>
                            <h3>TECHNICAL EXPERTISE</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="skills-container">
                                {student.skills.map((skill, index) => (
                                    <span key={index} className="skill-pill">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Projects Showcase */}
                {student.projects?.length > 0 && (
                    <div className="grid-card-v2 full-width">
                        <div className="card-header-v2">
                            <div className="card-icon-box purple">
                                <Briefcase size={20} />
                            </div>
                            <h3>NOTABLE PROJECTS</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {student.projects.map((project, index) => (
                                    <div key={index} className="resource-item-v2 flex-col !items-start gap-4">
                                        <div className="flex justify-between w-full">
                                            <h4 className="text-xl font-bold text-white">{project.title}</h4>
                                            <div className="flex gap-3">
                                                {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github size={18} /></a>}
                                                {project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noopener noreferrer"><Globe size={18} /></a>}
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed">{project.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(project.technologies) ? project.technologies : project.technologies.split(',')).map((tech, i) => (
                                                <span key={i} className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-slate-500 border border-white/5">{tech.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Drive Registrations */}
                {student.applications?.length > 0 && (
                    <div className="grid-card-v2 full-width">
                        <div className="card-header-v2">
                            <div className="card-icon-box blue">
                                <Target size={20} />
                            </div>
                            <h3>DRIVE PARTICIPATION</h3>
                        </div>
                        <div className="card-body-v2">
                            <div className="drive-reg-grid">
                                {student.applications.map((app, index) => (
                                    <div key={index} className="reg-card">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-white font-bold">{app.jobTitle}</h4>
                                            <span className={`status-badge-inline status-${app.status} text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20`}>
                                                {app.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="reg-type">Job Code: {app.jobId.slice(-6).toUpperCase()}</div>
                                        <div className="text-[10px] text-slate-500 mt-2">Registered {new Date(app.appliedAt).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Certifications & Resume */}
                <div className="grid-card-v2 full-width">
                    <div className="card-header-v2">
                        <div className="card-icon-box emerald">
                            <Award size={20} />
                        </div>
                        <h3>VERIFIED CREDENTIALS</h3>
                    </div>
                    <div className="card-body-v2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {student.resumeUrl && (
                                <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" className="resource-item-v2 !bg-blue-600/10 !border-blue-600/20">
                                    <FileText size={24} className="text-blue-500" />
                                    <div className="flex-1">
                                        <div className="res-label">CURRICULUM VITAE</div>
                                        <div className="res-link">Download CV</div>
                                    </div>
                                </a>
                            )}
                            {student.certifications?.map((cert, index) => (
                                <a key={index} href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="resource-item-v2">
                                    <Award size={24} className="text-emerald-500" />
                                    <div className="flex-1">
                                        <div className="res-label">CERTIFICATE</div>
                                        <div className="res-link">{cert.name}</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <footer className="flex justify-end gap-3 p-12 bg-white/5 border-t border-white/5 rounded-t-[3rem] mt-12">
                <Button variant="secondary" onClick={() => navigate('/company/shortlist')} className="rounded-2xl px-8">
                    Close Dossier
                </Button>
                {student.applications?.length > 0 ? (
                    <Button onClick={() => setShortlistModal(true)} icon={Star} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10">
                        Confirm Shortlist
                    </Button>
                ) : (
                    <Button onClick={() => setInviteModal(true)} icon={Mail} className="bg-slate-700 hover:bg-slate-600 text-white rounded-2xl px-10">
                        Send Recruitment Offer
                    </Button>
                )}
            </footer>

            {/* Modals remain the same but use the new theme classes */}
            <Modal isOpen={shortlistModal} onClose={() => setShortlistModal(false)} title="Move to Pipeline" size="md">
                <div className="p-6">
                    <p className="text-slate-400 mb-8">Move <strong>{student.name?.firstName}</strong> to your selection pipeline.</p>
                    <div className="space-y-6">
                        <div className="form-group">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Target Drive</label>
                            <select className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-white" value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
                                <option value="">-- Select Drive --</option>
                                {student.applications?.map(app => <option key={app.jobId} value={app.jobId}>{app.jobTitle}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Verification Notes</label>
                            <textarea className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-white" value={shortlistNotes} onChange={(e) => setShortlistNotes(e.target.value)} placeholder="Evaluation summary..." rows={4} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-10">
                        <Button variant="secondary" onClick={() => setShortlistModal(false)}>Cancel</Button>
                        <Button onClick={handleShortlist} loading={isShortlisting} disabled={isShortlisting} icon={Star}>Confirm Move</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={inviteModal} onClose={() => setInviteModal(false)} title="Send Recruitment Offer" size="md">
                <div className="p-6">
                    <p className="text-slate-400 mb-8">Invite <strong>{student.name?.firstName}</strong> to register for your job drive.</p>
                    <div className="space-y-6">
                        <div className="form-group">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Target Job Drive</label>
                            <select className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-white" value={selectedJobForInvite} onChange={(e) => setSelectedJobForInvite(e.target.value)}>
                                <option value="">-- Choose Job --</option>
                                {jobs.map(job => <option key={job._id} value={job._id}>{job.title} ({job.type})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Personalized Message</label>
                            <textarea className="w-full bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-white" value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} placeholder="Recruitment message..." rows={4} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-10">
                        <Button variant="secondary" onClick={() => setInviteModal(false)}>Cancel</Button>
                        <Button onClick={handleInvite} loading={isInviting} disabled={isInviting} icon={Mail}>Send Offer</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StudentDetail;
