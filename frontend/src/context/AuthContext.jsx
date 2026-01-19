import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    // Verify token is still valid
                    const response = await authAPI.getProfile();
                    setUser(response.data.data.user);
                    setIsAuthenticated(true);
                } catch (error) {
                    // Token invalid, clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user: userData, profile } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ ...userData, profile }));

            setUser({ ...userData, profile });
            setIsAuthenticated(true);

            toast.success('Login successful!');
            return { success: true, user: userData };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { token, user: newUser, profile } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ ...newUser, profile }));

            setUser({ ...newUser, profile });
            setIsAuthenticated(true);

            toast.success(response.data.message);
            return { success: true, user: newUser };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            // Continue with logout even if API fails
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // Role check helpers
    const isSuperAdmin = user?.role === 'super_admin';
    const isCollegeAdmin = user?.role === 'college_admin';
    const isCompany = user?.role === 'company';
    const isStudent = user?.role === 'student';
    const isApproved = user?.isApproved ?? false;

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        isSuperAdmin,
        isCollegeAdmin,
        isCompany,
        isStudent,
        isApproved
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
