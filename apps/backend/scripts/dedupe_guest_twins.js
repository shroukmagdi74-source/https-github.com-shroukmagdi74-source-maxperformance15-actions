#!/usr/bin/env node
/**
 * dedupe_guest_twins.js
 *
 * One-time reconciliation for storefront "shadow" guest orders.
 *
 * Every storefront checkout writes TWO rows with the same order number:
 *   1) orders        (primary / source of truth)
 *   2) guest_orders  (backwards-compatible shadow)
 *
 * If both rows receive an active order_assignment, the Agent Workspace shows
 * the same order twice (once with the "زائر" badge). This script:
 *   - finds guest assignments that have a regular twin in the same company
 *   - moves the guest's call logs / notes / counters onto the regular row
 *   - keeps the regular row as the single visible order
 *   - transfers the assignment to the regular only when the regular has none
 *   - deactivates the guest assignment (does NOT delete the guest row)
 *
 * Usage (from apps/backend):
 *   node scripts/dedupe_guest_twins.js --dry-run
 *   node scripts/dedupe_guest_twins.js --dry-run --company=<companyId>
 *   node scripts/dedupe_guest_twins.js --dry-run --company-name=Swan
 *   node scripts/dedupe_guest_twins.js --apply   --company=<companyId>
 *
 * Safety:
 *   - dry-run is the default; nothing is written without --apply
 *   - every pair is processed in its own transaction
 *   - the guest row is only deactivated, never deleted
 *   - if the regular already has an active assignment, the guest one is only deactivated
 */

const { getSharedPrismaClient } = require('../services/sharedDatabase');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const DRY_RUN = !APPLY;
const argValue = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const companyIdArg = argValue('company');
const companyNameArg = argValue('company-name');

