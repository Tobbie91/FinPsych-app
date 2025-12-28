/**
 * Button component placeholder.
 * Implement styling based on your design system.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant: _variant = 'primary',
  size: _size = 'md',
  isLoading: _isLoading = false,
  ...props
}: ButtonProps) {
  return <button {...props}>{children}</button>;
}
