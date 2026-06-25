import { describe, expect, it } from 'vitest';
import {
  isValidLatitude,
  isValidLongitude,
  isValidCoordinate,
  metersToLatDegrees,
  metersToLngDegrees,
  latDegreesToMeters,
  lngDegreesToMeters,
  METERS_PER_DEGREE_LAT,
} from '../src/index';

describe('isValidLatitude', () => {
  it('should return true for valid latitudes', () => {
    expect(isValidLatitude(0)).toBe(true);
    expect(isValidLatitude(90)).toBe(true);
    expect(isValidLatitude(-90)).toBe(true);
    expect(isValidLatitude(45.123)).toBe(true);
  });

  it('should return false for out-of-range latitudes', () => {
    expect(isValidLatitude(91)).toBe(false);
    expect(isValidLatitude(-91)).toBe(false);
    expect(isValidLatitude(180)).toBe(false);
  });

  it('should return false for NaN and Infinity', () => {
    expect(isValidLatitude(NaN)).toBe(false);
    expect(isValidLatitude(Infinity)).toBe(false);
    expect(isValidLatitude(-Infinity)).toBe(false);
  });
});

describe('isValidLongitude', () => {
  it('should return true for valid longitudes', () => {
    expect(isValidLongitude(0)).toBe(true);
    expect(isValidLongitude(180)).toBe(true);
    expect(isValidLongitude(-180)).toBe(true);
    expect(isValidLongitude(77.209)).toBe(true);
  });

  it('should return false for out-of-range longitudes', () => {
    expect(isValidLongitude(181)).toBe(false);
    expect(isValidLongitude(-181)).toBe(false);
  });

  it('should return false for NaN and Infinity', () => {
    expect(isValidLongitude(NaN)).toBe(false);
    expect(isValidLongitude(Infinity)).toBe(false);
  });
});

describe('isValidCoordinate', () => {
  it('should return true for valid coordinates', () => {
    expect(isValidCoordinate({ latitude: 28.6, longitude: 77.2 })).toBe(true);
    expect(isValidCoordinate({ latitude: 0, longitude: 0 })).toBe(true);
    expect(isValidCoordinate({ latitude: -90, longitude: -180 })).toBe(true);
  });

  it('should return false for out-of-range coordinates', () => {
    expect(isValidCoordinate({ latitude: 100, longitude: 0 })).toBe(false);
    expect(isValidCoordinate({ latitude: 0, longitude: 200 })).toBe(false);
  });

  it('should throw TypeError for null/undefined', () => {
    expect(() => isValidCoordinate(null as never)).toThrow(TypeError);
    expect(() => isValidCoordinate(undefined as never)).toThrow(TypeError);
  });
});

describe('metersToLatDegrees', () => {
  it('should convert meters to latitude degrees', () => {
    expect(metersToLatDegrees(METERS_PER_DEGREE_LAT)).toBeCloseTo(1, 10);
    expect(metersToLatDegrees(0)).toBe(0);
  });

  it('should throw on negative meters', () => {
    expect(() => metersToLatDegrees(-1)).toThrow(RangeError);
  });

  it('should throw on NaN', () => {
    expect(() => metersToLatDegrees(NaN)).toThrow(TypeError);
  });
});

describe('metersToLngDegrees', () => {
  it('should return ≈1 at equator for 111320 meters', () => {
    expect(metersToLngDegrees(METERS_PER_DEGREE_LAT, 0)).toBeCloseTo(1, 10);
  });

  it('should return ≈2 at latitude 60 for 111320 meters', () => {
    // cos(60°) = 0.5, so 111320 / (111320 * 0.5) = 2
    expect(metersToLngDegrees(METERS_PER_DEGREE_LAT, 60)).toBeCloseTo(2, 5);
  });

  it('should throw at latitude ±90 (poles)', () => {
    expect(() => metersToLngDegrees(100, 90)).toThrow(RangeError);
    expect(() => metersToLngDegrees(100, -90)).toThrow(RangeError);
  });

  it('should throw for out-of-range latitude', () => {
    expect(() => metersToLngDegrees(100, 91)).toThrow(RangeError);
  });

  it('should throw for negative meters', () => {
    expect(() => metersToLngDegrees(-1, 0)).toThrow(RangeError);
  });

  it('should throw for NaN inputs', () => {
    expect(() => metersToLngDegrees(NaN, 0)).toThrow(TypeError);
    expect(() => metersToLngDegrees(100, NaN)).toThrow(TypeError);
  });
});

describe('latDegreesToMeters', () => {
  it('should convert degrees to meters', () => {
    expect(latDegreesToMeters(1)).toBe(METERS_PER_DEGREE_LAT);
    expect(latDegreesToMeters(0)).toBe(0);
  });

  it('should throw on negative degrees', () => {
    expect(() => latDegreesToMeters(-1)).toThrow(RangeError);
  });

  it('should throw on NaN', () => {
    expect(() => latDegreesToMeters(NaN)).toThrow(TypeError);
  });
});

describe('lngDegreesToMeters', () => {
  it('should return 111320 for 1 degree at the equator', () => {
    expect(lngDegreesToMeters(1, 0)).toBe(METERS_PER_DEGREE_LAT);
  });

  it('should return ≈55660 for 1 degree at latitude 60', () => {
    // cos(60°) ≈ 0.5
    expect(lngDegreesToMeters(1, 60)).toBeCloseTo(METERS_PER_DEGREE_LAT * 0.5, 0);
  });

  it('should return 0 for 1 degree at the poles', () => {
    // cos(90°) ≈ 0
    expect(lngDegreesToMeters(1, 90)).toBeCloseTo(0, 0);
  });

  it('should throw on negative degrees', () => {
    expect(() => lngDegreesToMeters(-1, 0)).toThrow(RangeError);
  });

  it('should throw on out-of-range latitude', () => {
    expect(() => lngDegreesToMeters(1, 91)).toThrow(RangeError);
  });
});
