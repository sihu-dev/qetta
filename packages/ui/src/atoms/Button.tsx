/**
 * FORGE LABS UI - Button Component
 * L2 (Cells) - Primary interactive element
 *
 * Supabase-inspired button with multiple variants
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  `focus-visible:ring-offset-gray-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default: 'text-gray-1 bg-brand-400 shadow-sm hover:bg-brand-500 active:bg-brand-600',
        secondary: 'bg-gray-4 text-gray-12 hover:bg-gray-5 active:bg-gray-6 shadow-sm',
        outline:
          'border-gray-6 text-gray-12 hover:bg-gray-4 hover:border-gray-7 border bg-transparent',
        ghost: 'text-gray-12 hover:bg-gray-4 bg-transparent',
        destructive: 'bg-error-DEFAULT hover:bg-error-dark text-white shadow-sm active:bg-red-700',
        success: 'bg-success-DEFAULT hover:bg-success-dark text-white shadow-sm',
        link: 'text-brand-400 underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-7 rounded px-2.5 text-xs',
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-base',
        xl: 'h-12 px-8 text-lg',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-10 w-10 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render as child element (for composition with links, etc.) */
  asChild?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Icon to display before text */
  leftIcon?: React.ReactNode;
  /** Icon to display after text */
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
