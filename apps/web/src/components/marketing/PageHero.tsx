/**
 * 마케팅 페이지 공통 히어로 섹션
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  badge?: string;
  icon?: LucideIcon;
  title: string;
  titleBreak?: boolean;
  description: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
    external?: boolean;
  };
  backLink?: {
    label: string;
    href: string;
  };
  centered?: boolean;
  className?: string;
}

export function PageHero({
  badge,
  icon: Icon,
  title,
  titleBreak = false,
  description,
  primaryCta,
  secondaryCta,
  backLink,
  centered = false,
  className,
}: PageHeroProps) {
  return (
    <section className={cn('py-20 lg:py-28', className)}>
      <div className="container mx-auto px-4">
        <div className={cn('max-w-4xl', centered && 'mx-auto text-center')}>
          {backLink && (
            <Link
              href={backLink.href}
              className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
            >
              ← {backLink.label}
            </Link>
          )}

          <div className={cn('mb-6 flex items-center gap-4', centered && 'justify-center')}>
            {Icon && (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-8 w-8 text-primary" />
              </div>
            )}
            {badge && <Badge variant="secondary">{badge}</Badge>}
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
            {titleBreak ? (
              <>
                {title.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < title.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </>
            ) : (
              title
            )}
          </h1>

          <p
            className={cn(
              'text-muted-foreground mb-8 text-xl',
              centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'
            )}
          >
            {description}
          </p>

          {(primaryCta || secondaryCta) && (
            <div className={cn('flex flex-wrap gap-4', centered && 'justify-center')}>
              {primaryCta && (
                <Button size="lg" asChild>
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              )}
              {secondaryCta && (
                <Button size="lg" variant="outline" asChild>
                  {secondaryCta.external ? (
                    <a href={secondaryCta.href} target="_blank" rel="noopener noreferrer">
                      {secondaryCta.label}
                    </a>
                  ) : (
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
