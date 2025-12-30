/**
 * 기능 그리드 컴포넌트
 */
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeatureGrid({ features, columns = 4, className }: FeatureGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {features.map((feature) => (
        <div key={feature.title} className="bg-card rounded-xl border p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <feature.icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 font-semibold">{feature.title}</h3>
          <p className="text-muted-foreground text-sm">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  centered?: boolean;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  centered = false,
  className,
}: FeatureCardProps) {
  return (
    <div className={cn('bg-card rounded-xl border p-6', centered && 'text-center', className)}>
      <div
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10',
          centered && 'mx-auto'
        )}
      >
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
