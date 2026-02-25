import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const result = await login(formData.email, formData.password);
        setLoading(false);

        if (result.success) {
            // Redirect based on role
            const role = result.user?.role;
            if (role === 'super_admin') navigate('/admin');
            else if (role === 'college_admin') navigate('/college');
            else if (role === 'company') navigate('/company');
            else navigate('/student');
        }
    };


    return (
        <div className="auth-page">
            <div className="auth-bg-overlay" />

            <div className="auth-content-wrapper">
                <div className="auth-container">
                    {/* Left side - Info panel */}
                    <div className="auth-info md:flex hidden">
                        <div className="auth-info-content">
                            <div className="brand-logo mb-6">
                                <GraduationCap size={40} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Placement Portal</h2>
                            <p className="text-white/80 mb-8 italic">"Your bridge to a professional career"</p>
                            <ul className="space-y-4">
                                <li className="text-white/90">✓ Verified Opportunities</li>
                                <li className="text-white/90">✓ Campus Recruitment Drives</li>
                                <li className="text-white/90">✓ Industry Partnerships</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right side - Form Card */}
                    <div className="auth-card">
                        <div className="auth-header text-center mb-10">
                            <div className="w-16 h-16 bg-[var(--accent-brand)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--accent-brand)]/20 mx-auto mb-4 md:hidden">
                                <GraduationCap className="text-white" size={32} />
                            </div>
                            <h1 className="auth-title">Welcome Back</h1>
                            <p className="auth-subtitle">Sign in to your account</p>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="auth-input-group">
                                <label className="auth-label">Email / Username</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@university.edu"
                                    className="auth-input"
                                    autoComplete="off"
                                    required
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div className="auth-input-group">
                                <label className="auth-label">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="auth-input"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-brown)]/60 hover:text-[var(--text-brown)]"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <div className="flex items-center justify-between text-sm mb-6">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--accent-brand)]/30 bg-white text-[var(--accent-brand)]" />
                                    <span className="text-[var(--text-brown)]/80 group-hover:text-[var(--accent-brand)] transition-colors">Remember Me</span>
                                </label>
                                <Link to="/forgot-password" title="Forgot Password?" className="text-sm font-medium text-[var(--primary-brown)] hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--primary-brown)] hover:bg-[var(--dark-brown)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>
                        </form>

                        <p className="auth-footer text-center mt-8">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-[var(--primary-brown)] font-bold hover:underline">Register</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Global Footer */}
            <div className="auth-footer-wrapper">
                <Footer />
            </div>
        </div>
    );
};

export default Login;
