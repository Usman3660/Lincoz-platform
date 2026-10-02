import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

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
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]',
      text: 'text-indigo-400'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]',
      text: 'text-emerald-400'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/20 text-amber-400',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]',
      text: 'text-amber-400'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      iconBg: 'bg-rose-500/20 text-rose-400',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]',
      text: 'text-rose-400'
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      glow: 'hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]',
      text: 'text-cyan-400'
    }
  };

  const scheme = colorMap[colorScheme] || colorMap.indigo;

  return (
    <div className={`relative p-5 rounded-2xl bg-[#182234]/60 border ${scheme.border} backdrop-blur-md transition-all duration-300 ${scheme.glow} group hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {value}
            </h4>
            {badgeText && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && (
            <span className={`flex items-center font-medium ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              <ArrowUpRight className={`w-3.5 h-3.5 mr-0.5 ${!trendPositive && 'rotate-90'}`} />
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
