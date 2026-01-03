'use client';

import type { ReactNode } from 'react';

/**
 * Protected layout for authenticated pages.
 * Simple wrapper - dashboard handles its own layout.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
