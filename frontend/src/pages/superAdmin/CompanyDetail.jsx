import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
    ArrowLeft, Briefcase, Users, Globe, MapPin, 
    Mail, Phone, Clock, CheckCircle, XCircle, 
    Ban, ShieldAlert, Building2, Calendar, DollarSign,
    TrendingUp, Award, Layers
} from 'lucide-react';
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
            const response = await superAdminAPI.getAllJobs({ company: id, limit: 100 });
            setJobs(response.data.data.jobs || []);
        } catch (error) {
            console.error('Failed to load jobs');
        } finally {
            setJobsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium">Loading partner profile...</p>
                </div>
            </div>
        );
    }

    // Calculate stats
    const activeJobs = jobs.filter(job => job.status === 'active' || job.status === 'open').length;
    const totalApplicants = jobs.reduce((acc, job) => acc + (job.applicants?.length || 0), 0);

    return (
        <div className="dashboard p-8">
            {/* Premium Header Banner */}
            <div className="premium-header-banner mb-12">
                <div className="premium-header-text">
                    <button 
                        onClick={() => navigate('/admin/companies')} 
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4 text-sm font-bold"
                    >
                        <ArrowLeft size={16} />
                        Back to Partners
                    </button>
                    <h1>{company.name}</h1>
                    <p className="flex items-center gap-2 mt-2">
                        {company.type === 'placement_agency' ? 'Recruitment Partner' : 'Corporate Partner'} • 
                        <span className="opacity-80">{company.industry}</span>
                    </p>
                </div>
                <div className={`px-6 py-3 rounded-xl flex items-center gap-3 border ${
                    company.isSuspended ? 'bg-red-500/10 border-red-500/20' :
                    company.isApproved ? 'bg-emerald-500/10 border-emerald-500/20' : 
                    company.isRejected ? 'bg-red-500/10 border-red-500/20' :
                    'bg-amber-500/10 border-amber-500/20'
                }`}>
                    {company.isSuspended ? <Ban size={20} className="text-red-500" /> :
                     company.isApproved ? <CheckCircle size={20} className="text-emerald-500" /> : 
                     company.isRejected ? <XCircle size={20} className="text-red-500" /> :
                     <Clock size={20} className="text-amber-500" />}
                    
                    <span className={`text-sm font-black uppercase tracking-wider ${
                        company.isSuspended ? 'text-red-500' :
                        company.isApproved ? 'text-emerald-500' : 
                        company.isRejected ? 'text-red-500' : 
                        'text-amber-500'
                    }`}>
                        {company.isSuspended ? 'SUSPENDED' :
                         company.isApproved ? 'VERIFIED PARTNER' : 
                         company.isRejected ? 'REJECTED' : 
                         'PENDING REVIEW'}
                    </span>
                </div>
            </div>

            {/* Premium Statistics Grid */}
            <div className="premium-stat-grid mb-16">
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="premium-stat-icon bg-blue-500/10 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <Briefcase size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Total Postings</span>
                        <span className="stat-value">{jobs.length}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="premium-stat-icon bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <Layers size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Active Jobs</span>
                        <span className="stat-value">{activeJobs}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="premium-stat-icon bg-purple-500/10 text-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                        <Users size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Total Applicants</span>
                        <span className="stat-value">{totalApplicants}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="premium-stat-icon bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <Award size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Hires Made</span>
                        <span className="stat-value">{company.stats?.totalHires || 0}</span>
                    </div>
                </motion.div>
            </div>

            {/* Information Cards */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
            >
                {/* Organization Details */}
                <div className="content-section bg-[#1e293b] border border-white/5 rounded-[2rem] p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Building2 size={20} className="text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Organization Profile</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                <Globe size={16} className="text-slate-400" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Industry</span>
                                <span className="text-sm font-medium text-white">{company.industry}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                <Users size={16} className="text-slate-400" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Organization Size</span>
                                <span className="text-sm font-medium text-white">{company.size || 'Not specified'}</span>
                            </div>
                        </div>
                        {company.headquarters && (
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <MapPin size={16} className="text-slate-400" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Headquarters</span>
                                    <span className="text-sm font-medium text-white">{company.headquarters.city}, {company.headquarters.state}</span>
                                </div>
                            </div>
                        )}
                        {company.website && (
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <Globe size={16} className="text-slate-400" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Website</span>
                                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                        {company.website}
                                    </a>
                                </div>
                            </div>
                        )}
                        {company.description && (
                            <div className="pt-6 border-t border-white/5 mt-6">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">About</span>
                                <p className="text-sm text-slate-400 leading-relaxed">{company.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="content-section bg-[#1e293b] border border-white/5 rounded-[2rem] p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Users size={20} className="text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Point of Contact</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-lg font-bold text-white">
                                {company.contactPerson?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{company.contactPerson?.name || 'Not Specified'}</h3>
                                <p className="text-sm text-slate-400">{company.contactPerson?.designation || 'Representative'}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                <Mail size={18} className="text-emerald-500" />
                                <span className="text-sm text-slate-300">{company.contactPerson?.email || company.user?.email}</span>
                            </div>
                            {company.contactPerson?.phone && (
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                    <Phone size={18} className="text-emerald-500" />
                                    <span className="text-sm text-slate-300">{company.contactPerson.phone}</span>
                                </div>
                            )}
                        </div>

                        {company.isSuspended && (
                            <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShieldAlert size={18} className="text-red-500" />
                                    <span className="text-sm font-bold text-red-500 uppercase tracking-wider">Account Suspended</span>
                                </div>
                                <p className="text-sm text-red-400/80 pl-8">
                                    Reason: {company.suspensionReason || 'Violation of platform policies'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Job Listings */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="content-section bg-[#1e293b] border border-white/5 rounded-[2rem] p-10 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Briefcase size={20} className="text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Recent Job Postings</h2>
                    </div>
                    <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-400">
                        {jobs.length} Active Listings
                    </span>
                </div>

                {jobsLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                        <Briefcase size={40} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400 font-medium">No job postings available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div key={job._id} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{job.title}</h4>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                            job.status === 'open' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                                            'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                        }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                                        <Briefcase size={14} />
                                    </div>
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <MapPin size={14} className="text-slate-500" />
                                        {job.location}
                                    </div>
                                    {job.salary && (
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <DollarSign size={14} className="text-slate-500" />
                                            ₹{job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Calendar size={14} className="text-slate-500" />
                                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-slate-500">
                                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1">
                                        <Users size={12} />
                                        {job.applicants?.length || 0} Applicants
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CompanyDetail;
