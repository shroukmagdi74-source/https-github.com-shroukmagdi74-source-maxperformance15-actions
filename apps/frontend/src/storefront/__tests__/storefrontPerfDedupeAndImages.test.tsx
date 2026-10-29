// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../services/apiClient';
import { storefrontSettingsService } from '../../services/storefrontSettingsService';
import {
  resetStorefrontShippingQuoteCacheForTests,
  storefrontApi,
} from '../../utils/storefrontApi';
import ProductDescription from '../sections/product-info/components/ProductDescription';

describe('storefront performance deduplication & image optimization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    storefrontSettingsService.clearCache('');
    resetStorefrontShippingQuoteCacheForTests();
    window.localStorage.clear();
  });

  it('rewrites /uploads/ images inside ProductDescription HTML through proxy-image with lazy + async decoding', () => {
    const html = `
      <p>تفاصيل المنتج</p>
      <img src="/uploads/products/raw-2mb-photo.png" alt="صورة تفصيلية">
      <img src="https://cdn.otherdomain.com/spec.svg" alt="خارجية" />
    `;
    const { container } = render(<ProductDescription safeDescription={html} />);
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(2);

    expect(images[0].getAttribute('src')).toBe(
      '/api/proxy-image?url=%2Fuploads%2Fproducts%2Fraw-2mb-photo.png&w=720&q=78&format=webp',
    );
    expect(images[0].getAttribute('loading')).toBe('lazy');
    expect(images[0].getAttribute('decoding')).toBe('async');

    expect(images[1].getAttribute('src')).toBe('https://cdn.otherdomain.com/spec.svg');
    expect(images[1].getAttribute('loading')).toBe('lazy');
    expect(images[1].getAttribute('decoding')).toBe('async');
  });

  it('deduplicates concurrent getPublicSettings calls and bridges cold host cache to companyId', async () => {
    let resolveGet!: (val: unknown) => void;
    const getSpy = vi.spyOn(apiClient, 'get').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveGet = resolve;
        }) as any,
    );

    const coldCall1 = storefrontSettingsService.getPublicSettings();
    const coldCall2 = storefrontSettingsService.getPublicSettings();
    const companyCallWhileInflight = storefrontSettingsService.getPublicSettings('cmp_swan');

    resolveGet({
      data: {
        success: true,
        data: {
          companyId: 'cmp_swan',
          storeName: 'Swan Footwear',
          tiktokPixelEnabled: true,
          tiktokPixelId: 'TT_123',
        },
      },
    });

    const [r1, r2, r3] = await Promise.all([
      coldCall1,
      coldCall2,
      companyCallWhileInflight,
    ]);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(r1.data.companyId).toBe('cmp_swan');
    expect(r2.data.companyId).toBe('cmp_swan');
    expect(r3.data.tiktokPixelId).toBe('TT_123');

    // Subsequent call within 60s TTL hits memory cache
    const cachedCompanyCall = await storefrontSettingsService.getPublicSettings('cmp_swan');
    expect(cachedCompanyCall.data.storeName).toBe('Swan Footwear');
    expect(getSpy).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent storefrontApi.calculateShipping calls and caches quotes for 60s', async () => {
    let resolveFetch!: (val: Response) => void;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const p1 = storefrontApi.calculateShipping('Cairo', 'cmp_swan', [
      { productId: 'prod_1', quantity: 1 },
    ]);
    const p2 = storefrontApi.calculateShipping(' cairo ', 'cmp_swan', [
      { productId: 'prod_1', quantity: 1 },
    ]);

    resolveFetch(
      new Response(
        JSON.stringify({
          success: true,
          data: { price: 65, methods: [{ title: 'توصيل سريع' }] },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const [res1, res2] = await Promise.all([p1, p2]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(res1.data.price).toBe(65);
    expect(res2.data.price).toBe(65);

    const res3 = await storefrontApi.calculateShipping('Cairo', 'cmp_swan', [
      { productId: 'prod_1', quantity: 1 },
    ]);
    expect(res3.data.price).toBe(65);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
