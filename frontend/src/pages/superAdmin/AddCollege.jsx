import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2, MapPin, Globe, Phone, Mail, ShieldCheck, GraduationCap, Plus, Activity, ShieldAlert, Sparkles, Target } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './AdminPages.css';

const AddCollegeObject = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        collegeName: '',
        collegeCode: '',
        university: '',
        city: '',
        state: '',
        pincode: '',
        contactEmail: '',
        phone: '',
        website: '',
        departments: '',
        adminEmail: '',
        adminPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formData,
                departments: formData.departments.split(',').map(d => d.trim()).filter(d => d)
            };

            await superAdminAPI.createCollege(data);
            toast.success('College node initialized successfully!');
            navigate('/admin/colleges');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initialize college node');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <button
                        onClick={() => navigate('/admin/colleges')}
                        className="flex items-center gap-2 text-[#6b3f1d] font-bold text-[10px] uppercase tracking-widest hover:gap-3 transition-all mb-4"
                    >
                        <ArrowLeft size={14} /> Back to Institutions
                    </button>
                    <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-2">Register Institutional Node</h1>
                    <p className="text-xs text-[#8b6f5a] font-medium uppercase tracking-widest leading-none">New Academic Entity Initialization Protocol</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl space-y-12 pb-20">
                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-10 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                        <Target size={18} className="text-[#6b3f1d]" /> Institutional Identity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">College Official Name</label>
                            <Input
                                name="collegeName"
                                value={formData.collegeName}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                placeholder="FULL INSTITUTIONAL NAME"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">College Registry Code</label>
                            <Input
                                name="collegeCode"
                                value={formData.collegeCode}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                placeholder="E.G. MIT, IIT, STANFORD"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Parent University Affiliation</label>
                            <Input
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                placeholder="Parent University Affiliation"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-10 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-[#c6a85e]" /> Geographic Infrastructure
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">State Sector</label>
                            <Input
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">PIN Signature</label>
                            <Input
                                name="pincode"
                                value={formData.pincode}
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
                        <Globe size={18} className="text-[#6b3f1d]" /> Communication Hub
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Official Registry Email</label>
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
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Official Phone String</label>
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
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Official Digital Domain (Website)</label>
                            <Input
                                name="website"
                                type="url"
                                value={formData.website}
                                onChange={handleChange}
                                className="admin-form-input-hardened"
                                style={{ background: '#ffffff !important' }}
                                placeholder="HTTPS://WWW.COLLEGE.EDU"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                        <Sparkles size={18} className="text-[#c6a85e]" /> Academic Specialization Matrix
                    </h2>
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Commissioned Departments (Comma Delimited)</label>
                        <textarea
                            name="departments"
                            value={formData.departments}
                            onChange={handleChange}
                            placeholder="COMPUTER SCIENCE, MECHANICAL ENGINEERING, ARTIFICIAL INTELLIGENCE, ARCHITECTURE..."
                            className="admin-form-input-hardened theme-input w-full"
                            style={{ backgroundColor: '#ffffff' }}
                        />
                        <p className="text-[9px] text-[#8b6f5a] font-bold uppercase tracking-widest opacity-60">Separate each academic segment with a comma for mapping.</p>
                    </div>
                </div>

                <div className="bg-[#6b3f1d] p-10 rounded-xl shadow-xl border border-[#4a2c15] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-10 border-b border-white/10 pb-4 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-[#c6a85e]" /> Root Authority Access
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#e6d8c3] uppercase tracking-widest block ml-1">Admin Identity Signature (Email)</label>
                            <Input
                                name="adminEmail"
                                type="email"
                                value={formData.adminEmail}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                className="!bg-white/10 !border-white/20 !text-white !text-[11px] !font-bold uppercase !tracking-wider placeholder:text-white/30"
                                placeholder="ADMIN@INSTITUTION.EDU"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#e6d8c3] uppercase tracking-widest block ml-1">Admin Security Key (Password)</label>
                            <Input
                                name="adminPassword"
                                type="password"
                                value={formData.adminPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="!bg-white/10 !border-white/20 !text-white !text-[11px] !font-bold uppercase !tracking-wider placeholder:text-white/30"
                                placeholder="••••••••••••"
                            />
                        </div>
                    </div>
                    <div className="mt-10 p-5 bg-[#4a2c15] rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={16} className="text-[#c6a85e]" />
                            <p className="text-[10px] font-bold text-[#e6d8c3] uppercase tracking-widest leading-relaxed">
                                CRITICAL: This identity will hold primary operational control over the institutional node.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-[#e6d8c3]">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/colleges')}
                        className="!rounded-lg !border-[#e6d8c3] !text-[#8b6f5a] !px-10"
                    >
                        <span className="text-[11px] font-bold uppercase tracking-wider">Abort Protocol</span>
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="!bg-[#6b3f1d] !rounded-lg !px-20 text-[11px] font-bold uppercase tracking-widest h-14"
                    >
                        {loading ? 'Initializing Interface...' : 'Initialize Institutional Node'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddCollegeObject;
