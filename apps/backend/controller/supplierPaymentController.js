const { getSharedPrismaClient, safeQuery } = require('../services/sharedDatabase');
const { recordSupplierPayment, generatePaymentNumber } = require('../services/supplierPaymentService');
const { logProcurementActivity } = require('../services/procurementAuditService');
const { recalculateSupplierBalance } = require('../services/supplierBalanceService');

exports.createSupplierPayment = async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const {
      supplierId,
      purchaseInvoiceId,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      bankName,
      checkNumber,
      checkDate,
      notes,
      treasuryAccountId,
      sourceKey,
    } = req.body;

    const result = await recordSupplierPayment({
      companyId,
      supplierId,
      purchaseInvoiceId,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      bankName,
      checkNumber,
      checkDate,
      notes,
      treasuryAccountId,
      userId,
      sourceKey,
    });

    res.status(result.alreadyExisted ? 200 : 201).json({
      success: true,
      message: result.alreadyExisted ? 'تم استرجاع الدفعة المسجلة مسبقاً' : 'تم تسجيل الدفعة بنجاح',
      payment: result.payment,
      financialPosting: result.financialPosting,
      alreadyExisted: result.alreadyExisted,
    });
  } catch (error) {
    console.error('Error creating supplier payment:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء تسجيل الدفعة',
      error: error.message,
    });
  }
};

exports.getAllSupplierPayments = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { page = 1, limit = 20, supplierId, paymentMethod, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { companyId };

    if (supplierId) where.supplierId = supplierId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (search) {
      where.OR = [
        { paymentNumber: { contains: search } },
        { referenceNumber: { contains: search } },
        { notes: { contains: search } }
      ];
    }

    const [payments, total] = await Promise.all([
      safeQuery(() => getSharedPrismaClient().supplierPayment.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: {
            select: { id: true, name: true, phone: true }
          },
          purchaseInvoice: {
            select: { id: true, invoiceNumber: true }
          }
        }
      })),
      safeQuery(() => getSharedPrismaClient().supplierPayment.count({ where }))
    ]);

    res.json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching supplier payments:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب المدفوعات' });
  }
};

exports.getSupplierPaymentById = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { id } = req.params;

    const payment = await safeQuery(() => getSharedPrismaClient().supplierPayment.findFirst({
      where: { id, companyId },
      include: {
        supplier: true,
        purchaseInvoice: {
          include: {
            purchaseInvoiceItems: true
          }
        }
      }
    }));

    if (!payment) {
      return res.status(404).json({ message: 'الدفعة غير موجودة' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching supplier payment:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الدفعة' });
  }
};

exports.updateSupplierPayment = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { id = req.params.id } = req.params;
    const {
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      bankName,
      checkNumber,
      checkDate,
      notes
    } = req.body;

    const existingPayment = await safeQuery(() => getSharedPrismaClient().supplierPayment.findFirst({
      where: { id, companyId }
    }));

    if (!existingPayment) {
      return res.status(404).json({ message: 'الدفعة غير موجودة' });
    }

    let updatedAmount = undefined;
    if (amount !== undefined && amount !== null && amount !== '') {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'المبلغ يجب أن يكون رقماً أكبر من الصفر' });
      }

      const oldAmount = parseFloat(existingPayment.amount);
      const diff = Math.round((parsedAmount - oldAmount) * 100) / 100;

      if (diff !== 0) {
        // If linked to an invoice, validate remaining balance and update invoice
        if (existingPayment.purchaseInvoiceId) {
          const invoice = await safeQuery(() => getSharedPrismaClient().purchaseInvoice.findUnique({
            where: { id: existingPayment.purchaseInvoiceId }
          }));

          if (invoice) {
            const currentRemaining = parseFloat(invoice.remainingAmount || 0);
            if (diff > currentRemaining + 0.001) {
              return res.status(400).json({
                message: `المبلغ الجديد يتجاوز المبلغ المتبقي على الفاتورة (${(currentRemaining + oldAmount).toFixed(2)})`
              });
            }

            const newPaid = Math.max(0, Math.round((parseFloat(invoice.paidAmount || 0) + diff) * 100) / 100);
            const newRem = Math.max(0, Math.round((parseFloat(invoice.totalAmount || 0) - newPaid) * 100) / 100);
            const newStatus = newRem <= 0 ? 'PAID' : 'PENDING';

            await safeQuery(() => getSharedPrismaClient().purchaseInvoice.update({
              where: { id: existingPayment.purchaseInvoiceId },
              data: {
                paidAmount: newPaid,
                remainingAmount: newRem,
                status: newStatus
              }
            }));
          }
        }

        // Adjust supplier current balance directly
        await safeQuery(() => getSharedPrismaClient().supplier.update({
          where: { id: existingPayment.supplierId },
          data: {
            currentBalance: {
              decrement: diff
            }
          }
        }));

        // Adjust financial posting if one exists
        try {
          await safeQuery(() => getSharedPrismaClient().financialPosting.updateMany({
            where: {
              companyId,
              sourceType: 'SUPPLIER_PAYMENT',
              sourceId: id,
            },
            data: {
              amount: parsedAmount,
            }
          }));
        } catch (finErr) {
          console.warn('Financial posting update warning:', finErr.message);
        }

        updatedAmount = parsedAmount;
      }
    }

    const payment = await safeQuery(() => getSharedPrismaClient().supplierPayment.update({
      where: { id },
      data: {
        ...(updatedAmount !== undefined ? { amount: updatedAmount } : {}),
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        paymentMethod: paymentMethod || undefined,
        referenceNumber: referenceNumber !== undefined ? referenceNumber : undefined,
        bankName: bankName !== undefined ? bankName : undefined,
        checkNumber: checkNumber !== undefined ? checkNumber : undefined,
        checkDate: checkDate ? new Date(checkDate) : (checkDate === null || checkDate === '' ? null : undefined),
        notes: notes !== undefined ? notes : undefined
      },
      include: {
        supplier: true,
        purchaseInvoice: true
      }
    }));

    try {
      await recalculateSupplierBalance(existingPayment.supplierId, companyId);
    } catch (balErr) {
      console.warn('[Supplier Payment Update] Recalculate notice:', balErr.message);
    }

    await logProcurementActivity({
      companyId,
      userId: req.user.id,
      action: 'UPDATE_SUPPLIER_PAYMENT',
      targetType: 'SUPPLIER_PAYMENT',
      targetId: payment.id,
      targetName: payment.paymentNumber,
      description: `تعديل بيانات دفعة المورد ${payment.paymentNumber}${updatedAmount !== undefined ? ` (المبلغ: ${updatedAmount} ج.م)` : ''}`,
      metadata: { paymentMethod, referenceNumber, amount: updatedAmount },
      severity: 'LOW',
    });

    res.json({
      message: 'تم تحديث الدفعة بنجاح',
      payment
    });
  } catch (error) {
    console.error('Error updating supplier payment:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث الدفعة' });
  }
};

