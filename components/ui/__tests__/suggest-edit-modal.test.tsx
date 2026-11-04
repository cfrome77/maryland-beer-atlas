import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SuggestEditModal } from '../suggest-edit-modal';

describe('SuggestEditModal Component', () => {
  const defaultProps = {
    breweryId: 'test-brewery',
    brewerySlug: 'test-brewery',
    breweryName: 'Test Craft Brewery',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders trigger button and opens modal when clicked', () => {
    render(<SuggestEditModal {...defaultProps} />);

    const triggerBtn = screen.getByRole('button', { name: /suggest an edit/i });
    expect(triggerBtn).toBeInTheDocument();

    // Modal should not be open initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click trigger to open modal
    fireEvent.click(triggerBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Reporting update for')).toBeInTheDocument();
    expect(screen.getByText('Test Craft Brewery')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    render(<SuggestEditModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /suggest an edit/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('handles form inputs and successful API submission', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Thank you!' }),
    });
    global.fetch = mockFetch;

    render(<SuggestEditModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /suggest an edit/i }));

    const detailsTextarea = screen.getByPlaceholderText(/e\.g\., Open 2 PM/i);
    fireEvent.change(detailsTextarea, {
      target: { value: 'New taproom hours on Friday: 3pm to 10pm.' },
    });

    const submitBtn = screen.getByRole('button', { name: /submit suggestion/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/reports', expect.objectContaining({
        method: 'POST',
      }));
      expect(screen.getByText('Suggestion Received!')).toBeInTheDocument();
    });
  });

  it('renders amenity checkboxes when category is amenity_or_beer_update and sends corrections', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Thank you!' }),
    });
    global.fetch = mockFetch;

    render(<SuggestEditModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /suggest an edit/i }));

    const selectDropdown = screen.getByRole('combobox');
    fireEvent.change(selectDropdown, { target: { value: 'amenity_or_beer_update' } });

    expect(screen.getByText('Permanent Amenity Updates')).toBeInTheDocument();
    const kitchenCheckbox = screen.getByLabelText(/Has Permanent Kitchen/i);
    const patioCheckbox = screen.getByLabelText(/Has Outdoor Patio/i);

    expect(kitchenCheckbox).not.toBeChecked();
    expect(patioCheckbox).not.toBeChecked();

    fireEvent.click(kitchenCheckbox);
    fireEvent.click(patioCheckbox);

    expect(kitchenCheckbox).toBeChecked();
    expect(patioCheckbox).toBeChecked();

    const detailsTextarea = screen.getByPlaceholderText(/e\.g\., Open 2 PM/i);
    fireEvent.change(detailsTextarea, {
      target: { value: 'They added a permanent pizza kitchen and expanded outdoor patio seating.' },
    });

    const submitBtn = screen.getByRole('button', { name: /submit suggestion/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/reports',
        expect.objectContaining({
          body: expect.stringContaining('"hasKitchen":true'),
        })
      );
      expect(screen.getByText('Suggestion Received!')).toBeInTheDocument();
    });
  });

  it('displays error message when API request fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server temporarily unavailable' }),
    });
    global.fetch = mockFetch;

    render(<SuggestEditModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /suggest an edit/i }));

    const detailsTextarea = screen.getByPlaceholderText(/e\.g\., Open 2 PM/i);
    fireEvent.change(detailsTextarea, {
      target: { value: 'New taproom hours on Friday: 3pm to 10pm.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit suggestion/i }));

    await waitFor(() => {
      expect(screen.getByText('Server temporarily unavailable')).toBeInTheDocument();
    });
  });
});
