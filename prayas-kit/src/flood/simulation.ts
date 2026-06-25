import type { ElevationCell, FloodedCell, SimulationResult } from '../types';
import { classifyFloodRisk } from './risk';

/**
 * Run a simplified flood-fill simulation over a set of elevation cells.
 *
 * **Algorithm (bucket-fill model):**
 * 1. Total rainfall volume is computed as
 *    `cellAreaSqM × numberOfCells × (rainfallMm / 1000)`.
 * 2. Cells are sorted by elevation (lowest first).
 * 3. Water is "poured" into the landscape from the bottom up.
 *    At each elevation step the algorithm checks whether the remaining
 *    water volume is sufficient to raise the water surface to the next
 *    cell's elevation. If not, the final flood level is interpolated.
 * 4. Every cell whose elevation is below the computed flood level is
 *    returned as a {@link FloodedCell} together with its water depth
 *    and qualitative risk classification.
 *
 * @param cells       - Array of elevation cells to evaluate.
 *                      The array is **not** mutated.
 * @param rainfallMm  - Total rainfall in millimetres (≥ 0).
 * @param cellAreaSqM - Area of a single grid cell in square metres (> 0).
 * @returns A {@link SimulationResult} with the flood level, flooded cells,
 *          and summary statistics.
 *
 * @throws {RangeError} If `cells` is empty.
 * @throws {RangeError} If `rainfallMm` is negative or non-finite.
 * @throws {RangeError} If `cellAreaSqM` is not a positive finite number.
 *
 * @example
 * ```ts
 * import { simulateFlood } from '@suryanb/flood-sim';
 *
 * const result = simulateFlood(
 *   [
 *     { coordinate: { latitude: 28.6, longitude: 77.2 }, elevation: 200 },
 *     { coordinate: { latitude: 28.61, longitude: 77.2 }, elevation: 205 },
 *   ],
 *   50,   // 50 mm rainfall
 *   10000 // 10 000 m² per cell
 * );
 *
 * console.log(result.floodLevel);
 * console.log(result.floodedCells);
 * ```
 */
export function simulateFlood(
  cells: ReadonlyArray<ElevationCell>,
  rainfallMm: number,
  cellAreaSqM: number,
): SimulationResult {
  // ── Input validation ───────────────────────────────────────────────
  if (!cells || cells.length === 0) {
    throw new RangeError('cells array must contain at least one element');
  }

  if (!Number.isFinite(rainfallMm) || rainfallMm < 0) {
    throw new RangeError(
      `rainfallMm must be a non-negative finite number, received ${String(rainfallMm)}`,
    );
  }

  if (!Number.isFinite(cellAreaSqM) || cellAreaSqM <= 0) {
    throw new RangeError(
      `cellAreaSqM must be a positive finite number, received ${String(cellAreaSqM)}`,
    );
  }

  // ── Zero-rainfall fast path ────────────────────────────────────────
  if (rainfallMm === 0) {
    return {
      floodLevel: -Infinity,
      floodedCells: [],
      totalCells: cells.length,
      floodedPercentage: 0,
    };
  }

  // ── Prepare a mutable, sorted copy ────────────────────────────────
  const sorted = cells.slice().sort((a, b) => a.elevation - b.elevation);

  const totalWaterVolume =
    cellAreaSqM * sorted.length * (rainfallMm / 1000);

  let cumulativeVolume = 0;
  let finalFloodLevel = sorted[0]!.elevation;

  for (let i = 1; i < sorted.length; i++) {
    const levelDifference = sorted[i]!.elevation - sorted[i - 1]!.elevation;
    const volumeToFill = levelDifference * i * cellAreaSqM;

    if (cumulativeVolume + volumeToFill >= totalWaterVolume) {
      const remainingVolume = totalWaterVolume - cumulativeVolume;
      finalFloodLevel =
        sorted[i - 1]!.elevation + remainingVolume / (i * cellAreaSqM);
      break;
    }

    cumulativeVolume += volumeToFill;
    finalFloodLevel = sorted[i]!.elevation;
  }

  // If all cells were iterated and water is left, distribute remaining
  // volume evenly across all cells above the highest elevation.
  if (cumulativeVolume < totalWaterVolume && sorted.length > 0) {
    const remainingVolume = totalWaterVolume - cumulativeVolume;
    finalFloodLevel =
      sorted[sorted.length - 1]!.elevation +
      remainingVolume / (sorted.length * cellAreaSqM);
  }

  // ── Classify every cell ───────────────────────────────────────────
  const floodedCells: FloodedCell[] = [];

  for (const cell of cells) {
    if (cell.elevation < finalFloodLevel) {
      const waterDepth = finalFloodLevel - cell.elevation;
      floodedCells.push({
        coordinate: cell.coordinate,
        elevation: cell.elevation,
        waterDepth,
        riskLevel: classifyFloodRisk(waterDepth),
      });
    }
  }

  const floodedPercentage =
    cells.length > 0 ? (floodedCells.length / cells.length) * 100 : 0;

  return {
    floodLevel: finalFloodLevel,
    floodedCells,
    totalCells: cells.length,
    floodedPercentage,
  };
}
