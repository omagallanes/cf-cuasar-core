import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import type { MainLayoutProps } from '../../types/components';
import { navigationItems } from '../../config/navigation';

const MainLayout: React.FC<MainLayoutProps> = ({
  sidebarCollapsed: externalCollapsed
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const sidebarCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggleSidebar = () => {
    setInternalCollapsed(!internalCollapsed);
  };

  const handleMobileMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        items={navigationItems}
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        activePath={location.pathname}
      />

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar
          items={navigationItems}
          collapsed={false}
          activePath={location.pathname}
        />
      </div>

      {/* Header */}
      <Header
        onMenuClick={handleMobileMenuClick}
        onLogout={() => console.log('Logout')}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main content */}
      <main
        className={`
          pt-16 transition-all duration-300
          ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}
        `}
      >
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
