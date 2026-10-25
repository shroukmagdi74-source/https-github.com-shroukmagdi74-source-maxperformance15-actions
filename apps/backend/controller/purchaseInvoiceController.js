const {
  getSharedPrismaClient,
  safeQuery,
} = require("../services/sharedDatabase");
const { recordSupplierPayment } = require("../services/supplierPaymentService");
const { logProcurementActivity } = require("../services/procurementAuditService");

const normalizePurchaseInvoice = (invoice) => {
  if (!invoice) return invoice;

  const { purchaseInvoiceItems, supplierPayments, _count, ...rest } = invoice;

  return {
    ...rest,
    ...(purchaseInvoiceItems !== undefined
      ? { items: purchaseInvoiceItems }
      : {}),
    ...(supplierPayments !== undefined ? { payments: supplierPayments } : {}),
    ...(_count
      ? {
          _count: {
            ..._count,
            ...(typeof _count.purchaseInvoiceItems === "number"
              ? { items: _count.purchaseInvoiceItems }
              : {}),
            ...(typeof _count.supplierPayments === "number"
              ? { payments: _count.supplierPayments }
              : {}),
          },
        }
      : {}),
  };
};

const generateInvoiceNumber = async (companyId) => {
  const lastInvoice = await safeQuery(() =>
    getSharedPrismaClient().purchaseInvoice.findFirst({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    }),
  );

  const lastNumber = lastInvoice
    ? parseInt(lastInvoice.invoiceNumber.split("-").pop())
    : 0;
  return `PI-${String(lastNumber + 1).padStart(6, "0")}`;
};

const generatePaymentNumber = async (companyId) => {
  const lastPayment = await safeQuery(() =>
    getSharedPrismaClient().supplierPayment.findFirst({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    }),
  );

  const lastNumber = lastPayment
    ? parseInt(lastPayment.paymentNumber.split("-").pop())
    : 0;
  return `SP-${String(lastNumber + 1).padStart(6, "0")}`;
};

