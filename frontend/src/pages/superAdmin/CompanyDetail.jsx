import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Briefcase, Users, Globe, MapPin,
    Mail, Phone, Clock, CheckCircle, XCircle,
    Ban, ShieldAlert, Building2, Calendar, DollarSign,
    TrendingUp, Award, Layers, ArrowUpRight, Target, ExternalLink,
    MoreVertical, UserCheck
} from 'lucide-react';
import Button from '../../components/common/Button';
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
            <div className="admin-page flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[#e6d8c3] border-t-[#6b3f1d] rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-[#8b6f5a] font-bold uppercase tracking-widest text-[10px]">Accessing Corporate Profile...</p>
                </div>
            </div>
        );
    }

    const activeJobs = jobs.filter(job => job.status === 'active' || job.status === 'open').length;
    const totalApplicants = jobs.reduce((acc, job) => acc + (job.applicants?.length || 0), 0);

    return (
        <div className="admin-page">
            <div className="flex justify-between items-start mb-10">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#e6d8c3] overflow-hidden">
                        {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-2" />
                        ) : (
                            <Building2 size={32} className="text-[#6b3f1d]" />
                        )}
                    </div>
                    <div>
                        <button
                            onClick={() => navigate('/admin/companies')}
                            className="flex items-center gap-2 text-[#6b3f1d] font-bold text-[10px] uppercase tracking-widest hover:gap-3 transition-all mb-3"
                        >
                            <ArrowLeft size={14} /> Back to Ecosystem
                        </button>
                        <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-2">{company.name}</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-[#8b6f5a] font-bold uppercase tracking-widest bg-[#faf6ef] px-2 py-1 rounded border border-[#e6d8c3]">
                                {company.type === 'placement_agency' ? 'Recruitment Node' : 'Corporate Hub'} • {company.industry}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${company.isSuspended ? 'bg-[#fdeaea] border-[#f5c2c7] text-[#b42318]' :
                                company.isApproved ? 'bg-[#e6f4ea] border-[#b7e4c7] text-[#1e7d4d]' :
                                    'bg-[#fffbeb] border-[#fef3c7] text-[#b45309]'
                                }`}>
                                {company.isSuspended ? 'Operational Block' :
                                    company.isApproved ? 'Verified Partner' : 'Registry Review'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="!rounded-lg !border-[#e6d8c3] !text-[#6b3f1d]">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Modify Profile</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{jobs.length}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Total Postings</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{activeJobs}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Live Channels</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{totalApplicants}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Capture Intent</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm border-l-4 border-l-[#c6a85e]">
                    <div className="text-2xl font-black text-[#6b3f1d] tracking-tight">{company.stats?.totalHires || 0}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Full Acquisitions</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                <div className="lg:col-span-2 space-y-12">
                    <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                            <Target size={18} className="text-[#6b3f1d]" /> Organization DNA
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-70">Industry Sector</span>
                                    <p className="text-[11px] font-bold text-[#4a2c15] uppercase">{company.industry}</p>
                                </div>
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-70">Operational Scale</span>
                                    <p className="text-[11px] font-bold text-[#4a2c15] uppercase">{company.size || 'NOT SPECIFIED'}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-70">Global Headquarters</span>
                                    <p className="text-[11px] font-bold text-[#4a2c15] uppercase">
                                        {company.headquarters ? `${company.headquarters.city}, ${company.headquarters.state}` : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-70">Digital Extraction Node</span>
                                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#6b3f1d] hover:underline uppercase break-all">
                                        {company.website || 'N/A'}
                                    </a>
                                </div>
                            </div>
                        </div>
                        {company.description && (
                            <div className="mt-10 pt-8 border-t border-[#faf6ef]">
                                <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-4 opacity-70">Executive Summary</span>
                                <p className="text-[11px] font-bold text-[#8b6f5a] leading-relaxed uppercase opacity-80 max-w-2xl">
                                    {company.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-[#4a2c15] uppercase tracking-tight">Active Recruitment Channels</h2>
                            <p className="text-[10px] font-bold text-[#c6a85e] uppercase tracking-widest mt-1">Live Intelligence Feeds</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {jobsLoading ? (
                                <div className="col-span-full py-12 text-center">
                                    <div className="w-8 h-8 border-2 border-[#e6d8c3] border-t-[#6b3f1d] rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="col-span-full py-16 text-center bg-[#faf6ef] rounded-xl border border-dashed border-[#e6d8c3]">
                                    <p className="text-[#8b6f5a] font-bold uppercase tracking-widest text-[10px]">No active channels detected in current cycle</p>
                                </div>
                            ) : (
                                jobs.map((job) => (
                                    <div key={job._id} className="p-8 bg-white rounded-xl border border-[#e6d8c3] hover:border-[#c6a85e]/30 transition-all border-l-4 border-l-[#e6d8c3] hover:border-l-[#6b3f1d] shadow-sm group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-sm font-bold uppercase tracking-tight text-[#4a2c15] mb-2 group-hover:text-[#6b3f1d] transition-colors">{job.title}</h4>
                                                <span className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${job.status === 'open' ? 'bg-[#e6f4ea] border-[#b7e4c7] text-[#1e7d4d]' : 'bg-[#faf6ef] text-[#8b6f5a] border-[#e6d8c3]'
                                                    }`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <div className="w-10 h-10 rounded-lg bg-[#faf6ef] flex items-center justify-center text-[#6b3f1d] border border-[#e6d8c3]">
                                                <Briefcase size={18} />
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">
                                                <MapPin size={14} className="text-[#c6a85e]" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">
                                                <Clock size={14} className="text-[#c6a85e]" />
                                                Deadline: {new Date(job.deadline).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-[#faf6ef] flex items-center justify-between">
                                            <span className="text-[8px] font-bold text-[#8b6f5a] opacity-40 uppercase tracking-widest">PULSE: {new Date(job.createdAt).toLocaleDateString()}</span>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-[#6b3f1d] uppercase tracking-widest">
                                                <Users size={14} />
                                                {job.applicants?.length || 0} Intent Captured
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                            <UserCheck size={18} className="text-[#6b3f1d]" /> Node Authority
                        </h2>
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-14 h-14 rounded bg-[#6b3f1d] text-white flex items-center justify-center text-xl font-black shadow-lg">
                                {company.contactPerson?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-tight text-[#4a2c15] leading-none mb-1.5">{company.contactPerson?.name || 'REP IDENTITY UNSET'}</h3>
                                <p className="text-[9px] font-bold text-[#c6a85e] uppercase tracking-widest">{company.contactPerson?.designation || 'OPERATIONAL LEAD'}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                <span className="text-[8px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-60">Authentication Sector</span>
                                <p className="text-[10px] font-bold text-[#4a2c15] break-all">{company.contactPerson?.email || company.user?.email}</p>
                            </div>
                            {company.contactPerson?.phone && (
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[8px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-60">Direct Extraction Link</span>
                                    <p className="text-[10px] font-bold text-[#4a2c15]">{company.contactPerson.phone}</p>
                                </div>
                            )}
                        </div>
                        {company.isSuspended && (
                            <div className="mt-8 p-5 bg-[#fdeaea] border border-[#f5c2c7] rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <ShieldAlert size={16} className="text-[#b42318]" />
                                    <span className="text-[10px] font-bold text-[#b42318] uppercase tracking-widest">Operational Restriction</span>
                                </div>
                                <p className="text-[10px] font-bold text-[#b42318]/70 uppercase leading-relaxed tracking-tight">
                                    {company.suspensionReason || 'SYSTEM VIOLATION DETECTED'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-[#6b3f1d] p-8 rounded-xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-10 border-b border-white/10 pb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-[#c6a85e]" /> Performance Index
                        </h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/10 rounded-lg border border-white/5">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#e6d8c3] opacity-60 block mb-2">Acquisitions</span>
                                    <p className="text-2xl font-black text-white">{company.stats?.totalHires || 0}</p>
                                </div>
                                <div className="p-4 bg-white/10 rounded-lg border border-white/5">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#e6d8c3] opacity-60 block mb-2">Conversion</span>
                                    <p className="text-2xl font-black text-white">
                                        {totalApplicants > 0 ? ((company.stats?.totalHires / totalApplicants) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-[#4a2c15] rounded-xl border border-white/5">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-[#e6d8c3] opacity-60 block mb-2">Integration Pulse</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white">{new Date(company.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetail;
