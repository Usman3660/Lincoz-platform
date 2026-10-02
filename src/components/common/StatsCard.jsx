import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  colorScheme = 'indigo', // indigo, emerald, amber, rose, cyan
  badgeText
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      border: 'border-slate-800 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
      glow: 'hover:shadow-lg hover:shadow-indigo-500/10',
      text: 'text-indigo-400'
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      border: 'border-slate-800 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
      glow: 'hover:shadow-lg hover:shadow-emerald-500/10',
      text: 'text-emerald-400'
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      border: 'border-slate-800 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
      glow: 'hover:shadow-lg hover:shadow-amber-500/10',
      text: 'text-amber-400'
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      border: 'border-slate-800 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
      glow: 'hover:shadow-lg hover:shadow-rose-500/10',
      text: 'text-rose-400'
    },
    cyan: {
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      border: 'border-slate-800 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
      glow: 'hover:shadow-lg hover:shadow-cyan-500/10',
      text: 'text-cyan-400'
    }
  };

  const scheme = colorMap[colorScheme] || colorMap.indigo;

  return (
    <div className={`relative p-5 rounded-2xl bg-[#111827] border ${scheme.border} transition-all duration-200 ${scheme.glow} flex flex-col justify-between min-h-[148px] shadow-sm`}>
      
      {/* Top Header: Title & Icon */}
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-snug line-clamp-2">
          {title}
        </span>

        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${scheme.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Metric Value & Optional Pill */}
      <div className="my-2 space-y-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
            {value}
          </h4>
          {badgeText && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center ${scheme.bg}`}>
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Subtitle / Context & Trend */}
      {(subtitle || trend) && (
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
          {subtitle && (
            <span className="text-[11px] text-slate-400 truncate max-w-[190px]" title={subtitle}>
              {subtitle}
            </span>
          )}
          {trend && (
            <span className={`text-[11px] font-bold flex items-center shrink-0 ml-auto ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              <ArrowUpRight className={`w-3.5 h-3.5 mr-0.5 ${!trendPositive && 'rotate-90'}`} />
              {trend}
            </span>
          )}
        </div>
      )}

    </div>
  );
};