exports.createPurchaseInvoice = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const {
      supplierId,
      purchaseOrderId,
      invoiceDate,
      dueDate,
      items,
      notes,
      shippingCost,
      discountAmount,
      paidAmount: rawPaidAmount,
      paymentMethod,
      paymentNotes,
    } = req.body;

    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({ message: "المورد والأصناف مطلوبة" });
    }

    const invoiceNumber = await generateInvoiceNumber(companyId);

    // Validate candidate productIds against actual Products table to avoid Foreign Key violation
    const validProductIds = new Set();
    const candidateProductIds = items
      .map((item) => item.productId)
      .filter(Boolean);

    if (candidateProductIds.length > 0) {
      const existingProducts = await safeQuery(() =>
        getSharedPrismaClient().product.findMany({
          where: {
            id: { in: candidateProductIds },
            companyId,
          },
          select: { id: true },
        }),
      );
      if (Array.isArray(existingProducts)) {
        existingProducts.forEach((p) => validProductIds.add(p.id));
      }
    }

    let subtotal = 0;
    let taxAmount = 0;

    const invoiceItems = items.map((item) => {
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.unitPrice);
      const taxRate = parseFloat(item.taxRate || 0);
      const discountRate = parseFloat(item.discountRate || 0);

      const itemSubtotal = quantity * unitPrice;
      const itemDiscount = itemSubtotal * (discountRate / 100);
      const itemTax = (itemSubtotal - itemDiscount) * (taxRate / 100);
      const totalPrice = itemSubtotal - itemDiscount + itemTax;

      subtotal += itemSubtotal;
      taxAmount += itemTax;

      const safeProductId =
        item.productId && validProductIds.has(item.productId)
          ? item.productId
          : null;

      return {
        productId: safeProductId,
        productName: item.productName,
        description: item.description,
        quantity,
        unitPrice,
        taxRate,
        discountRate,
        totalPrice,
        notes: item.notes,
      };
    });

    const shipping = parseFloat(shippingCost || 0);
    const discount = parseFloat(discountAmount || 0);
    const totalAmount = subtotal + taxAmount + shipping - discount;

    const requestedPaid = Math.max(0, parseFloat(rawPaidAmount || 0));
    const paidAmount = Math.min(requestedPaid, totalAmount);
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const status = remainingAmount <= 0 ? "PAID" : paidAmount > 0 ? "PARTIALLY_PAID" : "PENDING";

    let invoice = null;
    let lastInvoiceError = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const invoiceNumber = await generateInvoiceNumber(companyId);
        invoice = await safeQuery(() =>
          getSharedPrismaClient().purchaseInvoice.create({
            data: {
              companyId,
              supplierId,
              purchaseOrderId: purchaseOrderId || null,
              invoiceNumber,
              invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
              dueDate: dueDate ? new Date(dueDate) : null,
              subtotal,
              taxAmount,
              discountAmount: discount,
              shippingCost: shipping,
              totalAmount,
              paidAmount: 0,
              remainingAmount: totalAmount,
              status: "PENDING",
              notes,
              createdBy: userId,
              purchaseInvoiceItems: {
                create: invoiceItems,
              },
            },
            include: {
              purchaseInvoiceItems: true,
              supplier: true,
              purchaseOrder: true,
            },
          }),
        );
        break;
      } catch (err) {
        if (err.code === "P2002" || (err.message && err.message.includes("invoiceNumber"))) {
          lastInvoiceError = err;
          await new Promise((r) => setTimeout(r, 20 + Math.random() * 40));
          continue;
        }
        throw err;
      }
    }

    if (!invoice) {
      throw lastInvoiceError || new Error("فشل إنشاء فاتورة الشراء بعد عدة محاولات بسبب تعارض الترقيم");
    }

    // 1. Supplier debt increases by full invoice totalAmount
    await safeQuery(() =>
      getSharedPrismaClient().supplier.update({
        where: { id: supplierId },
        data: {
          currentBalance: {
            increment: totalAmount,
          },
        },
      }),
    );

    // 2. Record upfront supplier payment if paidAmount > 0 via unified service
    if (paidAmount > 0) {
      await recordSupplierPayment({
        companyId,
        supplierId,
        purchaseInvoiceId: invoice.id,
        amount: paidAmount,
        paymentMethod: paymentMethod || "CASH",
        treasuryAccountId: req.body.treasuryAccountId || null,
        notes: paymentNotes || "سداد فوري عند إنشاء الفاتورة",
        userId,
        paymentDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        sourceKey: `invoice:${invoice.id}:inline`,
      });

      // Reload fresh invoice with updated balances
      invoice = await safeQuery(() =>
        getSharedPrismaClient().purchaseInvoice.findUnique({
          where: { id: invoice.id },
          include: {
            purchaseInvoiceItems: true,
            supplier: true,
            purchaseOrder: true,
            supplierPayments: true,
          },
        }),
      );
    }

    // Accounting Auto-Posting Hook (Non-blocking & Zero Blast-Radius)
    try {
      const AccountingAutoPostingService = require('../services/accountingAutoPostingService');
      AccountingAutoPostingService.postPurchaseInvoice(companyId, invoice.id, {
        userId,
        invoiceData: invoice,
      }).catch((err) => console.error('[Accounting Auto-Posting] Purchase Invoice async error:', err.message));
    } catch (autoErr) {
      console.error('[Accounting Auto-Posting] Purchase Invoice hook error:', autoErr.message);
    }

    // Audit Log Activity
    await logProcurementActivity({
      companyId,
      userId,
      action: "CREATE_PURCHASE_INVOICE",
      targetType: "PURCHASE_INVOICE",
      targetId: invoice.id,
      targetName: invoice.invoiceNumber,
      description: `إنشاء فاتورة شراء رقم ${invoice.invoiceNumber} بمبلغ إجمالي ${totalAmount} ج.م`,
      metadata: {
        totalAmount,
        paidAmount,
        remainingAmount: invoice.remainingAmount,
        supplierId,
        purchaseOrderId,
        treasuryAccountId: req.body.treasuryAccountId || null,
      },
      severity: "MEDIUM",
    });

    res.status(201).json({
      success: true,
      message: paidAmount >= totalAmount ? "تم إنشاء الفاتورة وسدادها بنجاح" : "تم إنشاء الفاتورة بنجاح",
      invoice: normalizePurchaseInvoice(invoice),
    });
  } catch (error) {
    console.error("Error creating purchase invoice:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء الفاتورة: " + error.message,
      error: error.message,
      details: error.stack,
    });
  }
};

