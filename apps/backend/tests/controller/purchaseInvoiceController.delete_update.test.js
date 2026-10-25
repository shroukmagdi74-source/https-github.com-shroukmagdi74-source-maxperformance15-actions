/**
 * Unit Test: Purchase Invoice Delete and Update controller logic
 * Verifies that deleting/updating a purchase invoice:
 * 1. Synchronizes supplier payments (deletes or updates linked payments).
 * 2. Recalculates supplier balance accurately.
 * 3. Updates invoice line items, totals, status, and audit trail.
 */

const assert = require("assert");

process.env.NODE_ENV = "test";

// Mock external modules that aren't installed locally
const Module = require("module");
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === "ioredis") {
    function MockRedis() {
      return {
        get: async () => null,
        set: async () => "OK",
        del: async () => 1,
        on: () => {},
      };
    }
    return MockRedis;
  }
  if (id === "dotenv") {
    return { config: () => {} };
  }
  if (id === "@prisma/client" || id.includes("@prisma")) {
    return { PrismaClient: function() { return {}; } };
  }
  return originalRequire.apply(this, arguments);
};

// Mock dependencies
const sharedDatabase = require("../../services/sharedDatabase");
const procurementAuditService = require("../../services/procurementAuditService");

let mockDb = {};
let auditLogs = [];

function setupMocks() {
  auditLogs = [];
  mockDb = {
    purchaseInvoice: {
      findFirst: null,
      update: null,
      delete: null,
    },
    purchaseInvoiceItem: {
      deleteMany: null,
      createMany: null,
    },
    supplierPayment: {
      deleteMany: null,
      updateMany: null,
    },
    supplier: {
      update: null,
    },
    product: {
      findMany: async () => [{ id: "prod-1" }],
    },
    $transaction: async (fn) => fn(mockDb),
  };

  sharedDatabase.getSharedPrismaClient = () => mockDb;
  sharedDatabase.safeQuery = async (fn) => fn();

  procurementAuditService.logProcurementActivity = async (payload) => {
    auditLogs.push(payload);
  };
}

