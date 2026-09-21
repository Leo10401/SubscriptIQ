import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '../lib/utils';

export function RiskBadge({ level = 'low', score = null, showLabel = true, size = 'md', className }) {
  const normalized = (level || 'low').toLowerCase();

  const configs = {
    low: {
      label: 'Low Risk',
      badgeClass: 'smooth-badge-low',
      jewelClass: 'smooth-jewel-emerald',
      textColor: 'text-[#006644]',
      Icon: CheckCircle2,
    },
    medium: {
      label: 'Medium Risk',
      badgeClass: 'smooth-badge-med',
      jewelClass: 'smooth-jewel-mimosa',
      textColor: 'text-[#874700]',
      Icon: AlertTriangle,
    },
    high: {
      label: 'High Risk',
      badgeClass: 'smooth-badge-high',
      jewelClass: 'smooth-jewel-chrysanthemum',
      textColor: 'text-[#B01E22] font-bold',
      Icon: AlertOctagon,
    },
  };

  const config = configs[normalized] || configs.low;
  const Icon = config.Icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full transition-all select-none shadow-2xs',
        config.badgeClass,
        config.textColor,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={`Churn risk: ${config.label}`}
    >
      <Icon className={cn('shrink-0', iconSizes[size])} aria-hidden="true" />

      {showLabel && <span>{config.label}</span>}
      {score !== null && score !== undefined && (
        <span className="opacity-90 font-mono text-[11px] tracking-tight font-bold">({score})</span>
      )}
    </span>
  );
}
