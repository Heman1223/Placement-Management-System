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
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            image: 'https://images.unsplash.com/photo-1523240715630-388910488214?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'college_admin',
            title: 'I am a College Admin',
            description: 'Manage campus placements, track student progress, and invite elite recruiters to your campus.',
            icon: Building2,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'company',
            title: 'I am a Company',
            description: 'Post job openings, shortlist top talent, and manage campus recruitment drives effortlessly.',
            icon: Briefcase,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-5xl bg-[#1e293b]/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
                {/* Header Section */}
                <div className="p-8 border-b border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <GraduationCap className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Register</h2>
                            <p className="text-xs text-slate-300">Placement Management System</p>
                        </div>
                    </div>
                    {step > 1 && (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="p-2 text-slate-200 hover:text-white bg-slate-800/50 rounded-xl transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                </div>

                <div className="flex-1 p-8 md:p-12">
                {/* Progress Bar (Step 2 & 3) */}
                {step > 1 && (
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Step {step - 1} of 2</span>
                            <span className="text-xs text-slate-300">
                                {role === 'student' ? 'Student Registration' : role === 'company' ? 'Company Registration' : 'College Registration'}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                                style={{ width: `${(step - 1) * 50}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Step 1: Role Selection */}
                {step === 1 && (
                    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center max-w-2xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Choose your journey</h1>
                            <p className="text-slate-200 text-lg">
                                Select the account type that best describes you to get started.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {roleCards.map((card) => (
                                <button
                                    key={card.id}
                                    onClick={() => setRole(card.id)}
                                    className={`relative flex flex-col text-left p-8 rounded-3xl border-2 transition-all duration-300 group overflow-hidden ${
                                        role === card.id 
                                            ? 'border-blue-600 bg-blue-600/5 ring-4 ring-blue-600/10' 
                                            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                                    }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                                        <card.icon className={`${card.color}`} size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-white">{card.title}</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-8">
                                        {card.description}
                                    </p>
                                    
                                    <div className={`mt-auto inline-flex items-center space-x-3 text-sm font-bold transition-all ${
                                        role === card.id ? 'text-blue-500' : 'text-slate-300 group-hover:text-slate-300'
                                    }`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                            role === card.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800'
                                        }`}>
                                            {role === card.id ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                                        </div>
                                        <span>{role === card.id ? 'Selected' : 'Select'}</span>
                                    </div>

                                    {/* Glass decoration */}
                                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl transition-all duration-500 ${
                                        role === card.id ? 'bg-blue-600/20' : 'bg-transparent'
                                    }`} />
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col space-y-6 max-w-md mx-auto">
                            <button
                                onClick={() => role && setStep(2)}
                                disabled={!role}
                                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                                    role 
                                        ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/25' 
                                        : 'bg-slate-800 text-slate-300 cursor-not-allowed'
                                }`}
                            >
                                <span>Continue</span>
                                <ChevronRight size={20} />
                            </button>
                            <div className="text-center">
                                <span className="text-slate-300">Already have an account? </span>
                                <Link to="/login" className="text-blue-500 font-bold hover:underline">Login here</Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Basic Account Details */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">
                                {role === 'student' ? 'Create Student Account' : role === 'company' ? 'Register your company' : 'College Setup'}
                            </h1>
                            <p className="text-slate-200">Please provide your basic university details to get started with placements.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Form content based on Step 2 design would go here */}
                            {/* To keep it manageable, let's implement the specific form for the selected role */}
                            
                            {role === 'student' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                placeholder="Alex"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                            />
                                            {errors.firstName && <p className="text-xs text-red-500 ml-1">{errors.firstName}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                placeholder="Johnson"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                            />
                                            {errors.lastName && <p className="text-xs text-red-500 ml-1">{errors.lastName}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-300 ml-1">College / University</label>
                                        <div className="relative">
                                            <select
                                                name="collegeId"
                                                value={formData.collegeId}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 pr-10 appearance-none focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                            >
                                                <option value="">Select your College</option>
                                                {colleges.map(college => (
                                                    <option key={college._id} value={college._id}>{college.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                                        </div>
                                        {errors.collegeId && <p className="text-xs text-red-500 ml-1">{errors.collegeId}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">Department</label>
                                            <div className="relative">
                                                <select
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 pr-10 appearance-none focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                                >
                                                    <option>Computer Science</option>
                                                    <option>IT</option>
                                                    <option>Electronics</option>
                                                    <option>Mechanical</option>
                                                    <option>Civil</option>
                                                    <option>MBA</option>
                                                    <option>MCA</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">Roll Number</label>
                                            <input
                                                type="text"
                                                name="rollNumber"
                                                placeholder="e.g. 21CS001"
                                                value={formData.rollNumber}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">Batch Year</label>
                                            <input
                                                type="number"
                                                name="batch"
                                                placeholder="2025"
                                                value={formData.batch}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">Phone Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                placeholder="+91 9876543210"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-300 ml-1">University Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="alex.j@university.edu"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                        />
                                        {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
                                    </div>
                                </>
                            )}

                            {role === 'company' && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-300 ml-1">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            placeholder="e.g. Acme Corporation"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                        />
                                        {errors.companyName && <p className="text-xs text-red-500 ml-1">{errors.companyName}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">Industry Type</label>
                                            <div className="relative">
                                                <select
                                                    name="industry"
                                                    value={formData.industry}
                                                    onChange={handleChange}
                                                    className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 pr-10 appearance-none focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                                >
                                                    <option value="">Select Industry</option>
                                                    <option>Information Technology</option>
                                                    <option>Finance</option>
                                                    <option>Manufacturing</option>
                                                    <option>Healthcare</option>
                                                    <option>Consulting</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">Company Size</label>
                                            <div className="relative">
                                                <select
                                                    name="companySize"
                                                    value={formData.companySize}
                                                    onChange={handleChange}
                                                    className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 pr-10 appearance-none focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                                >
                                                    <option value="1-50">1-50</option>
                                                    <option value="51-200">51-200</option>
                                                    <option value="201-500">201-500</option>
                                                    <option value="501-1000">501-1000</option>
                                                    <option value="1000+">1000+</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">HR Contact Person</label>
                                            <input
                                                type="text"
                                                name="contactPerson"
                                                placeholder="Full Name"
                                                value={formData.contactPerson}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">Phone Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                placeholder="+91 9876543210"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                placeholder="e.g. San Francisco"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                            {errors.city && <p className="text-xs text-red-500 ml-1">{errors.city}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                placeholder="e.g. California"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                            {errors.state && <p className="text-xs text-red-500 ml-1">{errors.state}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-300 ml-1">Official Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="hr@company.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                        />
                                        {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-300 ml-1">Website</label>
                                        <div className="flex">
                                            <div className="bg-[#1e293b]/60 border border-r-0 border-slate-800 px-4 flex items-center text-slate-300 rounded-l-xl text-sm whitespace-nowrap">https://</div>
                                            <input
                                                type="text"
                                                name="website"
                                                placeholder="www.company.com"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="flex-1 bg-[#1e293b]/40 border border-slate-800 rounded-r-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {role === 'college_admin' && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-300 ml-1">College Name</label>
                                        <input
                                            type="text"
                                            name="collegeName"
                                            placeholder="e.g. Stanford University"
                                            value={formData.collegeName}
                                            onChange={handleChange}
                                            className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                        />
                                        {errors.collegeName && <p className="text-xs text-red-500 ml-1">{errors.collegeName}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">College Code</label>
                                            <input
                                                type="text"
                                                name="collegeCode"
                                                placeholder="STFD"
                                                value={formData.collegeCode}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">Admin Phone</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                placeholder="+91 9876543210"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                placeholder="e.g. San Francisco"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                            {errors.city && <p className="text-xs text-red-500 ml-1">{errors.city}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300 ml-1">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                placeholder="e.g. California"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                            />
                                            {errors.state && <p className="text-xs text-red-500 ml-1">{errors.state}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-300 ml-1">Admin Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="admin@college.edu"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                        />
                                        {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-4 flex flex-col space-y-4">
                            <button
                                type="submit"
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-600/20"
                            >
                                <span>Continue to Step 2</span>
                                <ArrowRight size={20} />
                            </button>
                            <div className="text-center text-sm">
                                <span className="text-slate-300">Already have an account? </span>
                                <Link to="/login" className="text-blue-500 font-bold">Login instead</Link>
                            </div>
                        </div>
                    </form>
                )}

                {/* Step 3: Password / Extra Info */}
                {step === 3 && (
                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">Secure your account</h1>
                            <p className="text-slate-200">Final step to set up your {role.replace('_', ' ')} portal.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-300 ml-1">Set Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                        required
                                    />
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-300 ml-1">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Repeat your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                        required
                                    />
                                    <UserCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                </div>
                                {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col space-y-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-600/20"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Complete Registration</span>
                                        <Sparkles size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                </div>

                {/* Footer decorations */}
                <div className="p-8 border-t border-slate-800/50 flex justify-center space-x-8 text-xs text-slate-300">
                    <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
                    <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
                    <span className="hover:text-slate-300 cursor-pointer transition-colors">Help Center</span>
                </div>
            </div>
        </div>
    );
};

export default Register;
