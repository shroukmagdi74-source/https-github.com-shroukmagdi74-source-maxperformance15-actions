/**
 * ? performanceScore.ts
 * Pure Performance Score and Page Weight Calculator for MaxP Storefront Studio (PERF-1).
 *
 * Evaluates local storefront page performance strictly without external network calls:
 * 1. Section count: penalizes excessive sections (> 10)
 * 2. Images without dimensions: penalizes missing width or height (prevents CLS)
 * 3. Large images: penalizes images > 300KB
 * 4. Large embedded scripts/styles: penalizes customCss / customJs > 30KB
 * 5. Web fonts count: penalizes excessive fonts (> 3)
 *
 * Produces:
 * - Performance score (0-100)
 * - Top 3 prioritized recommendations
 * - Real page weights (bytes) from available data
 */

export interface PageWeightBreakdown {
  imagesBytes: number;
  scriptsBytes: number;
  stylesBytes: number;
  dataBytes: number;
  totalBytes: number;
  formattedTotal: string;
}

export interface PerformanceMetrics {
  sectionCount: number;
  imagesWithoutDimensionsCount: number;
  largeImagesCount: number;
  largeScriptsCount: number;
  fontsCount: number;
}

export interface PerformanceMetricDetail {
  id: string;
  label: string;
  value: number;
  unit?: string;
  status: "good" | "needs-improvement" | "poor";
  penalty: number;
  message: string;
}

export interface PerformanceScoreResult {
  score: number;
  rating: "excellent" | "good" | "needs-improvement" | "poor";
  recommendations: string[];
  weights: PageWeightBreakdown;
  metrics: PerformanceMetrics;
  details: PerformanceMetricDetail[];
}

export interface PerformanceAuditInput {
  sections?: any[];
  pageConfig?: any;
  theme?: any;
  fonts?: string[];
  customCss?: string;
  customJs?: string;
  pageKey?: string;
}

export interface ExtractedImageInfo {
  url?: string;
  hasDimensions: boolean;
  sizeBytes: number;
  sectionIndex?: number;
}

/**
 * Formats byte counts into human-readable strings (e.g. 450 KB, 1.25 MB).
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Calculates byte size of a UTF-8 string.
 */
export function getStringByteSize(str: string | undefined | null): number {
  if (!str) return 0;
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str).length;
  }
  return str.length;
}

/**
 * Parses image size in bytes from various structures or data URIs.
 */
