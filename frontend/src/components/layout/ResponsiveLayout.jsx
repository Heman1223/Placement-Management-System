import React, { useState } from 'react';
import { Menu, X, Bell, Settings, User } from 'lucide-react';

/**
 * Responsive Dashboard Layout
 * 
 * Desktop: Sidebar always visible
 * Mobile: Sidebar as drawer (toggle)
 */
const ResponsiveLayout = ({ children, user, navigation }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-base font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-transform duration-300 ease-in-out
          w-64 md:w-72
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-14 md:h-16 flex items-center px-4 md:px-6 border-b border-gray-200">
          <h1 className="text-lg md:text-xl font-bold text-blue-600">
            PlacementMS
          </h1>
        </div>

        {/* Navigation */}
        <nav className="p-3 md:p-4 space-y-1">
          {navigation?.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm md:text-base font-medium
                transition-colors
                ${
                  item.active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* User Profile (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm md:text-base font-semibold">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || 'Role'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
          min-h-screen
          pt-14 md:pt-0
          md:ml-72
          transition-all duration-300
        `}
      >
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

/**
 * Responsive Page Header
 */
export const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-4 md:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm md:text-base text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2 md:gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Responsive Section Container
 */
export const Section = ({ title, children, className = '' }) => {
  return (
    <div className={`mb-6 md:mb-8 ${className}`}>
      {title && (
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default ResponsiveLayout;
