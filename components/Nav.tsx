import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import MobileMenu from './MobileMenu';

const links = [
  { href: '/cities', label: 'Cities' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Pricing' },
];

export default async function Nav() {
  let user = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    // Auth check failed (e.g. missing env vars, network error).
    // Render nav as unauthenticated.
    console.error('Nav auth check failed:', error);
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Roaming Families
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="hidden md:inline-flex rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
          {/* Mobile hamburger */}
          <MobileMenu links={links} isAuthenticated={!!user} />
        </div>
      </div>
    </header>
  );
}
