import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  UploadCloud,
  GitCommitVertical,
  Share2,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Shield,
  Play,
  Terminal,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ onTriggerDemo }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Overview',
      path: '/investigation',
      icon: LayoutDashboard,
      badge: 'Main',
      exact: true
    },
    {
      name: 'Evidence Import',
      path: '/investigation/import',
      icon: UploadCloud,
      badge: '4 files'
    },
    {
      name: 'Incident Timeline',
      path: '/investigation/timeline',
      icon: GitCommitVertical,
      badge: '4 events'
    },
    {
      name: 'Correlation Graph',
      path: '/investigation/correlation',
      icon: Share2,
      badge: '3D'
    },
    {
      name: 'Investigation Reports',
      path: '/investigation/report',
      icon: FileText,
      badge: 'Export'
    },
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col bg-[#070b18]/95 backdrop-blur-xl border-r border-cyan-500/15 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } shrink-0`}
    >
      {/* Workstation Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-cyan-500/15">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold tracking-wider text-cyan-300 uppercase truncate">
              Forensic Station
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors ml-auto focus:outline-none"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                />

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r shadow-[0_0_8px_#00f2fe]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Interactive Demo Quick Action */}
      <div className="p-3 border-t border-cyan-500/15">
        <button
          onClick={onTriggerDemo}
          className={`w-full group flex items-center ${
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
          } rounded-xl bg-gradient-to-r from-violet-950/60 to-slate-900 border border-violet-500/30 hover:border-violet-400 text-violet-300 hover:text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)]`}
          title="Launch Interactive Synthetic Demo"
        >
          <Play className="w-4 h-4 text-violet-400 shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && (
            <div className="ml-2.5 text-left">
              <div className="text-xs font-semibold text-violet-200">Interactive Demo</div>
              <div className="text-[10px] text-violet-400/80 font-mono">Step-by-step replay</div>
            </div>
          )}
        </button>

        {/* Forensic Core Principle */}
        {!collapsed && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 tracking-wider uppercase font-semibold">
              <Shield className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Core Principle</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 font-mono italic">
              "No Evidence, No Claim."
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
