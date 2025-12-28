import { redirect } from 'next/navigation';

/**
 * Root page redirects to dashboard.
 * Auth check happens in the dashboard layout.
 */
export default function HomePage() {
  redirect('/dashboard');
}