async function runTests() {
  console.log("🧪 Starting Purchase Invoice Delete & Update Unit Tests...");
  setupMocks();

  const controller = require("../../controller/purchaseInvoiceController");

  // -------------------------------------------------------------
  // Test 1: deletePurchaseInvoice when invoice not found -> 404
  // -------------------------------------------------------------
  {
    mockDb.purchaseInvoice.findFirst = async () => null;
    let statusCode = null;
    let responseBody = null;
    const req = {
      user: { companyId: "comp-1", id: "user-1" },
      params: { id: "non-existent" },
    };
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        responseBody = body;
        return res;
      },
    };

    await controller.deletePurchaseInvoice(req, res);
    assert.strictEqual(statusCode, 404, "Must return 404 for non-existent invoice");
    console.log("   ✅ Test 1 Passed: 404 when invoice not found");
  }

  // -------------------------------------------------------------
  // Test 2: deletePurchaseInvoice with payments -> deletes payments & adjusts supplier balance
  // -------------------------------------------------------------
  {
    let deletedPaymentWhere = null;
    let deletedItemsWhere = null;
    let deletedInvoiceWhere = null;
    let updatedSupplierData = null;

    mockDb.purchaseInvoice.findFirst = async () => ({
      id: "inv-101",
      companyId: "comp-1",
      supplierId: "sup-1",
      invoiceNumber: "PI-000101",
      totalAmount: 1000,
      paidAmount: 400,
      remainingAmount: 600,
      supplierPayments: [
        { id: "pay-1", amount: 400, purchaseInvoiceId: "inv-101" },
      ],
      purchaseInvoiceItems: [{ id: "item-1" }],
      supplier: { id: "sup-1", name: "المورد النموذجي" },
    });

    mockDb.supplierPayment.deleteMany = async (args) => {
      deletedPaymentWhere = args.where;
    };
    mockDb.purchaseInvoiceItem.deleteMany = async (args) => {
      deletedItemsWhere = args.where;
    };
    mockDb.purchaseInvoice.delete = async (args) => {
      deletedInvoiceWhere = args.where;
    };
    mockDb.supplier.update = async (args) => {
      updatedSupplierData = args;
    };

    let responseBody = null;
    const req = {
      user: { companyId: "comp-1", id: "user-1" },
      params: { id: "inv-101" },
    };
    const res = {
      status: () => res,
      json: (body) => {
        responseBody = body;
        return res;
      },
    };

    await controller.deletePurchaseInvoice(req, res);

    assert.strictEqual(responseBody.success, true, "Must respond with success");
    assert.strictEqual(deletedPaymentWhere.purchaseInvoiceId, "inv-101", "Must delete payments linked to invoice");
    assert.strictEqual(deletedItemsWhere.purchaseInvoiceId, "inv-101", "Must delete line items");
    assert.strictEqual(deletedInvoiceWhere.id, "inv-101", "Must delete the invoice itself");
    // totalAmount (1000) - payments (400) = net debt 600 to decrement
    assert.strictEqual(updatedSupplierData.data.currentBalance.decrement, 600, "Must decrement supplier balance by net remaining debt 600");
    assert.strictEqual(auditLogs.length, 1, "Must log audit activity");
    assert.strictEqual(auditLogs[0].action, "DELETE_PURCHASE_INVOICE");
    console.log("   ✅ Test 2 Passed: deletePurchaseInvoice cascade deletes payments and decrements supplier balance");
  }

  // -------------------------------------------------------------
  // Test 3: updatePurchaseInvoice -> updates items, totals and adjusts balance delta
  // -------------------------------------------------------------
  {
    auditLogs = [];
    let updatedInvoiceData = null;
    let updatedSupplierDelta = null;

    mockDb.purchaseInvoice.findFirst = async () => ({
      id: "inv-102",
      companyId: "comp-1",
      supplierId: "sup-1",
      invoiceNumber: "PI-000102",
      subtotal: 500,
      taxAmount: 0,
      shippingCost: 0,
      discountAmount: 0,
      totalAmount: 500,
      paidAmount: 200,
      remainingAmount: 300,
      status: "PENDING",
      supplierPayments: [{ id: "pay-1", amount: 200 }],
      supplier: { id: "sup-1", name: "المورد النموذجي" },
    });

    mockDb.purchaseInvoiceItem.deleteMany = async () => {};
    mockDb.purchaseInvoiceItem.createMany = async () => {};
    mockDb.supplier.update = async (args) => {
      updatedSupplierDelta = args;
    };
    mockDb.purchaseInvoice.update = async (args) => {
      updatedInvoiceData = args;
      return {
        id: "inv-102",
        ...args.data,
        purchaseInvoiceItems: [],
        supplier: { id: "sup-1", name: "المورد النموذجي" },
        supplierPayments: [],
      };
    };

    const req = {
      user: { companyId: "comp-1", id: "user-1" },
      params: { id: "inv-102" },
      body: {
        supplierId: "sup-1",
        items: [
          {
            productId: "prod-1",
            productName: "صنف تجريبي",
            quantity: 2,
            unitPrice: 400, // subtotal = 800
            taxRate: 10,    // tax = 80
            discountRate: 0,
          },
        ],
        shippingCost: 50,
        discountAmount: 30,
        // newTotal = 800 + 80 + 50 - 30 = 900
      },
    };

    let responseBody = null;
    const res = {
      status: () => res,
      json: (body) => {
        responseBody = body;
        return res;
      },
    };

    await controller.updatePurchaseInvoice(req, res);

    assert.strictEqual(responseBody.success, true, "Must respond with success");
    assert.strictEqual(updatedInvoiceData.data.totalAmount, 900, "New total amount must be 900");
    assert.strictEqual(updatedInvoiceData.data.remainingAmount, 700, "New remaining amount must be 900 - 200 = 700");
    assert.strictEqual(updatedInvoiceData.data.status, "PARTIALLY_PAID", "Status must be PARTIALLY_PAID");
    // delta = 900 - 500 = +400 to supplier debt
    assert.strictEqual(updatedSupplierDelta.data.currentBalance.increment, 400, "Supplier balance incremented by delta 400");
    assert.strictEqual(auditLogs.length, 1, "Must log audit activity");
    assert.strictEqual(auditLogs[0].action, "UPDATE_PURCHASE_INVOICE");
    console.log("   ✅ Test 3 Passed: updatePurchaseInvoice recalculates totals, balances and preserves payments");
  }

  // -------------------------------------------------------------
  // Test 4: deletePurchaseInvoice when fully paid -> net debt reduction is 0
  // -------------------------------------------------------------
  {
    mockDb.purchaseInvoice.findFirst = async () => ({
      id: "inv-103",
      companyId: "comp-1",
      supplierId: "sup-1",
      invoiceNumber: "PI-000103",
      totalAmount: 1500,
      paidAmount: 1500,
      remainingAmount: 0,
      supplierPayments: [
        { id: "pay-10", amount: 1500, purchaseInvoiceId: "inv-103" },
      ],
      purchaseInvoiceItems: [{ id: "item-2" }],
      supplier: { id: "sup-1", name: "المورد النموذجي" },
    });

    let supplierUpdated = false;
    mockDb.supplierPayment.deleteMany = async () => {};
    mockDb.purchaseInvoiceItem.deleteMany = async () => {};
    mockDb.purchaseInvoice.delete = async () => {};
    mockDb.supplier.update = async () => {
      supplierUpdated = true;
    };

    let responseBody = null;
    const req = {
      user: { companyId: "comp-1", id: "user-1" },
      params: { id: "inv-103" },
    };
    const res = {
      status: () => res,
      json: (body) => {
        responseBody = body;
        return res;
      },
    };

    await controller.deletePurchaseInvoice(req, res);
    assert.strictEqual(responseBody.success, true);
    assert.strictEqual(supplierUpdated, false, "Supplier balance should not decrement when already fully paid (net debt was 0)");
    console.log("   ✅ Test 4 Passed: Fully paid invoice deletion does not decrement already settled balance");
  }

  // -------------------------------------------------------------
  // Test 5: updatePurchaseInvoice with new supplier:
  // 5a. Blocked if invoice already has payments -> 400
  // 5b. Allowed if invoice has 0 payments -> balances transferred cleanly
  // -------------------------------------------------------------
  {
    // 5a: With existing payments
    mockDb.purchaseInvoice.findFirst = async () => ({
      id: "inv-104",
      companyId: "comp-1",
      supplierId: "sup-old",
      invoiceNumber: "PI-000104",
      totalAmount: 1000,
      paidAmount: 300,
      remainingAmount: 700,
      supplierPayments: [{ id: "pay-20", amount: 300 }],
      supplier: { id: "sup-old", name: "المورد القديم" },
    });

    let statusCode = null;
    let req = {
      user: { companyId: "comp-1", id: "user-1" },
      params: { id: "inv-104" },
      body: { supplierId: "sup-new" },
    };
    let res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => body,
    };

    await controller.updatePurchaseInvoice(req, res);
    assert.strictEqual(statusCode, 400, "Must block changing supplier on partially paid invoice");
    console.log("   ✅ Test 5a Passed: Blocked changing supplier when invoice has payments");

    // 5b: Unpaid invoice allows supplier change and transfers debt
    let oldSupplierDecremented = false;
    let newSupplierIncremented = false;

    mockDb.purchaseInvoice.findFirst = async () => ({
      id: "inv-105",
      companyId: "comp-1",
      supplierId: "sup-old",
      invoiceNumber: "PI-000105",
      subtotal: 1000,
      taxAmount: 0,
      shippingCost: 0,
      discountAmount: 0,
      totalAmount: 1000,
      paidAmount: 0,
      remainingAmount: 1000,
      status: "PENDING",
      supplierPayments: [],
      supplier: { id: "sup-old", name: "المورد القديم" },
    });

    mockDb.supplier.update = async (args) => {
      if (args.where.id === "sup-old" && args.data.currentBalance.decrement === 1000) {
        oldSupplierDecremented = true;
      }
      if (args.where.id === "sup-new" && args.data.currentBalance.increment === 1000) {
        newSupplierIncremented = true;
      }
    };
    mockDb.purchaseInvoice.update = async (args) => ({
      id: "inv-105",
      ...args.data,
      purchaseInvoiceItems: [],
      supplier: { id: "sup-new", name: "المورد الجديد" },
      supplierPayments: [],
    });

    req = {
      user: { companyId: "comp-1", id: "user-1" },
      params: { id: "inv-105" },
      body: { supplierId: "sup-new" },
    };

    await controller.updatePurchaseInvoice(req, res);
    assert.strictEqual(oldSupplierDecremented, true, "Old supplier debt must be decremented by 1000");
    assert.strictEqual(newSupplierIncremented, true, "New supplier debt must be incremented by 1000");
    console.log("   ✅ Test 5b Passed: Unpaid invoice supplier change transfers debt cleanly");
  }

  console.log("🎉 All Purchase Invoice controller tests passed successfully!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
