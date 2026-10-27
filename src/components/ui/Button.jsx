import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 tracking-wide',
    md: 'text-sm px-4 py-2 gap-2 tracking-wide',
    lg: 'text-base px-6 py-3 gap-2.5 tracking-wider font-semibold',
    icon: 'p-2 w-9 h-9',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.5)] border border-cyan-300/40',
    secondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(0,242,254,0.1)]',
    violet: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border border-violet-400/40',
    outline: 'bg-transparent hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100',
    danger: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-400/60',
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {/* Light sheen effect on hover */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />

      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={`shrink-0 ${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />
      ) : null}

      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
