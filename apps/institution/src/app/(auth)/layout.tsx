import type { ReactNode } from 'react';

/**
 * Auth layout wrapper for login and signup pages.
 * Add auth-specific styling/layout here.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
}
