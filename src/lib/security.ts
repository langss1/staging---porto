export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  const cleanUrl = url.trim();
  if (
    cleanUrl.toLowerCase().startsWith('javascript:') || 
    cleanUrl.toLowerCase().startsWith('data:') ||
    cleanUrl.toLowerCase().startsWith('vbscript:')
  ) {
    return '#';
  }
  return cleanUrl;
}
