/**
 * FORGE LABS UI - MetricCard Fragment
 * L3 (Tissues) - Key metric display card
 *
 * Supabase-inspired metric visualization
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { Card } from '../atoms/Card';
import { Skeleton } from '../atoms/Skeleton';

const metricCardVariants = cva('', {
  variants: {
    trend: {
      up: 'text-success-DEFAULT',
      down: 'text-error-DEFAULT',
      neutral: 'text-gray-11',
    },
  },
  defaultVariants: {
    trend: 'neutral',
  },
});

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof metricCardVariants> {
  /** Metric title/label */
  title: string;
  /** Main metric value */
  value: string | number;
  /** Subtitle or description */
  subtitle?: string;
  /** Change value (e.g., "+12.5%") */
  change?: string;
  /** Change period (e.g., "vs last month") */
  changePeriod?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Sparkline chart data */
  sparkline?: number[];
  /** Click handler */
  onClick?: () => void;
}

// Simple sparkline component
const Sparkline: React.FC<{ data: number[]; trend?: 'up' | 'down' | 'neutral' }> = ({
  data,
  trend = 'neutral',
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#707070';

  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// Trend arrow icons
const TrendUp = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const TrendDown = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      className,
      title,
      value,
      subtitle,
      change,
      changePeriod,
      trend = 'neutral',
      icon,
      loading = false,
      sparkline,
      onClick,
      ...props
    },
    ref
  ) => {
    if (loading) {
      return (
        <Card ref={ref} className={cn('p-4', className)} {...props}>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        variant={onClick ? 'interactive' : 'default'}
        className={cn('p-4', className)}
        onClick={onClick}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-gray-11 text-sm font-medium">{title}</p>
            <p className="text-gray-12 text-2xl font-bold tracking-tight">{value}</p>
            {(change || subtitle) && (
              <div className="flex items-center gap-2">
                {change && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-sm font-medium',
                      metricCardVariants({ trend })
                    )}
                  >
                    {trend === 'up' && <TrendUp />}
                    {trend === 'down' && <TrendDown />}
                    {change}
                  </span>
                )}
                {changePeriod && <span className="text-gray-9 text-xs">{changePeriod}</span>}
                {subtitle && !change && <span className="text-gray-11 text-sm">{subtitle}</span>}
              </div>
            )}
          </div>
          {icon && (
            <div className="bg-gray-4 text-gray-11 flex h-10 w-10 items-center justify-center rounded-lg">
              {icon}
            </div>
          )}
        </div>
        {sparkline && sparkline.length > 1 && (
          <div className="-mx-1 mt-4">
            <Sparkline data={sparkline} trend={trend ?? 'neutral'} />
          </div>
        )}
      </Card>
    );
  }
);

MetricCard.displayName = 'MetricCard';

export { MetricCard };
