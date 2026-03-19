import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { HeaderProps } from '../../types/components';
import { uiTexts } from '../../config/texts';

const Header: React.FC<HeaderProps> = ({
  userName = 'Usuario',
  userAvatar,
  onMenuClick,
  onLogout,
  sidebarCollapsed = false
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className={`fixed top-0 right-0 left-0 ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'} h-16 bg-white border-b border-gray-200 z-40 transition-all duration-300`}>
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label={uiTexts.header.menuButtonLabel}
        >
          <Icons.Menu size={24} className="text-gray-600" />
        </button>

        {/* Search bar - hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={uiTexts.header.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100" aria-label={uiTexts.header.notificationsLabel}>
            <Icons.Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              aria-label={uiTexts.header.userMenuLabel}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="hidden lg:block text-sm font-medium text-gray-700">
                {userName}
              </span>
              <Icons.ChevronDown size={16} className="hidden lg:block text-gray-400" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <Link
                    to="/perfil"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Icons.User size={16} className="mr-2 text-gray-400" />
                    {uiTexts.header.profile}
                  </Link>
                  <Link
                    to="/configuracion"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Icons.Settings size={16} className="mr-2 text-gray-400" />
                    {uiTexts.header.settings}
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={onLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <Icons.LogOut size={16} className="mr-2" />
                    {uiTexts.header.logout}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