function parseImageSizeBytes(val: any): number {
  if (!val) return 0;
  if (typeof val === "object" && val !== null) {
    if (typeof val.size === "number" && val.size > 0) return val.size;
    if (typeof val.bytes === "number" && val.bytes > 0) return val.bytes;
    if (typeof val.fileSize === "number" && val.fileSize > 0) return val.fileSize;
    if (typeof val.sizeBytes === "number" && val.sizeBytes > 0) return val.sizeBytes;
    if (typeof val.url === "string") return parseImageSizeBytes(val.url);
    if (typeof val.src === "string") return parseImageSizeBytes(val.src);
    return 0;
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("data:image/")) {
      const parts = trimmed.split(",");
      const base64Data = parts[1] || "";
      return Math.floor((base64Data.length * 3) / 4);
    }
    // Check URL query string for explicit size param (e.g. ?size=350000)
    const match = trimmed.match(/[?&]size=(\d+)/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  return 0;
}

/**
 * Determines whether an image has explicit width and height dimensions.
 */
function checkImageDimensions(val: any, parentSettings?: any): boolean {
  if (!val) return false;

  if (typeof val === "object" && val !== null) {
    const w = val.width ?? val.w ?? val.dimensions?.width;
    const h = val.height ?? val.h ?? val.dimensions?.height;
    if (typeof w === "number" && w > 0 && typeof h === "number" && h > 0) {
      return true;
    }
  }

  if (parentSettings && typeof parentSettings === "object") {
    const pw = parentSettings.imageWidth ?? parentSettings.width;
    const ph = parentSettings.imageHeight ?? parentSettings.height;
    if (typeof pw === "number" && pw > 0 && typeof ph === "number" && ph > 0) {
      return true;
    }
  }

  return false;
}

/**
 * Deeply extracts image references and their dimension/size telemetry from sections.
 */
export function extractPageImages(sections: any[] = []): ExtractedImageInfo[] {
  const images: ExtractedImageInfo[] = [];

  const inspectValue = (val: any, parentSettings?: any, sectionIndex?: number) => {
    if (!val) return;

    if (typeof val === "string") {
      const lower = val.toLowerCase();
      const isImageUrl =
        lower.startsWith("data:image/") ||
        lower.startsWith("http://") ||
        lower.startsWith("https://") ||
        lower.startsWith("/") ||
        lower.endsWith(".png") ||
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".webp") ||
        lower.endsWith(".gif") ||
        lower.endsWith(".svg") ||
        lower.endsWith(".avif");

      if (isImageUrl) {
        images.push({
          url: val,
          hasDimensions: checkImageDimensions(val, parentSettings),
          sizeBytes: parseImageSizeBytes(val),
          sectionIndex,
        });
      }
      return;
    }

    if (typeof val === "object" && val !== null) {
      // Check common list properties first
      if (Array.isArray(val)) {
        for (const item of val) {
          inspectValue(item, parentSettings, sectionIndex);
        }
        return;
      }

      // If val is directly an image descriptor with string url/src
      if (typeof val.url === "string" || typeof val.src === "string") {
        const urlStr = typeof val.url === "string" ? val.url : val.src;
        images.push({
          url: urlStr,
          hasDimensions: checkImageDimensions(val, parentSettings),
          sizeBytes: parseImageSizeBytes(val),
          sectionIndex,
        });
        return;
      }

      // If val has a string image property
      if (typeof val.image === "string") {
        images.push({
          url: val.image,
          hasDimensions: checkImageDimensions(val, parentSettings),
          sizeBytes: parseImageSizeBytes(val.image) || parseImageSizeBytes(val),
          sectionIndex,
        });
      }

      // Inspect known image setting keys
      const knownKeys = [
        "image",
        "images",
        "banner",
        "heroImage",
        "backgroundImage",
        "bgImage",
        "thumbnail",
        "logo",
        "avatar",
        "items",
        "products",
        "slides",
        "gallery",
        "cards",
      ];

      for (const k of knownKeys) {
        if (k in val) {
          // If k is 'image' and it was already handled as string above, only recurse if object
          if (k === "image" && typeof val[k] === "string") {
            continue;
          }
          inspectValue(val[k], val, sectionIndex);
        }
      }
    }
  };

  sections.forEach((sec, idx) => {
    if (!sec) return;
    const settings = typeof sec === "object" && sec !== null ? sec.settings || sec : {};
    inspectValue(settings, settings, idx);
  });

  return images;
}

/**
 * Resolves all distinct web font families configured across theme and settings.
 */
export function extractPageFonts(input: PerformanceAuditInput): string[] {
  const fontSet = new Set<string>();

  if (Array.isArray(input.fonts)) {
    for (const f of input.fonts) {
      if (typeof f === "string" && f.trim()) {
        fontSet.add(f.trim().toLowerCase());
      }
    }
  }

  const theme = input.theme || {};
  if (Array.isArray(theme.fonts)) {
    for (const f of theme.fonts) {
      if (typeof f === "string" && f.trim()) {
        fontSet.add(f.trim().toLowerCase());
      }
    }
  }

  const typography = theme.typography || {};
  for (const key of ["fontFamily", "headingFont", "bodyFont", "accentFont", "font"]) {
    const val = typography[key];
    if (typeof val === "string" && val.trim()) {
      fontSet.add(val.trim().toLowerCase());
    }
  }

  const sections = input.sections || input.pageConfig?.sections || [];
  sections.forEach((sec: any) => {
    if (!sec) return;
    const settings = typeof sec === "object" && sec !== null ? sec.settings || sec : {};
    if (typeof settings.fontFamily === "string" && settings.fontFamily.trim()) {
      fontSet.add(settings.fontFamily.trim().toLowerCase());
    }
  });

  if (fontSet.size === 0) {
    fontSet.add("system-ui");
  }

  return Array.from(fontSet);
}

/**
 * Calculates page weights (bytes) from images, embedded scripts, styles, and serialized structure.
 */
