import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ title }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        if (window.innerWidth <= 768) {
            setMobileSidebarOpen(!mobileSidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    return (
        <div className="layout">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
            />

            <div className={`layout-main ${sidebarCollapsed ? 'layout-main-expanded' : ''}`}>
                <Header onMenuClick={toggleSidebar} title={title} />
                <main className="layout-content">
                    <Outlet />
                </main>
            </div>

            {/* Mobile overlay */}
            {mobileSidebarOpen && (
                <div
                    className="layout-overlay"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
