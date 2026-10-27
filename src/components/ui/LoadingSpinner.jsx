export default function LoadingSpinner({
  size = 'md',
  message = 'Processing forensic records...',
  className = ''
}) {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-3'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="relative">
        <div className={`${sizeMap[size] || sizeMap.md} rounded-full border-cyan-500/20 animate-spin border-t-cyan-400 border-r-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)]`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>
      </div>
      {message && (
        <p className="mt-4 text-xs font-mono tracking-wider text-cyan-300/80 uppercase">
          {message}
        </p>
      )}
    </div>
  );
}
