import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Building2, GraduationCap, Briefcase,
    Search, FileText, Settings, Star, Upload, BarChart3, Bell, User, Activity, UserCog
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ collapsed, onToggle, mobileOpen }) => {
    const { user, isSuperAdmin, isCollegeAdmin, isCompany } = useAuth();
    const location = useLocation();

    // Get navigation items based on role
    const getNavItems = () => {
        if (isSuperAdmin) {
            return [
                { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
                { path: '/admin/colleges', icon: Building2, label: 'Colleges' },
                { path: '/admin/college-admins', icon: UserCog, label: 'College Admins' },
                { path: '/admin/companies', icon: Briefcase, label: 'Companies' },
                { path: '/admin/students', icon: GraduationCap, label: 'Students' },
                { path: '/admin/users', icon: Users, label: 'Users' },
                { path: '/admin/activity-logs', icon: Activity, label: 'Activity Logs' }
            ];
        }

        if (isCollegeAdmin) {
            return [
                { path: '/college', icon: LayoutDashboard, label: 'Dashboard' },
                { path: '/college/students', icon: GraduationCap, label: 'Students' },
                { path: '/college/upload', icon: Upload, label: 'Bulk Upload' },
                { path: '/college/placements', icon: BarChart3, label: 'Placements' },
                { path: '/college/company-activity', icon: Building2, label: 'Company Activity' },
                { path: '/college/activity-logs', icon: Activity, label: 'Activity Logs' }
            ];
        }

        if (isCompany) {
            return [
                { path: '/company', icon: LayoutDashboard, label: 'Dashboard' },
                { path: '/company/jobs', icon: Briefcase, label: 'My Jobs' },
                { path: '/company/search', icon: Search, label: 'Find Talent' },
                { path: '/company/shortlist', icon: Star, label: 'Shortlisted' }
            ];
        }

        // Student
        return [
            { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/student/profile', icon: User, label: 'My Profile' },
            { path: '/student/jobs', icon: Briefcase, label: 'Browse Jobs' },
            { path: '/student/applications', icon: FileText, label: 'My Applications' }
        ];
    };

    const navItems = getNavItems();

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <GraduationCap className="logo-icon w-6 h-6 md:w-7 md:h-7" />
                    {!collapsed && <span className="logo-text text-base md:text-lg">PlaceMS</span>}
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin' || item.path === '/college' || item.path === '/company'}
                        className={({ isActive }) =>
                            `sidebar-link text-sm md:text-base ${isActive ? 'sidebar-link-active' : ''}`
                        }
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                {!collapsed && (
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-email">{user?.email}</span>
                            <span className="sidebar-user-role">{user?.role?.replace('_', ' ')}</span>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
