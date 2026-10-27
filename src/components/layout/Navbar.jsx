import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Terminal,
  Activity,
  PlayCircle,
  Menu,
  X,
  Database,
  ArrowRight
} from 'lucide-react';
import Button from '../ui/Button';
import api from '../../services/api';

export default function Navbar({ onLaunchDemo }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check backend status on mount
    api.checkBackendHealth().then((res) => {
      setBackendStatus(res.connected ? 'online' : 'demo');
    });
  }, []);

  const handleDemoClick = () => {
    if (onLaunchDemo) {
      onLaunchDemo();
    } else {
      navigate('/investigation?demo=true');
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Investigation', path: '/investigation' },
  ];

  const isInvestigationRoute = location.pathname.startsWith('/investigation');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050811]/90 backdrop-blur-md border-b border-cyan-500/15 py-3 shadow-2xl'
          : 'bg-transparent py-4 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-violet-600/20 border border-cyan-500/40 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all">
              <ShieldAlert className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  Trace<span className="text-cyan-400">X</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 rounded">
                  FORENSICS
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400 group-hover:text-slate-300">
                Timeline Reconstruction
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path && !link.path.includes('#');
              return link.path.startsWith('/#') ? (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-sm font-medium text-slate-300 hover:text-cyan-300 transition-colors tracking-wide"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors tracking-wide ${
                    isActive ? 'text-cyan-400 font-semibold' : 'text-slate-300 hover:text-cyan-300'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons & Status */}
          <div className="hidden md:flex items-center gap-3">
            {/* Status indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                }`}
              />
              <span>{backendStatus === 'online' ? 'BACKEND LIVE' : 'SYNTHETIC DEMO'}</span>
            </div>

            {/* Launch Demo Button */}
            <Button
              variant="secondary"
              size="sm"
              icon={PlayCircle}
              onClick={handleDemoClick}
              className="text-xs"
            >
              Launch Demo
            </Button>

            {!isInvestigationRoute && (
              <Button
                variant="primary"
                size="sm"
                icon={Terminal}
                onClick={() => navigate('/investigation')}
                className="text-xs"
              >
                Launch Investigation
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={PlayCircle}
              onClick={handleDemoClick}
              className="text-xs px-2.5 py-1"
            >
              Demo
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-cyan-500/20 bg-[#070b18]/95 backdrop-blur-xl px-4 py-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-slate-200 hover:text-cyan-400 py-2 border-b border-slate-800/60"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  icon={ArrowRight}
                  onClick={() => {
                    navigate('/investigation');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-center"
                >
                  Open Workstation
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
