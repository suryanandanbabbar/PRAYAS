import { describe, it, expect } from 'vitest';
import {
  pcmToWavBuffer,
  pcmToWavBlob,
  createWavHeader,
  WAV_HEADER_SIZE,
  PCM_FORMAT_TAG,
} from '../src/index';

/**
 * Reads a 4-character ASCII string from a DataView at the given offset.
 */
function readString(view: DataView, offset: number, length: number): string {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(view.getUint8(offset + i));
  }
  return str;
}

describe('pcmToWavBuffer', () => {
  it('should produce a valid WAV header for mono 24000 Hz (defaults)', () => {
    const pcm = new Int16Array([100, -100, 200, -200]);
    const buffer = pcmToWavBuffer(pcm);
    const view = new DataView(buffer);

    // RIFF header
    expect(readString(view, 0, 4)).toBe('RIFF');
    expect(view.getUint32(4, true)).toBe(36 + pcm.length * 2);
    expect(readString(view, 8, 4)).toBe('WAVE');

    // fmt sub-chunk
    expect(readString(view, 12, 4)).toBe('fmt ');
    expect(view.getUint32(16, true)).toBe(16); // sub-chunk size
    expect(view.getUint16(20, true)).toBe(PCM_FORMAT_TAG); // audio format
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(24000); // sample rate
    expect(view.getUint32(28, true)).toBe(24000 * 1 * 2); // byte rate
    expect(view.getUint16(32, true)).toBe(2); // block align
    expect(view.getUint16(34, true)).toBe(16); // bits per sample

    // data sub-chunk
    expect(readString(view, 36, 4)).toBe('data');
    expect(view.getUint32(40, true)).toBe(pcm.length * 2);
  });

  it('should write correct PCM sample data after the header', () => {
    const pcm = new Int16Array([0, 32767, -32768, 1000]);
    const buffer = pcmToWavBuffer(pcm);
    const view = new DataView(buffer);

    expect(view.getInt16(44, true)).toBe(0);
    expect(view.getInt16(46, true)).toBe(32767);
    expect(view.getInt16(48, true)).toBe(-32768);
    expect(view.getInt16(50, true)).toBe(1000);
  });

  it('should produce correct total buffer size', () => {
    const pcm = new Int16Array(100);
    const buffer = pcmToWavBuffer(pcm);
    expect(buffer.byteLength).toBe(WAV_HEADER_SIZE + 100 * 2);
  });

  it('should handle stereo configuration', () => {
    const pcm = new Int16Array([100, 200, 300, 400]);
    const buffer = pcmToWavBuffer(pcm, { numChannels: 2 });
    const view = new DataView(buffer);

    expect(view.getUint16(22, true)).toBe(2); // stereo
    expect(view.getUint32(28, true)).toBe(24000 * 2 * 2); // byte rate
    expect(view.getUint16(32, true)).toBe(4); // block align
  });

  it('should handle custom sample rates', () => {
    const pcm = new Int16Array([1]);
    const buffer = pcmToWavBuffer(pcm, { sampleRate: 48000 });
    const view = new DataView(buffer);

    expect(view.getUint32(24, true)).toBe(48000);
    expect(view.getUint32(28, true)).toBe(48000 * 1 * 2);
  });

  it('should handle an empty Int16Array', () => {
    const pcm = new Int16Array(0);
    const buffer = pcmToWavBuffer(pcm);
    const view = new DataView(buffer);

    expect(buffer.byteLength).toBe(WAV_HEADER_SIZE);
    expect(view.getUint32(40, true)).toBe(0); // data size = 0
    expect(view.getUint32(4, true)).toBe(36); // chunk size = 36
  });

  it('should throw TypeError for non-Int16Array input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => pcmToWavBuffer([] as any)).toThrow(TypeError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => pcmToWavBuffer('hello' as any)).toThrow(TypeError);
  });

  it('should throw RangeError for invalid numChannels', () => {
    const pcm = new Int16Array([1]);
    expect(() => pcmToWavBuffer(pcm, { numChannels: 0 })).toThrow(RangeError);
    expect(() => pcmToWavBuffer(pcm, { numChannels: -1 })).toThrow(RangeError);
    expect(() => pcmToWavBuffer(pcm, { numChannels: 1.5 })).toThrow(RangeError);
  });

  it('should throw RangeError for invalid sampleRate', () => {
    const pcm = new Int16Array([1]);
    expect(() => pcmToWavBuffer(pcm, { sampleRate: 0 })).toThrow(RangeError);
    expect(() => pcmToWavBuffer(pcm, { sampleRate: -8000 })).toThrow(RangeError);
    expect(() => pcmToWavBuffer(pcm, { sampleRate: NaN })).toThrow(RangeError);
    expect(() => pcmToWavBuffer(pcm, { sampleRate: Infinity })).toThrow(RangeError);
  });

  it('should throw RangeError for unsupported bitsPerSample', () => {
    const pcm = new Int16Array([1]);
    expect(() => pcmToWavBuffer(pcm, { bitsPerSample: 8 })).toThrow(RangeError);
    expect(() => pcmToWavBuffer(pcm, { bitsPerSample: 24 })).toThrow(RangeError);
    expect(() => pcmToWavBuffer(pcm, { bitsPerSample: 32 })).toThrow(RangeError);
  });
});

describe('pcmToWavBlob', () => {
  it('should produce a Blob with audio/wav MIME type', () => {
    const pcm = new Int16Array([100, -100]);
    const blob = pcmToWavBlob(pcm);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('audio/wav');
    expect(blob.size).toBe(WAV_HEADER_SIZE + pcm.length * 2);
  });
});

describe('createWavHeader', () => {
  it('should compute correct header metadata', () => {
    const header = createWavHeader(48000, { sampleRate: 48000, numChannels: 2 });

    expect(header.numChannels).toBe(2);
    expect(header.sampleRate).toBe(48000);
    expect(header.bitsPerSample).toBe(16);
    expect(header.blockAlign).toBe(4); // 2 channels × 2 bytes
    expect(header.byteRate).toBe(48000 * 4); // 192000
    expect(header.dataSize).toBe(48000 * 2); // 96000 bytes
    expect(header.chunkSize).toBe(36 + 48000 * 2);
  });

  it('should throw RangeError for negative numSamples', () => {
    expect(() => createWavHeader(-1)).toThrow(RangeError);
  });

  it('should handle zero samples', () => {
    const header = createWavHeader(0);
    expect(header.dataSize).toBe(0);
    expect(header.chunkSize).toBe(36);
  });
});

describe('constants', () => {
  it('WAV_HEADER_SIZE should be 44', () => {
    expect(WAV_HEADER_SIZE).toBe(44);
  });

  it('PCM_FORMAT_TAG should be 1', () => {
    expect(PCM_FORMAT_TAG).toBe(1);
  });
});
