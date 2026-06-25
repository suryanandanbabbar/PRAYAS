import type { Coordinate } from '../types';

/**
 * Number of meters per degree of latitude.
 * This is an approximate constant valid for the WGS-84 ellipsoid
 * (actual value varies slightly with latitude).
 */
export const METERS_PER_DEGREE_LAT = 111_320;

/**
 * Check whether a latitude value is a finite number within the valid range [-90, 90].
 *
 * @param lat - The latitude value to validate.
 * @returns `true` if the value is a finite number in [-90, 90], `false` otherwise.
 *
 * @example
 * ```ts
 * isValidLatitude(45);    // true
 * isValidLatitude(-91);   // false
 * isValidLatitude(NaN);   // false
 * ```
 */
export function isValidLatitude(lat: number): boolean {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

/**
 * Check whether a longitude value is a finite number within the valid range [-180, 180].
 *
 * @param lng - The longitude value to validate.
 * @returns `true` if the value is a finite number in [-180, 180], `false` otherwise.
 *
 * @example
 * ```ts
 * isValidLongitude(120);   // true
 * isValidLongitude(-181);  // false
 * isValidLongitude(NaN);   // false
 * ```
 */
export function isValidLongitude(lng: number): boolean {
  return Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

/**
 * Check whether a {@link Coordinate} object has valid latitude and longitude values.
 *
 * @param coord - The coordinate to validate.
 * @returns `true` if both latitude and longitude are valid, `false` otherwise.
 * @throws {TypeError} If `coord` is not an object or is null/undefined.
 *
 * @example
 * ```ts
 * isValidCoordinate({ latitude: 28.6, longitude: 77.2 }); // true
 * isValidCoordinate({ latitude: 100, longitude: 0 });      // false
 * ```
 */
export function isValidCoordinate(coord: Coordinate): boolean {
  if (coord === null || coord === undefined || typeof coord !== 'object') {
    throw new TypeError('coord must be a non-null object with latitude and longitude properties');
  }
  return isValidLatitude(coord.latitude) && isValidLongitude(coord.longitude);
}

/**
 * Convert a distance in meters to the equivalent offset in latitude degrees.
 *
 * Based on the approximation: 1° latitude ≈ 111 320 m.
 *
 * @param meters - Distance in meters (must be a finite non-negative number).
 * @returns The equivalent distance expressed in degrees of latitude.
 * @throws {RangeError} If `meters` is negative.
 * @throws {TypeError} If `meters` is not a finite number.
 *
 * @example
 * ```ts
 * metersToLatDegrees(111320); // ≈ 1
 * ```
 */
export function metersToLatDegrees(meters: number): number {
  if (!Number.isFinite(meters)) {
    throw new TypeError('meters must be a finite number');
  }
  if (meters < 0) {
    throw new RangeError('meters must be non-negative');
  }
  return meters / METERS_PER_DEGREE_LAT;
}

/**
 * Convert a distance in meters to the equivalent offset in longitude degrees
 * at a given latitude.
 *
 * Because lines of longitude converge toward the poles the conversion depends
 * on the cosine of the latitude.  At ±90° the cosine is essentially zero and
 * this function throws to prevent a division-by-zero / infinity result.
 *
 * @param meters    - Distance in meters (must be a finite non-negative number).
 * @param atLatitude - The latitude (in degrees) at which the conversion applies.
 * @returns The equivalent distance expressed in degrees of longitude.
 * @throws {RangeError} If `meters` is negative.
 * @throws {RangeError} If `atLatitude` is outside [-90, 90].
 * @throws {RangeError} If `atLatitude` is exactly ±90 (cosine ≈ 0, result would be infinite).
 * @throws {TypeError} If either argument is not a finite number.
 *
 * @example
 * ```ts
 * metersToLngDegrees(111320, 0);  // ≈ 1  (at equator)
 * metersToLngDegrees(111320, 60); // ≈ 2  (at 60° latitude)
 * ```
 */
export function metersToLngDegrees(meters: number, atLatitude: number): number {
  if (!Number.isFinite(meters)) {
    throw new TypeError('meters must be a finite number');
  }
  if (!Number.isFinite(atLatitude)) {
    throw new TypeError('atLatitude must be a finite number');
  }
  if (meters < 0) {
    throw new RangeError('meters must be non-negative');
  }
  if (atLatitude < -90 || atLatitude > 90) {
    throw new RangeError('atLatitude must be between -90 and 90');
  }
  if (atLatitude === 90 || atLatitude === -90) {
    throw new RangeError(
      'Cannot convert meters to longitude degrees at the poles (latitude ±90) because the cosine is zero',
    );
  }

  const cosLat = Math.cos((atLatitude * Math.PI) / 180);
  return meters / (METERS_PER_DEGREE_LAT * cosLat);
}

/**
 * Convert a latitude offset in degrees to the equivalent distance in meters.
 *
 * @param degrees - Latitude offset in degrees (must be a finite non-negative number).
 * @returns The equivalent distance in meters.
 * @throws {RangeError} If `degrees` is negative.
 * @throws {TypeError} If `degrees` is not a finite number.
 *
 * @example
 * ```ts
 * latDegreesToMeters(1); // 111320
 * ```
 */
export function latDegreesToMeters(degrees: number): number {
  if (!Number.isFinite(degrees)) {
    throw new TypeError('degrees must be a finite number');
  }
  if (degrees < 0) {
    throw new RangeError('degrees must be non-negative');
  }
  return degrees * METERS_PER_DEGREE_LAT;
}

/**
 * Convert a longitude offset in degrees to the equivalent distance in meters
 * at a given latitude.
 *
 * @param degrees    - Longitude offset in degrees (must be a finite non-negative number).
 * @param atLatitude - The latitude (in degrees) at which the conversion applies.
 * @returns The equivalent distance in meters.
 * @throws {RangeError} If `degrees` is negative.
 * @throws {RangeError} If `atLatitude` is outside [-90, 90].
 * @throws {TypeError} If either argument is not a finite number.
 *
 * @example
 * ```ts
 * lngDegreesToMeters(1, 0);  // 111320      (at equator)
 * lngDegreesToMeters(1, 60); // ≈ 55660     (at 60°)
 * ```
 */
export function lngDegreesToMeters(degrees: number, atLatitude: number): number {
  if (!Number.isFinite(degrees)) {
    throw new TypeError('degrees must be a finite number');
  }
  if (!Number.isFinite(atLatitude)) {
    throw new TypeError('atLatitude must be a finite number');
  }
  if (degrees < 0) {
    throw new RangeError('degrees must be non-negative');
  }
  if (atLatitude < -90 || atLatitude > 90) {
    throw new RangeError('atLatitude must be between -90 and 90');
  }

  const cosLat = Math.cos((atLatitude * Math.PI) / 180);
  return degrees * METERS_PER_DEGREE_LAT * cosLat;
}
