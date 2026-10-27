import { describe, expect, it } from 'vitest';
import { getSidebarConfig } from '../sidebar';

describe('Sidebar Affiliate Section Unification', () => {
  const t = (key: string, def?: string) => def || key;

  const buildSidebar = (activeApps: string[]) =>
    getSidebarConfig(t, {
      role: 'OWNER',
      company: {
        isCurrent: true,
        activeApps,
      },
      companies: [
        {
          isCurrent: true,
          activeApps,
        },
      ],
    });

  it('is visible when activeApps = ["affiliate-program"] (legacy slug)', () => {
    const config = buildSidebar(['affiliate-program']);
    const affiliateSection = config.find((s) => s.id === 'affiliate');

    expect(affiliateSection).toBeDefined();
    expect(affiliateSection?.hidden).toBe(false);
  });

  it('is visible when activeApps = ["affiliate-pro"] (surviving slug)', () => {
    const config = buildSidebar(['affiliate-pro']);
    const affiliateSection = config.find((s) => s.id === 'affiliate');

    expect(affiliateSection).toBeDefined();
    expect(affiliateSection?.hidden).toBe(false);
  });

  it('is visible when both slugs are present in activeApps', () => {
    const config = buildSidebar(['affiliate-program', 'affiliate-pro']);
    const affiliateSection = config.find((s) => s.id === 'affiliate');

    expect(affiliateSection).toBeDefined();
    expect(affiliateSection?.hidden).toBe(false);
  });

  it('is hidden when activeApps = []', () => {
    const config = buildSidebar([]);
    const affiliateSection = config.find((s) => s.id === 'affiliate');

    expect(affiliateSection).toBeDefined();
    expect(affiliateSection?.hidden).toBe(true);
  });

  it('is hidden when activeApps contains only unrelated apps', () => {
    const config = buildSidebar(['store-pro', 'crm-basic']);
    const affiliateSection = config.find((s) => s.id === 'affiliate');

    expect(affiliateSection).toBeDefined();
    expect(affiliateSection?.hidden).toBe(true);
  });

  it('preserves amazon-affiliate section independently', () => {
    const configWithoutAmazon = buildSidebar(['affiliate-pro']);
    const amazonSectionWithout = configWithoutAmazon.find((s) => s.id === 'amazon-affiliate');
    expect(amazonSectionWithout?.hidden).toBe(true);

    const configWithAmazon = buildSidebar(['amazon-affiliate-pro']);
    const amazonSectionWith = configWithAmazon.find((s) => s.id === 'amazon-affiliate');
    expect(amazonSectionWith?.hidden).toBe(false);
  });
});
