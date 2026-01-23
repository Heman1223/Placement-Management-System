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
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
            {/* Logo and Title */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] mb-4">
                    <GraduationCap className="text-white w-10 h-10" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Placement Management System</h1>
                <p className="text-slate-200">Your bridge to a professional career</p>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-[440px] bg-[#1e293b]/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email / Username</label>
                        <div className="relative group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="e.g. name@university.edu"
                                className="w-full bg-[#0f172a] border border-slate-800 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                required
                            />
                        </div>
                        {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="w-full bg-[#0f172a] border border-slate-800 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-800 bg-[#0f172a] text-blue-600 focus:ring-0 focus:ring-offset-0" />
                            <span className="text-slate-200 group-hover:text-slate-300 transition-colors">Remember Me</span>
                        </label>
                        <Link to="/forgot-password" title="Forgot Password?" className="text-blue-500 hover:text-blue-400 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>
                </form>
            </div>

            <p className="mt-8 text-slate-200 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">Register</Link>
            </p>

            <div className="mt-12 flex space-x-6 text-xs text-slate-300">
                <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-slate-300">Terms of Service</Link>
            </div>
        </div>
    );
};

export default Login;
