/**
 * Spinner component placeholder.
 * Implement styling based on your design system.
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size: _size = 'md' }: SpinnerProps) {
  return <div>Loading...</div>;
}
