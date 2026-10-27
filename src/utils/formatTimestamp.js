/**
 * Formatting and forensics classification helpers
 */

export function formatTimestamp(isoString) {
  if (!isoString) return '--:-- UTC';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return isoString;
  }
}

export function formatShortTime(isoString) {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes} UTC`;
  } catch {
    return isoString;
  }
}

export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Returns color classes and badges for digital forensics confidence ratings:
 * - FACT: Directly recorded in evidence
 * - LIKELY: A possible relationship supported by available evidence
 * - UNKNOWN: Something the available evidence cannot establish
 */
export function getClassificationBadge(classification) {
  switch (classification?.toUpperCase()) {
    case 'FACT':
      return {
        label: 'FACT',
        desc: 'Directly recorded in the evidence',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        glow: 'shadow-[0_0_12px_rgba(52,211,153,0.3)]'
      };
    case 'LIKELY':
      return {
        label: 'LIKELY',
        desc: 'Possible relationship supported by available evidence',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
        glow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]'
      };
    case 'UNKNOWN':
    default:
      return {
        label: 'UNKNOWN',
        desc: 'Something the available evidence cannot establish',
        bg: 'bg-violet-500/15',
        border: 'border-violet-500/30',
        text: 'text-violet-300',
        dot: 'bg-violet-400',
        glow: 'shadow-[0_0_12px_rgba(167,139,250,0.3)]'
      };
  }
}

export function getSeverityBadge(severity) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return {
        label: 'CRITICAL',
        color: 'text-rose-400',
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/30'
      };
    case 'HIGH':
      return {
        label: 'HIGH',
        color: 'text-orange-400',
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/30'
      };
    case 'MEDIUM':
      return {
        label: 'MEDIUM',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/15',
        border: 'border-yellow-500/30'
      };
    case 'LOW':
    default:
      return {
        label: 'LOW',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/15',
        border: 'border-cyan-500/30'
      };
  }
}
