const { getSharedPrismaClient } = require('./sharedDatabase');

/**
 * دالة تسعير الجملة الموحدة
 * resolveWholesalePrice(customerId, productId, companyId, [variantId], [options])
 * ترجّع سعر الموزع من قائمته (أو null لو مفيش)
 * تدعم الاستدعاء المعاملاتي (positional) وككائن (object payload)
 */
async function resolveWholesalePrice(param1, productId, companyId, variantId = null, options = {}) {
  let p = param1;
  if (param1 && typeof param1 === 'object' && !Array.isArray(param1) && !productId) {
    p = param1;
  } else {
    p = {
      customerId: param1,
      productId,
      companyId,
      variantId,
      quantity: typeof options === 'number' ? options : (options?.quantity || 1),
      options: typeof options === 'object' && options ? options : {},
    };
  }

  const prisma = p.prisma || getSharedPrismaClient();
  const cId = p.customerId || p.wholesaleCustomerId;
  const prodId = p.productId;
  const compId = p.companyId;
  const vId = p.variantId || null;
  const qty = typeof p.quantity === 'number' && !Number.isNaN(p.quantity) ? p.quantity : 1;
  const opts = p.options || {};

  const safeResolveRegularPrice = async () => {
    try {
      if (vId && prisma.productVariant?.findUnique) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: vId },
          select: { price: true, product: { select: { price: true } } },
        });
        if (variant) {
          return variant.price !== null && variant.price !== undefined
            ? Number(variant.price)
            : Number(variant.product?.price || 0);
        }
      }
      if (prodId && prisma.product?.findUnique) {
        const product = await prisma.product.findUnique({
          where: { id: prodId },
          select: { price: true },
        });
        return product ? Number(product.price || 0) : 0;
      }
    } catch {
      /* ignore */
    }
    return 0;
  };

  if (!cId || !prodId || !compId) {
    if (opts.fallbackToRegular) {
      const reg = await safeResolveRegularPrice();
      const fallbackObj = { price: reg, originalPrice: reg, isWholesale: false, priceListId: null, itemId: null };
      fallbackObj.valueOf = () => reg;
      fallbackObj.toString = () => String(reg);
      return fallbackObj;
    }
    return null;
  }

  const wholesaleCustomer = await prisma.wholesaleCustomer.findFirst({
    where: {
      companyId: compId,
      isActive: true,
      OR: [{ id: cId }, { customerId: cId }],
    },
  });

  if (!wholesaleCustomer) {
    if (opts.fallbackToRegular) {
      const reg = await safeResolveRegularPrice();
      const fallbackObj = { price: reg, originalPrice: reg, isWholesale: false, priceListId: null, itemId: null };
      fallbackObj.valueOf = () => reg;
      fallbackObj.toString = () => String(reg);
      return fallbackObj;
    }
    return null;
  }

  const links = await prisma.wholesaleCustomerPriceList.findMany({
    where: { customerId: wholesaleCustomer.customerId, companyId: compId },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: { priceList: true },
  });

  const now = new Date();
  for (const link of links) {
    const priceList = link.priceList;
    if (!priceList || !priceList.isActive || priceList.companyId !== compId) continue;
    if (priceList.validFrom && new Date(priceList.validFrom) > now) continue;
    if (priceList.validTo && new Date(priceList.validTo) < now) continue;

    const items = await prisma.wholesalePriceListItem.findMany({
      where: { priceListId: link.priceListId, productId: prodId },
    });

    const candidates = [];
    if (vId) {
      const variantItem = items.find((i) => i.variantId === vId);
      if (variantItem) candidates.push(variantItem);
    }
    const generalItem = items.find((i) => i.variantId === null);
    if (generalItem) candidates.push(generalItem);

    for (const item of candidates) {
      if (Number(item.minQuantity) <= qty) {
        const wholesalePrice = Number(item.price);
        const regularPrice = await safeResolveRegularPrice();
        const res = {
          price: wholesalePrice,
          originalPrice: regularPrice || wholesalePrice,
          isWholesale: true,
          priceListId: link.priceListId,
          priceListName: priceList.nameAr || priceList.name,
          itemId: item.id,
        };
        res.valueOf = () => wholesalePrice;
        res.toString = () => String(wholesalePrice);
        return res;
      }
    }
  }

  if (opts.fallbackToRegular) {
    const reg = await safeResolveRegularPrice();
    const fallbackObj = { price: reg, originalPrice: reg, isWholesale: false, priceListId: null, itemId: null };
    fallbackObj.valueOf = () => reg;
    fallbackObj.toString = () => String(reg);
    return fallbackObj;
  }

  return null;
}

async function resolveWholesaleContext({ prisma, companyId, customerId }) {
  const client = prisma || getSharedPrismaClient();
  const wholesaleCustomer = await client.wholesaleCustomer.findFirst({
    where: {
      companyId,
      isActive: true,
      OR: [{ id: customerId }, { customerId }],
    },
  });
  if (!wholesaleCustomer) return null;

  const creditLimit = Number(wholesaleCustomer.creditLimit);
  const currentBalance = Number(wholesaleCustomer.currentBalance);
  return {
    wholesaleCustomer,
    creditLimit,
    currentBalance,
    available: creditLimit - currentBalance,
  };
}

module.exports = { resolveWholesalePrice, resolveWholesaleContext };
