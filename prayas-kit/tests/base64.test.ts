import { describe, it, expect } from 'vitest';
import { base64ToArrayBuffer, base64ToPcm16 } from '../src/index';

/**
 * Encodes a Uint8Array to a base64 string using Node.js Buffer.
 */
function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

describe('base64ToArrayBuffer', () => {
  it('should decode a valid base64 string to an ArrayBuffer', () => {
    const original = new Uint8Array([1, 2, 3, 4, 5]);
    const b64 = toBase64(original);
    const result = base64ToArrayBuffer(b64);

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBe(5);

    const decoded = new Uint8Array(result);
    expect(Array.from(decoded)).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle base64 with padding', () => {
    // 1 byte → 4 base64 chars with == padding
    const original = new Uint8Array([255]);
    const b64 = toBase64(original); // "/w=="
    const result = base64ToArrayBuffer(b64);
    const decoded = new Uint8Array(result);
    expect(decoded[0]).toBe(255);
  });

  it('should decode a round-trip correctly for larger data', () => {
    const original = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      original[i] = i;
    }
    const b64 = toBase64(original);
    const result = base64ToArrayBuffer(b64);
    const decoded = new Uint8Array(result);

    expect(decoded.length).toBe(256);
    for (let i = 0; i < 256; i++) {
      expect(decoded[i]).toBe(i);
    }
  });

  it('should throw TypeError for non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => base64ToArrayBuffer(123 as any)).toThrow(TypeError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => base64ToArrayBuffer(null as any)).toThrow(TypeError);
  });

  it('should throw Error for empty string', () => {
    expect(() => base64ToArrayBuffer('')).toThrow('must not be empty');
  });

  it('should throw Error for invalid base64 characters', () => {
    expect(() => base64ToArrayBuffer('abc!@#')).toThrow('invalid characters');
  });
});

describe('base64ToPcm16', () => {
  it('should decode base64 to Int16Array', () => {
    // Create Int16Array samples, convert to bytes, then base64
    const samples = new Int16Array([0, 1000, -1000, 32767, -32768]);
    const bytes = new Uint8Array(samples.buffer);
    const b64 = toBase64(bytes);

    const result = base64ToPcm16(b64);

    expect(result).toBeInstanceOf(Int16Array);
    expect(result.length).toBe(5);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1000);
    expect(result[2]).toBe(-1000);
    expect(result[3]).toBe(32767);
    expect(result[4]).toBe(-32768);
  });

  it('should throw Error for odd byte length', () => {
    // 3 bytes → not a multiple of 2
    const bytes = new Uint8Array([1, 2, 3]);
    const b64 = toBase64(bytes);

    expect(() => base64ToPcm16(b64)).toThrow('not a multiple of 2');
  });

  it('should round-trip through pcmToWavBuffer', async () => {
    // This tests the integration between base64ToPcm16 and pcmToWavBuffer
    const { pcmToWavBuffer } = await import('../src/index');

    const original = new Int16Array([500, -500, 0, 12345]);
    const bytes = new Uint8Array(original.buffer);
    const b64 = toBase64(bytes);

    const decoded = base64ToPcm16(b64);
    const wavBuffer = pcmToWavBuffer(decoded);
    const view = new DataView(wavBuffer);

    // Verify samples in WAV data section
    expect(view.getInt16(44, true)).toBe(500);
    expect(view.getInt16(46, true)).toBe(-500);
    expect(view.getInt16(48, true)).toBe(0);
    expect(view.getInt16(50, true)).toBe(12345);
  });
});
