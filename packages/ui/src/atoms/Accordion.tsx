/**
 * FORGE LABS UI - Accordion Component
 * L2 (Cells) - Collapsible content panels
 *
 * Supabase-inspired accordion with animated expand/collapse
 */

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

const accordionVariants = cva('w-full', {
  variants: {
    variant: {
      default: '',
      bordered: 'border-gray-6 divide-gray-6 divide-y rounded-lg border',
      separated: 'space-y-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionItemVariants = cva('border-gray-6 border-b last:border-b-0', {
  variants: {
    variant: {
      default: '',
      bordered: 'border-b-0 last:border-b-0',
      separated: 'border-gray-6 overflow-hidden rounded-lg border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const accordionTriggerVariants = cva(
  `text-gray-12 hover:text-gray-11 focus-visible:ring-offset-gray-1 flex w-full flex-1 items-center justify-between py-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 [&[data-state=open]>svg]:rotate-180`,
  {
    variants: {
      size: {
        sm: 'py-2 text-xs',
        md: 'py-4 text-sm',
        lg: 'py-5 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const accordionContentVariants = cva(
  `text-gray-11 overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down`,
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> &
  VariantProps<typeof accordionVariants> & {
    /** Accordion variant style */
    variant?: 'default' | 'bordered' | 'separated';
  };

export interface AccordionItemProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Item
> {
  /** Inherits variant from parent Accordion */
  variant?: 'default' | 'bordered' | 'separated';
}

export interface AccordionTriggerProps
  extends
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>,
    VariantProps<typeof accordionTriggerVariants> {
  /** Hide the chevron icon */
  hideIcon?: boolean;
  /** Custom icon to replace default chevron */
  icon?: React.ReactNode;
}

export interface AccordionContentProps
  extends
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>,
    VariantProps<typeof accordionContentVariants> {}

const AccordionContext = React.createContext<{
  variant?: 'default' | 'bordered' | 'separated';
  size?: 'sm' | 'md' | 'lg';
}>({});

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ className, variant = 'default', children, ...props }, ref) => {
  return (
    <AccordionContext.Provider value={{ variant }}>
      <AccordionPrimitive.Root
        ref={ref}
        className={cn(accordionVariants({ variant }), className)}
        {...props}
      >
        {children}
      </AccordionPrimitive.Root>
    </AccordionContext.Provider>
  );
});
Accordion.displayName = 'Accordion';

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, variant: propVariant, ...props }, ref) => {
  const { variant: contextVariant } = React.useContext(AccordionContext);
  const variant = propVariant ?? contextVariant ?? 'default';

  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  );
});
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, size, hideIcon = false, icon, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(accordionTriggerVariants({ size }), className)}
      {...props}
    >
      {children}
      {!hideIcon &&
        (icon ?? (
          <ChevronDown className="text-gray-11 h-4 w-4 shrink-0 transition-transform duration-200" />
        ))}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, size, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(accordionContentVariants({ size }), className)}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  accordionVariants,
  accordionItemVariants,
  accordionTriggerVariants,
  accordionContentVariants,
};
