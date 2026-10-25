const assert = require("assert");
const { describe, it } = require("node:test");

describe("Purchase Invoice Inventory Stock Sync Unit Test", () => {
  it("should calculate correct stock adjustment and delta", () => {
    const items = [
      { productId: "prod_1", quantity: 5, unitPrice: 100 },
      { productId: "prod_2", quantity: 2, unitPrice: 50, variantId: "var_1" },
      { productId: null, quantity: 1, unitPrice: 20 }, // unlinked item
    ];

    const adjustments = [];
    for (const item of items) {
      const qty = parseFloat(item.quantity || 0);
      const unitPrice = parseFloat(item.unitPrice || 0);
      const productId = item.productId;
      if (!productId || qty <= 0) continue;

      adjustments.push({
        productId,
        qty,
        unitPrice,
        variantId: item.variantId || null,
      });
    }

    assert.strictEqual(adjustments.length, 2);
    assert.strictEqual(adjustments[0].productId, "prod_1");
    assert.strictEqual(adjustments[0].qty, 5);
    assert.strictEqual(adjustments[1].productId, "prod_2");
    assert.strictEqual(adjustments[1].variantId, "var_1");
  });

  it("should calculate correct reversal delta on invoice update", () => {
    const oldItems = [
      { productId: "prod_1", quantity: 5 },
      { productId: "prod_2", quantity: 10 },
    ];
    const newItems = [
      { productId: "prod_1", quantity: 7 }, // +2
      { productId: "prod_3", quantity: 4 }, // +4
      // prod_2 removed: -10
    ];

    const oldMap = new Map(oldItems.map(i => [i.productId, i.quantity]));
    const newMap = new Map(newItems.map(i => [i.productId, i.quantity]));

    const allProductIds = new Set([...oldMap.keys(), ...newMap.keys()]);
    const deltas = {};

    for (const pid of allProductIds) {
      const o = oldMap.get(pid) || 0;
      const n = newMap.get(pid) || 0;
      deltas[pid] = n - o;
    }

    assert.strictEqual(deltas["prod_1"], 2);
    assert.strictEqual(deltas["prod_2"], -10);
    assert.strictEqual(deltas["prod_3"], 4);
  });
});
