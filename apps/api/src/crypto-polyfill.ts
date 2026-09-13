import { webcrypto } from 'node:crypto';
/**
 * Polyfill the crypto global object if it is not available.
 * This is needed because the crypto global object is not available in the browser.
 * We need to polyfill it because the crypto global object is used in the browser.
 * We need to polyfill it because the crypto global object is used in the browser.
 */
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
}

export {};
