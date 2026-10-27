import { motion } from 'framer-motion';
import Card from '../ui/Card';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'cyan',
  trend,
  className = ''
}) {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-400/50',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'hover:shadow-[0_0_20px_rgba(0,242,254,0.15)]',
      valueColor: 'text-white'
    },
    violet: {
      border: 'border-violet-500/20 hover:border-violet-400/50',
      iconBg: 'bg-violet-500/10 text-violet-400',
      glow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
      valueColor: 'text-white'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-400/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]',
      valueColor: 'text-white'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-400/50',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]',
      valueColor: 'text-white'
    }
  };

  const style = colorMap[variant] || colorMap.cyan;

  return (
    <Card
      crosshairs
      className={`relative overflow-hidden transition-all duration-300 ${style.border} ${style.glow} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 font-medium">
            {title}
          </span>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`mt-1.5 text-2xl sm:text-3xl font-mono font-bold ${style.valueColor}`}
          >
            {value}
          </motion.div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl border border-white/5 ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 truncate">{subtext}</span>
          {trend && (
            <span className="text-cyan-400 text-[10px] font-semibold">{trend}</span>
          )}
        </div>
      )}
    </Card>
  );
}
