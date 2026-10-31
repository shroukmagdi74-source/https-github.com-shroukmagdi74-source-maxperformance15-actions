const {
  computeComponentPricing,
  detectComponentCycle,
  buildComponentTree,
  normalizeComponentPayload,
} = require('../services/manufacturingService');

describe('T02 — BOM Component Tree & Hierarchical Pricing Tests', () => {
  // 1. INCLUSIVE parent 100 + two children 20 and 30 => bomTotal = 100
  test('1. INCLUSIVE parent 100 with children 20 and 30 yields bomTotal = 100', () => {
    const components = [
      {
        id: 'P',
        clientRef: 'P',
        rawMaterialName: 'تشطيب كامل',
        consumptionPerUnit: 1,
        pricingMode: 'INCLUSIVE',
        totalPrice: 100,
      },
      {
        id: 'C1',
        clientRef: 'C1',
        parentId: 'P',
        rawMaterialName: 'خيط',
        consumptionPerUnit: 0.2,
        pricingMode: 'ADDITIVE',
        totalPrice: 20,
      },
      {
        id: 'C2',
        clientRef: 'C2',
        parentId: 'P',
        rawMaterialName: 'سوستة',
        consumptionPerUnit: 1,
        pricingMode: 'ADDITIVE',
        totalPrice: 30,
      },
    ];

    const result = computeComponentPricing(components);
    expect(result.bomTotal).toBe(100);
    expect(result.rootCount).toBe(1);
    expect(result.nodeCount).toBe(3);
    expect(result.roots[0].nodeTotal).toBe(100);
    expect(result.roots[0].children).toHaveLength(2);
  });

  // 2. ADDITIVE parent 100 with children 20 and 30 => bomTotal = 150
  test('2. ADDITIVE parent 100 with children 20 and 30 yields bomTotal = 150', () => {
    const components = [
      {
        id: 'P',
        clientRef: 'P',
        rawMaterialName: 'تشطيب كامل',
        consumptionPerUnit: 1,
        pricingMode: 'ADDITIVE',
        totalPrice: 100,
      },
      {
        id: 'C1',
        clientRef: 'C1',
        parentId: 'P',
        rawMaterialName: 'خيط',
        consumptionPerUnit: 0.2,
        pricingMode: 'ADDITIVE',
        totalPrice: 20,
      },
      {
        id: 'C2',
        clientRef: 'C2',
        parentId: 'P',
        rawMaterialName: 'سوستة',
        consumptionPerUnit: 1,
        pricingMode: 'ADDITIVE',
        totalPrice: 30,
      },
    ];

    const result = computeComponentPricing(components);
    expect(result.bomTotal).toBe(150);
    expect(result.roots[0].nodeTotal).toBe(150);
    expect(result.roots[0].children[0].nodeTotal).toBe(20);
    expect(result.roots[0].children[1].nodeTotal).toBe(30);
  });

  // 3. 3 levels: parent ADDITIVE 100 -> child INCLUSIVE 50 -> grandchild 10 => 150
  test('3. 3 levels: parent ADDITIVE 100 -> child INCLUSIVE 50 -> grandchild 10 yields 150', () => {
    const components = [
      {
        id: 'P',
        clientRef: 'P',
        rawMaterialName: 'أب',
        pricingMode: 'ADDITIVE',
        totalPrice: 100,
      },
      {
        id: 'C',
        clientRef: 'C',
        parentId: 'P',
        rawMaterialName: 'ابن شامل',
        pricingMode: 'INCLUSIVE',
        totalPrice: 50,
      },
      {
        id: 'GC',
        clientRef: 'GC',
        parentId: 'C',
        rawMaterialName: 'حفيد',
        pricingMode: 'ADDITIVE',
        totalPrice: 10,
      },
    ];

    const result = computeComponentPricing(components);
    expect(result.bomTotal).toBe(150);
    expect(result.byId['GC'].nodeTotal).toBe(10);
    expect(result.byId['C'].nodeTotal).toBe(50); // Inclusive child covers its grandchild
    expect(result.byId['P'].nodeTotal).toBe(150); // 100 + 50 = 150
  });

  // 4. parent INCLUSIVE 100 -> child ADDITIVE 50 -> grandchild 10 => 100
  test('4. 3 levels: parent INCLUSIVE 100 -> child ADDITIVE 50 -> grandchild 10 yields 100', () => {
    const components = [
      {
        id: 'P',
        clientRef: 'P',
        rawMaterialName: 'أب شامل',
        pricingMode: 'INCLUSIVE',
        totalPrice: 100,
      },
      {
        id: 'C',
        clientRef: 'C',
        parentId: 'P',
        rawMaterialName: 'ابن إضافي',
        pricingMode: 'ADDITIVE',
        totalPrice: 50,
      },
      {
        id: 'GC',
        clientRef: 'GC',
        parentId: 'C',
        rawMaterialName: 'حفيد',
        pricingMode: 'ADDITIVE',
        totalPrice: 10,
      },
    ];

    const result = computeComponentPricing(components);
    expect(result.bomTotal).toBe(100);
    expect(result.byId['P'].nodeTotal).toBe(100); // Inclusive parent covers all descendants
  });

  // 5. Cycle detection: A -> B -> A => { hasCycle: true, path: ['أ', 'ب', 'أ'] }
  test('5. Cycle detection: A -> B -> A returns { hasCycle: true, path: ["أ", "ب", "أ"] }', () => {
    const components = [
      {
        clientRef: 'A',
        parentRef: 'B',
        rawMaterialName: 'أ',
        consumptionPerUnit: 1,
        totalPrice: 10,
      },
      {
        clientRef: 'B',
        parentRef: 'A',
        rawMaterialName: 'ب',
        consumptionPerUnit: 1,
        totalPrice: 20,
      },
    ];

    const cycleResult = detectComponentCycle(components);
    expect(cycleResult.hasCycle).toBe(true);
    expect(cycleResult.path).toEqual(['أ', 'ب', 'أ']);
  });

  // 6. Non-existent parentId / parentRef throws 400 from normalizeComponentPayload
  test('6. parentId pointing to non-existent id throws 400 from normalizeComponentPayload', () => {
    const components = [
      {
        clientRef: 'C1',
        parentRef: 'NON_EXISTENT',
        rawMaterialName: 'ابن يتيم',
        totalPrice: 15,
      },
    ];

    expect(() => normalizeComponentPayload(components)).toThrow('البند الأب غير موجود في نفس القائمة');
    try {
      normalizeComponentPayload(components);
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  // 7. Duplicate clientRef throws 400
  test('7. Duplicate clientRef throws 400', () => {
    const components = [
      {
        clientRef: 'DUP_REF',
        rawMaterialName: 'بند أول',
        totalPrice: 10,
      },
      {
        clientRef: 'DUP_REF',
        rawMaterialName: 'بند مكرر',
        totalPrice: 20,
      },
    ];

    expect(() => normalizeComponentPayload(components)).toThrow(/تكرار في معرف البند/);
    try {
      normalizeComponentPayload(components);
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  // 8. totalPrice string "100.00" => 100 (number)
  test('8. totalPrice as string "100.00" converts to number 100 without NaN', () => {
    const components = [
      {
        id: 'ITEM1',
        rawMaterialName: 'خامة',
        totalPrice: '100.00',
        pricingMode: 'ADDITIVE',
      },
    ];

    const result = computeComponentPricing(components);
    expect(typeof result.bomTotal).toBe('number');
    expect(result.bomTotal).toBe(100);
    expect(result.byId['ITEM1'].totalPrice).toBe(100);
    expect(result.byId['ITEM1'].nodeTotal).toBe(100);
    expect(isNaN(result.bomTotal)).toBe(false);
  });

  // 9. Tree depth exceeding MAX_TREE_DEPTH (5) throws 400
  test('9. Tree depth of 6 levels throws 400 exceeding max depth 5', () => {
    const components = [
      { clientRef: 'L1', rawMaterialName: 'مستوى 1', totalPrice: 10 },
      { clientRef: 'L2', parentRef: 'L1', rawMaterialName: 'مستوى 2', totalPrice: 10 },
      { clientRef: 'L3', parentRef: 'L2', rawMaterialName: 'مستوى 3', totalPrice: 10 },
      { clientRef: 'L4', parentRef: 'L3', rawMaterialName: 'مستوى 4', totalPrice: 10 },
      { clientRef: 'L5', parentRef: 'L4', rawMaterialName: 'مستوى 5', totalPrice: 10 },
      { clientRef: 'L6', parentRef: 'L5', rawMaterialName: 'مستوى 6', totalPrice: 10 },
    ];

    expect(() => normalizeComponentPayload(components)).toThrow('تجاوزت أقصى عمق مسموح (5 مستويات)');
    try {
      normalizeComponentPayload(components);
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  // 10. Negative totalPrice throws 400
  test('10. Negative totalPrice throws 400', () => {
    const components = [
      {
        clientRef: 'NEG',
        rawMaterialName: 'بند سالب',
        totalPrice: -15.5,
      },
    ];

    expect(() => normalizeComponentPayload(components)).toThrow('سعر البند لا يقبل قيمة سالبة');
    try {
      normalizeComponentPayload(components);
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  // 11. Empty BOM components returns empty tree and 0 total
  test('11. Empty BOM returns empty tree and 0 total', () => {
    const result = computeComponentPricing([]);
    expect(result.bomTotal).toBe(0);
    expect(result.nodeCount).toBe(0);
    expect(result.rootCount).toBe(0);
    expect(result.roots).toEqual([]);
    expect(result.warnings).toEqual([]);

    const tree = buildComponentTree([]);
    expect(tree).toEqual([]);
  });

  // 12. Component with totalPrice = null results in nodeTotal = 0 without NaN
  test('12. Component with totalPrice = null results in nodeTotal = 0 without NaN', () => {
    const components = [
      {
        id: 'NULL_PRICE',
        rawMaterialName: 'بند بدون سعر',
        totalPrice: null,
      },
    ];

    const result = computeComponentPricing(components);
    expect(result.bomTotal).toBe(0);
    expect(result.byId['NULL_PRICE'].nodeTotal).toBe(0);
    expect(isNaN(result.bomTotal)).toBe(false);
  });

  // 13. Warnings generated for assembly nodes with children
  test('13. Assembly nodes with children generate warning about consumptionPerUnit', () => {
    const components = [
      {
        id: 'PARENT_ASM',
        rawMaterialName: 'تجميعة الياقة',
        totalPrice: 50,
      },
      {
        id: 'CHILD_FABRIC',
        parentId: 'PARENT_ASM',
        rawMaterialName: 'قماش الياقة',
        totalPrice: 20,
      },
    ];

    const result = computeComponentPricing(components);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('تجميعة الياقة');
    expect(result.warnings[0]).toContain('له أبناء — استهلاكه (consumptionPerUnit) مش محسوب في متطلبات الخامات');
  });

  // 14. buildComponentTree returns structured roots with children
  test('14. buildComponentTree returns roots with nested children', () => {
    const components = [
      { id: 'ROOT1', rawMaterialName: 'جذر 1', totalPrice: 40 },
      { id: 'CHILD1', parentId: 'ROOT1', rawMaterialName: 'ابن 1', totalPrice: 15 },
      { id: 'ROOT2', rawMaterialName: 'جذر 2 منفصل', totalPrice: 60 },
    ];

    const tree = buildComponentTree(components);
    expect(tree).toHaveLength(2);
    expect(tree[0].id).toBe('ROOT1');
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe('CHILD1');
    expect(tree[1].id).toBe('ROOT2');
    expect(tree[1].children).toHaveLength(0);
  });
});
