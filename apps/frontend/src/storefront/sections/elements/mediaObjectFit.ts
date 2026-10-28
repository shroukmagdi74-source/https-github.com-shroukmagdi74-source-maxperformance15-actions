/**
 * Object-fit / object-position helpers (Ticket FIT-1).
 *
 * Kept in its own module — instead of `studio/utils/studioStyleUtils` — so that
 * storefront media elements (ImageElement / VideoElement / StoryParallax) can
 * use it without pulling the whole studio style engine into the runtime bundle.
 * `studioStyleUtils` re-exports these helpers for the inspector + CSS emitters.
 */

export const OBJECT_FIT_VALUES = ["cover", "contain", "fill", "none", "scale-down"] as const;

export type ObjectFitValue = (typeof OBJECT_FIT_VALUES)[number];

/**
 * The 9 canonical object-position presets exposed in the inspector.
 * Values are the equivalent CSS percentages so that RTL/LTR both behave.
 */
export const OBJECT_POSITION_PRESETS: Record<string, string> = {
  "top-left": "0% 0%",
  top: "50% 0%",
  "top-right": "100% 0%",
  left: "0% 50%",
  center: "50% 50%",
  right: "100% 50%",
  "bottom-left": "0% 100%",
  bottom: "50% 100%",
  "bottom-right": "100% 100%",
};

export const OBJECT_POSITION_PRESET_KEYS: string[] = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
];

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const normalizeDigits = (value: unknown): string =>
  String(value ?? "").replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));

const POSITION_KEYWORD = /^(left|right|top|bottom|center)$/i;
const POSITION_LENGTH = /^-?\d+(\.\d+)?(px|rem|em|%|vw|vh|vmin|vmax|ch|ex)?$/i;

/**
 * Normalizes any object-fit input into one of the 5 valid CSS values.
 * Returns `undefined` for empty / "auto" / unknown values so that callers can
 * leave the browser (or an existing Tailwind class) in charge — Ticket FIT-1
 * acceptance #5 requires zero object-fit output when nothing is configured.
 */
export function normalizeObjectFit(value: unknown): ObjectFitValue | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return undefined;

  const raw = normalizeDigits(value).trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (!raw || raw === "auto" || raw === "default" || raw === "initial" || raw === "inherit") {
    return undefined;
  }
  if (raw === "scaledown" || raw === "scale-down") return "scale-down";

  return (OBJECT_FIT_VALUES as readonly string[]).includes(raw)
    ? (raw as ObjectFitValue)
    : undefined;
}

/**
 * Normalizes an object-position input into a valid CSS `object-position` value.
 * Accepts:
 * - the 9 presets ("top-left", "center", ...)
 * - free values ("30% 70%", "left 20px", "center bottom")
 * - `{ x, y }` objects where numeric values are treated as percentages
 * Returns `undefined` for empty / "custom" / invalid input.
 */
export function normalizeObjectPosition(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const rawX = record["x"] ?? record["horizontal"];
    const rawY = record["y"] ?? record["vertical"];
    if (rawX === undefined || rawY === undefined) return undefined;
    const x = formatPositionPart(rawX);
    const y = formatPositionPart(rawY);
    if (!x || !y) return undefined;
    return `${x} ${y}`;
  }

  const raw = normalizeDigits(value).trim();
  if (!raw) return undefined;

  const key = raw.toLowerCase().replace(/[\s_]+/g, "-");
  if (key === "custom" || key === "auto" || key === "default" || key === "initial") {
    return undefined;
  }
  if (OBJECT_POSITION_PRESETS[key]) return OBJECT_POSITION_PRESETS[key];

  let tokens = raw.split(/\s+/).filter(Boolean);
  // Support the UI's "custom 30% 70%" form as well as the plain "30% 70%".
  if (tokens.length > 1 && (tokens[0] || "").toLowerCase() === "custom") {
    tokens = tokens.slice(1);
  }
  if (tokens.length < 1 || tokens.length > 4) return undefined;
  if (!tokens.every((token) => POSITION_KEYWORD.test(token) || POSITION_LENGTH.test(token))) {
    return undefined;
  }

  return tokens.join(" ");
}

function formatPositionPart(value: unknown): string | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? `${value}%` : undefined;
  }
  const raw = normalizeDigits(value).trim();
  if (!raw) return undefined;
  if (POSITION_LENGTH.test(raw)) {
    return /^-?\d+(\.\d+)?$/.test(raw) ? `${raw}%` : raw;
  }
  return POSITION_KEYWORD.test(raw) ? raw : undefined;
}

/**
 * Builds the inline `React.CSSProperties` subset for a media element
 * (`<img>` / `<video>`). Returns an empty object when nothing is configured so
 * default rendering is byte-for-byte unchanged (Ticket FIT-1 acceptance #5).
 */
export function buildMediaObjectStyle(
  settings?: Record<string, any> | null
): { objectFit?: ObjectFitValue; objectPosition?: string } {
  if (!settings || typeof settings !== "object") return {};

  const style: { objectFit?: ObjectFitValue; objectPosition?: string } = {};

  const fit = normalizeObjectFit(settings["objectFit"] ?? settings["object-fit"]);
  if (fit) style.objectFit = fit;

  const position = normalizeObjectPosition(
    settings["objectPosition"] ?? settings["object-position"]
  );
  if (position) style.objectPosition = position;

  return style;
}

/**
 * Maps object-fit onto its `background-size` equivalent for sections that paint
 * the image through `background-image` (no replaced element involved).
 * `scale-down` has no background-size equivalent, so it falls back to `contain`.
 */
export const OBJECT_FIT_TO_BACKGROUND_SIZE: Record<ObjectFitValue, string> = {
  cover: "cover",
  contain: "contain",
  fill: "100% 100%",
  none: "auto",
  "scale-down": "contain",
};

/**
 * Builds `background-size` / `background-position` overrides for sections that
 * render their image as a CSS background (e.g. StoryParallax).
 * Returns an empty object when nothing is configured.
 */
export function buildBackgroundMediaStyle(
  settings?: Record<string, any> | null
): { backgroundSize?: string; backgroundPosition?: string } {
  if (!settings || typeof settings !== "object") return {};

  const style: { backgroundSize?: string; backgroundPosition?: string } = {};

  const fit = normalizeObjectFit(settings["objectFit"] ?? settings["object-fit"]);
  if (fit) style.backgroundSize = OBJECT_FIT_TO_BACKGROUND_SIZE[fit];

  const position = normalizeObjectPosition(
    settings["objectPosition"] ?? settings["object-position"]
  );
  if (position) style.backgroundPosition = position;

  return style;
}

/** True when the given section/element type can meaningfully use object-fit. */
export const MEDIA_SECTION_TYPES = new Set<string>([
  "image",
  "video",
  "media",
  "story-parallax",
  "background-video",
  "before-after-slider",
  "image-hotspot",
  "product-gallery",
  "lookbook-showcase",
  "look-mosaic",
  "hero-banner",
]);

/** True when the settings object already carries an image/video source. */
export function hasMediaSource(settings?: Record<string, any> | null): boolean {
  if (!settings || typeof settings !== "object") return false;
  return Boolean(
    settings["src"] ||
      settings["image"] ||
      settings["url"] ||
      settings["poster"] ||
      settings["backgroundImage"] ||
      settings["video"]
  );
}