function maxDate(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

function mergeNotes(a, b) {
  const left = String(a || '').trim();
  const right = String(b || '').trim();
  if (!left) return right || null;
  if (!right) return left;
  if (left === right || left.includes(right)) return left;
  if (right.includes(left)) return right;
  return `${left}\n${right}`;
}

async function resolveCompanyId(prisma) {
  if (companyIdArg) return companyIdArg;
  if (!companyNameArg) return null;
  const company = await prisma.company.findFirst({
    where: { name: { contains: companyNameArg, mode: 'insensitive' } },
    select: { id: true, name: true },
  });
  if (!company) throw new Error(`Company not found: ${companyNameArg}`);
  console.log(`[INFO] Company: ${company.name} (${company.id})`);
  return company.id;
}

async function findPairs(prisma, companyId) {
  const guests = await prisma.guestOrder.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      orderAssignments: { some: { isActive: true } },
    },
    select: {
      id: true,
      companyId: true,
      orderNumber: true,
      guestName: true,
      total: true,
      finalTotal: true,
      status: true,
      callAttempts: true,
      lastCallAt: true,
      followUpDate: true,
      notes: true,
      metadata: true,
      orderAssignments: {
        where: { isActive: true },
        select: {
          id: true,
          assignedTo: true,
          assignedBy: true,
          assignedAt: true,
          strategy: true,
          metadata: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const pairs = [];
  for (const guest of guests) {
    let primaryOrderId = null;
    if (guest.metadata) {
      try {
        const meta = typeof guest.metadata === 'string' ? JSON.parse(guest.metadata) : guest.metadata;
        primaryOrderId = meta?.primaryOrderId || null;
      } catch (_e) {}
    }

    const orClauses = [];
    if (primaryOrderId) orClauses.push({ id: primaryOrderId });
    if (guest.orderNumber) orClauses.push({ orderNumber: { equals: guest.orderNumber, mode: 'insensitive' } });
    if (orClauses.length === 0) continue;

    const regular = await prisma.order.findFirst({
      where: { companyId: guest.companyId, OR: orClauses },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        callAttempts: true,
        lastCallAttemptAt: true,
        followUpDate: true,
        notes: true,
      },
    });
    if (!regular) continue;

    const guestAssignment = guest.orderAssignments[0] || null;
    if (!guestAssignment) continue;

    const regularAssignment = await prisma.orderAssignment.findFirst({
      where: { orderId: regular.id, isActive: true },
      select: { id: true, assignedTo: true },
    });

    const [callLogs, notes] = await Promise.all([
      prisma.callAttemptLog.count({ where: { guestOrderId: guest.id } }),
      prisma.orderNote.count({ where: { guestOrderId: guest.id } }),
    ]);

    pairs.push({ guest, regular, guestAssignment, regularAssignment, callLogs, notes });
  }
  return pairs;
}

const TERMINAL_STATUSES = new Set([
  'CANCELLED',
  'RETURNED',
  'DELIVERED',
  'PARTIALLY_DELIVERED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DUPLICATE_ORDER',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'TRASH',
  'LOST',
  'EXCHANGED',
]);

function isTerminalStatus(status) {
  if (!status) return false;
  return TERMINAL_STATUSES.has(String(status).trim().toUpperCase());
}

function shouldTransferAssignment(pair) {
  const { regular, regularAssignment } = pair;
  if (regularAssignment) return false;
  if (isTerminalStatus(regular.status)) return false;
  return true;
}

function printPair(pair) {
  const { guest, regular, guestAssignment, regularAssignment, callLogs, notes } = pair;
  const transfer = shouldTransferAssignment(pair);
  const actionText = transfer
    ? 'transfer guest assignment to regular, then deactivate guest assignment'
    : regularAssignment
    ? 'deactivate guest assignment only (regular already has active assignment)'
    : `deactivate guest assignment only (regular status is terminal: ${regular.status})`;

  console.log(
    [
      `PAIR  ${guest.orderNumber}`,
      `  guest   : ${guest.id} | ${guest.guestName || ''} | total=${guest.total} final=${guest.finalTotal} status=${guest.status} calls=${guest.callAttempts} assignedTo=${guestAssignment.assignedTo}`,
      `  regular : ${regular.id} | ${regular.customerName || ''} | total=${regular.total} status=${regular.status} calls=${regular.callAttempts} assignedTo=${regularAssignment ? regularAssignment.assignedTo : '(none)'}`,
      `  move    : callLogs=${callLogs} notes=${notes}`,
      `  action  : ${actionText}`,
    ].join('\n')
  );
}

async function applyPair(prisma, pair) {
  const { guest, regular, guestAssignment, callLogs } = pair;

  await prisma.$transaction(async (tx) => {
    // 1) Move call logs and notes to the regular order.
    if (callLogs > 0) {
      await tx.callAttemptLog.updateMany({
        where: { guestOrderId: guest.id },
        data: { orderId: regular.id, guestOrderId: null },
      });
    }
    await tx.orderNote.updateMany({
      where: { guestOrderId: guest.id },
      data: { orderId: regular.id, guestOrderId: null },
    });

    // 2) Merge counters / follow-up / notes onto the regular.
    const logCount = await tx.callAttemptLog.count({ where: { orderId: regular.id } });
    const mergedCallAttempts = Math.max(logCount, regular.callAttempts || 0, guest.callAttempts || 0);
    const mergedLastCall = maxDate(regular.lastCallAttemptAt, guest.lastCallAt);
    const mergedFollowUp = regular.followUpDate || guest.followUpDate || null;
    const mergedNotes = mergeNotes(regular.notes, guest.notes);

    await tx.order.update({
      where: { id: regular.id },
      data: {
        callAttempts: mergedCallAttempts,
        ...(mergedLastCall ? { lastCallAttemptAt: mergedLastCall } : {}),
        ...(mergedFollowUp ? { followUpDate: mergedFollowUp } : {}),
        ...(mergedNotes ? { notes: mergedNotes } : {}),
      },
    });

    // 3) Keep the work with an owner ONLY if the regular order is actionable (non-terminal)
    //    and has no active assignment. Terminal orders should not receive an active assignment.
    if (shouldTransferAssignment(pair)) {
      await tx.orderAssignment.create({
        data: {
          companyId: guest.companyId,
          orderId: regular.id,
          assignedTo: guestAssignment.assignedTo,
          assignedBy: guestAssignment.assignedBy || null,
          assignedAt: guestAssignment.assignedAt || new Date(),
          strategy: guestAssignment.strategy || 'dedupe-transfer',
          metadata: guestAssignment.metadata || null,
          isActive: true,
        },
      });
      await tx.order.update({
        where: { id: regular.id },
        data: {
          assignedTo: guestAssignment.assignedTo,
          assignedBy: guestAssignment.assignedBy || null,
          assignedAt: guestAssignment.assignedAt || new Date(),
          assignmentStrategy: guestAssignment.strategy || 'dedupe-transfer',
        },
      });
    }

    // 4) Deactivate the shadow assignment (the guest row itself stays).
    await tx.orderAssignment.updateMany({
      where: { guestOrderId: guest.id, isActive: true },
      data: { isActive: false },
    });
  });
}

async function main() {
  const prisma = getSharedPrismaClient();
  try {
    const companyId = await resolveCompanyId(prisma);
    const pairs = await findPairs(prisma, companyId);

    console.log(`[INFO] Mode: ${DRY_RUN ? 'DRY-RUN (no writes)' : 'APPLY'}`);
    console.log(`[INFO] Guest assignments with a regular twin: ${pairs.length}`);

    if (pairs.length === 0) {
      console.log('[OK] Nothing to reconcile.');
      return;
    }

    const transferCount = pairs.filter(shouldTransferAssignment).length;
    const deactivateOnlyCount = pairs.length - transferCount;
    console.log(`[INFO] Planned transfers (actionable non-terminal): ${transferCount}`);
    console.log(`[INFO] Planned deactivate-only (already assigned or terminal): ${deactivateOnlyCount}`);

    for (const pair of pairs) printPair(pair);

    console.log(`\n[SUMMARY] Total pairs: ${pairs.length} | Transfer: ${transferCount} | Deactivate-only: ${deactivateOnlyCount}`);

    if (DRY_RUN) {
      console.log('\n[DRY-RUN] No changes written. Re-run with --apply to execute.');
      return;
    }

    let done = 0;
    for (const pair of pairs) {
      try {
        await applyPair(prisma, pair);
        done += 1;
        console.log(`[OK] Reconciled ${pair.guest.orderNumber}`);
      } catch (err) {
        console.error(`[FAIL] ${pair.guest.orderNumber}: ${err.message}`);
      }
    }
    console.log(`\n[DONE] Reconciled ${done}/${pairs.length} pairs.`);
  } finally {
    if (typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect();
    }
  }
}

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
