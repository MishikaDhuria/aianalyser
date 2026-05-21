import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mic,
  Users,
  Code,
  FileSpreadsheet,
  BarChart3,
  Settings as SettingsIcon
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Interview', path: '/interview-setup', icon: Mic },
    { name: 'GD Analyzer', path: '/gd-room', icon: Users },
    { name: 'Coding Arena', path: '/coding-arena', icon: Code },
    { name: 'Resume ATS', path: '/resume-analyzer', icon: FileSpreadsheet },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/5 min-h-[calc(100vh-73px)] hidden md:block p-4 flex flex-col justify-between">
      <div className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-300 border-l-4 border-cyan-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>

      <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 mt-auto">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
          AI Status
        </h4>
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold text-emerald-400">Gemini Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
