/**
 * Helper to correctly pluralize Arabic nouns for Academy modules and lessons.
 * Eliminates broken grammatical phrases like "1 وحدات · 7 درس".
 */

export function formatArabicModules(count: number): string {
  if (count <= 0) return "لا توجد وحدات";
  if (count === 1) return "وحدة واحدة";
  if (count === 2) return "وحدتان";
  if (count >= 3 && count <= 10) return `${count} وحدات`;
  return `${count} وحدة`;
}

export function formatArabicLessons(count: number): string {
  if (count <= 0) return "لا توجد دروس";
  if (count === 1) return "درس واحد";
  if (count === 2) return "درسان";
  if (count >= 3 && count <= 10) return `${count} دروس`;
  return `${count} درس`;
}
