import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft, User, Mail, Phone, GraduationCap,
    MapPin, Calendar, BookOpen, Briefcase, Award,
    CheckCircle, Clock, ShieldAlert, Star, ExternalLink,
    Code, Globe, Linkedin, Github, FileText, Target,
    Building, TrendingUp, ArrowUpRight, Shield
} from 'lucide-react';
import Button from '../../components/common/Button';
import './AdminPages.css';

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStudentDetails();
    }, [id]);

    const fetchStudentDetails = async () => {
        try {
            const response = await superAdminAPI.getStudentDetails(id);
            setStudent(response.data.data.student);
            setStats(response.data.data.stats);
        } catch (error) {
            toast.error('Failed to load student details');
            navigate('/admin/students');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStar = async () => {
        try {
            await superAdminAPI.toggleStarStudent(student._id);
            setStudent(prev => ({ ...prev, isStarStudent: !prev.isStarStudent }));
            toast.success(student.isStarStudent ? 'Removed from Star Students' : 'Marked as Star Student');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="admin-page flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[#e6d8c3] border-t-[#6b3f1d] rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-[#8b6f5a] font-bold uppercase tracking-widest text-[10px]">Accessing Talent Dossier...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="flex justify-between items-start mb-10">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-xl bg-white border border-[#e6d8c3] flex items-center justify-center overflow-hidden shadow-sm">
                        {student.profilePicture ? (
                            <img src={student.profilePicture} alt={student.name.firstName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[#faf6ef] flex items-center justify-center">
                                <User size={32} className="text-[#6b3f1d]" />
                            </div>
                        )}
                    </div>
                    <div>
                        <button
                            onClick={() => navigate('/admin/students')}
                            className="flex items-center gap-2 text-[#6b3f1d] font-bold text-[10px] uppercase tracking-widest hover:gap-3 transition-all mb-3"
                        >
                            <ArrowLeft size={14} /> Back to Registry
                        </button>
                        <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-2">{student.name.firstName} {student.name.lastName}</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-[#8b6f5a] font-bold uppercase tracking-widest bg-[#faf6ef] px-2 py-1 rounded border border-[#e6d8c3]">
                                ID: {student.rollNumber} • {student.department}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleToggleStar}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border ${student.isStarStudent
                            ? 'bg-[#c6a85e] border-[#c6a85e] text-white shadow-lg'
                            : 'bg-white border-[#e6d8c3] text-[#8b6f5a] hover:border-[#c6a85e]'
                            }`}
                    >
                        <Star size={18} fill={student.isStarStudent ? 'currentColor' : 'none'} />
                    </button>
                    <div className={`px-4 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${student.isVerified ? 'bg-[#e6f4ea] border-[#b7e4c7] text-[#1e7d4d]' : 'bg-[#fffbeb] border-[#fef3c7] text-[#b45309]'
                        }`}>
                        {student.isVerified ? 'Verified Asset' : 'Registry Review'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{student.cgpa}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Merit Index (CGPA)</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{student.applications?.length || 0}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Captured Intents</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{student.projects?.length || 0}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Active Deployments</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm border-l-4 border-l-[#c6a85e]">
                    <div className="text-2xl font-black text-[#6b3f1d] tracking-tight">{student.batch}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Batch Cycle</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                <div className="lg:col-span-2 space-y-12">
                    <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                            <Target size={18} className="text-[#6b3f1d]" /> Academic Profile
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-1 opacity-70">Institution</span>
                                    <p className="text-[11px] font-bold text-[#4a2c15] uppercase">{student.college?.name}</p>
                                </div>
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-1 opacity-70">Department Sector</span>
                                    <p className="text-[11px] font-bold text-[#4a2c15] uppercase">{student.department}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-1 opacity-70">Merit Index (CGPA)</span>
                                    <p className="text-[11px] font-bold text-[#4a2c15] uppercase">{student.cgpa} Cumulative</p>
                                </div>
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-1 opacity-70">Cycle Code (Batch)</span>
                                    <p className="text-[11px] font-bold text-[#4a2c15] uppercase">{student.batch}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                            <Code size={18} className="text-[#c6a85e]" /> Technical Spectrum (Skills)
                        </h2>
                        <div className="flex flex-wrap gap-2.5">
                            {student.skills?.length > 0 ? (
                                student.skills.map((skill, index) => (
                                    <span key={index} className="px-4 py-2 bg-[#faf6ef] border border-[#e6d8c3] rounded-lg text-[9px] font-bold text-[#6b3f1d] uppercase tracking-widest hover:border-[#c6a85e] transition-colors">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest italic opacity-60">No spectral data detected in this node</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                            <Activity size={18} className="text-[#6b3f1d]" /> Development Log (Projects)
                        </h2>
                        <div className="space-y-6">
                            {student.projects?.length > 0 ? (
                                student.projects.map((project, index) => (
                                    <div key={index} className="p-6 bg-[#faf6ef] rounded-xl border border-[#e6d8c3] border-l-4 border-l-[#e6d8c3] hover:border-l-[#6b3f1d] transition-all group shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-[13px] font-black uppercase tracking-tight text-[#4a2c15] group-hover:text-[#6b3f1d] transition-colors">{project.title}</h4>
                                            {project.link && (
                                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#6b3f1d] hover:text-white transition-all">
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[#8b6f5a] font-bold uppercase leading-relaxed mb-6 opacity-80">{project.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies?.map((tech, i) => (
                                                <span key={i} className="text-[8px] font-black text-[#4a2c15] bg-white border border-[#e6d8c3] px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 text-center bg-[#faf6ef] rounded-xl border border-dashed border-[#e6d8c3]">
                                    <p className="text-[#8b6f5a] font-bold uppercase tracking-widest text-[10px]">No active deployments identified</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                            <Mail size={18} className="text-[#6b3f1d]" /> Communication Vector
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                <span className="text-[8px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-60">Email Identity</span>
                                <p className="text-[10px] font-bold truncate lowercase text-[#4a2c15]">{student.email}</p>
                            </div>
                            <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                <span className="text-[8px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-60">Primary Link (Phone)</span>
                                <p className="text-[10px] font-bold text-[#4a2c15]">{student.phone}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-[#faf6ef] space-y-4">
                            {student.socialLinks?.linkedin && (
                                <a href={student.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-[#faf6ef] rounded-xl border border-[#e6d8c3] hover:border-[#6b3f1d] transition-all group">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] group-hover:bg-[#6b3f1d] group-hover:text-white transition-all shadow-sm">
                                        <Linkedin size={16} />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#4a2c15] uppercase tracking-widest">LinkedIn Profile</span>
                                    <ArrowUpRight size={14} className="ml-auto text-[#8b6f5a] opacity-40 group-hover:opacity-100 group-hover:text-[#6b3f1d] transition-all" />
                                </a>
                            )}
                            {student.socialLinks?.github && (
                                <a href={student.socialLinks.github} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-[#faf6ef] rounded-xl border border-[#e6d8c3] hover:border-[#6b3f1d] transition-all group">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-[#e6d8c3] flex items-center justify-center text-[#4a2c15] group-hover:bg-[#4a2c15] group-hover:text-white transition-all shadow-sm">
                                        <Github size={16} />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#4a2c15] uppercase tracking-widest">Global Repository</span>
                                    <ArrowUpRight size={14} className="ml-auto text-[#8b6f5a] opacity-40 group-hover:opacity-100 group-hover:text-[#4a2c15] transition-all" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#6b3f1d] p-8 rounded-xl shadow-xl border border-[#4a2c15] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-10 border-b border-white/10 pb-4 flex items-center gap-2">
                            <Shield size={18} className="text-[#c6a85e]" /> Verification Node
                        </h2>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-[#e6d8c3] opacity-60">Authority ID</span>
                                <p className="text-[11px] font-bold text-white uppercase tracking-tight mt-1">{student.rollNumber}</p>
                            </div>
                            <div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-[#e6d8c3] opacity-60">Activation Phase</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white mt-1 flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${student.isVerified ? 'bg-[#1e7d4d]' : 'bg-[#b45309]'} animate-pulse`}></div>
                                    {student.isVerified ? 'Verified Asset' : 'Registry Review'}
                                </p>
                            </div>
                            <div className="pt-8 border-t border-white/10 mt-6">
                                {student.resume ? (
                                    <a href={student.resume} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full bg-[#c6a85e] text-[#4a2c15] text-[10px] font-black uppercase tracking-widest py-4 rounded-lg shadow-lg hover:bg-white hover:text-[#6b3f1d] transition-all group">
                                        <FileText size={16} className="transition-transform group-hover:scale-110" />
                                        Access Talent Dossier
                                    </a>
                                ) : (
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 text-center py-4 border border-white/5 rounded-lg bg-black/10">
                                        No Dossier Detected
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