exports.deleteSupplierPayment = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { id } = req.params;

    const payment = await safeQuery(() => getSharedPrismaClient().supplierPayment.findFirst({
      where: { id, companyId }
    }));

    if (!payment) {
      return res.status(404).json({ message: 'الدفعة غير موجودة' });
    }

    // 1. Revert supplier balance
    await safeQuery(() =>
      getSharedPrismaClient().supplier.update({
        where: { id: payment.supplierId },
        data: {
          currentBalance: {
            increment: parseFloat(payment.amount)
          }
        }
      })
    );

    // 2. Revert invoice paid/remaining amounts if linked
    if (payment.purchaseInvoiceId) {
      const invoice = await safeQuery(() => getSharedPrismaClient().purchaseInvoice.findUnique({
        where: { id: payment.purchaseInvoiceId }
      }));

      if (invoice) {
        const newPaidAmount = Math.max(0, Math.round((parseFloat(invoice.paidAmount || 0) - parseFloat(payment.amount)) * 100) / 100);
        const newRemainingAmount = Math.max(0, Math.round((parseFloat(invoice.totalAmount || 0) - newPaidAmount) * 100) / 100);
        const newStatus = newRemainingAmount <= 0 ? 'PAID' : 'PENDING';

        await safeQuery(() =>
          getSharedPrismaClient().purchaseInvoice.update({
            where: { id: payment.purchaseInvoiceId },
            data: {
              paidAmount: newPaidAmount,
              remainingAmount: newRemainingAmount,
              status: newStatus
            }
          })
        );
      }
    }

    // 3. Remove financial posting if linked
    try {
      await safeQuery(() =>
        getSharedPrismaClient().financialPosting.deleteMany({
          where: {
            companyId,
            sourceType: 'SUPPLIER_PAYMENT',
            sourceId: id,
          }
        })
      );
    } catch (finErr) {
      console.warn('Financial posting delete warning:', finErr.message);
    }

    // 4. Delete the supplier payment record
    await safeQuery(() => getSharedPrismaClient().supplierPayment.delete({
      where: { id }
    }));

    // 5. Recalculate supplier balance
    try {
      await recalculateSupplierBalance(payment.supplierId, companyId);
    } catch (balErr) {
      console.warn('[Supplier Payment Delete] Recalculate notice:', balErr.message);
    }

    // 6. Audit log
    await logProcurementActivity({
      companyId,
      userId: req.user.id,
      action: 'DELETE_SUPPLIER_PAYMENT',
      targetType: 'SUPPLIER_PAYMENT',
      targetId: payment.id,
      targetName: payment.paymentNumber,
      description: `حذف دفعة مورد بقيمة ${payment.amount} ج.م (رقم: ${payment.paymentNumber})`,
      metadata: { amount: payment.amount, supplierId: payment.supplierId },
      severity: 'HIGH',
    });

    res.json({ message: 'تم حذف الدفعة بنجاح' });
  } catch (error) {
    console.error('Error deleting supplier payment:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حذف الدفعة' });
  }
};

exports.getSupplierPaymentStats = async (req, res) => {
  try {
    const { companyId } = req.user;

    const [totalPayments, totalAmount, cashPayments, bankTransfers, checks] = await Promise.all([
      safeQuery(() => getSharedPrismaClient().supplierPayment.count({ where: { companyId } })),
      safeQuery(() => getSharedPrismaClient().supplierPayment.aggregate({
        where: { companyId },
        _sum: { amount: true }
      })),
      safeQuery(() => getSharedPrismaClient().supplierPayment.count({ where: { companyId, paymentMethod: 'CASH' } })),
      safeQuery(() => getSharedPrismaClient().supplierPayment.count({ where: { companyId, paymentMethod: 'BANK_TRANSFER' } })),
      safeQuery(() => getSharedPrismaClient().supplierPayment.count({ where: { companyId, paymentMethod: 'CHECK' } }))
    ]);

    res.json({
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      cashPayments,
      bankTransfers,
      checks
    });
  } catch (error) {
    console.error('Error fetching supplier payment stats:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الإحصائيات' });
  }
};
