import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export const Card = forwardRef(({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  variant = 'default',
  crosshairs = false,
  ...props
}, ref) => {
  const variantStyles = {
    default: 'glass-panel',
    violet: 'glass-panel-violet',
    terminal: 'bg-[#060913] border border-cyan-500/20 shadow-2xl',
    flat: 'bg-slate-900/60 border border-slate-800'
  };

  return (
    <motion.div
      ref={ref}
      className={`relative rounded-xl p-5 overflow-hidden transition-all duration-300 ${variantStyles[variant] || variantStyles.default} ${hoverEffect ? 'glass-panel-hover hover:-translate-y-0.5' : ''} ${glow ? 'glow-cyan-sm' : ''} ${className}`}
      {...props}
    >
      {/* Optional decorative cyber corner crosshairs */}
      {crosshairs && (
        <>
          <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />
        </>
      )}

      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';
export default Card;
