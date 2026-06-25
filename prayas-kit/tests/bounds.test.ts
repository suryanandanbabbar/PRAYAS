import { describe, expect, it } from 'vitest';
import { boundsFromCenter, boundsContains, boundsArea } from '../src/index';

describe('boundsFromCenter', () => {
  it('should create a bounding box around a center point', () => {
    const box = boundsFromCenter({ latitude: 28.6, longitude: 77.2 }, 5000);
    // latOffset = 5000 / 111320 ≈ 0.04491
    expect(box.south).toBeCloseTo(28.6 - 5000 / 111320, 4);
    expect(box.north).toBeCloseTo(28.6 + 5000 / 111320, 4);
    // The box should be symmetric around the center
    expect((box.south + box.north) / 2).toBeCloseTo(28.6, 10);
    expect((box.west + box.east) / 2).toBeCloseTo(77.2, 10);
  });

  it('should create a wider box at higher latitudes', () => {
    const boxEquator = boundsFromCenter({ latitude: 0, longitude: 0 }, 1000);
    const boxHighLat = boundsFromCenter({ latitude: 60, longitude: 0 }, 1000);
    const equatorLngSpan = boxEquator.east - boxEquator.west;
    const highLatLngSpan = boxHighLat.east - boxHighLat.west;
    // At 60° lat, cos(60°)=0.5 → longitude span should be ~2× wider
    expect(highLatLngSpan).toBeCloseTo(equatorLngSpan * 2, 5);
  });

  it('should throw for negative radius', () => {
    expect(() => boundsFromCenter({ latitude: 0, longitude: 0 }, -1)).toThrow(RangeError);
  });

  it('should throw for zero radius', () => {
    expect(() => boundsFromCenter({ latitude: 0, longitude: 0 }, 0)).toThrow(RangeError);
  });

  it('should throw for NaN radius', () => {
    expect(() => boundsFromCenter({ latitude: 0, longitude: 0 }, NaN)).toThrow(TypeError);
  });

  it('should throw for invalid center coordinate', () => {
    expect(() => boundsFromCenter({ latitude: 100, longitude: 0 }, 1000)).toThrow(RangeError);
  });

  it('should throw for null center', () => {
    expect(() => boundsFromCenter(null as never, 1000)).toThrow(TypeError);
  });

  it('should throw at the poles (lat ±90)', () => {
    expect(() => boundsFromCenter({ latitude: 90, longitude: 0 }, 1000)).toThrow(RangeError);
    expect(() => boundsFromCenter({ latitude: -90, longitude: 0 }, 1000)).toThrow(RangeError);
  });
});

describe('boundsContains', () => {
  const box = { south: 28, north: 29, west: 77, east: 78 };

  it('should return true for a point inside the box', () => {
    expect(boundsContains(box, { latitude: 28.5, longitude: 77.5 })).toBe(true);
  });

  it('should return true for a point on the boundary', () => {
    expect(boundsContains(box, { latitude: 28, longitude: 77 })).toBe(true);
    expect(boundsContains(box, { latitude: 29, longitude: 78 })).toBe(true);
  });

  it('should return false for a point outside the box', () => {
    expect(boundsContains(box, { latitude: 30, longitude: 77.5 })).toBe(false);
    expect(boundsContains(box, { latitude: 28.5, longitude: 79 })).toBe(false);
  });

  it('should throw for null bounds', () => {
    expect(() => boundsContains(null as never, { latitude: 0, longitude: 0 })).toThrow(TypeError);
  });

  it('should throw if south > north', () => {
    expect(() =>
      boundsContains({ south: 29, north: 28, west: 77, east: 78 }, { latitude: 28.5, longitude: 77.5 }),
    ).toThrow(RangeError);
  });

  it('should throw for invalid point', () => {
    expect(() => boundsContains(box, { latitude: NaN, longitude: 77 })).toThrow(RangeError);
  });

  it('should work across the date line', () => {
    // Box spanning from 170°E to 190°E (≡ 170°W)
    const dateLineBox = { south: -10, north: 10, west: 170, east: 190 };
    // A point at 175 is inside
    expect(boundsContains(dateLineBox, { latitude: 0, longitude: 175 })).toBe(true);
  });
});

describe('boundsArea', () => {
  it('should compute area at the equator (1°×1°)', () => {
    const box = { south: 0, north: 1, west: 0, east: 1 };
    const area = boundsArea(box);
    // 1° lat = 111320 m, 1° lng at equator = 111320 m
    // area ≈ 111320 * 111320 ≈ 1.239e10
    expect(area).toBeCloseTo(111320 * 111320, -6);
  });

  it('should return 0 for a zero-area box', () => {
    const box = { south: 10, north: 10, west: 20, east: 20 };
    expect(boundsArea(box)).toBe(0);
  });

  it('should compute smaller area at higher latitudes', () => {
    const boxEquator = { south: -0.5, north: 0.5, west: -0.5, east: 0.5 };
    const boxHighLat = { south: 59.5, north: 60.5, west: -0.5, east: 0.5 };
    expect(boundsArea(boxHighLat)).toBeLessThan(boundsArea(boxEquator));
  });

  it('should throw for null bounds', () => {
    expect(() => boundsArea(null as never)).toThrow(TypeError);
  });

  it('should throw if south > north', () => {
    expect(() => boundsArea({ south: 10, north: 5, west: 0, east: 1 })).toThrow(RangeError);
  });

  it('should throw for non-finite bounds values', () => {
    expect(() => boundsArea({ south: NaN, north: 1, west: 0, east: 1 })).toThrow(TypeError);
  });
});