export function calculatePageWeights(input: PerformanceAuditInput): PageWeightBreakdown {
  const sections = input.sections || input.pageConfig?.sections || [];
  const extractedImages = extractPageImages(sections);

  let imagesBytes = 0;
  for (const img of extractedImages) {
    imagesBytes += img.sizeBytes;
  }

  let scriptsBytes = 0;
  const customJs = input.customJs || input.pageConfig?.customJs || input.theme?.customJs || "";
  scriptsBytes += getStringByteSize(customJs);

  let stylesBytes = 0;
  const customCss = input.customCss || input.pageConfig?.customCss || input.theme?.customCss || "";
  stylesBytes += getStringByteSize(customCss);

  // Measure inline scripts and styles inside section settings
  sections.forEach((sec: any) => {
    if (!sec) return;
    const settings = typeof sec === "object" && sec !== null ? sec.settings || sec : {};
    if (typeof settings.customCss === "string") stylesBytes += getStringByteSize(settings.customCss);
    if (typeof settings.css === "string") stylesBytes += getStringByteSize(settings.css);
    if (typeof settings.customJs === "string") scriptsBytes += getStringByteSize(settings.customJs);
    if (typeof settings.js === "string") scriptsBytes += getStringByteSize(settings.js);
    if (typeof settings.code === "string") scriptsBytes += getStringByteSize(settings.code);
  });

  let dataBytes = 0;
  try {
    dataBytes = getStringByteSize(JSON.stringify(sections));
  } catch {
    dataBytes = 0;
  }

  const totalBytes = imagesBytes + scriptsBytes + stylesBytes + dataBytes;

  return {
    imagesBytes,
    scriptsBytes,
    stylesBytes,
    dataBytes,
    totalBytes,
    formattedTotal: formatBytes(totalBytes),
  };
}

/**
 * Computes performance score (0-100), top 3 prioritized recommendations, and telemetry.
 */