exports.getAllPurchaseInvoices = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { page = 1, limit = 20, status, supplierId, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { companyId };

    if (status === "OVERDUE") {
      where.status = { notIn: ["PAID", "CANCELLED"] };
      where.dueDate = { lt: new Date() };
    } else if (status && status !== "all") {
      where.status = status;
    }
    if (supplierId) where.supplierId = supplierId;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const [invoices, total] = await Promise.all([
      safeQuery(() =>
        getSharedPrismaClient().purchaseInvoice.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
          include: {
            supplier: {
              select: { id: true, name: true, phone: true },
            },
            purchaseOrder: {
              select: { id: true, orderNumber: true },
            },
            _count: {
              select: { purchaseInvoiceItems: true, supplierPayments: true },
            },
          },
        }),
      ),
      safeQuery(() => getSharedPrismaClient().purchaseInvoice.count({ where })),
    ]);

    res.json({
      invoices: invoices.map(normalizePurchaseInvoice),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching purchase invoices:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الفواتير" });
  }
};

exports.getPurchaseInvoiceById = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { id } = req.params;

    const invoice = await safeQuery(() =>
      getSharedPrismaClient().purchaseInvoice.findFirst({
        where: { id, companyId },
        include: {
          supplier: true,
          purchaseOrder: true,
          purchaseInvoiceItems: {
            include: {
              product: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
          supplierPayments: {
            orderBy: { createdAt: "desc" },
          },
        },
      }),
    );

    if (!invoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }

    res.json(normalizePurchaseInvoice(invoice));
  } catch (error) {
    console.error("Error fetching purchase invoice:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الفاتورة" });
  }
};

