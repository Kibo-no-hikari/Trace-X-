import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Terminal } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 cyber-grid opacity-50 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full glass-panel border border-cyan-500/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-4xl font-mono font-extrabold text-cyan-400 block mb-1">
            404
          </span>
          <h2 className="text-lg font-bold text-white font-mono">
            Forensic Telemetry Not Found
          </h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            The requested incident artifact or route does not exist in the active investigation workspace.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="outline" size="sm" icon={ArrowLeft} className="w-full text-xs">
              Return Home
            </Button>
          </Link>
          <Link to="/investigation">
            <Button variant="primary" size="sm" icon={Terminal} className="w-full text-xs">
              Forensic Station
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
