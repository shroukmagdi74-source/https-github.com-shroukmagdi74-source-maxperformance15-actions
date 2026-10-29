# Architectural Decision Record: Platform Subscriptions Ledger & Entitlements Separation

**Task:** T17 — Packages System Removal & Subscriptions Hardening  
**Date:** 2026-10-29  
**Status:** Accepted & Implemented  

---

## 1. Context & Architectural Overview

The legacy platform previously bundled application features into rigid platform subscription plans (`BASIC`, `PRO`, `ENTERPRISE` via `SubscriptionsPlanType` and `companies_plan`). This design was deprecated and completely removed from the product catalog in favor of individual Marketplace applications and bundles (`messaging-bundle`, `ai-inbox-bundle`, `medical-bundle`, etc.).

During the removal of legacy plan entities, the role of `PlatformSubscription` (table: `platform_subscriptions`) was strictly clarified and decoupled from entitlement logic:

1. **`platform_subscriptions` is a Financial/Billing Ledger Only:**
   - It records financial recurring billing state: `monthlyFee`, `status`, `billingDay`, `nextBillingDate`, `trialEndDate`, `lastBillingDate`, and `failedAttempts`.
   - It contains **no** `plan` column, **no** plan type enum, and **no** entitlement decision logic.

2. **`company_apps` is the Sole Source of Truth for Entitlement:**
   - Feature and application access are governed strictly by records in `company_apps` (`status`, `validUntil`, `trialEndsAt`, `nextBillingAt`).
   - Proven in `platformSubscriptionController.js` (lines 106–116): when payment succeeds, `platformSubscription.upsert` updates the billing ledger, while `companyApp.upsert` provisions the actual application licenses.

---

## 2. Whitelist of Justified Remaining References

Per Criterion #1 of T17, any remaining occurrences of terms like `monthlyFee` or `plan` in legacy schemas are justified and documented below:

| Component / File | Field / Symbol | Justification & Architectural Role |
| :--- | :--- | :--- |
| `apps/backend/controller/platformSubscriptionController.js` | `monthlyFee: amount` | Records the agreed monthly recurring charge for active bundles (e.g. 999 EGP for Messaging bundle, 299 EGP for HR bundle) in the billing ledger. |
| `apps/backend/services/billingService.js` | `monthlyFee: 0` | Baseline initial billing ledger row for new companies (zero fee until a paid bundle is activated). |
| `apps/backend/routes/platformRevenueRoutes.js` | `monthlyFee` aggregation | Computes platform MRR, revenue breakdowns, and affiliate commissions based on actual collected billing fees. |
| `apps/backend/controller/superAdminApiController.js:788-795` | `estimatedMRR`, `statusBreakdown` | Operational telemetry showing subscription health (ACTIVE, CANCELLED) and MRR without any plan segmentation. |
| `apps/backend/prisma/verify_schema/core.prisma` | `planConfigurationId` | Archived verification schema (marked as `// DEAD FILE — legacy verify schema`). Does not affect runtime Prisma client. |
| `apps/backend/catalog/marketplace/bundles.json` | `monthlyPrice: 999/299` | Business catalog definition of marketplace bundle pricing. Prices are data driven from catalog JSON, not hardcoded in controllers. |

---

## 3. Data Protection & Production Safety (P0 Mandate)

- **Preservation of Paid Customer Entitlements:**
  Existing subscribers in `platform_subscriptions` with `monthlyFee > 0` and active dates retain full uninterrupted access because access checks resolve against `company_apps`.
- **Zero In-Place Drop of Table:**
  The table `platform_subscriptions` must NEVER be dropped. The legacy column `plan` and legacy enums were safely removed in migration `20261001_remove_legacy_plans_system`.
- **Dry-Run Backups:**
  Any administrative snapshot of `platform_subscriptions` must be executed through `scripts/platform-subscriptions-backup.js` in dry-run mode prior to execution.
