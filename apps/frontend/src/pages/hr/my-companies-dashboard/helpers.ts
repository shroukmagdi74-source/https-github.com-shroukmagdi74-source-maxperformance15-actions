export const CACHE_TTL_MS = 60_000;

export const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const backendUrl =
    import.meta.env["VITE_API_URL"]?.replace("/api/v1", "") ||
    window.location.origin;
  return `${backendUrl}/${path.replace(/^\/+/, "")}`;
};
