// =============================================================================
// Security utility functions
// =============================================================================

/** MED-05 / CRIT-02:
 *  Sanitize a URL before rendering in an <a href>.
 *  Blocks javascript:, data:, vbscript: and enforces https/http/mailto only.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  const cleanUrl = url.trim();

  // Block dangerous protocols
  const lower = cleanUrl.toLowerCase();
  const BLOCKED = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:'];
  if (BLOCKED.some((proto) => lower.startsWith(proto))) {
    return '#';
  }

  // Only allow safe protocols
  const ALLOWED_PROTOCOLS = ['https:', 'http:', 'mailto:', '/'];
  const hasAllowedProtocol = ALLOWED_PROTOCOLS.some(
    (proto) => lower.startsWith(proto)
  );
  if (!hasAllowedProtocol) {
    return '#';
  }

  return cleanUrl;
}

/** MED-02:
 *  Validate a file upload by MIME type and size.
 *  Returns an error string, or null if the file is acceptable.
 */
export function validateFileUpload(
  file: File,
  options: {
    allowedMimes: string[];
    maxSizeBytes?: number;
  }
): string | null {
  const { allowedMimes, maxSizeBytes = 10 * 1024 * 1024 } = options; // 10 MB default

  if (!allowedMimes.includes(file.type)) {
    return `File type "${file.type}" is not allowed. Allowed types: ${allowedMimes.join(', ')}`;
  }

  if (file.size > maxSizeBytes) {
    const mb = (maxSizeBytes / 1024 / 1024).toFixed(0);
    return `File size exceeds the ${mb} MB limit.`;
  }

  return null; // valid
}

/** CRIT-02:
 *  Validate a redirect path — only allow relative paths starting with /
 *  to prevent open redirect attacks via the ?from= parameter.
 */
export function validateRedirectPath(raw: string | null, fallback = '/'): string {
  if (!raw) return fallback;
  // Must be a relative path starting with / but NOT //  (protocol-relative URL)
  if (raw.startsWith('/') && !raw.startsWith('//')) {
    // Disallow admin-to-admin redirects from untrusted sources if desired
    return raw;
  }
  return fallback;
}
