import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  highlight = false,
  variant = 'default',
  className,
}) {
  const variantStyles = {
    default: 'smooth-card',
    primary: 'bg-[#0F4C81] text-white shadow-[0_10px_25px_-5px_rgba(15,76,129,0.35)] border border-[#0B3B66]',
    coral: 'bg-[#FF6F61] text-white shadow-[0_10px_25px_-5px_rgba(255,111,97,0.35)] border border-[#E05345]',
    danger: 'smooth-card border-l-4 border-l-[#D0272B]',
    warning: 'smooth-card border-l-4 border-l-[#D97706]',
    success: 'smooth-card border-l-4 border-l-[#00875A]',
  };

  const isPrimary = variant === 'primary';
  const isCoral = variant === 'coral';
  const isDarkCard = isPrimary || isCoral;

  return (
    <div
      className={cn(
        'relative p-6 rounded-2xl smooth-card-interactive select-none',
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            'text-[11px] font-bold uppercase tracking-wider',
            isDarkCard ? 'text-white/80' : 'text-[#526071]'
          )}
        >
          {title}
        </p>
        {Icon && (
          <div
            className={cn(
              'p-2.5 rounded-xl transition-transform duration-200',
              isDarkCard
                ? 'bg-white/15 text-white shadow-inner'
                : 'bg-[#F6F8FB] text-[#0F4C81] border border-[#0F4C81]/10'
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3
          className={cn(
            'text-2xl sm:text-3xl font-black tracking-tight font-mono',
            isDarkCard ? 'text-white' : 'text-[#0F172A]'
          )}
        >
          {value}
        </h3>
        {subtitle && (
          <p
            className={cn(
              'text-xs mt-1 font-medium',
              isDarkCard ? 'text-white/75' : 'text-[#526071]'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend > 0 ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px]',
                isDarkCard
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E6F7F1] text-[#006644] border border-[#99E3D0]'
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              +{trend}%
            </span>
          ) : trend < 0 ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px]',
                isDarkCard
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FDF0F0] text-[#B01E22] border border-[#FECACA]'
              )}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              {trend}%
            </span>
          ) : (
            <span
              className={cn(
                'font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]',
                isDarkCard ? 'text-white/70' : 'text-[#526071] bg-slate-100'
              )}
            >
              <Minus className="w-3.5 h-3.5" /> 0%
            </span>
          )}
          {trendLabel && (
            <span
              className={cn(
                'text-[11px] font-medium',
                isDarkCard ? 'text-white/70' : 'text-[#526071]'
              )}
            >
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
