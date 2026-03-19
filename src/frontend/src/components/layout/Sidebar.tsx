import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { SidebarProps, SidebarItem } from '../../types/components';
import { uiTexts } from '../../config/texts';
import { navigationItems } from '../../config/navigation';

const Sidebar: React.FC<SidebarProps> = ({
  items = navigationItems,
  collapsed = false,
  onToggle,
  activePath
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent size={20} /> : null;
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = activePath === item.path;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="w-full">
        <Link
          to={item.path}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpand(item.id);
            }
          }}
          className={`
            flex items-center w-full px-4 py-3 transition-all duration-200
            ${isActive
              ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
          style={{ paddingLeft: collapsed ? '1rem' : `${1 + level * 1}rem` }}
        >
          <span className={collapsed ? '' : 'mr-3'}>
            {getIcon(item.icon)}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.badge !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-600 rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <Icons.ChevronDown size={16} />
                </span>
              )}
            </>
          )}
        </Link>
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1">
            {item.children!.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200
        transition-all duration-300 z-50 hidden lg:block
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <Icons.LayoutDashboard className="text-primary-600" size={28} />
            <span className="text-xl font-bold text-gray-900">{uiTexts.sidebar.appName}</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="flex items-center justify-center w-full">
            <Icons.LayoutDashboard className="text-primary-600" size={28} />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="py-4 overflow-y-auto h-[calc(100vh-4rem)]">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>{renderSidebarItem(item)}</li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50"
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {collapsed ? (
          <Icons.ChevronRight size={16} className="text-gray-600" />
        ) : (
          <Icons.ChevronLeft size={16} className="text-gray-600" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
