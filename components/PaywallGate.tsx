import Link from 'next/link';

interface PaywallGateProps {
  isPro: boolean;
  children: React.ReactNode;
}

export default function PaywallGate({ isPro, children }: PaywallGateProps) {
  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/95 border rounded-xl shadow-lg p-6 text-center max-w-xs mx-4">
          <p className="font-semibold mb-1">Pro feature</p>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade to FamilyRoam Pro to unlock this section.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Upgrade →
          </Link>
        </div>
      </div>
    </div>
  );
}
