import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Building2, GraduationCap, Briefcase,
    Search, FileText, Settings, Star, Upload, BarChart3, Bell, User, Activity, UserCog,
    Calendar, LineChart
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ collapsed, onToggle, mobileOpen }) => {
    const { user, isSuperAdmin, isCollegeAdmin, isCompany, isStudent } = useAuth();
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

            ];
        }

        if (isCollegeAdmin) {
            return [
                { path: '/college', icon: LayoutDashboard, label: 'Dashboard' },
                { path: '/college/students', icon: GraduationCap, label: 'Students' },
                { path: '/college/upload', icon: Upload, label: 'Bulk Upload' },
                { path: '/college/placements', icon: BarChart3, label: 'Placements' },
                { path: '/college/partnerships', icon: Building2, label: 'Industry Partnerships' },
                { path: '/college/company-activity', icon: Activity, label: 'Company Activity' },
                { path: '/college/activity-logs', icon: Activity, label: 'Activity Logs' },
                { path: '/college/settings', icon: Settings, label: 'Settings' }
            ];
        }

        if (isCompany) {
            return [
                { path: '/company', icon: LayoutDashboard, label: 'Dashboard' },
                { path: '/company/jobs', icon: Briefcase, label: 'Job Drives' },
                { path: '/company/applications', icon: FileText, label: 'Direct Applicants' },
                { path: '/company/partnerships', icon: Building2, label: 'Colleges' },
                { path: '/company/search', icon: Search, label: 'Talent Pool' },
                { path: '/company/shortlist', icon: Star, label: 'Selection Pipeline' },
                { path: '/company/settings', icon: Settings, label: 'Settings' }
            ];
        }

        // Student
        return [
            { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/student/profile', icon: User, label: 'My Profile' },
            { path: '/student/college-profile', icon: Building2, label: 'College Profile' },
            { path: '/student/jobs', icon: Briefcase, label: 'Job Drives' },
            { path: '/student/offers', icon: Star, label: 'Recruitment Offers' },
            { path: '/student/applications', icon: FileText, label: 'My Registrations' }
        ];
    };

    const navItems = getNavItems();

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-square">
                        <GraduationCap className="logo-icon text-white" />
                    </div>
                    {!collapsed && <span className="logo-text">PlaceMS</span>}
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
                    <div className="sidebar-user-block">
                        <div className="sidebar-user-avatar">
                            {(isCompany && user?.profile?.logo) ? (
                                <img src={user.profile.logo} alt="Company Logo" className="sidebar-logo-img" />
                            ) : (isCollegeAdmin && user?.profile?.logo) ? (
                                <img src={user.profile.logo} alt="College Logo" className="sidebar-logo-img" />
                            ) : (
                                user?.email?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <div className="sidebar-user-info">
                            {isCompany ? (
                                <>
                                    <span className="sidebar-user-name">{user?.profile?.name || 'Company'}</span>
                                    <span className="sidebar-user-role">{user?.email}</span>
                                </>
                            ) : isCollegeAdmin ? (
                                <>
                                    <span className="sidebar-user-name">{user?.profile?.name || 'College'}</span>
                                    <span className="sidebar-user-role">{user?.email}</span>
                                </>
                            ) : isStudent ? (
                                <>
                                    <span className="sidebar-user-name">{user?.profile?.name?.firstName || 'Student'} {user?.profile?.name?.lastName || ''}</span>
                                    <span className="sidebar-user-role">{user?.email}</span>
                                </>
                            ) : (
                                <>
                                    <span className="sidebar-user-name">{user?.email?.split('@')[0] || 'Admin'}</span>
                                    <span className="sidebar-user-role">{user?.email}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
