// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { StudioInspectorAnalyticsTab } from '../studio/inspector/StudioInspectorAnalyticsTab';

describe('Studio Inspector Analytics Tab (AN-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders initial state, duration toggle, and displays empty state with zero fake numbers', async () => {
    const emptyResponse = {
      totals: { views: 0, clicks: 0, ctr: 0 },
      pages: [],
      sections: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => emptyResponse,
    });

    render(
      <StudioInspectorAnalyticsTab
        companyId="company-123"
        activePageKey="home"
        initialSubView="traffic"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('analytics-total-views').textContent).toBe('0');
      expect(screen.getByTestId('analytics-total-clicks').textContent).toBe('0');
      expect(screen.getByTestId('analytics-total-ctr').textContent).toBe('—');
    });

    // Check empty state messages
    expect(screen.getByTestId('analytics-empty-pages').textContent).toContain('مفيش بيانات بعد');
    expect(screen.getByTestId('analytics-empty-sections').textContent).toContain('مفيش بيانات بعد');

    // Default duration is 7 days
    expect(screen.getByTestId('analytics-days-7').className).toContain('bg-white');
  });

  it('renders real analytics metrics correctly when API returns data', async () => {
    const mockData = {
      totals: { views: 250, clicks: 50, ctr: 0.2 },
      pages: [
        { pageKey: 'home', views: 200, clicks: 45 },
        { pageKey: 'shop', views: 50, clicks: 5 },
      ],
      sections: [
        { sectionType: 'hero-banner', views: 180, clicks: 35 },
        { sectionType: 'product-grid', views: 70, clicks: 15 },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    render(
      <StudioInspectorAnalyticsTab
        companyId="company-123"
        activePageKey="home"
        initialSubView="traffic"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('analytics-total-views').textContent).toBe('250');
      expect(screen.getByTestId('analytics-total-clicks').textContent).toBe('50');
      expect(screen.getByTestId('analytics-total-ctr').textContent).toBe('20.0%');
    });

    // Check page rows
    expect(screen.getByTestId('analytics-page-row-home')).toBeTruthy();
    expect(screen.getByTestId('analytics-page-row-shop')).toBeTruthy();

    // Check section rows
    expect(screen.getByTestId('analytics-section-row-hero-banner')).toBeTruthy();
    expect(screen.getByTestId('analytics-section-row-product-grid')).toBeTruthy();
  });

  it('switches duration and triggers a new API request with updated days parameter', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        totals: { views: 10, clicks: 1, ctr: 0.1 },
        pages: [],
        sections: [],
      }),
    });
    global.fetch = fetchMock;

    render(<StudioInspectorAnalyticsTab companyId="company-123" initialSubView="traffic" />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('days=7'),
        expect.anything()
      );
    });

    // Click on 14 days button
    const btn14 = screen.getByTestId('analytics-days-14');
    fireEvent.click(btn14);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('days=14'),
        expect.anything()
      );
    });

    // Click refresh button
    const refreshBtn = screen.getByTestId('analytics-refresh-button');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });
});
