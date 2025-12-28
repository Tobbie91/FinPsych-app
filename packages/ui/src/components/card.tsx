/**
 * Card component placeholder.
 * Implement styling based on your design system.
 */

import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, ...props }: CardProps) {
  return <div {...props}>{children}</div>;
}
