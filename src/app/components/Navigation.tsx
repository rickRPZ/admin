import { useState } from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Panel Principal',
      shortLabel: 'Dashboard',
      roles: ['admin', 'registros', 'caja']
    },
    {
      path: '/registros',
      icon: UserPlus,
      label: 'Registrar Asistentes',
      shortLabel: 'Registros',
      roles: ['admin', 'registros']
    }
  ];

  const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <nav
        className={`
          hidden md:block fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-50 transition-all duration-300
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex flex-col h-full py-4">
          {/* Header */}
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between h-12">
              {isExpanded ? (
                <>
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">Adoradores</h2>
                    <p className="text-xs text-gray-500">EDA</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </>
              ) : (
                <div className="w-full flex justify-center">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-2 space-y-1 overflow-y-auto">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {isExpanded && (
                    <span className="font-medium text-sm whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Info */}
          {isExpanded && user && (
            <div className="px-4 pt-4 border-t border-gray-200 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className={`
        md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 transition-transform
        ${isMobileOpen ? 'translate-y-full' : 'translate-y-0'}
      `}>
        <div className="flex justify-around py-2">
          {filteredItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-2 px-3 transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-xs mt-1">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <nav className={`
        md:hidden fixed top-0 right-0 bottom-0 w-64 bg-white border-l border-gray-200 z-50 transition-transform
        ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full py-4">
          {/* Header */}
          <div className="px-4 mb-6 pt-12">
            <h2 className="font-bold text-xl text-gray-900">Adoradores - EDA</h2>
            {user && (
              <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 space-y-1 overflow-y-auto">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
