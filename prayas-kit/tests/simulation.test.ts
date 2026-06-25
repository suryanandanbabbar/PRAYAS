import { describe, it, expect } from 'vitest';
import { simulateFlood } from '../src/index';
import type { ElevationCell } from '../src/index';

/**
 * Helper to build elevation cells quickly.
 */
function makeCells(elevations: number[]): ElevationCell[] {
  return elevations.map((elevation, i) => ({
    coordinate: { latitude: 28.5 + i * 0.01, longitude: 77.1 },
    elevation,
  }));
}

describe('simulateFlood', () => {
  it('should return zero flooded cells when rainfall is 0', () => {
    const cells = makeCells([100, 110, 120]);
    const result = simulateFlood(cells, 0, 10_000);
    expect(result.floodedCells).toHaveLength(0);
    expect(result.floodedPercentage).toBe(0);
    expect(result.floodLevel).toBe(-Infinity);
  });

  it('should flood lower cells when rainfall is significant', () => {
    // Three cells at different heights
    const cells = makeCells([100, 200, 300]);
    const result = simulateFlood(cells, 500, 10_000);
    expect(result.floodedCells.length).toBeGreaterThan(0);
    expect(result.floodLevel).toBeGreaterThan(100);
  });

  it('should flood all cells with extreme rainfall', () => {
    const cells = makeCells([10, 11, 12]);
    // Enormous rainfall
    const result = simulateFlood(cells, 100_000, 10_000);
    expect(result.floodedCells).toHaveLength(3);
    expect(result.floodedPercentage).toBe(100);
  });

  it('should classify flooded cells with appropriate risk levels', () => {
    const cells = makeCells([10, 10.05, 10.3, 11, 15]);
    const result = simulateFlood(cells, 5000, 10_000);
    // At least one cell should have a risk level
    for (const fc of result.floodedCells) {
      expect(['Very Low', 'Low', 'Moderate', 'High']).toContain(fc.riskLevel);
    }
  });

  it('should include waterDepth and coordinate on flooded cells', () => {
    const cells = makeCells([10, 20]);
    const result = simulateFlood(cells, 1000, 10_000);
    for (const fc of result.floodedCells) {
      expect(fc.waterDepth).toBeGreaterThan(0);
      expect(fc.coordinate).toBeDefined();
      expect(fc.elevation).toBeDefined();
    }
  });

  it('should throw when cells array is empty', () => {
    expect(() => simulateFlood([], 10, 10_000)).toThrow(RangeError);
  });

  it('should throw when rainfallMm is negative', () => {
    expect(() => simulateFlood(makeCells([10]), -5, 10_000)).toThrow(
      RangeError,
    );
  });

  it('should throw when cellAreaSqM is zero', () => {
    expect(() => simulateFlood(makeCells([10]), 10, 0)).toThrow(RangeError);
  });

  it('should throw when cellAreaSqM is negative', () => {
    expect(() => simulateFlood(makeCells([10]), 10, -100)).toThrow(RangeError);
  });

  it('should not mutate the original cells array', () => {
    const cells = makeCells([30, 10, 20]);
    const copy = cells.map((c) => ({ ...c }));
    simulateFlood(cells, 100, 10_000);
    expect(cells.map((c) => c.elevation)).toEqual(
      copy.map((c) => c.elevation),
    );
  });

  it('should handle a single cell', () => {
    const cells = makeCells([50]);
    const result = simulateFlood(cells, 100, 10_000);
    // With one cell, water sits on top of it
    expect(result.floodedCells).toHaveLength(1);
    expect(result.floodLevel).toBeGreaterThan(50);
  });

  it('should handle all cells at the same elevation', () => {
    const cells = makeCells([100, 100, 100, 100]);
    const result = simulateFlood(cells, 50, 10_000);
    // All cells at same elevation → all flooded equally
    expect(result.floodedCells).toHaveLength(4);
    const depths = result.floodedCells.map((c) => c.waterDepth);
    // All depths should be equal
    expect(new Set(depths.map((d) => d.toFixed(6))).size).toBe(1);
  });
});
