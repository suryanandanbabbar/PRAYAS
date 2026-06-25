import { describe, expect, it } from 'vitest';
import { haversineDistance, sortByDistance, EARTH_RADIUS_M } from '../src/index';

describe('haversineDistance', () => {
  it('should return 0 for identical points', () => {
    const p = { latitude: 28.6, longitude: 77.2 };
    expect(haversineDistance(p, p)).toBe(0);
  });

  it('should compute distance between Delhi and Mumbai', () => {
    const delhi = { latitude: 28.6139, longitude: 77.209 };
    const mumbai = { latitude: 19.076, longitude: 72.8777 };
    const d = haversineDistance(delhi, mumbai);
    // Expected ≈ 1153 km
    expect(d).toBeGreaterThan(1_140_000);
    expect(d).toBeLessThan(1_165_000);
  });

  it('should compute distance along the equator (90° apart)', () => {
    const a = { latitude: 0, longitude: 0 };
    const b = { latitude: 0, longitude: 90 };
    const expected = (Math.PI / 2) * EARTH_RADIUS_M; // quarter circumference
    expect(haversineDistance(a, b)).toBeCloseTo(expected, -3);
  });

  it('should compute distance from pole to pole', () => {
    const north = { latitude: 90, longitude: 0 };
    const south = { latitude: -90, longitude: 0 };
    const expected = Math.PI * EARTH_RADIUS_M; // half circumference
    expect(haversineDistance(north, south)).toBeCloseTo(expected, -3);
  });

  it('should compute distance across the date line', () => {
    const a = { latitude: 0, longitude: 179 };
    const b = { latitude: 0, longitude: -179 };
    // 2° of longitude at the equator
    const expected = (2 / 360) * 2 * Math.PI * EARTH_RADIUS_M;
    expect(haversineDistance(a, b)).toBeCloseTo(expected, -2);
  });

  it('should be symmetric', () => {
    const a = { latitude: 10, longitude: 20 };
    const b = { latitude: 30, longitude: 40 };
    expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 10);
  });

  it('should throw for NaN coordinates', () => {
    expect(() => haversineDistance({ latitude: NaN, longitude: 0 }, { latitude: 0, longitude: 0 })).toThrow(
      RangeError,
    );
  });

  it('should throw for out-of-range coordinates', () => {
    expect(() =>
      haversineDistance({ latitude: 100, longitude: 0 }, { latitude: 0, longitude: 0 }),
    ).toThrow(RangeError);
  });

  it('should throw for null coordinate', () => {
    expect(() => haversineDistance(null as never, { latitude: 0, longitude: 0 })).toThrow(TypeError);
  });
});

describe('sortByDistance', () => {
  const origin = { latitude: 0, longitude: 0 };

  it('should sort items by ascending distance', () => {
    const items = [
      { name: 'Far', latitude: 10, longitude: 10 },
      { name: 'Near', latitude: 1, longitude: 1 },
      { name: 'Mid', latitude: 5, longitude: 5 },
    ];
    const sorted = sortByDistance(items, origin);
    expect(sorted[0].name).toBe('Near');
    expect(sorted[1].name).toBe('Mid');
    expect(sorted[2].name).toBe('Far');
  });

  it('should not mutate the original array', () => {
    const items = [
      { latitude: 10, longitude: 10 },
      { latitude: 1, longitude: 1 },
    ];
    const copy = [...items];
    sortByDistance(items, origin);
    expect(items).toEqual(copy);
  });

  it('should return empty array for empty input', () => {
    expect(sortByDistance([], origin)).toEqual([]);
  });

  it('should handle a single item', () => {
    const items = [{ latitude: 5, longitude: 5 }];
    const sorted = sortByDistance(items, origin);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].latitude).toBe(5);
  });

  it('should throw for non-array items', () => {
    expect(() => sortByDistance('not array' as never, origin)).toThrow(TypeError);
  });

  it('should throw for invalid from coordinate', () => {
    expect(() => sortByDistance([], { latitude: NaN, longitude: 0 })).toThrow(RangeError);
  });

  it('should throw when an item has invalid coordinates', () => {
    const items = [{ latitude: 200, longitude: 0 }];
    expect(() => sortByDistance(items, origin)).toThrow(RangeError);
  });

  it('should preserve extra properties on items', () => {
    const items = [
      { name: 'Shelter A', capacity: 100, latitude: 5, longitude: 5 },
      { name: 'Shelter B', capacity: 200, latitude: 1, longitude: 1 },
    ];
    const sorted = sortByDistance(items, origin);
    expect(sorted[0].name).toBe('Shelter B');
    expect(sorted[0].capacity).toBe(200);
  });
});
