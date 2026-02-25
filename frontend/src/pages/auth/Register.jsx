import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import {
    Mail, Lock, Building2, Briefcase, User, Phone, MapPin,
    ChevronLeft, GraduationCap, CheckCircle2, ChevronRight,
    ArrowRight, Sparkles, Upload, Globe, UserCheck, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PrimaryButton, InputField } from '../../components/common';
import Footer from '../../components/layout/Footer';

const Register = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        // Common Profile fields
        firstName: '',
        lastName: '',
        phone: '',
        // Student fields
        collegeId: '',
        department: 'Computer Science',
        batch: new Date().getFullYear().toString(),
        rollNumber: '',
        dateOfBirth: '',
        gender: 'male',
        // College fields
        collegeName: '',
        collegeCode: '',
        city: '',
        state: '',
        // Company fields
        companyName: '',
        industry: '',
        companyType: 'company',
        contactPerson: '',
        website: '',
        companySize: '1-50'
    });
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await authAPI.getPublicColleges();
                if (response.data.success) {
                    setColleges(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch colleges:', error);
            }
        };
        fetchColleges();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (role === 'student') {
            if (!formData.firstName) newErrors.firstName = 'First Name is required';
            if (!formData.lastName) newErrors.lastName = 'Last Name is required';
            if (!formData.collegeId) newErrors.collegeId = 'College selection is required';
        } else if (role === 'company') {
            if (!formData.companyName) newErrors.companyName = 'Company Name is required';
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.state) newErrors.state = 'State is required';
        } else if (role === 'college_admin') {
            if (!formData.collegeName) newErrors.collegeName = 'College Name is required';
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.state) newErrors.state = 'State is required';
        }

        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step === 2) {
            if (validateStep2()) setStep(3);
            return;
        }

        setLoading(true);
        try {
            // Format data for backend
            let payload = {
                email: formData.email,
                password: formData.password,
                role: role
            };

            if (role === 'student') {
                payload = {
                    ...payload,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    collegeId: formData.collegeId,
                    department: formData.department,
                    batch: parseInt(formData.batch),
                    rollNumber: formData.rollNumber,
                    dateOfBirth: formData.dateOfBirth,
                    gender: formData.gender
                };
            } else if (role === 'company') {
                payload = {
                    ...payload,
                    companyName: formData.companyName,
                    industry: formData.industry,
                    companyType: formData.companyType,
                    contactPerson: formData.contactPerson,
                    phone: formData.phone,
                    website: formData.website,
                    city: formData.city,
                    state: formData.state,
                    size: formData.companySize
                };
            } else if (role === 'college_admin') {
                payload = {
                    ...payload,
                    collegeName: formData.collegeName,
                    collegeCode: formData.collegeCode,
                    city: formData.city,
                    state: formData.state,
                    phone: formData.phone
                };
            }

            const result = await register(payload);
            if (result.success) {
                if (role === 'college_admin') navigate('/college');
                else if (role === 'company') navigate('/company');
                else navigate('/student');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const roleCards = [
        {
            id: 'student',
            title: 'I am a Student',
            description: 'Browse placements, build your professional profile, and apply to top global companies.',
            icon: GraduationCap,
            color: 'text-[var(--accent-brand)]',
            bg: 'bg-[var(--accent-brand)]/10',
            image: 'https://images.unsplash.com/photo-1523240715630-388910488214?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'college_admin',
            title: 'I am a College Admin',
            description: 'Manage campus placements, track student progress, and invite elite recruiters to your campus.',
            icon: Building2,
            color: 'text-[var(--accent-brand)]',
            bg: 'bg-[var(--accent-brand)]/10',
            image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'company',
            title: 'I am a Company',
            description: 'Post job openings, shortlist top talent, and manage campus recruitment drives effortlessly.',
            icon: Briefcase,
            color: 'text-[var(--accent-brand)]',
            bg: 'bg-[var(--accent-brand)]/10',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400'
        }
    ];

    return (
        <div className="auth-page">
            <div className="auth-bg-overlay" />

            <div className="auth-content-wrapper">
                <div className="auth-container max-w-5xl flex-col bg-white">
                    {/* Header Section */}
                    <div className="p-8 border-b border-[var(--accent-brand)]/10 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-[var(--accent-brand)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--accent-brand)]/20">
                                <GraduationCap className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-[var(--text-brown)]">Register</h2>
                                <p className="text-xs text-[var(--text-brown)] opacity-70">Placement Management System</p>
                            </div>
                        </div>
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="p-2 text-[var(--text-brown)] hover:bg-[var(--bg-cream)] rounded-xl transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 p-8 md:p-12 bg-white">
                        {/* Progress Bar (Step 2 & 3) */}
                        {step > 1 && (
                            <div className="mb-10 max-w-md mx-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Step {step - 1} of 2</span>
                                    <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                                        {role === 'student' ? 'Student Registration' : role === 'company' ? 'Company Registration' : 'College Registration'}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden border border-border/20">
                                    <div
                                        className="h-full bg-primary transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(90,62,43,0.3)]"
                                        style={{ width: `${(step - 1) * 50}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 1: Role Selection */}
                        {step === 1 && (
                            <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700 text-center">
                                <div className="max-w-2xl mx-auto mb-16">
                                    <h1 className="text-5xl md:text-6xl font-black mb-6 text-text tracking-tight">Choice your journey</h1>
                                    <p className="text-muted font-medium text-lg leading-relaxed">
                                        Select the account type that best describes you to get started.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {roleCards.map((card) => (
                                        <button
                                            key={card.id}
                                            onClick={() => setRole(card.id)}
                                            className={`relative flex flex-col text-left p-8 rounded-[2.5rem] border-2 transition-all duration-500 group overflow-hidden ${role === card.id
                                                ? 'border-primary bg-card/40 shadow-elevated scale-105'
                                                : 'border-border/30 bg-white/50 hover:border-primary/50 hover:bg-cream/30'
                                                }`}
                                        >
                                            <div className={`w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 active:scale-95`}>
                                                <card.icon className="text-primary" size={32} />
                                            </div>
                                            <h3 className="text-2xl font-black mb-4 text-text tracking-tight">{card.title}</h3>
                                            <p className="text-muted font-medium text-sm leading-relaxed mb-10">
                                                {card.description}
                                            </p>

                                            <div className={`mt-auto inline-flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${role === card.id ? 'text-primary' : 'text-muted'
                                                }`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${role === card.id ? 'bg-primary text-white shadow-[0_8px_20px_rgba(90,62,43,0.3)]' : 'bg-cream'
                                                    }`}>
                                                    {role === card.id ? <CheckCircle2 size={20} /> : <ArrowRight size={20} />}
                                                </div>
                                                <span>{role === card.id ? 'Selected' : 'Select'}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col space-y-6 max-w-md mx-auto pt-12">
                                    <PrimaryButton
                                        onClick={() => role && setStep(2)}
                                        disabled={!role}
                                        className="w-full py-5 text-lg uppercase tracking-[0.25em] shadow-elevated"
                                    >
                                        <span>Continue to Registration</span>
                                        <ChevronRight size={24} />
                                    </PrimaryButton>
                                    <div className="text-sm font-medium">
                                        <span className="text-muted uppercase tracking-widest text-[10px] font-black">Already registered? </span>
                                        <Link to="/login" className="text-primary font-black hover:text-primaryDark uppercase tracking-widest text-[10px] ml-2">Login here</Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Basic Account Details */}
                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 max-w-2xl mx-auto">
                                <div className="text-center mb-10">
                                    <h1 className="text-4xl font-black mb-4 text-text tracking-tight">
                                        {role === 'student' ? 'Student Registration' : role === 'company' ? 'Register Company' : 'College Setup'}
                                    </h1>
                                    <p className="text-muted font-medium">Please provide your professional details to get started.</p>
                                </div>

                                <div className="space-y-6">
                                    {role === 'student' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-6">
                                                <InputField
                                                    label="First Name"
                                                    type="text"
                                                    name="firstName"
                                                    placeholder="Alex"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    error={errors.firstName}
                                                />
                                                <InputField
                                                    label="Last Name"
                                                    type="text"
                                                    name="lastName"
                                                    placeholder="Johnson"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    error={errors.lastName}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2 w-full">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">College / University</label>
                                                <div className="relative">
                                                    <select
                                                        name="collegeId"
                                                        value={formData.collegeId}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-[#D7C2AE] text-[#2C1B12] rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#5A3E2B]/30 transition-all font-medium"
                                                    >
                                                        <option value="">Select your College</option>
                                                        {colleges.map(college => (
                                                            <option key={college._id} value={college._id}>{college.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
                                                </div>
                                                {errors.collegeId && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{errors.collegeId}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2 w-full">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">Department</label>
                                                    <div className="relative">
                                                        <select
                                                            name="department"
                                                            value={formData.department}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-[#D7C2AE] text-[#2C1B12] rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#5A3E2B]/30 transition-all font-medium"
                                                        >
                                                            <option>Computer Science</option>
                                                            <option>IT</option>
                                                            <option>Electronics</option>
                                                            <option>Mechanical</option>
                                                            <option>Civil</option>
                                                            <option>MBA</option>
                                                            <option>MCA</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
                                                    </div>
                                                </div>
                                                <InputField
                                                    label="Roll Number"
                                                    type="text"
                                                    name="rollNumber"
                                                    placeholder="e.g. 21CS001"
                                                    value={formData.rollNumber}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <InputField
                                                    label="Batch Year"
                                                    type="number"
                                                    name="batch"
                                                    placeholder="2025"
                                                    value={formData.batch}
                                                    onChange={handleChange}
                                                />
                                                <InputField
                                                    label="Phone Number"
                                                    type="text"
                                                    name="phone"
                                                    placeholder="+91 9876543210"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <InputField
                                                label="University Email"
                                                type="email"
                                                name="email"
                                                placeholder="alex.j@university.edu"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={errors.email}
                                            />
                                        </>
                                    )}

                                    {role === 'company' && (
                                        <>
                                            <InputField
                                                label="Company Name"
                                                type="text"
                                                name="companyName"
                                                placeholder="e.g. Acme Corporation"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                error={errors.companyName}
                                            />

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2 w-full">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">Industry Type</label>
                                                    <div className="relative">
                                                        <select
                                                            name="industry"
                                                            value={formData.industry}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-[#D7C2AE] text-[#2C1B12] rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#5A3E2B]/30 transition-all font-medium"
                                                        >
                                                            <option value="">Select Industry</option>
                                                            <option>Information Technology</option>
                                                            <option>Finance</option>
                                                            <option>Manufacturing</option>
                                                            <option>Healthcare</option>
                                                            <option>Consulting</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 w-full">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">Company Size</label>
                                                    <div className="relative">
                                                        <select
                                                            name="companySize"
                                                            value={formData.companySize}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-[#D7C2AE] text-[#2C1B12] rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#5A3E2B]/30 transition-all font-medium"
                                                        >
                                                            <option value="1-50">1-50</option>
                                                            <option value="51-200">51-200</option>
                                                            <option value="201-500">201-500</option>
                                                            <option value="501-1000">501-1000</option>
                                                            <option value="1000+">1000+</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <InputField
                                                    label="HR Contact Person"
                                                    type="text"
                                                    name="contactPerson"
                                                    placeholder="Full Name"
                                                    value={formData.contactPerson}
                                                    onChange={handleChange}
                                                />
                                                <InputField
                                                    label="Phone Number"
                                                    type="text"
                                                    name="phone"
                                                    placeholder="+91 9876543210"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <InputField
                                                    label="City"
                                                    type="text"
                                                    name="city"
                                                    placeholder="e.g. San Francisco"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    error={errors.city}
                                                />
                                                <InputField
                                                    label="State"
                                                    type="text"
                                                    name="state"
                                                    placeholder="e.g. California"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    error={errors.state}
                                                />
                                            </div>

                                            <InputField
                                                label="Official Email"
                                                type="email"
                                                name="email"
                                                placeholder="hr@company.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={errors.email}
                                            />

                                            <InputField
                                                label="Website URL"
                                                type="text"
                                                name="website"
                                                placeholder="https://www.company.com"
                                                value={formData.website}
                                                onChange={handleChange}
                                            />
                                        </>
                                    )}

                                    {role === 'college_admin' && (
                                        <>
                                            <InputField
                                                label="College Name"
                                                type="text"
                                                name="collegeName"
                                                placeholder="e.g. Stanford University"
                                                value={formData.collegeName}
                                                onChange={handleChange}
                                                error={errors.collegeName}
                                            />

                                            <div className="grid grid-cols-2 gap-6">
                                                <InputField
                                                    label="College Code"
                                                    type="text"
                                                    name="collegeCode"
                                                    placeholder="STFD"
                                                    value={formData.collegeCode}
                                                    onChange={handleChange}
                                                />
                                                <InputField
                                                    label="Admin Phone"
                                                    type="text"
                                                    name="phone"
                                                    placeholder="+91 9876543210"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <InputField
                                                    label="City"
                                                    type="text"
                                                    name="city"
                                                    placeholder="e.g. San Francisco"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    error={errors.city}
                                                />
                                                <InputField
                                                    label="State"
                                                    type="text"
                                                    name="state"
                                                    placeholder="e.g. California"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    error={errors.state}
                                                />
                                            </div>

                                            <InputField
                                                label="Admin Email"
                                                type="email"
                                                name="email"
                                                placeholder="admin@college.edu"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={errors.email}
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="pt-8 flex flex-col space-y-6">
                                    <PrimaryButton
                                        type="submit"
                                        className="w-full py-5 text-lg uppercase tracking-[0.25em] shadow-elevated"
                                    >
                                        <span>Continue to Step 2</span>
                                        <ArrowRight size={24} />
                                    </PrimaryButton>
                                    <div className="text-center">
                                        <Link to="/login" className="text-muted font-black hover:text-primary uppercase tracking-widest text-[10px]">Login instead</Link>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Step 3: Password / Extra Info */}
                        {step === 3 && (
                            <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 max-w-md mx-auto">
                                <div className="text-center">
                                    <h1 className="text-4xl font-black mb-4 text-text tracking-tight tracking-tight">Secure Account</h1>
                                    <p className="text-muted font-medium">Final step to set up your {role.replace('_', ' ')} portal.</p>
                                </div>

                                <div className="space-y-8">
                                    <InputField
                                        label="Set Password"
                                        type="password"
                                        name="password"
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />

                                    <InputField
                                        label="Confirm Password"
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Repeat your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        error={errors.confirmPassword}
                                        required
                                    />
                                </div>

                                <div className="pt-8">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 text-lg uppercase tracking-[0.25em] shadow-elevated"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>Complete Setup</span>
                                                <Sparkles size={20} />
                                            </>
                                        )}
                                    </PrimaryButton>
                                </div>
                            </form>
                        )}

                    </div>

                    <div className="p-10 border-t border-[var(--accent-brand)]/10 flex justify-center space-x-12 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-brown)] opacity-60">
                        <Link to="/privacy" className="hover:text-text transition-colors">Privacy Policy</Link>
                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                        <Link to="/terms" className="hover:text-text transition-colors">Terms of Service</Link>
                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                        <Link to="/help" className="hover:text-text transition-colors">Help Center</Link>
                    </div>
                </div>
            </div>

            {/* Main Global Footer */}
            <div className="auth-footer-wrapper">
                <Footer />
            </div>
        </div>
    );
};

export default Register;
