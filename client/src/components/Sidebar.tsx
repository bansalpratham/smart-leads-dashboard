import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Download, LogOut, Sun, Moon } from 'lucide-react';

export const Sidebar: React.FC<{ darkMode: boolean; toggleDarkMode: () => void }> = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // simple nav links
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
  ];


  return (
    <div className="w-64 glass border-r border-white/20 dark:border-white/10 flex flex-col h-screen transition-colors duration-500 z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">Smart Leads</h1>
      </div>
      
      <div className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path === '/leads' && location.pathname.startsWith('/leads'));
          
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800/50 hover:shadow-sm'
              }`}
            >
              <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:scale-110'}`} />
              {link.name}
            </Link>
          );
        })}
        <button
          onClick={() => alert('Please navigate to the Leads page to export filtered leads to CSV.')}
          className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800/50 hover:shadow-sm"
        >
          <Download size={20} className="text-gray-400 dark:text-gray-500 transition-transform duration-300 group-hover:scale-110" />
          Export CSV
        </button>
      </div>

      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 space-y-4">
        <div className="px-4 py-3 bg-white/50 dark:bg-gray-800/30 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-800 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">{user?.name}</span>
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">{user?.role}</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-300 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
