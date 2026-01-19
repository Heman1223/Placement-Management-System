import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Building2, Briefcase, User, Phone, MapPin } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './Auth.css';

const Register = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        // College fields
        collegeName: '',
        collegeCode: '',
        city: '',
        state: '',
        phone: '',
        // Company fields
        companyName: '',
        companyType: 'company',
        industry: '',
        contactPerson: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step === 1) {
            if (validateStep1()) setStep(2);
            return;
        }

        if (step === 2) {
            setStep(3);
            return;
        }

        setLoading(true);
        const result = await register({ ...formData, role });
        setLoading(false);

        if (result.success) {
            const targetRole = role;
            if (targetRole === 'college_admin') navigate('/college');
            else if (targetRole === 'company') navigate('/company');
            else navigate('/student');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card auth-card-wide">
                    <div className="auth-header">
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">
                            {step === 1 && 'Enter your credentials to get started'}
                            {step === 2 && 'Select your account type'}
                            {step === 3 && 'Complete your profile'}
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="auth-progress">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`auth-progress-step ${step >= s ? 'active' : ''}`}>
                                {s}
                            </div>
                        ))}
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {step === 1 && (
                            <>
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    icon={Mail}
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    required
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    placeholder="Create a password"
                                    icon={Lock}
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    required
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    icon={Lock}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                    required
                                />
                            </>
                        )}

                        {step === 2 && (
                            <div className="role-selector">
                                <div
                                    className={`role-option ${role === 'college_admin' ? 'selected' : ''}`}
                                    onClick={() => handleRoleSelect('college_admin')}
                                >
                                    <Building2 size={32} />
                                    <h3>College/University</h3>
                                    <p>Manage students and track placements</p>
                                </div>
                                <div
                                    className={`role-option ${role === 'company' ? 'selected' : ''}`}
                                    onClick={() => handleRoleSelect('company')}
                                >
                                    <Briefcase size={32} />
                                    <h3>Company/Agency</h3>
                                    <p>Post jobs and hire talent</p>
                                </div>
                            </div>
                        )}

                        {step === 3 && role === 'college_admin' && (
                            <>
                                <Input
                                    label="College Name"
                                    name="collegeName"
                                    placeholder="Enter college name"
                                    icon={Building2}
                                    value={formData.collegeName}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="College Code"
                                    name="collegeCode"
                                    placeholder="e.g., VJTI, COEP"
                                    value={formData.collegeCode}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="auth-row">
                                    <Input
                                        label="City"
                                        name="city"
                                        placeholder="City"
                                        icon={MapPin}
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="State"
                                        name="state"
                                        placeholder="State"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <Input
                                    label="Phone"
                                    name="phone"
                                    placeholder="Contact number"
                                    icon={Phone}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </>
                        )}

                        {step === 3 && role === 'company' && (
                            <>
                                <Input
                                    label="Company Name"
                                    name="companyName"
                                    placeholder="Enter company name"
                                    icon={Building2}
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="auth-row">
                                    <div className="input-wrapper input-full">
                                        <label className="input-label">Type</label>
                                        <select
                                            className="input"
                                            name="companyType"
                                            value={formData.companyType}
                                            onChange={handleChange}
                                        >
                                            <option value="company">Company</option>
                                            <option value="placement_agency">Placement Agency</option>
                                        </select>
                                    </div>
                                    <Input
                                        label="Industry"
                                        name="industry"
                                        placeholder="e.g., IT, Finance"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <Input
                                    label="Contact Person"
                                    name="contactPerson"
                                    placeholder="Your name"
                                    icon={User}
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Phone"
                                    name="phone"
                                    placeholder="Contact number"
                                    icon={Phone}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </>
                        )}

                        <div className="auth-buttons">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setStep(step - 1)}
                                >
                                    Back
                                </Button>
                            )}
                            <Button
                                type="submit"
                                fullWidth={step === 1}
                                size="lg"
                                loading={loading}
                            >
                                {step < 3 ? 'Continue' : 'Create Account'}
                            </Button>
                        </div>
                    </form>

                    <p className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
