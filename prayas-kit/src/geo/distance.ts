import type { Coordinate, HasCoordinate } from '../types';
import { isValidCoordinate } from './coordinates';

/**
 * Mean radius of Earth in meters (WGS-84 derived).
 */
export const EARTH_RADIUS_M = 6_371_000;

/**
 * Calculate the great-circle distance between two geographic coordinates
 * using the Haversine formula.
 *
 * @param a - The first coordinate.
 * @param b - The second coordinate.
 * @returns The distance in meters between `a` and `b`.
 * @throws {TypeError}  If either argument is not a valid coordinate object.
 * @throws {RangeError} If latitude or longitude values are out of range.
 *
 * @example
 * ```ts
 * const delhi = { latitude: 28.6139, longitude: 77.2090 };
 * const mumbai = { latitude: 19.0760, longitude: 72.8777 };
 * haversineDistance(delhi, mumbai); // ≈ 1_153_000 m
 * ```
 */
export function haversineDistance(a: Coordinate, b: Coordinate): number {
  validateCoordinateArg(a, 'a');
  validateCoordinateArg(b, 'b');

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);

  const halfChordLenSq =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLenSq), Math.sqrt(1 - halfChordLenSq));

  return EARTH_RADIUS_M * angularDistance;
}

/**
 * Sort an array of items that have latitude/longitude properties by their
 * distance from a reference coordinate, closest first.
 *
 * This is a TypeScript port of the PRAYAS App.js shelter-sorting logic
 * (line 379) which sorted shelters by their pre-computed `distance` field.
 * This implementation computes the distance on-the-fly using the Haversine
 * formula so that callers do not need to pre-compute it.
 *
 * The original array is **not** mutated; a new sorted array is returned.
 *
 * @typeParam T - Any type that extends {@link HasCoordinate}.
 * @param items - The items to sort.
 * @param from  - The reference coordinate to measure distance from.
 * @returns A new array of items sorted by ascending distance from `from`.
 * @throws {TypeError}  If `items` is not an array.
 * @throws {TypeError}  If `from` is not a valid coordinate object.
 * @throws {RangeError} If any coordinate values are out of range.
 *
 * @example
 * ```ts
 * const shelters = [
 *   { name: 'A', latitude: 28.7, longitude: 77.1 },
 *   { name: 'B', latitude: 28.5, longitude: 77.3 },
 * ];
 * const sorted = sortByDistance(shelters, { latitude: 28.6, longitude: 77.2 });
 * // sorted[0] is whichever shelter is closer
 * ```
 */
export function sortByDistance<T extends HasCoordinate>(items: T[], from: Coordinate): T[] {
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an array');
  }
  validateCoordinateArg(from, 'from');

  // Pre-compute distances so we don't call haversine twice per comparison.
  const withDistance = items.map((item) => {
    validateCoordinateArg(item as Coordinate, 'items element');
    return {
      item,
      distance: haversineDistance(
        { latitude: item.latitude, longitude: item.longitude },
        from,
      ),
    };
  });

  withDistance.sort((a, b) => a.distance - b.distance);

  return withDistance.map((entry) => entry.item);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Convert degrees to radians.
 *
 * @param deg - Angle in degrees.
 * @returns Angle in radians.
 */
function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Validate that a value is a valid Coordinate, throwing descriptive errors.
 *
 * @param coord - The value to validate.
 * @param name  - A human-readable name used in error messages.
 */
function validateCoordinateArg(coord: Coordinate, name: string): void {
  if (coord === null || coord === undefined || typeof coord !== 'object') {
    throw new TypeError(`${name} must be a non-null Coordinate object`);
  }
  if (!isValidCoordinate(coord)) {
    throw new RangeError(
      `${name} has invalid coordinates: latitude=${coord.latitude}, longitude=${coord.longitude}`,
    );
  }
}
