import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaywallGate from '@/components/PaywallGate';

// Mock next/link as a plain anchor element
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('PaywallGate', () => {
  const childContent = 'Secret content';

  it('renders children directly when isPro is true', () => {
    render(<PaywallGate isPro={true}><p>{childContent}</p></PaywallGate>);
    expect(screen.getByText(childContent)).toBeInTheDocument();
    expect(screen.queryByText('Pro feature')).not.toBeInTheDocument();
  });

  it('blurs children and shows paywall when isPro is false', () => {
    render(<PaywallGate isPro={false}><p>{childContent}</p></PaywallGate>);
    // Children still rendered (blurred) in the DOM
    expect(screen.getByText(childContent)).toBeInTheDocument();
    // Paywall overlay is shown
    expect(screen.getByText('Pro feature')).toBeInTheDocument();
    expect(screen.getByText(/Upgrade to FamilyRoam Pro/)).toBeInTheDocument();
  });

  it('renders an "Upgrade" link pointing to /pricing when not pro', () => {
    render(<PaywallGate isPro={false}><p>{childContent}</p></PaywallGate>);
    const link = screen.getByRole('link', { name: /upgrade/i });
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('applies blur and pointer-events-none to children when not pro', () => {
    render(<PaywallGate isPro={false}><p>{childContent}</p></PaywallGate>);
    const blurredDiv = screen.getByText(childContent).closest('div');
    expect(blurredDiv).toHaveClass('blur-sm');
    expect(blurredDiv).toHaveClass('pointer-events-none');
  });

  it('children are marked aria-hidden when blurred', () => {
    render(<PaywallGate isPro={false}><p>{childContent}</p></PaywallGate>);
    const blurredDiv = screen.getByText(childContent).closest('div');
    expect(blurredDiv).toHaveAttribute('aria-hidden');
  });
});
