import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2, Globe, Phone, Mail, ShieldCheck, Briefcase, Plus, MapPin, Search, Activity, Target, Sparkles, ShieldAlert, UserCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './AdminPages.css';

const AddCompanyObject = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        companyType: 'company',
        industry: '',
        description: '',
        website: '',
        contactPerson: '',
        contactEmail: '',
        phone: '',
        city: '',
        state: '',
        size: '',
        userEmail: '',
        userPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await superAdminAPI.createCompany(formData);
            toast.success('Corporate node initialized successfully!');
            navigate('/admin/companies');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initialize corporate node');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <button
                        onClick={() => navigate('/admin/companies')}
                        className="flex items-center gap-2 text-[#6b3f1d] font-bold text-[10px] uppercase tracking-widest hover:gap-3 transition-all mb-4"
                    >
                        <ArrowLeft size={14} /> Back to Ecosystem
                    </button>
                    <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-2">Register Corporate Entity</h1>
                    <p className="text-xs text-[#8b6f5a] font-medium uppercase tracking-widest leading-none">New Corporate Node Insertion Protocol</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl space-y-12 pb-20">
                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-10 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                        <Target size={18} className="text-[#6b3f1d]" /> Corporate Identity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Entity Official Name</label>
                            <Input
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                placeholder="REGISTERED COMPANY NAME"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Operational Protocol</label>
                            <select
                                name="companyType"
                                value={formData.companyType}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input w-full py-3 px-3 text-[11px] !font-bold uppercase !tracking-wider"
                                style={{ backgroundColor: '#ffffff' }}
                            >
                                <option value="company">CORPORATE HUB</option>
                                <option value="placement_agency">RECRUITMENT NODE</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Industry Sector</label>
                            <Input
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                placeholder="E.G. IT, FINTECH, LOGISTICS"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Operational Scale</label>
                            <select
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                className="admin-form-input-hardened theme-input w-full py-3 px-3 text-[11px] !font-bold uppercase !tracking-wider"
                                style={{ backgroundColor: '#ffffff' }}
                            >
                                <option value="">SELECT SCALE</option>
                                <option value="1-50">1-50 TALENTS</option>
                                <option value="51-200">51-200 TALENTS</option>
                                <option value="201-500">201-500 TALENTS</option>
                                <option value="501-1000">501-1000 TALENTS</option>
                                <option value="1000+">1000+ TALENTS</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-10 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-[#c6a85e]" /> Global Headquarters
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">City Hub</label>
                            <Input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">State Jurisdiction</label>
                            <Input
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-10 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                        <UserCheck size={18} className="text-[#6b3f1d]" /> Node Authority
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Authorized Representative</label>
                            <Input
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                placeholder="FULL LEGAL NAME"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Direct Vector (Email)</label>
                            <Input
                                name="contactEmail"
                                type="email"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Mobile Access Link</label>
                            <Input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Digital Extraction Portal (URL)</label>
                            <Input
                                name="website"
                                type="url"
                                value={formData.website}
                                onChange={handleChange}
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                placeholder="HTTPS://WWW.COMPANY.COM"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                        <Sparkles size={18} className="text-[#c6a85e]" /> Executive Mission Summary
                    </h2>
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Operational Objectives & Mission</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="OPERATIONAL OBJECTIVES, MISSION STATEMENT, AND VALUE PROPOSITION..."
                            className="admin-form-input-hardened theme-input w-full"
                            style={{ backgroundColor: '#ffffff' }}
                        />
                    </div>
                </div>

                <div className="bg-[#6b3f1d] p-10 rounded-xl shadow-xl border border-[#4a2c15] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-10 border-b border-white/10 pb-4 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-[#c6a85e]" /> Root Access Signature
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#e6d8c3] uppercase tracking-widest block ml-1">Central User Identifier (Email)</label>
                            <Input
                                name="userEmail"
                                type="email"
                                value={formData.userEmail}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                className="!bg-white/10 !border-white/20 !text-white !text-[11px] !font-bold uppercase !tracking-wider placeholder:text-white/30"
                                placeholder="USER@COMPANY.COM"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#e6d8c3] uppercase tracking-widest block ml-1">Platform Access Key (Password)</label>
                            <Input
                                name="userPassword"
                                type="password"
                                value={formData.userPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="!bg-white/10 !border-white/20 !text-white !text-[11px] !font-bold uppercase !tracking-wider placeholder:text-white/30"
                                placeholder="••••••••••••"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-[#e6d8c3]">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/companies')}
                        className="!rounded-lg !border-[#e6d8c3] !text-[#8b6f5a] !px-10"
                    >
                        <span className="text-[11px] font-bold uppercase tracking-wider">Abort Protocol</span>
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="!bg-[#6b3f1d] !rounded-lg !px-20 text-[11px] font-bold uppercase tracking-widest h-14"
                    >
                        {loading ? 'Initializing Interface...' : 'Initialize Corporate Node'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddCompanyObject;
