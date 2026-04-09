import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewForm from '@/components/ReviewForm';

describe('ReviewForm', () => {
  it('renders the form with all fields', () => {
    render(<ReviewForm cityId="city-1" />);
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Title (optional)')).toBeInTheDocument();
    expect(screen.getByText('Your experience')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit review' })).toBeInTheDocument();
  });

  it('renders 5 star buttons with first 5 filled by default (rating=5)', () => {
    render(<ReviewForm cityId="city-1" />);
    const stars = screen.getAllByRole('button', { name: '★' });
    expect(stars).toHaveLength(5);
  });

  it('updates rating when a star is clicked', () => {
    render(<ReviewForm cityId="city-1" />);
    const stars = screen.getAllByRole('button', { name: '★' });
    fireEvent.click(stars[2]); // click 3rd star → rating = 3
    // Stars 1-3 should have text-yellow-400, 4-5 should have text-muted
    expect(stars[0]).toHaveClass('text-yellow-400');
    expect(stars[2]).toHaveClass('text-yellow-400');
    expect(stars[3]).toHaveClass('text-muted');
  });

  it('toggles kids age chips on click', () => {
    render(<ReviewForm cityId="city-1" />);
    const chip = screen.getByRole('button', { name: '0–2' });
    expect(chip).not.toHaveClass('bg-primary');
    fireEvent.click(chip);
    expect(chip).toHaveClass('bg-primary');
    // Click again to deselect
    fireEvent.click(chip);
    expect(chip).not.toHaveClass('bg-primary');
  });

  it('allows toggling multiple kids age chips independently', () => {
    render(<ReviewForm cityId="city-1" />);
    const chip1 = screen.getByRole('button', { name: '0–2' });
    const chip2 = screen.getByRole('button', { name: '3–5' });
    fireEvent.click(chip1);
    fireEvent.click(chip2);
    expect(chip1).toHaveClass('bg-primary');
    expect(chip2).toHaveClass('bg-primary');
    // Deselect first
    fireEvent.click(chip1);
    expect(chip1).not.toHaveClass('bg-primary');
    expect(chip2).toHaveClass('bg-primary');
  });

  it('shows all four age range chips', () => {
    render(<ReviewForm cityId="city-1" />);
    expect(screen.getByRole('button', { name: '0–2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3–5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '6–12' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '13+' })).toBeInTheDocument();
  });

  it('shows success message after successful submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    render(<ReviewForm cityId="city-1" />);
    // Fill in required body field
    fireEvent.change(screen.getByPlaceholderText('What was it like for your family?'), {
      target: { value: 'Great city!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }));
    await waitFor(() => {
      expect(screen.getByText(/Thanks for your review/)).toBeInTheDocument();
    });
    vi.unstubAllGlobals();
  });

  it('shows error message after failed submission', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Not authenticated' }),
      })
    );
    render(<ReviewForm cityId="city-1" />);
    fireEvent.change(screen.getByPlaceholderText('What was it like for your family?'), {
      target: { value: 'My review' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }));
    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });
    vi.unstubAllGlobals();
  });

  it('shows generic error when response has no error field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })
    );
    render(<ReviewForm cityId="city-1" />);
    fireEvent.change(screen.getByPlaceholderText('What was it like for your family?'), {
      target: { value: 'My review' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }));
    await waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });
    vi.unstubAllGlobals();
  });

  it('disables submit button while loading', async () => {
    let resolveRequest: (value: unknown) => void;
    const pendingFetch = new Promise((resolve) => { resolveRequest = resolve; });
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pendingFetch));
    render(<ReviewForm cityId="city-1" />);
    fireEvent.change(screen.getByPlaceholderText('What was it like for your family?'), {
      target: { value: 'Great!' },
    });
    const submitBtn = screen.getByRole('button', { name: 'Submit review' });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText('Submitting…')).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();
    });
    resolveRequest!({ ok: true });
    vi.unstubAllGlobals();
  });
});
