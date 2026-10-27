const fs = require('fs');
const path = require('path');

describe('frontend sidebar & widget affiliate unification', () => {
  const sidebarPath = path.resolve(__dirname, '../../../frontend/src/config/sidebar.ts');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

  const companyAppsPath = path.resolve(__dirname, '../../../frontend/src/utils/companyApps.ts');
  const companyAppsContent = fs.readFileSync(companyAppsPath, 'utf8');

  const marketplaceUtilsPath = path.resolve(__dirname, '../../../frontend/src/utils/marketplace.ts');
  const marketplaceUtilsContent = fs.readFileSync(marketplaceUtilsPath, 'utf8');

  const myAppsTypesPath = path.resolve(__dirname, '../../../frontend/src/pages/marketplace/types/myAppsTypes.ts');
  const myAppsTypesContent = fs.readFileSync(myAppsTypesPath, 'utf8');

  const installedAppsDashboardPath = path.resolve(__dirname, '../../../frontend/src/components/dashboard/InstalledAppsDashboard.tsx');
  const installedAppsDashboardContent = fs.readFileSync(installedAppsDashboardPath, 'utf8');

  const widgetRegistryPath = path.resolve(__dirname, '../../../frontend/src/components/dashboard/widgets/registry.ts');
  const widgetRegistryContent = fs.readFileSync(widgetRegistryPath, 'utf8');

  describe('sidebar.ts configuration', () => {
    test('affiliate section uses isAnyAppActive with both affiliate-pro and affiliate-program', () => {
      // Must use isAnyAppActive with both slugs
      expect(sidebarContent).toMatch(/id:\s*['"]affiliate['"]/);
      expect(sidebarContent).toMatch(/hidden:\s*!isAnyAppActive\(\s*\[\s*['"]affiliate-pro['"]\s*,\s*['"]affiliate-program['"]\s*\]\s*\)/);
    });

    test('amazon section is untouched and still requires amazon-affiliate-pro', () => {
      expect(sidebarContent).toMatch(/id:\s*['"]amazon-affiliate['"]/);
      expect(sidebarContent).toMatch(/hidden:\s*!isAppActive\(\s*['"]amazon-affiliate-pro['"]\s*\)/);
    });

    // Helper implementing the exact isAppActive / isAnyAppActive logic from sidebar.ts (lines 282-295)
    const createSidebarVisibilityChecker = (activeApps) => {
      const isAppActive = (slug) => {
        if (!slug || !Array.isArray(activeApps)) return false;
        const targetSlug = slug.trim().toLowerCase();
        return activeApps.some((a) => {
          if (typeof a === 'string') return a.trim().toLowerCase() === targetSlug;
          if (a && typeof a === 'object') {
            if (typeof a.slug === 'string' && a.slug.trim().toLowerCase() === targetSlug) return true;
            if (a.app && typeof a.app.slug === 'string' && a.app.slug.trim().toLowerCase() === targetSlug) return true;
          }
          return false;
        });
      };
      const isAnyAppActive = (slugs) => slugs.some((slug) => isAppActive(slug));

      return {
        isAffiliateHidden: !isAnyAppActive(['affiliate-pro', 'affiliate-program']),
        isAmazonHidden: !isAppActive('amazon-affiliate-pro'),
      };
    };

    test('sidebar affiliate section is visible when activeApps = ["affiliate-program"]', () => {
      const { isAffiliateHidden } = createSidebarVisibilityChecker(['affiliate-program']);
      expect(isAffiliateHidden).toBe(false);
    });

    test('sidebar affiliate section is visible when activeApps = ["affiliate-pro"]', () => {
      const { isAffiliateHidden } = createSidebarVisibilityChecker(['affiliate-pro']);
      expect(isAffiliateHidden).toBe(false);
    });

    test('sidebar affiliate section is visible when activeApps has both slugs', () => {
      const { isAffiliateHidden } = createSidebarVisibilityChecker(['affiliate-program', 'affiliate-pro']);
      expect(isAffiliateHidden).toBe(false);
    });

    test('sidebar affiliate section is hidden when activeApps = []', () => {
      const { isAffiliateHidden } = createSidebarVisibilityChecker([]);
      expect(isAffiliateHidden).toBe(true);
    });

    test('sidebar affiliate section is hidden when activeApps contains only unrelated apps', () => {
      const { isAffiliateHidden } = createSidebarVisibilityChecker(['order-core', 'store-pro']);
      expect(isAffiliateHidden).toBe(true);
    });

    test('amazon-affiliate section stays hidden when only affiliate-pro is active', () => {
      const { isAmazonHidden } = createSidebarVisibilityChecker(['affiliate-pro']);
      expect(isAmazonHidden).toBe(true);
    });

    test('amazon-affiliate section is visible when amazon-affiliate-pro is active', () => {
      const { isAmazonHidden } = createSidebarVisibilityChecker(['amazon-affiliate-pro']);
      expect(isAmazonHidden).toBe(false);
    });
  });

  describe('dashboard widgets & company apps integration', () => {
    test('companyApps.ts includes both slugs in operation sets', () => {
      expect(companyAppsContent).toContain('"affiliate-pro"');
      expect(companyAppsContent).toContain('"affiliate-program"');
      expect(companyAppsContent).toMatch(/AFFILIATE_OPERATION_APP_SLUGS\s*=\s*new Set\(\[\s*["']affiliate-pro["'],\s*["']affiliate-program["']/);
      expect(companyAppsContent).toMatch(/MERCHANT_OPERATION_APP_SLUGS\s*=\s*new Set\(\[\s*["']affiliate-pro["'],\s*["']affiliate-program["']/);
    });

    test('widget registry accepts both slugs for affiliate widget', () => {
      expect(widgetRegistryContent).toMatch(/appSlug:\s*['"]affiliate-pro['"]/);
      expect(widgetRegistryContent).toMatch(/aliases:\s*\[\s*['"]affiliate-program['"]\s*\]/);
    });

    test('marketplace route mappings map affiliate-program to /affiliates/dashboard', () => {
      expect(marketplaceUtilsContent).toMatch(/["']affiliate-program["']:\s*["']\/affiliates\/dashboard["']/);
      expect(myAppsTypesContent).toMatch(/["']affiliate-program["']:\s*["']\/affiliates\/dashboard["']/);
      expect(installedAppsDashboardContent).toMatch(/['"]affiliate-program['"]:\s*['"]\/affiliates\/dashboard['"]/);
    });
  });
});