exports.updatePurchaseInvoice = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const { id } = req.params;
    const {
      supplierId,
      purchaseOrderId,
      invoiceDate,
      dueDate,
      status: requestedStatus,
      notes,
      shippingCost,
      discountAmount,
      items,
      paidAmount: rawPaidAmount,
      paymentMethod,
      treasuryAccountId,
    } = req.body;

    const prisma = getSharedPrismaClient();

    const existingInvoice = await safeQuery(() =>
      prisma.purchaseInvoice.findFirst({
        where: { id, companyId },
        include: {
          purchaseInvoiceItems: true,
          supplierPayments: true,
          supplier: true,
        },
      }),
    );

    if (!existingInvoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }

    const oldTotalAmount = parseFloat(existingInvoice.totalAmount || 0);
    const existingPayments = existingInvoice.supplierPayments || [];
    const currentPaidSum = existingPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0,
    );

    let subtotal = 0;
    let taxAmount = 0;
    let newItemsToCreate = null;

    if (Array.isArray(items) && items.length > 0) {
      // Validate candidate productIds against actual Products table to avoid Foreign Key violation
      const validProductIds = new Set();
      const candidateProductIds = items
        .map((item) => item.productId)
        .filter(Boolean);

      if (candidateProductIds.length > 0) {
        const existingProducts = await safeQuery(() =>
          prisma.product.findMany({
            where: {
              id: { in: candidateProductIds },
              companyId,
            },
            select: { id: true },
          }),
        );
        if (Array.isArray(existingProducts)) {
          existingProducts.forEach((p) => validProductIds.add(p.id));
        }
      }

      newItemsToCreate = items.map((item) => {
        const quantity = parseFloat(item.quantity || 1);
        const unitPrice = parseFloat(item.unitPrice || 0);
        const taxRate = parseFloat(item.taxRate || 0);
        const discountRate = parseFloat(item.discountRate || 0);

        const itemSubtotal = quantity * unitPrice;
        const itemDiscount = itemSubtotal * (discountRate / 100);
        const itemTax = (itemSubtotal - itemDiscount) * (taxRate / 100);
        const totalPrice = itemSubtotal - itemDiscount + itemTax;

        subtotal += itemSubtotal;
        taxAmount += itemTax;

        const safeProductId =
          item.productId && validProductIds.has(item.productId)
            ? item.productId
            : null;

        return {
          productId: safeProductId,
          productName: item.productName,
          description: item.description,
          quantity,
          unitPrice,
          taxRate,
          discountRate,
          totalPrice,
          notes: item.notes,
        };
      });
    } else {
      subtotal = parseFloat(existingInvoice.subtotal || 0);
      taxAmount = parseFloat(existingInvoice.taxAmount || 0);
    }

    const shipping =
      shippingCost !== undefined
        ? parseFloat(shippingCost || 0)
        : parseFloat(existingInvoice.shippingCost || 0);
    const discount =
      discountAmount !== undefined
        ? parseFloat(discountAmount || 0)
        : parseFloat(existingInvoice.discountAmount || 0);

    const newTotalAmount = subtotal + taxAmount + shipping - discount;
    const newSupplierId = supplierId || existingInvoice.supplierId;

    // Validation 1: Cannot reduce invoice total below already paid amount
    if (newTotalAmount < currentPaidSum - 0.001) {
      return res.status(400).json({
        message: `لا يمكن تقليل إجمالي الفاتورة (${newTotalAmount} ج.م) إلى أقل من المبالغ المدفوعة عليها مسبقاً (${currentPaidSum} ج.م). يُرجى تعديل أو حذف سندات الصرف المرتبطة أولاً.`,
      });
    }

    // Validation 2: Cannot change supplier if payments already recorded
    if (newSupplierId !== existingInvoice.supplierId && currentPaidSum > 0) {
      return res.status(400).json({
        message: "لا يمكن تغيير المورد لفاتورة مسجل عليها دفعات مالية مسبقاً. يُرجى معالجة المدفوعات أولاً قبل تغيير المورد.",
      });
    }

    // Handle payment adjustments:
    let effectivePaid = currentPaidSum;
    const requestedPaid =
      rawPaidAmount !== undefined
        ? Math.max(0, parseFloat(rawPaidAmount || 0))
        : undefined;

    // If requestedPaid is greater than current payments, record additional payment:
    if (requestedPaid !== undefined && requestedPaid > currentPaidSum) {
      const diffToPay = Math.min(
        requestedPaid - currentPaidSum,
        Math.max(0, newTotalAmount - currentPaidSum),
      );
      if (diffToPay > 0) {
        // Pre-update invoice headroom in DB so recordSupplierPayment validation succeeds
        await safeQuery(() =>
          prisma.purchaseInvoice.update({
            where: { id },
            data: {
              totalAmount: newTotalAmount,
              remainingAmount: Math.max(0, newTotalAmount - currentPaidSum),
            },
          }),
        );

        await recordSupplierPayment({
          companyId,
          supplierId: newSupplierId,
          purchaseInvoiceId: id,
          amount: diffToPay,
          paymentMethod: paymentMethod || "CASH",
          treasuryAccountId: treasuryAccountId || null,
          notes: "سداد تكميلي عند تعديل الفاتورة",
          userId,
          paymentDate: invoiceDate ? new Date(invoiceDate) : new Date(),
          sourceKey: `invoice:${id}:edit:${Date.now()}`,
        });
        effectivePaid += diffToPay;
      }
    }

    const newRemainingAmount = Math.max(0, newTotalAmount - effectivePaid);
    const newStatus =
      newRemainingAmount <= 0
        ? "PAID"
        : effectivePaid > 0
        ? "PARTIALLY_PAID"
        : requestedStatus || "PENDING";

    // Database updates in transaction
    const updatedInvoice = await safeQuery(() =>
      prisma.$transaction(async (tx) => {
        // 1. If line items changed, replace them
        if (newItemsToCreate) {
          await tx.purchaseInvoiceItem.deleteMany({
            where: { purchaseInvoiceId: id },
          });
          await tx.purchaseInvoiceItem.createMany({
            data: newItemsToCreate.map((item) => ({
              ...item,
              purchaseInvoiceId: id,
            })),
          });
        }

        // 2. Supplier balance adjustments
        if (newSupplierId !== existingInvoice.supplierId) {
          // Unpaid invoice moving to new supplier:
          await tx.supplier.update({
            where: { id: existingInvoice.supplierId },
            data: { currentBalance: { decrement: oldTotalAmount } },
          });
          await tx.supplier.update({
            where: { id: newSupplierId },
            data: { currentBalance: { increment: newTotalAmount } },
          });
        } else {
          // Same supplier: balance changes by delta in invoice total
          const totalDelta = newTotalAmount - oldTotalAmount;
          if (totalDelta !== 0) {
            await tx.supplier.update({
              where: { id: existingInvoice.supplierId },
              data: {
                currentBalance: {
                  increment: totalDelta,
                },
              },
            });
          }
        }

        // 3. Update the Purchase Invoice header
        return tx.purchaseInvoice.update({
          where: { id },
          data: {
            supplierId: newSupplierId,
            purchaseOrderId:
              purchaseOrderId !== undefined
                ? purchaseOrderId || null
                : existingInvoice.purchaseOrderId,
            invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            subtotal,
            taxAmount,
            discountAmount: discount,
            shippingCost: shipping,
            totalAmount: newTotalAmount,
            paidAmount: effectivePaid,
            remainingAmount: newRemainingAmount,
            status: newStatus,
            notes: notes !== undefined ? notes : undefined,
          },
          include: {
            purchaseInvoiceItems: true,
            supplier: true,
            supplierPayments: true,
            purchaseOrder: true,
          },
        });
      }),
    );

    // Audit Log Activity
    await logProcurementActivity({
      companyId,
      userId,
      action: "UPDATE_PURCHASE_INVOICE",
      targetType: "PURCHASE_INVOICE",
      targetId: updatedInvoice.id,
      targetName: updatedInvoice.invoiceNumber,
      description: `تعديل فاتورة شراء رقم ${updatedInvoice.invoiceNumber} بمبلغ جديد ${newTotalAmount} ج.م (السابق: ${oldTotalAmount} ج.م)`,
      metadata: {
        oldTotalAmount,
        newTotalAmount,
        paidAmount: effectivePaid,
        remainingAmount: newRemainingAmount,
        supplierId: newSupplierId,
      },
      severity: "MEDIUM",
    });

    res.json({
      success: true,
      message: "تم تحديث الفاتورة بنجاح",
      invoice: normalizePurchaseInvoice(updatedInvoice),
    });
  } catch (error) {
    console.error("Error updating purchase invoice:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث الفاتورة: " + error.message,
    });
  }
};

