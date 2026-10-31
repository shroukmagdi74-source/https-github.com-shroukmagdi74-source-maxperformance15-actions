import DOMPurify from 'dompurify';

interface PurifierInstance {
  sanitize: (source: string, config?: Record<string, unknown>) => string;
}

let cachedPurifier: PurifierInstance | null = null;

const getPurifier = (): PurifierInstance | null => {
  if (cachedPurifier) {
    return cachedPurifier;
  }

  if (typeof DOMPurify?.sanitize === 'function') {
    cachedPurifier = DOMPurify as unknown as PurifierInstance;
    return cachedPurifier;
  }

  if (typeof DOMPurify === 'function' && typeof window !== 'undefined') {
    cachedPurifier = (DOMPurify as unknown as (win: Window) => PurifierInstance)(window);
    return cachedPurifier;
  }

  const defaultExport = (DOMPurify as unknown as { default?: unknown })?.default;
  if (defaultExport && typeof (defaultExport as PurifierInstance).sanitize === 'function') {
    cachedPurifier = defaultExport as PurifierInstance;
    return cachedPurifier;
  }

  if (typeof defaultExport === 'function' && typeof window !== 'undefined') {
    cachedPurifier = (defaultExport as (win: Window) => PurifierInstance)(window);
    return cachedPurifier;
  }

  return null;
};

export const sanitizeStorefrontHtml = (html?: string | null): string => {
  if (typeof html !== 'string' || !html.trim()) {
    return '';
  }

  const purifier = getPurifier();
  if (purifier && typeof purifier.sanitize === 'function') {
    return purifier.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'rel', 'style', 'class', 'dir', 'align', 'allow', 'allowfullscreen', 'frameborder', 'scrolling'],
      ADD_TAGS: ['iframe'],
    });
  }

  return html;
};
