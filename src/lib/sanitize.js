/**
 * Lincoz Enterprise - Client-Side XSS Sanitization Utility
 * Rule 11: Never render untrusted content as raw HTML.
 */

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes dangerous HTML characters to prevent XSS injection.
 * @param {string} str - Raw input string
 * @returns {string} Sanitized string
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'/]/g, (match) => HTML_ENTITIES[match]);
}

/**
 * Sanitizes rich text by stripping all script, iframe, and inline execution handlers.
 * @param {string} html - HTML string
 * @returns {string} Clean HTML string safe for rendering
 */
export function sanitizeRichText(html) {
  if (typeof html !== 'string') return '';
  
  // Strip script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Safe text trimmer and null-coalescer
 * @param {any} val
 * @param {string} fallback
 * @returns {string}
 */
export function safeText(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  return escapeHtml(String(val).trim());
}
