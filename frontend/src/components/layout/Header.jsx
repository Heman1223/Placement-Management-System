import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsModal from './SettingsModal';
import './Header.css';

const Header = ({ onMenuClick, title }) => {
    const { user, logout, isSuperAdmin, isCollegeAdmin } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <header className="header">
                <div className="header-left">
                    <button className="header-menu-btn" onClick={onMenuClick}>
                        <Menu className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    {title && <h1 className="header-title text-sm md:text-base lg:text-lg">{title}</h1>}
                </div>

                <div className="header-right">
                    {/* Settings Icon - Super Admin opens modal, College Admin navigates to page */}
                    {isSuperAdmin && (
                        <button
                            className="header-icon-btn"
                            onClick={() => setShowSettings(true)}
                            title="Platform Settings"
                        >
                            <Settings className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    )}
                    
                    {isCollegeAdmin && (
                        <button
                            className="header-icon-btn"
                            onClick={() => navigate('/college/settings')}
                            title="College Settings"
                        >
                            <Settings className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    )}

                    {/* Notifications Icon */}
                    <button className="header-icon-btn" title="Notifications">
                        <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    <div className="header-user">
                        <button
                            className="header-user-btn"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <div className="header-avatar text-xs md:text-sm">
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                        </button>

                        {showDropdown && (
                            <div className="header-dropdown">
                                <div className="header-dropdown-info">
                                    <span className="header-dropdown-email text-xs md:text-sm">{user?.email}</span>
                                    <span className="header-dropdown-role text-xs">{user?.role?.replace('_', ' ')}</span>
                                    {isCollegeAdmin && user?.profile?.name && (
                                        <span className="header-dropdown-college text-xs" style={{ color: 'var(--primary-600)', fontWeight: 600, marginTop: '4px' }}>
                                            {user.profile.name}
                                        </span>
                                    )}
                                </div>
                                <div className="header-dropdown-divider" />
                                <button className="header-dropdown-item text-xs md:text-sm" onClick={logout}>
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </>
    );
};

export default Header;
