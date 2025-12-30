/**
 * FORGE LABS UI - PageHeader Fragment
 * L3 (Tissues) - Page title and actions header
 *
 * Supabase-inspired page header layout
 */

import * as React from 'react';
import { cn } from '../lib/cn';
import { Skeleton } from '../atoms/Skeleton';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Page title */
  title: string;
  /** Optional description */
  description?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Action buttons/elements */
  actions?: React.ReactNode;
  /** Badge or status indicator */
  badge?: React.ReactNode;
  /** Icon for the page */
  icon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Tabs or secondary navigation */
  tabs?: React.ReactNode;
  /** Sticky header */
  sticky?: boolean;
}

// Breadcrumb component
const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="text-gray-11 flex items-center gap-1 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg
              className="text-gray-9 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-gray-12 flex items-center gap-1 transition-colors"
            >
              {item.icon}
              {item.label}
            </a>
          ) : (
            <span className="text-gray-12 flex items-center gap-1">
              {item.icon}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      className,
      title,
      description,
      breadcrumbs,
      actions,
      badge,
      icon,
      loading = false,
      tabs,
      sticky = false,
      ...props
    },
    ref
  ) => {
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            'border-gray-5 bg-gray-1 border-b px-6 py-4',
            sticky && 'sticky top-0 z-10',
            className
          )}
          {...props}
        >
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('border-gray-5 bg-gray-1 border-b', sticky && 'sticky top-0 z-10', className)}
        {...props}
      >
        <div className="space-y-4 px-6 py-4">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

          {/* Header content */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              {/* Icon */}
              {icon && (
                <div className="bg-gray-4 text-gray-11 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                  {icon}
                </div>
              )}

              {/* Title and description */}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-gray-12 truncate text-2xl font-bold tracking-tight">
                    {title}
                  </h1>
                  {badge}
                </div>
                {description && <p className="text-gray-11 line-clamp-2 text-sm">{description}</p>}
              </div>
            </div>

            {/* Actions */}
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </div>

        {/* Tabs */}
        {tabs && <div className="-mb-px px-6">{tabs}</div>}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export { PageHeader };
