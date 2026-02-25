import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
// Removing global Auth.css to use Tailwind exclusively
// import './Auth.css';

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
        <div className="min-h-screen bg-[var(--bg-cream)] flex flex-col items-center justify-center p-4">
            {/* Logo and Title */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-[var(--accent-brand)] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(139,94,60,0.4)] mb-4">
                    <GraduationCap className="text-white w-10 h-10" />
                </div>
                <h1 className="text-4xl font-bold text-[var(--text-brown)] mb-2 text-center text-wrap">Placement Management System</h1>
                <p className="text-[var(--text-brown)] opacity-80">Your bridge to a professional career</p>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-[440px] bg-white border border-[var(--accent-brand)]/20 rounded-3xl p-8 shadow-2xl">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-brown)] mb-2">Email / Username</label>
                        <div className="relative group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="e.g. name@university.edu"
                                className="w-full bg-[#E8D8C3]/20 border border-[#D7C2AE] text-[#2C1B12] rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B]/30 focus:border-[#5A3E2B] transition-all placeholder:text-[#2C1B12]/40"
                                required
                            />
                        </div>
                        {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-brown)] mb-2">Password</label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="w-full bg-[#E8D8C3]/20 border border-[#D7C2AE] text-[#2C1B12] rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#5A3E2B]/30 focus:border-[#5A3E2B] transition-all placeholder:text-[#2C1B12]/40"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-brown)]/60 hover:text-[var(--text-brown)] transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-[var(--accent-brand)]/30 bg-white text-[var(--accent-brand)] focus:ring-0 focus:ring-offset-0 focus:outline-none outline-none" />
                            <span className="text-[var(--text-brown)] group-hover:text-[var(--accent-brand)] transition-colors">Remember Me</span>
                        </label>
                        <Link to="/forgot-password" title="Forgot Password?" className="text-[var(--accent-brand)] hover:opacity-80 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--accent-brand)] hover:opacity-90 text-white font-semibold py-4 rounded-xl shadow-lg shadow-[var(--accent-brand)]/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>
                </form>
            </div>

            <p className="mt-8 text-[var(--text-brown)] text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-[var(--accent-brand)] hover:opacity-80 font-semibold transition-colors">Register</Link>
            </p>

            <div className="mt-12 flex space-x-6 text-xs text-[var(--text-brown)]/60">
                <Link to="/privacy" className="hover:text-[var(--text-brown)]">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-[var(--text-brown)]">Terms of Service</Link>
            </div>
        </div>
    );
};

export default Login;
