import type { BoundingBox, Coordinate, GridOptions } from '../types';

/**
 * Approximate number of metres per degree of latitude (or longitude at the equator).
 * @internal
 */
const METRES_PER_DEGREE = 111_320;

/**
 * Generate a flat array of {@link Coordinate} pairs arranged in a regular
 * latitude / longitude grid that spans the given bounding box.
 *
 * The grid has `gridSize` divisions along each axis, producing
 * `gridSize × gridSize` points in total. Points are emitted in
 * row-major order (latitude varies in the outer loop).
 *
 * @param options - Grid generation options.
 * @returns An array of `gridSize²` coordinates.
 *
 * @throws {RangeError} If `gridSize` is less than 1.
 * @throws {RangeError} If `bounds.south >= bounds.north`.
 * @throws {RangeError} If `bounds.west >= bounds.east`.
 *
 * @example
 * ```ts
 * const coords = generateGrid({
 *   bounds: { south: 28.5, north: 28.7, west: 77.1, east: 77.3 },
 *   gridSize: 10,
 * });
 * console.log(coords.length); // 100
 * ```
 */
export function generateGrid(options: GridOptions): Coordinate[] {
  const { bounds, gridSize } = options;

  validateBounds(bounds);

  if (!Number.isFinite(gridSize) || gridSize < 1) {
    throw new RangeError(
      `gridSize must be an integer >= 1, received ${String(gridSize)}`,
    );
  }

  const safeGridSize = Math.floor(gridSize);

  const lngStep = (bounds.east - bounds.west) / safeGridSize;
  const latStep = (bounds.north - bounds.south) / safeGridSize;

  const locations: Coordinate[] = [];

  for (let i = 0; i < safeGridSize; i++) {
    for (let j = 0; j < safeGridSize; j++) {
      locations.push({
        latitude: bounds.south + i * latStep,
        longitude: bounds.west + j * lngStep,
      });
    }
  }

  return locations;
}

/**
 * Compute the approximate area of a single grid cell in **square metres**.
 *
 * The calculation accounts for the convergence of meridians at higher
 * latitudes by scaling the longitudinal extent with `cos(referenceLatitude)`.
 *
 * @param bounds         - The bounding box of the entire grid.
 * @param gridSize       - The number of divisions along each axis.
 * @param referenceLatitude - A representative latitude (in degrees) used
 *                           to correct for meridian convergence.
 * @returns Cell area in m².
 *
 * @throws {RangeError} If `gridSize` is less than 1.
 * @throws {RangeError} If `bounds.south >= bounds.north` or `bounds.west >= bounds.east`.
 * @throws {RangeError} If `referenceLatitude` is outside [−90, 90].
 *
 * @example
 * ```ts
 * const area = computeCellArea(
 *   { south: 28.5, north: 28.7, west: 77.1, east: 77.3 },
 *   70,
 *   28.6,
 * );
 * ```
 */
export function computeCellArea(
  bounds: BoundingBox,
  gridSize: number,
  referenceLatitude: number,
): number {
  validateBounds(bounds);

  if (!Number.isFinite(gridSize) || gridSize < 1) {
    throw new RangeError(
      `gridSize must be an integer >= 1, received ${String(gridSize)}`,
    );
  }

  if (
    !Number.isFinite(referenceLatitude) ||
    referenceLatitude < -90 ||
    referenceLatitude > 90
  ) {
    throw new RangeError(
      `referenceLatitude must be between -90 and 90, received ${String(referenceLatitude)}`,
    );
  }

  const safeGridSize = Math.floor(gridSize);

  const lngStep = (bounds.east - bounds.west) / safeGridSize;
  const latStep = (bounds.north - bounds.south) / safeGridSize;

  const latMetres = latStep * METRES_PER_DEGREE;
  const lngMetres =
    lngStep * METRES_PER_DEGREE * Math.cos((referenceLatitude * Math.PI) / 180);

  return latMetres * lngMetres;
}

/**
 * Validate that a bounding box has strictly ordered edges.
 * @internal
 */
function validateBounds(bounds: BoundingBox): void {
  if (bounds.south >= bounds.north) {
    throw new RangeError(
      `bounds.south (${bounds.south}) must be strictly less than bounds.north (${bounds.north})`,
    );
  }
  if (bounds.west >= bounds.east) {
    throw new RangeError(
      `bounds.west (${bounds.west}) must be strictly less than bounds.east (${bounds.east})`,
    );
  }
}
