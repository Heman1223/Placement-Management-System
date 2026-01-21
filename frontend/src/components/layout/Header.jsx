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
                        <Menu size={20} />
                    </button>
                    {title && <h1 className="header-title">{title}</h1>}
                </div>

                <div className="header-right">
                    {/* Settings Icon - Super Admin opens modal, College Admin navigates to page */}
                    {isSuperAdmin && (
                        <button
                            className="header-icon-btn"
                            onClick={() => setShowSettings(true)}
                            title="Platform Settings"
                        >
                            <Settings size={20} />
                        </button>
                    )}
                    
                    {isCollegeAdmin && (
                        <button
                            className="header-icon-btn"
                            onClick={() => navigate('/college/settings')}
                            title="College Settings"
                        >
                            <Settings size={20} />
                        </button>
                    )}

                    {/* Notifications Icon */}
                    <button className="header-icon-btn" title="Notifications">
                        <Bell size={20} />
                    </button>

                    <div className="header-user">
                        <button
                            className="header-user-btn"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <div className="header-avatar">
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <ChevronDown size={16} />
                        </button>

                        {showDropdown && (
                            <div className="header-dropdown">
                                <div className="header-dropdown-info">
                                    <span className="header-dropdown-email">{user?.email}</span>
                                    <span className="header-dropdown-role">{user?.role?.replace('_', ' ')}</span>
                                </div>
                                <div className="header-dropdown-divider" />
                                <button className="header-dropdown-item" onClick={logout}>
                                    <LogOut size={16} />
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
