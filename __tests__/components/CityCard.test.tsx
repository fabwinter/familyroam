import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CityCard from '@/components/CityCard';

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/SaveCityButton', () => ({
  default: ({ cityId }: { cityId: string }) => (
    <button aria-label="Save city" data-city-id={cityId} />
  ),
}));

const baseProps = {
  slug: 'lisbon',
  name: 'Lisbon',
  country: 'Portugal',
};

describe('CityCard', () => {
  it('renders city name and country', () => {
    render(<CityCard {...baseProps} />);
    expect(screen.getByText('Lisbon')).toBeInTheDocument();
    expect(screen.getByText('Portugal')).toBeInTheDocument();
  });

  it('links to the correct city page', () => {
    render(<CityCard {...baseProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cities/lisbon');
  });

  it('renders a fallback image when no imageUrl is provided', () => {
    render(<CityCard {...baseProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', expect.stringMatching(/picsum\.photos|unsplash\.com/));
    expect(img).toHaveAttribute('alt', 'Lisbon');
  });

  it('renders an img tag when imageUrl is provided', () => {
    render(<CityCard {...baseProps} imageUrl="https://example.com/lisbon.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/lisbon.jpg');
    expect(img).toHaveAttribute('alt', 'Lisbon');
  });

  it('shows costAvg when provided', () => {
    render(<CityCard {...baseProps} costAvg={2500} />);
    expect(screen.getByText(/2,500/)).toBeInTheDocument();
  });

  it('does not show cost when costAvg is null', () => {
    render(<CityCard {...baseProps} costAvg={null} />);
    expect(screen.queryByText(/\/mo/)).not.toBeInTheDocument();
  });

  it('shows safetyScore when provided', () => {
    render(<CityCard {...baseProps} safetyScore={85} />);
    expect(screen.getByText('🛡 85')).toBeInTheDocument();
  });

  it('does not show safety score when safetyScore is null', () => {
    render(<CityCard {...baseProps} safetyScore={null} />);
    expect(screen.queryByText(/🛡/)).not.toBeInTheDocument();
  });

  it('shows familyScore when provided', () => {
    render(<CityCard {...baseProps} familyScore={78} />);
    expect(screen.getByText('👨‍👩‍👧 78')).toBeInTheDocument();
  });

  it('does not show family score when familyScore is null', () => {
    render(<CityCard {...baseProps} familyScore={null} />);
    expect(screen.queryByText(/👨/)).not.toBeInTheDocument();
  });

  it('renders SaveCityButton when id is provided', () => {
    render(<CityCard {...baseProps} id="city-123" />);
    expect(screen.getByRole('button', { name: 'Save city' })).toBeInTheDocument();
  });

  it('does not render SaveCityButton when id is not provided', () => {
    render(<CityCard {...baseProps} />);
    expect(screen.queryByRole('button', { name: 'Save city' })).not.toBeInTheDocument();
  });

  it('renders with all optional props provided', () => {
    render(
      <CityCard
        {...baseProps}
        id="city-abc"
        costAvg={1800}
        safetyScore={90}
        familyScore={82}
        imageUrl="https://example.com/city.jpg"
      />
    );
    expect(screen.getByText('Lisbon')).toBeInTheDocument();
    expect(screen.getByText('Portugal')).toBeInTheDocument();
    expect(screen.getByText(/1,800/)).toBeInTheDocument();
    expect(screen.getByText('🛡 90')).toBeInTheDocument();
    expect(screen.getByText('👨‍👩‍👧 82')).toBeInTheDocument();
  });
});
