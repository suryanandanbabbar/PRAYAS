/**
 * Decodes a base64-encoded string into an ArrayBuffer.
 *
 * Works in both browser (using `atob`) and Node.js (using `Buffer`) environments.
 *
 * @param base64 - A valid base64-encoded string.
 * @returns The decoded data as an ArrayBuffer.
 * @throws {TypeError} If `base64` is not a string.
 * @throws {Error} If `base64` is an empty string.
 * @throws {Error} If `base64` contains invalid base64 characters.
 *
 * @example
 * ```typescript
 * const buffer = base64ToArrayBuffer('AQID'); // decodes to [1, 2, 3]
 * ```
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof base64 !== 'string') {
    throw new TypeError('base64 must be a string');
  }

  if (base64.length === 0) {
    throw new Error('base64 string must not be empty');
  }

  // Validate base64 characters (standard base64 alphabet + padding)
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    throw new Error('base64 string contains invalid characters');
  }

  let bytes: Uint8Array;

  if (typeof globalThis.Buffer !== 'undefined') {
    // Node.js environment
    const buf = globalThis.Buffer.from(base64, 'base64');
    bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  } else if (typeof atob === 'function') {
    // Browser environment
    const binaryString = atob(base64);
    const len = binaryString.length;
    bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  } else {
    throw new Error(
      'No base64 decoding mechanism available. Requires either Node.js Buffer or browser atob.'
    );
  }

  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/**
 * Decodes a base64-encoded string into a 16-bit signed integer PCM array.
 *
 * The base64 data is expected to represent raw 16-bit little-endian PCM samples.
 * Each sample occupies 2 bytes, so the decoded byte length must be even.
 *
 * @param base64 - A valid base64-encoded string representing 16-bit PCM data.
 * @returns The decoded PCM samples as an Int16Array.
 * @throws {TypeError} If `base64` is not a string.
 * @throws {Error} If `base64` is an empty string.
 * @throws {Error} If the decoded byte length is not a multiple of 2.
 *
 * @example
 * ```typescript
 * // Decode base64-encoded PCM data returned from a speech API
 * const pcmSamples = base64ToPcm16(apiResponse.audioContent);
 * ```
 */
export function base64ToPcm16(base64: string): Int16Array {
  const buffer = base64ToArrayBuffer(base64);

  if (buffer.byteLength % 2 !== 0) {
    throw new Error(
      `Decoded data has ${buffer.byteLength} bytes, which is not a multiple of 2. ` +
        'Expected 16-bit PCM data (2 bytes per sample).'
    );
  }

  return new Int16Array(buffer);
}
