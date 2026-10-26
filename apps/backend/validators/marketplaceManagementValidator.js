const { z } = require('zod');

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const appSchema = z.object({
  name: z.string().min(1, 'App name is required').max(200),
  slug: z.string().regex(slugRegex, 'Invalid slug format').max(200).nullish(),
  description: z.string().max(2000).nullish(),
  monthlyPrice: z.number().min(0).nullish(),
  yearlyPrice: z.number().min(0).nullish(),
  trialDays: z.number().int().min(0).max(365).nullish(),
  category: z.string().max(100).nullish(),
  isActive: z.boolean().nullish(),
  isPublic: z.boolean().nullish(),
  isFeatured: z.boolean().nullish(),
  isPopular: z.boolean().nullish(),
  isAutoInstall: z.boolean().nullish(),
  logo: z.string().max(500).nullish(),
  icon: z.string().max(200).nullish(),
  coverImage: z.string().max(500).nullish(),
  images: z.union([z.array(z.string().max(500)), z.string().max(2000)]).nullish(),
  mainRoute: z.string().max(200).nullish(),
  adminRoute: z.string().max(200).nullish(),
  pricingModel: z.enum(['FREE', 'SUBSCRIPTION', 'PAY_PER_USE']).nullish(),
  unitPrice: z.number().min(0).nullish(),
  unitName: z.string().max(100).nullish(),
  ppuBillingMethod: z.enum(['PER_ORDER', 'PER_ITEM', 'PERCENTAGE']).nullish(),
  features: z.union([z.string(), z.array(z.any()), z.record(z.any())]).nullish(),
  requiredApps: z.union([z.array(z.string()), z.string()]).nullish(),
});

const bundleSchema = z.object({
  name: z.string().min(1, 'Bundle name is required').max(200),
  slug: z.string().regex(slugRegex, 'Invalid slug format').max(200).nullish(),
  description: z.string().max(2000).nullish(),
  monthlyPrice: z.number().min(0).nullish(),
  yearlyPrice: z.number().min(0).nullish(),
  discount: z.number().min(0).max(100).nullish(),
  isActive: z.boolean().nullish(),
  isFeatured: z.boolean().nullish(),
  appIds: z.union([z.array(z.string()), z.string()]).nullish(),
});

const pricingRuleSchema = z.object({
  feature: z.string().min(1, 'Feature name is required').max(200),
  price: z.number().min(0).nullish(),
  unit: z.string().max(100).nullish(),
  description: z.string().max(1000).nullish(),
  isActive: z.boolean().nullish(),
});

function sanitizePayload(rawBody) {
  const sanitized = { ...rawBody };
  const numericFields = ['monthlyPrice', 'yearlyPrice', 'trialDays', 'unitPrice', 'discount', 'price'];

  for (const key in sanitized) {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    } else if (numericFields.includes(key) && typeof sanitized[key] === 'string' && !isNaN(Number(sanitized[key]))) {
      sanitized[key] = Number(sanitized[key]);
    }
  }

  // Normalize slug
  if (typeof sanitized.slug === 'string') {
    const trimmedSlug = sanitized.slug.trim().toLowerCase();
    sanitized.slug = trimmedSlug || null;
  }

  // Normalize pricingModel
  if (typeof sanitized.pricingModel === 'string') {
    const pm = sanitized.pricingModel.trim().toUpperCase();
    if (['FREE', 'SUBSCRIPTION', 'PAY_PER_USE'].includes(pm)) {
      sanitized.pricingModel = pm;
    }
  }

  // Normalize ppuBillingMethod
  if (typeof sanitized.ppuBillingMethod === 'string') {
    const ppu = sanitized.ppuBillingMethod.trim().toUpperCase();
    if (['PER_ORDER', 'PER_ITEM', 'PERCENTAGE'].includes(ppu)) {
      sanitized.ppuBillingMethod = ppu;
    } else {
      sanitized.ppuBillingMethod = null;
    }
  }

  // Normalize requiredApps
  if (typeof sanitized.requiredApps === 'string') {
    const trimmed = sanitized.requiredApps.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          sanitized.requiredApps = parsed.map(String).filter(Boolean);
        }
      } catch (_) {
        sanitized.requiredApps = [];
      }
    } else if (trimmed) {
      sanitized.requiredApps = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      sanitized.requiredApps = [];
    }
  }

  // Normalize bundle appIds
  if (typeof sanitized.appIds === 'string') {
    const trimmed = sanitized.appIds.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          sanitized.appIds = parsed.map(String).filter(Boolean);
        }
      } catch (_) {
        sanitized.appIds = [];
      }
    } else if (trimmed) {
      sanitized.appIds = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      sanitized.appIds = [];
    }
  }

  // Normalize images if stringified JSON array
  if (typeof sanitized.images === 'string' && sanitized.images.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(sanitized.images);
      if (Array.isArray(parsed)) {
        sanitized.images = parsed.map(String).filter(Boolean);
      }
    } catch (_) {}
  }

  return sanitized;
}

function validate(schema) {
  return (req, res, next) => {
    const sanitizedBody = sanitizePayload(req.body);

    const result = schema.safeParse(sanitizedBody);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0] || 'Invalid data';
      return res.status(400).json({
        success: false,
        message: firstError,
        errors,
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = {
  validateCreateApp: validate(appSchema),
  validateUpdateApp: validate(appSchema.partial()),
  validateCreateBundle: validate(bundleSchema),
  validateUpdateBundle: validate(bundleSchema.partial()),
  validateCreatePricingRule: validate(pricingRuleSchema),
  validateUpdatePricingRule: validate(pricingRuleSchema.partial()),
};
