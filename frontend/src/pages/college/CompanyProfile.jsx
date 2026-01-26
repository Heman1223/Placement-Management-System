import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Globe, Mail, Phone, Calendar, ArrowLeft, MapPin, Award, Users, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { collegeAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CompanyProfile = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [company, setCompany] = useState(location.state?.company || null);
    const [loading, setLoading] = useState(!company);

    useEffect(() => {
        if (!company) {
            fetchCompanyDetails();
        }
    }, [id]);

    const fetchCompanyDetails = async () => {
        try {
            // Since we don't have a direct "get single company" endpoint for college,
            // we'll try to find it in connected companies or request details
            // For now, let's fetch connected companies and find it
            const response = await collegeAPI.getConnectedCompanies();
            if (response.data.success) {
                const found = response.data.data.find(c => c._id === id);
                if (found) {
                    setCompany(found);
                } else {
                    toast.error('Company not found or access denied');
                    navigate('/college/partnerships');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load company details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!company) return null;

    return (
        <div className="p-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-8">
                <Button 
                    variant="secondary" 
                    icon={ArrowLeft} 
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    Back
                </Button>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-4 flex-shrink-0">
                            {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                            ) : (
                                <Building2 size={48} className="text-blue-400" />
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl font-black text-white mb-2">{company.name}</h1>
                                    <div className="flex flex-wrap gap-4 text-slate-400">
                                        <span className="flex items-center gap-2">
                                            <Building2 size={16} />
                                            {company.industry}
                                        </span>
                                        {company.location && (
                                            <span className="flex items-center gap-2">
                                                <MapPin size={16} />
                                                {company.location}
                                            </span>
                                        )}
                                        {company.website && (
                                            <a 
                                                href={company.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-400 hover:underline"
                                            >
                                                <Globe size={16} />
                                                Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-sm font-bold flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    Active Partner
                                </div>
                            </div>

                            <p className="text-slate-300 leading-relaxed max-w-3xl">
                                {company.description || "No description available."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact & Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Contact Info */}
                <div className="md:col-span-1 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Users size={20} className="text-purple-400" />
                        Contact Person
                    </h3>
                    {company.contactPerson ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Name</p>
                                    <p className="text-white font-medium">{company.contactPerson.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Email</p>
                                    <a href={`mailto:${company.contactPerson.email}`} className="text-white font-medium hover:text-blue-400 transition-colors">
                                        {company.contactPerson.email}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Phone</p>
                                    <p className="text-white font-medium">{company.contactPerson.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 italic">No contact information shared.</p>
                    )}
                </div>

                {/* Partnership Details */}
                <div className="md:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Award size={20} className="text-amber-400" />
                        Partnership Status
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-slate-400 text-sm mb-1">Status</p>
                            <p className="text-xl font-bold text-emerald-400">Active</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-slate-400 text-sm mb-1">Partnership Date</p>
                            <p className="text-xl font-bold text-white">
                                {company.accessDetails?.grantedAt 
                                    ? new Date(company.accessDetails.grantedAt).toLocaleDateString(undefined, { dateStyle: 'long' })
                                    : 'N/A'}
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 col-span-2">
                             <p className="text-slate-400 text-sm mb-1">Access Tracking</p>
                             <div className="flex items-center gap-2 mt-2">
                                <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-full opacity-50"></div>
                                </div>
                                <span className="text-xs text-emerald-400 font-bold">Authorized</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
