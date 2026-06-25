import type { WavHeader, WavOptions } from '../types';

/** Size of a standard WAV file header in bytes. */
export const WAV_HEADER_SIZE = 44;

/** PCM audio format tag used in WAV headers. */
export const PCM_FORMAT_TAG = 1;

/**
 * Default WAV options used when no overrides are provided.
 */
const DEFAULT_OPTIONS: Required<WavOptions> = {
  numChannels: 1,
  sampleRate: 24000,
  bitsPerSample: 16,
};

/**
 * Writes an ASCII string into a DataView at the specified byte offset.
 *
 * @param view - The DataView to write into.
 * @param offset - The byte offset at which to start writing.
 * @param str - The ASCII string to write.
 */
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Resolves user-supplied options against defaults and validates them.
 *
 * @param options - Optional WAV configuration overrides.
 * @returns Fully resolved options with all fields populated.
 * @throws {RangeError} If any option value is out of valid range.
 */
function resolveOptions(options?: WavOptions): Required<WavOptions> {
  const resolved: Required<WavOptions> = {
    numChannels: options?.numChannels ?? DEFAULT_OPTIONS.numChannels,
    sampleRate: options?.sampleRate ?? DEFAULT_OPTIONS.sampleRate,
    bitsPerSample: options?.bitsPerSample ?? DEFAULT_OPTIONS.bitsPerSample,
  };

  if (!Number.isInteger(resolved.numChannels) || resolved.numChannels < 1) {
    throw new RangeError(
      `numChannels must be a positive integer, got ${resolved.numChannels}`
    );
  }

  if (!Number.isFinite(resolved.sampleRate) || resolved.sampleRate <= 0) {
    throw new RangeError(
      `sampleRate must be a positive number, got ${resolved.sampleRate}`
    );
  }

  if (resolved.bitsPerSample !== 16) {
    throw new RangeError(
      `bitsPerSample must be 16 (only 16-bit PCM is supported), got ${resolved.bitsPerSample}`
    );
  }

  return resolved;
}

/**
 * Creates a WAV header metadata object for the given number of samples and options.
 *
 * This does not produce binary data — it computes the field values that would
 * appear in a WAV file header.
 *
 * @param numSamples - The number of PCM samples (per channel).
 * @param options - Optional WAV configuration overrides.
 * @returns A {@link WavHeader} object with all computed fields.
 * @throws {RangeError} If `numSamples` is negative or options are invalid.
 *
 * @example
 * ```typescript
 * const header = createWavHeader(48000, { sampleRate: 48000, numChannels: 2 });
 * console.log(header.byteRate); // 192000
 * ```
 */
export function createWavHeader(numSamples: number, options?: WavOptions): WavHeader {
  if (!Number.isInteger(numSamples) || numSamples < 0) {
    throw new RangeError(`numSamples must be a non-negative integer, got ${numSamples}`);
  }

  const { numChannels, sampleRate, bitsPerSample } = resolveOptions(options);
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const chunkSize = 36 + dataSize;

  return {
    chunkSize,
    numChannels,
    sampleRate,
    byteRate,
    blockAlign,
    bitsPerSample,
    dataSize,
  };
}

/**
 * Converts 16-bit PCM sample data into a complete WAV file stored in an ArrayBuffer.
 *
 * The resulting ArrayBuffer contains a valid RIFF/WAVE header followed by the
 * raw PCM sample data. This function works in both Node.js and browser environments.
 *
 * @param pcmData - The raw 16-bit signed integer PCM samples.
 * @param options - Optional WAV configuration overrides.
 * @returns A complete WAV file as an ArrayBuffer.
 * @throws {TypeError} If `pcmData` is not an Int16Array.
 * @throws {RangeError} If options are invalid.
 *
 * @example
 * ```typescript
 * const samples = new Int16Array([0, 1000, -1000, 0]);
 * const wavBuffer = pcmToWavBuffer(samples, { sampleRate: 16000 });
 * ```
 */
export function pcmToWavBuffer(pcmData: Int16Array, options?: WavOptions): ArrayBuffer {
  if (!(pcmData instanceof Int16Array)) {
    throw new TypeError('pcmData must be an Int16Array');
  }

  const { numChannels, sampleRate, bitsPerSample } = resolveOptions(options);
  const bytesPerSample = bitsPerSample / 8;
  const dataSize = pcmData.length * bytesPerSample;

  const buffer = new ArrayBuffer(WAV_HEADER_SIZE + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Sub-chunk size (16 for PCM)
  view.setUint16(20, PCM_FORMAT_TAG, true); // Audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // Byte rate
  view.setUint16(32, numChannels * bytesPerSample, true); // Block align
  view.setUint16(34, bitsPerSample, true);

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(WAV_HEADER_SIZE + i * bytesPerSample, pcmData[i]!, true);
  }

  return buffer;
}

/**
 * Converts 16-bit PCM sample data into a WAV Blob with MIME type `audio/wav`.
 *
 * This is a convenience wrapper around {@link pcmToWavBuffer} for browser environments
 * where a Blob is needed (e.g. for creating object URLs for `<audio>` elements).
 *
 * @param pcmData - The raw 16-bit signed integer PCM samples.
 * @param options - Optional WAV configuration overrides.
 * @returns A Blob containing the complete WAV file data.
 * @throws {TypeError} If `pcmData` is not an Int16Array.
 * @throws {RangeError} If options are invalid.
 * @throws {Error} If the `Blob` constructor is not available in the current environment.
 *
 * @example
 * ```typescript
 * const blob = pcmToWavBlob(samples, { sampleRate: 24000 });
 * const url = URL.createObjectURL(blob);
 * audioElement.src = url;
 * ```
 */
export function pcmToWavBlob(pcmData: Int16Array, options?: WavOptions): Blob {
  if (typeof Blob === 'undefined') {
    throw new Error(
      'Blob is not available in this environment. Use pcmToWavBuffer() instead, ' +
        'which returns an ArrayBuffer and works in all environments.'
    );
  }

  const buffer = pcmToWavBuffer(pcmData, options);
  return new Blob([buffer], { type: 'audio/wav' });
}
