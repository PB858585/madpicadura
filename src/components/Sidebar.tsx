
import React from 'react';
import { Package, BarChart3, Settings, Home, Download } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Gerador', path: '/generator' },
    { icon: BarChart3, label: 'Validador', path: '/validator' },
    { icon: Download, label: 'Exportar', path: '/export' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <div className={`bg-gray-900 text-white h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg">TrackGen</h1>
              <p className="text-gray-400 text-xs">Gerador de Códigos</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onToggle}
          className="w-full p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
