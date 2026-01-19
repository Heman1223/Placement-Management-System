import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, GraduationCap, Building2, Briefcase, Users } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
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
            <div className="auth-container">
                {/* Left Panel - Info */}
                <div className="auth-info">
                    <div className="auth-info-content">
                        <div className="brand-logo">
                            <GraduationCap />
                        </div>
                        <h2>Placement Management System</h2>
                        <p>Connect colleges, companies, and talent seamlessly on one powerful platform.</p>
                        <ul>
                            <li>
                                <Building2 size={16} />
                                Colleges can manage student data and track placements in real-time
                            </li>
                            <li>
                                <Briefcase size={16} />
                                Companies can search, filter, and hire top talent effortlessly
                            </li>
                            <li>
                                <Users size={16} />
                                Students can explore opportunities and apply with one click
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Welcome Back!</h1>
                        <p className="auth-subtitle">Sign in to access your dashboard</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <Input
                            label="Email Address"
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
                            placeholder="Enter your password"
                            icon={Lock}
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={loading}
                            icon={LogIn}
                        >
                            Sign In
                        </Button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/register">Create one now</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
