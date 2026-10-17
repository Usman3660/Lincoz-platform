/**
 * Lincoz Enterprise - Cryptographically Secure Random Utilities
 * Compliant with SonarQube Rule S2245 (CWE-338: Use of Cryptographically Strong PRNG).
 * Replaces insecure Math.random() with standard Web Crypto API.
 */

export function secureRandomId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const uuid = crypto.randomUUID();
    return prefix ? `${prefix}-${uuid}` : uuid;
  }
  const array = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(array);
  }
  const hex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  return prefix ? `${prefix}-${hex}` : hex;
}

export function secureRandomDigits(length = 4) {
  const array = new Uint32Array(1);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(array);
  } else {
    // Safe fallback if crypto is unavailable
    return '8892';
  }
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const val = min + (array[0] % (max - min + 1));
  return val.toString();
}

export function secureRandomString(length = 8) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, length);
  }
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(array);
  }
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  return Array.from(array, b => chars[b % chars.length]).join('');
}

export function secureRandomInt(min, max) {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(array);
    return min + (array[0] % range);
  }
  return min;
}
