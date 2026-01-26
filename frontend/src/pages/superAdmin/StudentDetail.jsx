import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import Button from '../../components/common/Button';
import {
    ArrowLeft, Mail, Phone, Calendar, Award, Briefcase,
    FileText, Github, Linkedin, Globe, CheckCircle, XCircle,
    GraduationCap, Star, MapPin, Building2, ExternalLink, Download, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../college/StudentDetail.css'; // Reusing CSS

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        try {
            const response = await superAdminAPI.getStudent(id);
            setStudent(response.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load student details');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStar = async () => {
        try {
            await superAdminAPI.toggleStarStudent(id);
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
        return <div className="p-8 text-center text-slate-400">Student not found</div>;
    }

    return (
        <div className="student-detail-page p-8">
            {/* Header */}
            <div className="detail-header mb-8 flex items-center justify-between">
                <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/students')}>
                    Back to Students
                </Button>
                <button 
                    className={`nav-btn-v2 ${student.isStarStudent ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-white/5 text-slate-400 border-white/10'} border px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all`}
                    onClick={handleToggleStar}
                >
                    <Star size={18} className={student.isStarStudent ? 'fill-current' : ''} />
                    <span className="font-bold text-sm">{student.isStarStudent ? 'Star Student' : 'Mark Star'}</span>
                </button>
            </div>

            {/* Profile Overview */}
            <div className="profile-overview bg-[#1e293b] border border-white/5 rounded-2xl p-8 mb-8 flex items-start gap-8">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-3xl font-bold flex-shrink-0">
                        {student.name?.firstName?.[0]}{student.name?.lastName?.[0]}
                    </div>
                    {student.isStarStudent && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-2 border-4 border-[#1e293b]">
                            <Star size={16} className="text-white fill-white" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">{student.name?.firstName} {student.name?.lastName}</h1>
                        {student.isStarStudent && (
                            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
                                Star Student
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 text-lg mb-4">{student.department} • Batch {student.batch}</p>
                    <div className="flex gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            student.isVerified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                            student.isRejected ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                            {student.isVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {student.isVerified ? 'Verified' : student.isRejected ? 'Rejected' : 'Pending'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${student.placementStatus === 'placed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                student.placementStatus === 'in_process' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                            {student.placementStatus?.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Mail size={20} className="text-blue-500" /> Contact Information
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-slate-400">Email</span>
                            <span className="text-white font-medium">{student.email}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-slate-400">Phone</span>
                            <span className="text-white font-medium">{student.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-slate-400">College</span>
                            <span className="text-white font-medium text-right">{student.college?.name}</span>
                        </div>
                        {(student.city || student.state) && (
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <MapPin size={16} /> Location
                                </span>
                                <span className="text-white font-medium">{student.city}{student.city && student.state ? ', ' : ''}{student.state}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* About Me */}
                {student.about && (
                    <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 lg:col-span-2">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <FileText size={20} className="text-amber-500" /> About Candidate
                        </h2>
                        <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                            {student.about}
                        </p>
                    </div>
                )}

                {/* Academic Information */}
                <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Award size={20} className="text-purple-500" /> Academic Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                            <span className="block text-slate-400 text-sm mb-1">Roll Number</span>
                            <span className="block text-white font-bold text-lg">{student.rollNumber}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                            <span className="block text-slate-400 text-sm mb-1">CGPA</span>
                            <span className="block text-blue-400 font-bold text-lg">{student.cgpa?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                            <span className="block text-slate-400 text-sm mb-1">Backlogs</span>
                            <span className="block text-white font-bold text-lg">{student.backlogs?.active || 0}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                            <span className="block text-slate-400 text-sm mb-1">Percentage</span>
                            <span className="block text-white font-bold text-lg">{student.percentage ? `${student.percentage}%` : 'N/A'}</span>
                        </div>
                        {student.course && (
                            <div className="p-4 bg-white/5 rounded-xl text-center col-span-2">
                                <span className="block text-slate-400 text-sm mb-1">Course</span>
                                <span className="block text-white font-bold text-lg">{student.course}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Education History */}
                {(student.education?.tenth || student.education?.twelfth || student.education?.diploma) && (
                    <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <GraduationCap size={20} className="text-indigo-500" /> Education History
                        </h2>
                        <div className="space-y-4">
                            {student.education?.tenth && (
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white font-semibold">10th Standard</span>
                                        <span className="text-emerald-400 font-bold">{student.education.tenth.percentage}%</span>
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        {student.education.tenth.board} • {student.education.tenth.yearOfPassing}
                                    </div>
                                </div>
                            )}
                            {student.education?.twelfth && (
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white font-semibold">12th Standard</span>
                                        <span className="text-emerald-400 font-bold">{student.education.twelfth.percentage}%</span>
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        {student.education.twelfth.board} • {student.education.twelfth.stream} • {student.education.twelfth.yearOfPassing}
                                    </div>
                                </div>
                            )}
                            {student.education?.diploma && (
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white font-semibold">Diploma</span>
                                        <span className="text-emerald-400 font-bold">{student.education.diploma.percentage}%</span>
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        {student.education.diploma.branch} • {student.education.diploma.yearOfPassing}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Profile Links */}
                <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-cyan-500" /> Profile Links
                    </h2>
                    <div className="space-y-3">
                        {student.resumeUrl && (
                            <a
                                href={student.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                            >
                                <span className="text-white flex items-center gap-2">
                                    <Eye size={18} className="text-blue-400" /> Resume
                                </span>
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-blue-400" />
                            </a>
                        )}
                        {student.linkedinUrl && (
                            <a
                                href={student.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                            >
                                <span className="text-white flex items-center gap-2">
                                    <Linkedin size={18} className="text-blue-500" /> LinkedIn
                                </span>
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-blue-400" />
                            </a>
                        )}
                        {student.githubUrl && (
                            <a
                                href={student.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                            >
                                <span className="text-white flex items-center gap-2">
                                    <Github size={18} className="text-slate-300" /> GitHub
                                </span>
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-blue-400" />
                            </a>
                        )}
                        {student.portfolioUrl && (
                            <a
                                href={student.portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                            >
                                <span className="text-white flex items-center gap-2">
                                    <Globe size={18} className="text-purple-400" /> Portfolio
                                </span>
                                <ExternalLink size={16} className="text-slate-500 group-hover:text-blue-400" />
                            </a>
                        )}
                        {!student.resumeUrl && !student.linkedinUrl && !student.githubUrl && !student.portfolioUrl && (
                            <p className="text-slate-500 text-center py-4">No profile links added</p>
                        )}
                    </div>
                </div>

                {/* Skills */}
                {student.skills && student.skills.length > 0 && (
                    <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Award size={20} className="text-emerald-500" /> Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {student.skills.map((skill, index) => (
                                <span key={index} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {student.certifications && student.certifications.length > 0 && (
                    <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Award size={20} className="text-amber-500" /> Certifications
                        </h2>
                        <div className="space-y-3">
                            {student.certifications.map((cert, index) => (
                                <div key={index} className="p-4 bg-white/5 rounded-xl">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-white font-semibold">{cert.name}</span>
                                        {cert.credentialUrl && (
                                            <a
                                                href={cert.credentialUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300"
                                                title="View credential"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        {cert.issuer}{cert.issueDate ? ` • ${new Date(cert.issueDate).toLocaleDateString()}` : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {student.projects && student.projects.length > 0 && (
                    <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 lg:col-span-2">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-pink-500" /> Projects
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.projects.map((project, index) => (
                                <div key={index} className="p-4 bg-white/5 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-white font-semibold">{project.title}</h3>
                                        <div className="flex gap-2">
                                            {project.projectUrl && (
                                                <a
                                                    href={project.projectUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300"
                                                    title="View project"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                            {project.githubUrl && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-slate-400 hover:text-slate-300"
                                                    title="View on GitHub"
                                                >
                                                    <Github size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {project.description && (
                                        <p className="text-slate-400 text-sm mb-3">{project.description}</p>
                                    )}
                                    {project.technologies && (
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(project.technologies) 
                                                ? project.technologies 
                                                : (typeof project.technologies === 'string' ? project.technologies.split(',') : [])
                                            ).map((tech, i) => (
                                                <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium">
                                                    {typeof tech === 'string' ? tech.trim() : tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Placement Details (if placed) */}
                {student.placementStatus === 'placed' && student.placementDetails && (
                    <div className="bg-[#1e293b] border border-emerald-500/20 rounded-2xl p-6 lg:col-span-2">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-emerald-500" /> Placement Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-emerald-500/10 rounded-xl text-center">
                                <span className="block text-slate-400 text-sm mb-1">Company</span>
                                <span className="block text-white font-bold text-lg">{student.placementDetails.company || 'N/A'}</span>
                            </div>
                            <div className="p-4 bg-emerald-500/10 rounded-xl text-center">
                                <span className="block text-slate-400 text-sm mb-1">Role</span>
                                <span className="block text-white font-bold text-lg">{student.placementDetails.role || 'N/A'}</span>
                            </div>
                            <div className="p-4 bg-emerald-500/10 rounded-xl text-center">
                                <span className="block text-slate-400 text-sm mb-1">Package</span>
                                <span className="block text-emerald-400 font-bold text-lg">
                                    {student.placementDetails.package ? `₹${student.placementDetails.package} LPA` : 'N/A'}
                                </span>
                            </div>
                            <div className="p-4 bg-emerald-500/10 rounded-xl text-center">
                                <span className="block text-slate-400 text-sm mb-1">Joining Date</span>
                                <span className="block text-white font-bold text-lg">
                                    {student.placementDetails.joiningDate
                                        ? new Date(student.placementDetails.joiningDate).toLocaleDateString()
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                        {student.placementDetails.offerLetterUrl && (
                            <div className="mt-4">
                                <a
                                    href={student.placementDetails.offerLetterUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                >
                                    <Eye size={16} /> View Offer Letter
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetail;
