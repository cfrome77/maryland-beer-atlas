import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'default' | 'narrow' | 'wide' | 'full';
  as?: React.ElementType;
}

export function PageContainer({
  children,
  className,
  size = 'default',
  as: Component = 'div',
  ...props
}: PageContainerProps) {
  const sizeClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <Component
      className={cn(
        'container mx-auto px-4 md:px-6 py-8 md:py-12 w-full',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