exports.deletePurchaseInvoice = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const { id } = req.params;
    const prisma = getSharedPrismaClient();

    const invoice = await safeQuery(() =>
      prisma.purchaseInvoice.findFirst({
        where: { id, companyId },
        include: {
          supplierPayments: true,
          purchaseInvoiceItems: true,
          supplier: true,
        },
      }),
    );

    if (!invoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }

    const totalInvoiceAmount = parseFloat(invoice.totalAmount || 0);
    const payments = invoice.supplierPayments || [];
    const totalPaymentsAmount = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0,
    );

    // Atomic transaction for clean cascade removal & balance integrity
    await safeQuery(() =>
      prisma.$transaction(async (tx) => {
        // 1. Delete associated supplier payments & reverse any posted treasury movements
        if (payments.length > 0) {
          const paymentIds = payments.map((p) => p.id);

          // Refund posted treasury movements if any
          try {
            const postedPostings = await tx.financialPosting.findMany({
              where: {
                sourceType: "SUPPLIER_PAYMENT",
                sourceId: { in: paymentIds },
                companyId,
                status: "POSTED",
                treasuryAccountId: { not: null },
              },
            });
            for (const post of postedPostings) {
              if (post.treasuryAccountId && post.amount) {
                await tx.treasuryAccount.update({
                  where: { id: post.treasuryAccountId },
                  data: { balance: { increment: parseFloat(post.amount) } },
                });
              }
            }
            await tx.financialPosting.deleteMany({
              where: {
                sourceType: "SUPPLIER_PAYMENT",
                sourceId: { in: paymentIds },
                companyId,
              },
            });
          } catch (finErr) {
            console.warn("[Procurement Delete] Treasury cleanup notice:", finErr.message);
          }

          await tx.supplierPayment.deleteMany({
            where: { purchaseInvoiceId: id, companyId },
          });
        }

        // 2. Delete line items
        await tx.purchaseInvoiceItem.deleteMany({
          where: { purchaseInvoiceId: id },
        });

        // 3. Delete invoice itself
        await tx.purchaseInvoice.delete({
          where: { id },
        });

        // 4. Adjust supplier balance:
        // Invoice originally added +totalInvoiceAmount to supplier debt.
        // Each payment originally subtracted -payment.amount from supplier debt.
        // Net remaining unpaid debt added by this invoice was (totalInvoiceAmount - totalPaymentsAmount).
        // Removing both the invoice and its payments means reducing supplier debt by exactly that net amount!
        const netDebtReduction = Math.max(0, totalInvoiceAmount - totalPaymentsAmount);
        if (netDebtReduction > 0) {
          await tx.supplier.update({
            where: { id: invoice.supplierId },
            data: {
              currentBalance: {
                decrement: netDebtReduction,
              },
            },
          });
        }
      }),
    );

    // Audit logging
    await logProcurementActivity({
      companyId,
      userId,
      action: "DELETE_PURCHASE_INVOICE",
      targetType: "PURCHASE_INVOICE",
      targetId: invoice.id,
      targetName: invoice.invoiceNumber,
      description: `حذف فاتورة شراء رقم ${invoice.invoiceNumber} بقيمة ${totalInvoiceAmount} ج.م وحذف ${payments.length} مدفوعات تابعة لها`,
      metadata: {
        totalAmount: totalInvoiceAmount,
        deletedPaymentsCount: payments.length,
        totalPaymentsAmount,
        supplierId: invoice.supplierId,
      },
      severity: "HIGH",
    });

    res.json({
      success: true,
      message: "تم حذف الفاتورة والمدفوعات المرتبطة بها بنجاح",
    });
  } catch (error) {
    console.error("Error deleting purchase invoice:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الفاتورة: " + error.message,
    });
  }
};

