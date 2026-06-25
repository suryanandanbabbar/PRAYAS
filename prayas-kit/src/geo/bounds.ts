import type { BoundingBox, Coordinate } from '../types';
import {
  isValidCoordinate,
  isValidLatitude,
  isValidLongitude,
  latDegreesToMeters,
  lngDegreesToMeters,
  metersToLatDegrees,
  metersToLngDegrees,
} from './coordinates';

/**
 * Create a {@link BoundingBox} centered on a geographic coordinate with the
 * given radius in meters.
 *
 * This is a TypeScript port of the PRAYAS map61.html bounding-box logic
 * (lines 1229-1247) which converts a center + radius into a lat/lng rectangle.
 *
 * @param center       - The center coordinate of the bounding box.
 * @param radiusMeters - The radius in meters from the center to each edge.
 *                       Must be a finite positive number.
 * @returns A {@link BoundingBox} whose edges are `radiusMeters` away from `center`.
 * @throws {TypeError}  If `center` is not a valid coordinate object.
 * @throws {RangeError} If the coordinate is out of range.
 * @throws {RangeError} If `radiusMeters` is not a positive finite number.
 * @throws {RangeError} If center latitude is exactly ±90 (longitude offset is undefined at the poles).
 *
 * @example
 * ```ts
 * const box = boundsFromCenter({ latitude: 28.6, longitude: 77.2 }, 5000);
 * // box ≈ { south: 28.555, north: 28.645, west: 77.149, east: 77.251 }
 * ```
 */
export function boundsFromCenter(center: Coordinate, radiusMeters: number): BoundingBox {
  if (center === null || center === undefined || typeof center !== 'object') {
    throw new TypeError('center must be a non-null Coordinate object');
  }
  if (!isValidCoordinate(center)) {
    throw new RangeError(
      `Invalid center coordinate: latitude=${center.latitude}, longitude=${center.longitude}`,
    );
  }
  if (!Number.isFinite(radiusMeters)) {
    throw new TypeError('radiusMeters must be a finite number');
  }
  if (radiusMeters <= 0) {
    throw new RangeError('radiusMeters must be a positive number');
  }

  const latOffset = metersToLatDegrees(radiusMeters);
  const lngOffset = metersToLngDegrees(radiusMeters, center.latitude);

  return {
    south: center.latitude - latOffset,
    north: center.latitude + latOffset,
    west: center.longitude - lngOffset,
    east: center.longitude + lngOffset,
  };
}

/**
 * Check whether a point falls inside (or on the edge of) a {@link BoundingBox}.
 *
 * @param bounds - The bounding box to test against.
 * @param point  - The coordinate to check.
 * @returns `true` if the point is inside or on the boundary, `false` otherwise.
 * @throws {TypeError}  If `bounds` is not a valid BoundingBox object.
 * @throws {TypeError}  If `point` is not a valid Coordinate object.
 * @throws {RangeError} If the coordinate values are out of range.
 *
 * @example
 * ```ts
 * const box = { south: 28, north: 29, west: 77, east: 78 };
 * boundsContains(box, { latitude: 28.5, longitude: 77.5 }); // true
 * boundsContains(box, { latitude: 30, longitude: 77.5 });    // false
 * ```
 */
export function boundsContains(bounds: BoundingBox, point: Coordinate): boolean {
  if (bounds === null || bounds === undefined || typeof bounds !== 'object') {
    throw new TypeError('bounds must be a non-null BoundingBox object');
  }
  if (
    !Number.isFinite(bounds.south) ||
    !Number.isFinite(bounds.north) ||
    !Number.isFinite(bounds.west) ||
    !Number.isFinite(bounds.east)
  ) {
    throw new TypeError('bounds must have finite south, north, west, and east properties');
  }
  if (bounds.south > bounds.north) {
    throw new RangeError('bounds.south must be less than or equal to bounds.north');
  }
  if (point === null || point === undefined || typeof point !== 'object') {
    throw new TypeError('point must be a non-null Coordinate object');
  }
  if (!isValidLatitude(point.latitude) || !isValidLongitude(point.longitude)) {
    throw new RangeError(
      `Invalid point coordinate: latitude=${point.latitude}, longitude=${point.longitude}`,
    );
  }

  return (
    point.latitude >= bounds.south &&
    point.latitude <= bounds.north &&
    point.longitude >= bounds.west &&
    point.longitude <= bounds.east
  );
}

/**
 * Calculate the approximate area of a {@link BoundingBox} in square meters.
 *
 * This is derived from the PRAYAS map61.html cell-area computation
 * (lines 1353-1360) which multiplies the latitude span (in meters) by the
 * longitude span (in meters, adjusted for latitude at the center of the box).
 *
 * @param bounds - The bounding box whose area to compute.
 * @returns The approximate area in square meters.
 * @throws {TypeError}  If `bounds` is not a valid object.
 * @throws {RangeError} If bounds properties are inconsistent (south > north).
 *
 * @example
 * ```ts
 * const box = { south: 0, north: 1, west: 0, east: 1 };
 * boundsArea(box); // ≈ 1.239e10  (roughly 12 390 km²)
 * ```
 */
export function boundsArea(bounds: BoundingBox): number {
  if (bounds === null || bounds === undefined || typeof bounds !== 'object') {
    throw new TypeError('bounds must be a non-null BoundingBox object');
  }
  if (
    !Number.isFinite(bounds.south) ||
    !Number.isFinite(bounds.north) ||
    !Number.isFinite(bounds.west) ||
    !Number.isFinite(bounds.east)
  ) {
    throw new TypeError('bounds must have finite south, north, west, and east properties');
  }
  if (bounds.south > bounds.north) {
    throw new RangeError('bounds.south must be less than or equal to bounds.north');
  }

  const latSpanDeg = bounds.north - bounds.south;
  const lngSpanDeg = bounds.east - bounds.west;

  // Use the center latitude to approximate the cosine factor, matching the
  // PRAYAS cell-area formula.
  const centerLat = (bounds.south + bounds.north) / 2;

  const latSpanM = latDegreesToMeters(latSpanDeg);
  const lngSpanM = lngDegreesToMeters(Math.abs(lngSpanDeg), centerLat);

  return latSpanM * lngSpanM;
}