export function calculatePerformanceScore(input: PerformanceAuditInput): PerformanceScoreResult {
  const sections = input.sections || input.pageConfig?.sections || [];
  const sectionCount = sections.length;
  const extractedImages = extractPageImages(sections);
  const fonts = extractPageFonts(input);
  const fontsCount = fonts.length;
  const weights = calculatePageWeights(input);

  const imagesWithoutDimensionsCount = extractedImages.filter((img) => !img.hasDimensions).length;
  const LARGE_IMAGE_THRESHOLD = 300 * 1024; // 300KB
  const largeImagesCount = extractedImages.filter((img) => img.sizeBytes > LARGE_IMAGE_THRESHOLD).length;

  const LARGE_SCRIPT_STYLE_THRESHOLD = 30 * 1024; // 30KB
  let largeScriptsCount = 0;
  if (weights.scriptsBytes > LARGE_SCRIPT_STYLE_THRESHOLD) largeScriptsCount += 1;
  if (weights.stylesBytes > LARGE_SCRIPT_STYLE_THRESHOLD) largeScriptsCount += 1;

  interface PenaltyCandidate {
    penalty: number;
    recommendation: string;
  }
  const candidateRecommendations: PenaltyCandidate[] = [];
  const details: PerformanceMetricDetail[] = [];

  // 1. Sections count penalty
  // Ideal is 1-10 sections (0 penalty). If > 10, penalize 2 points per extra section (up to 15).
  let sectionPenalty = 0;
  if (sectionCount > 10) {
    sectionPenalty = Math.min(15, (sectionCount - 10) * 2);
    candidateRecommendations.push({
      penalty: sectionPenalty,
      recommendation: `قلّل عدد أقسام الصفحة (حاليًا ${sectionCount} قسمًا) إلى 10 أو أقل لتفادي بطء الرندر وزيادة عمق شجرة DOM`,
    });
    details.push({
      id: "sections",
      label: "عدد الأقسام",
      value: sectionCount,
      status: sectionCount > 15 ? "poor" : "needs-improvement",
      penalty: sectionPenalty,
      message: `${sectionCount} قسم (${sectionPenalty} نقطة خصم)`,
    });
  } else {
    details.push({
      id: "sections",
      label: "عدد الأقسام",
      value: sectionCount,
      status: "good",
      penalty: 0,
      message: `${sectionCount} أقسام (ممتاز)`,
    });
  }

  // 2. Images without dimensions penalty (5 points per un-dimensioned image, max 40)
  let dimensionsPenalty = 0;
  if (imagesWithoutDimensionsCount > 0) {
    dimensionsPenalty = Math.min(40, imagesWithoutDimensionsCount * 5);
    candidateRecommendations.push({
      penalty: dimensionsPenalty,
      recommendation: `حدد أبعاد العرض والارتفاع (width & height) لجميع الصور (${imagesWithoutDimensionsCount} صورة بدون أبعاد) لمنع انزياح التخطيط التراكمي (CLS)`,
    });
    details.push({
      id: "dimensions",
      label: "صور بدون أبعاد",
      value: imagesWithoutDimensionsCount,
      status: imagesWithoutDimensionsCount > 3 ? "poor" : "needs-improvement",
      penalty: dimensionsPenalty,
      message: `${imagesWithoutDimensionsCount} صورة تفتقر للأبعاد (${dimensionsPenalty} نقطة خصم)`,
    });
  } else {
    details.push({
      id: "dimensions",
      label: "صور بدون أبعاد",
      value: 0,
      status: "good",
      penalty: 0,
      message: "جميع الصور محددة الأبعاد (ممتاز)",
    });
  }

  // 3. Large images penalty (> 300KB) (6 points per large image, max 30)
  let largeImagesPenalty = 0;
  if (largeImagesCount > 0) {
    largeImagesPenalty = Math.min(30, largeImagesCount * 6);
    candidateRecommendations.push({
      penalty: largeImagesPenalty,
      recommendation: `اضغط الصور التي يتجاوز حجمها 300KB (${largeImagesCount} صورة كبيرة) أو استبدلها بصيغ عصرية مثل WebP أو AVIF`,
    });
    details.push({
      id: "large-images",
      label: "صور أكبر من 300KB",
      value: largeImagesCount,
      status: largeImagesCount > 2 ? "poor" : "needs-improvement",
      penalty: largeImagesPenalty,
      message: `${largeImagesCount} صورة تتجاوز 300KB (${largeImagesPenalty} نقطة خصم)`,
    });
  } else {
    details.push({
      id: "large-images",
      label: "صور أكبر من 300KB",
      value: 0,
      status: "good",
      penalty: 0,
      message: "لا توجد صور متضخمة (ممتاز)",
    });
  }

  // 4. Large embedded scripts/styles (> 30KB) (8 points per instance, max 24)
  let largeScriptsPenalty = 0;
  if (largeScriptsCount > 0) {
    largeScriptsPenalty = Math.min(24, largeScriptsCount * 8);
    candidateRecommendations.push({
      penalty: largeScriptsPenalty,
      recommendation: "قلّص السكربتات والأنماط المضمّنة التي تتجاوز 30KB لتفادي حظر معالجة مسار العرض الأساسي",
    });
    details.push({
      id: "large-scripts",
      label: "سكربتات/أنماط > 30KB",
      value: largeScriptsCount,
      status: "needs-improvement",
      penalty: largeScriptsPenalty,
      message: `${largeScriptsCount} ملفات تتجاوز 30KB (${largeScriptsPenalty} نقطة خصم)`,
    });
  } else {
    details.push({
      id: "large-scripts",
      label: "سكربتات/أنماط > 30KB",
      value: 0,
      status: "good",
      penalty: 0,
      message: "الأكواد البرمجية المضمّنة خفيفة (ممتاز)",
    });
  }

  // 5. Fonts count penalty (> 3)
  // When <= 3: 0 penalty and STRICTLY ZERO recommendation regarding reducing fonts.
  let fontsPenalty = 0;
  if (fontsCount > 3) {
    fontsPenalty = Math.min(20, (fontsCount - 3) * 5);
    candidateRecommendations.push({
      penalty: fontsPenalty,
      recommendation: `قلّل الخطوط المستخدمة (حاليًا ${fontsCount} خطوط) إلى 3 أو أقل لتسريع زمن تحميل الموقع وتفادي حظر الخطوط`,
    });
    details.push({
      id: "fonts",
      label: "عدد الخطوط",
      value: fontsCount,
      status: fontsCount > 4 ? "poor" : "needs-improvement",
      penalty: fontsPenalty,
      message: `${fontsCount} خطوط (${fontsPenalty} نقطة خصم)`,
    });
  } else {
    details.push({
      id: "fonts",
      label: "عدد الخطوط",
      value: fontsCount,
      status: "good",
      penalty: 0,
      message: `${fontsCount} خطوط (ضمن الحد الموصى به)`,
    });
  }

  const totalPenalty = sectionPenalty + dimensionsPenalty + largeImagesPenalty + largeScriptsPenalty + fontsPenalty;
  const rawScore = 100 - totalPenalty;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let rating: PerformanceScoreResult["rating"] = "excellent";
  if (score >= 90) rating = "excellent";
  else if (score >= 75) rating = "good";
  else if (score >= 50) rating = "needs-improvement";
  else rating = "poor";

  // Pick top 3 recommendations ordered by penalty severity
  candidateRecommendations.sort((a, b) => b.penalty - a.penalty);
  const recommendations = candidateRecommendations.slice(0, 3).map((c) => c.recommendation);

  return {
    score,
    rating,
    recommendations,
    weights,
    metrics: {
      sectionCount,
      imagesWithoutDimensionsCount,
      largeImagesCount,
      largeScriptsCount,
      fontsCount,
    },
    details,
  };
}
