const { getSharedPrismaClient } = require("../services/sharedDatabase");

const DEFAULT_PROCUREMENT_SETTINGS = {
  defaultTemplate: "official_tax",
  companyLegalName: "",
  taxNumber: "",
  crNumber: "",
  billingAddress: "",
  phone: "",
  email: "",
  defaultNotes: "تعتبر هذه الفاتورة سند التزام مالي معتمد بعد اكتمال التوريد ومطابقة الأصناف.",
  defaultPaymentTerms: "سداد بعد 30 يوم من تاريخ الفاتورة",
  signaturePurchasingTitle: "مسؤول المشتريات",
  signatureFinanceTitle: "اعتماد المدير المالي / الإدارة",
  signatureWarehouseTitle: "تأكيد واستلام المورد / المستودع",
  showCompanyStamp: true,
  showSignatureBlock: true,
};

/**
 * GET /api/v1/procurement/settings
 * Get company procurement settings with sensible fallbacks
 */
async function getSettings(req, res) {
  try {
    const companyId = req.user?.companyId || req.companyId;
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company ID is required" });
    }

    const prisma = getSharedPrismaClient();
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        phone: true,
        email: true,
        address: true,
        settings: true,
      },
    });

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    let parsedSettings = {};
    if (company.settings) {
      try {
        parsedSettings = typeof company.settings === "string" ? JSON.parse(company.settings) : company.settings;
      } catch (err) {
        console.warn("[ProcurementSettings] Failed to parse company.settings JSON:", err.message);
        parsedSettings = {};
      }
    }

    const savedProcurement = parsedSettings.procurement || {};

    const mergedSettings = {
      ...DEFAULT_PROCUREMENT_SETTINGS,
      companyLegalName: company.name || "",
      phone: company.phone || "",
      email: company.email || "",
      billingAddress: company.address || "",
      ...savedProcurement,
    };

    return res.json({
      success: true,
      data: mergedSettings,
    });
  } catch (error) {
    console.error("[ProcurementSettings] Error getting settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve procurement settings",
      error: error.message,
    });
  }
}

/**
 * PUT /api/v1/procurement/settings
 * Update procurement settings within company.settings JSON
 */
async function updateSettings(req, res) {
  try {
    const companyId = req.user?.companyId || req.companyId;
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company ID is required" });
    }

    const prisma = getSharedPrismaClient();
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { settings: true },
    });

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    let parsedSettings = {};
    if (company.settings) {
      try {
        parsedSettings = typeof company.settings === "string" ? JSON.parse(company.settings) : company.settings;
      } catch (err) {
        console.warn("[ProcurementSettings] Failed to parse existing company.settings JSON:", err.message);
        parsedSettings = {};
      }
    }

    const allowedFields = [
      "defaultTemplate",
      "companyLegalName",
      "taxNumber",
      "crNumber",
      "billingAddress",
      "phone",
      "email",
      "defaultNotes",
      "defaultPaymentTerms",
      "signaturePurchasingTitle",
      "signatureFinanceTitle",
      "signatureWarehouseTitle",
      "showCompanyStamp",
      "showSignatureBlock",
    ];

    const currentProcurement = parsedSettings.procurement || {};
    const updatedProcurement = { ...currentProcurement };

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updatedProcurement[field] = req.body[field];
      }
    }

    // Validate defaultTemplate
    const validTemplates = ["official_tax", "modern_minimal", "goods_receipt"];
    if (updatedProcurement.defaultTemplate && !validTemplates.includes(updatedProcurement.defaultTemplate)) {
      updatedProcurement.defaultTemplate = "official_tax";
    }

    parsedSettings.procurement = updatedProcurement;

    await prisma.company.update({
      where: { id: companyId },
      data: {
        settings: JSON.stringify(parsedSettings),
      },
    });

    return res.json({
      success: true,
      message: "Procurement settings updated successfully",
      data: {
        ...DEFAULT_PROCUREMENT_SETTINGS,
        ...updatedProcurement,
      },
    });
  } catch (error) {
    console.error("[ProcurementSettings] Error updating settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update procurement settings",
      error: error.message,
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  DEFAULT_PROCUREMENT_SETTINGS,
};
