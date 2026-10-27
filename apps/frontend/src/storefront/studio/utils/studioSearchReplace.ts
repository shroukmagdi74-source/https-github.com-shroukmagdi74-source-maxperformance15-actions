export interface StudioSearchMatch {
  id: string;
  sectionKey: string;
  sectionIndex: number;
  sectionType: string;
  field: string;
  path: Array<string | number>;
  currentText: string;
  matchIndex: number;
  matchLength: number;
}

export interface ReplaceResult {
  updatedSections: any[];
  count: number;
}

// Candidate text keys to search when traversing objects
const SEARCHABLE_TEXT_KEYS = new Set([
  "title",
  "subtitle",
  "heading",
  "subheading",
  "description",
  "text",
  "content",
  "label",
  "badge",
  "eyebrow",
  "ctaText",
  "buttonText",
  "primaryButtonText",
  "secondaryButtonText",
  "primaryCta",
  "secondaryCta",
  "linkText",
  "caption",
  "author",
  "role",
  "question",
  "answer",
  "quote",
  "name",
]);

function getSectionType(section: any): string {
  if (typeof section === "string") return section;
  return section?.type || "unknown";
}

function getSectionIdentifier(section: any, index: number): string {
  if (!section) return `section-${index}`;
  if (typeof section === "string") return `${section}-${index}`;
  return section.key || section.id || `${section.type || "section"}-${index}`;
}

/**
 * Recursively inspects a value and collects matches for a given query string.
 */
function traverseForSearch(
  value: any,
  query: string,
  sectionKey: string,
  sectionIndex: number,
  sectionType: string,
  currentPath: Array<string | number>,
  results: StudioSearchMatch[]
) {
  if (value === null || value === undefined) return;

  if (typeof value === "string") {
    // Only search string if parent key looks like text or is within settings/items
    const parentKey = currentPath[currentPath.length - 1];
    const isCandidateKey =
      typeof parentKey === "string" && SEARCHABLE_TEXT_KEYS.has(parentKey.toLowerCase());
    const isArrayItem = typeof parentKey === "number";

    // Skip technical non-text keys like IDs, colors, CSS, URLs, icon names unless candidate
    if (typeof parentKey === "string" && !isCandidateKey && !isArrayItem) {
      const lower = parentKey.toLowerCase();
      if (
        lower.includes("color") ||
        lower.includes("url") ||
        lower.includes("image") ||
        lower.includes("icon") ||
        lower.includes("id") ||
        lower.includes("key") ||
        lower.includes("style") ||
        lower.includes("class") ||
        lower.includes("css") ||
        lower.includes("slot")
      ) {
        return;
      }
    }

    const trimmed = value.trim();
    if (!trimmed) return;

    let searchStart = 0;
    while (searchStart < value.length) {
      const foundIdx = value.indexOf(query, searchStart);
      if (foundIdx === -1) break;

      const fieldName = String(parentKey || "text");
      const matchId = `${sectionKey}-${currentPath.join(".")}-${foundIdx}`;

      results.push({
        id: matchId,
        sectionKey,
        sectionIndex,
        sectionType,
        field: fieldName,
        path: [...currentPath],
        currentText: value,
        matchIndex: foundIdx,
        matchLength: query.length,
      });

      searchStart = foundIdx + query.length;
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, idx) => {
      traverseForSearch(
        item,
        query,
        sectionKey,
        sectionIndex,
        sectionType,
        [...currentPath, idx],
        results
      );
    });
    return;
  }

  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      traverseForSearch(
        v,
        query,
        sectionKey,
        sectionIndex,
        sectionType,
        [...currentPath, k],
        results
      );
    }
  }
}

/**
 * Searches all text fields across page sections for a query string.
 */
export function searchSections(sections: any[], query: string): StudioSearchMatch[] {
  const trimmed = query.trim();
  if (!trimmed || !Array.isArray(sections) || sections.length === 0) {
    return [];
  }

  const results: StudioSearchMatch[] = [];

  sections.forEach((section, index) => {
    const sectionKey = getSectionIdentifier(section, index);
    const sectionType = getSectionType(section);

    if (typeof section === "object" && section !== null) {
      traverseForSearch(
        section,
        trimmed,
        sectionKey,
        index,
        sectionType,
        [],
        results
      );
    }
  });

  return results;
}

/**
 * Replaces a single match in the sections tree.
 */
export function replaceSectionMatch(
  sections: any[],
  match: StudioSearchMatch,
  replacement: string
): ReplaceResult {
  if (!Array.isArray(sections) || !match) {
    return { updatedSections: sections || [], count: 0 };
  }

  // Deep clone
  const clonedSections: any[] = JSON.parse(JSON.stringify(sections)) as any[];
  const targetSection = clonedSections[match.sectionIndex];
  if (!targetSection) {
    return { updatedSections: clonedSections, count: 0 };
  }

  // Navigate to field
  let curr = targetSection;
  for (let i = 0; i < match.path.length - 1; i++) {
    const key = match.path[i];
    if (key === undefined || curr[key] === undefined) return { updatedSections: clonedSections, count: 0 };
    curr = curr[key];
  }

  const lastKey = match.path[match.path.length - 1];
  if (lastKey === undefined || typeof curr[lastKey] !== "string") {
    return { updatedSections: clonedSections, count: 0 };
  }

  const origStr: string = curr[lastKey];
  const before = origStr.slice(0, match.matchIndex);
  const after = origStr.slice(match.matchIndex + match.matchLength);
  curr[lastKey] = before + replacement + after;

  return {
    updatedSections: clonedSections,
    count: 1,
  };
}

/**
 * Replaces all occurrences of query across all searchable text fields in sections.
 */
export function replaceAllSectionMatches(
  sections: any[],
  query: string,
  replacement: string
): ReplaceResult {
  const trimmed = query.trim();
  if (!trimmed || !Array.isArray(sections)) {
    return { updatedSections: sections || [], count: 0 };
  }

  const matches = searchSections(sections, trimmed);
  if (matches.length === 0) {
    return { updatedSections: sections, count: 0 };
  }

  const clonedSections: any[] = JSON.parse(JSON.stringify(sections)) as any[];

  let replacedCount = 0;

  function recursiveReplace(obj: any): void {
    if (!obj || typeof obj !== "object") return;

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (typeof obj[i] === "string") {
          if (obj[i].includes(trimmed)) {
            const occurrences = obj[i].split(trimmed).length - 1;
            obj[i] = obj[i].split(trimmed).join(replacement);
            replacedCount += occurrences;
          }
        } else if (typeof obj[i] === "object") {
          recursiveReplace(obj[i]);
        }
      }
      return;
    }

    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") {
        if (v.includes(trimmed)) {
          const occurrences = v.split(trimmed).length - 1;
          obj[k] = v.split(trimmed).join(replacement);
          replacedCount += occurrences;
        }
      } else if (typeof v === "object") {
        recursiveReplace(v);
      }
    }
  }

  clonedSections.forEach((sec: any) => recursiveReplace(sec));

  return {
    updatedSections: clonedSections,
    count: replacedCount,
  };
}