exports.getPurchaseInvoiceStats = async (req, res) => {
  try {
    const { companyId } = req.user;

    const [
      totalInvoices,
      pendingInvoices,
      overdueInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
    ] = await Promise.all([
      safeQuery(() =>
        getSharedPrismaClient().purchaseInvoice.count({ where: { companyId } }),
      ),
      safeQuery(() =>
        getSharedPrismaClient().purchaseInvoice.count({
          where: { companyId, status: "PENDING" },
        }),
      ),
      safeQuery(() =>
        getSharedPrismaClient().purchaseInvoice.count({
          where: { companyId, status: "PENDING", dueDate: { lt: new Date() } },
        }),
      ),
      safeQuery(() =>
        getSharedPrismaClient().purchaseInvoice.aggregate({
          where: { companyId, status: { notIn: ["CANCELLED"] } },
          _sum: { totalAmount: true },
        }),
      ),
      safeQuery(() =>
        getSharedPrismaClient().purchaseInvoice.aggregate({
          where: { companyId, status: { notIn: ["CANCELLED"] } },
          _sum: { paidAmount: true },
        }),
      ),
      safeQuery(() =>
        getSharedPrismaClient().purchaseInvoice.aggregate({
          where: { companyId, status: "PENDING" },
          _sum: { remainingAmount: true },
        }),
      ),
    ]);

    res.json({
      totalInvoices,
      pendingInvoices,
      overdueInvoices,
      totalAmount: totalAmount._sum.totalAmount || 0,
      paidAmount: paidAmount._sum.paidAmount || 0,
      pendingAmount: pendingAmount._sum.remainingAmount || 0,
    });
  } catch (error) {
    console.error("Error fetching purchase invoice stats:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات" });
  }
};

exports.checkOverdueInvoices = async (req, res) => {
  try {
    const { companyId } = req.user;

    const overdueInvoices = await safeQuery(() =>
      getSharedPrismaClient().purchaseInvoice.findMany({
        where: {
          companyId,
          status: { notIn: ["PAID", "CANCELLED"] },
          dueDate: { lt: new Date() },
        },
      }),
    );

    res.json({
      success: true,
      message: "تم فحص الفواتير المتأخرة",
      count: overdueInvoices.length,
      overdueInvoices: overdueInvoices.map(normalizePurchaseInvoice),
    });
  } catch (error) {
    console.error("Error checking overdue invoices:", error);
    res.status(500).json({ message: "حدث خطأ أثناء فحص الفواتير المتأخرة" });
  }
};
