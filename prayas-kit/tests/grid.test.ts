import { describe, it, expect } from 'vitest';
import { generateGrid, computeCellArea } from '../src/index';

describe('generateGrid', () => {
  const bounds = { south: 28.5, north: 28.7, west: 77.1, east: 77.3 };

  it('should produce gridSize² coordinates', () => {
    const coords = generateGrid({ bounds, gridSize: 10 });
    expect(coords).toHaveLength(100);
  });

  it('should start at the south-west corner', () => {
    const coords = generateGrid({ bounds, gridSize: 5 });
    expect(coords[0].latitude).toBeCloseTo(28.5);
    expect(coords[0].longitude).toBeCloseTo(77.1);
  });

  it('should never exceed the bounding box', () => {
    const coords = generateGrid({ bounds, gridSize: 70 });
    for (const c of coords) {
      expect(c.latitude).toBeGreaterThanOrEqual(bounds.south);
      expect(c.latitude).toBeLessThanOrEqual(bounds.north);
      expect(c.longitude).toBeGreaterThanOrEqual(bounds.west);
      expect(c.longitude).toBeLessThanOrEqual(bounds.east);
    }
  });

  it('should produce a single point when gridSize is 1', () => {
    const coords = generateGrid({ bounds, gridSize: 1 });
    expect(coords).toHaveLength(1);
    expect(coords[0]).toEqual({
      latitude: bounds.south,
      longitude: bounds.west,
    });
  });

  it('should throw for gridSize < 1', () => {
    expect(() => generateGrid({ bounds, gridSize: 0 })).toThrow(RangeError);
    expect(() => generateGrid({ bounds, gridSize: -5 })).toThrow(RangeError);
  });

  it('should throw when south >= north', () => {
    expect(() =>
      generateGrid({
        bounds: { south: 29, north: 28, west: 77, east: 78 },
        gridSize: 10,
      }),
    ).toThrow(RangeError);
  });

  it('should throw when west >= east', () => {
    expect(() =>
      generateGrid({
        bounds: { south: 28, north: 29, west: 78, east: 77 },
        gridSize: 10,
      }),
    ).toThrow(RangeError);
  });

  it('should floor non-integer gridSize values', () => {
    const coords = generateGrid({ bounds, gridSize: 3.9 });
    // floor(3.9) = 3 → 9 cells
    expect(coords).toHaveLength(9);
  });
});

describe('computeCellArea', () => {
  const bounds = { south: 28.5, north: 28.7, west: 77.1, east: 77.3 };

  it('should return a positive number', () => {
    const area = computeCellArea(bounds, 70, 28.6);
    expect(area).toBeGreaterThan(0);
  });

  it('should produce smaller cells at higher latitudes (cos effect)', () => {
    const areaEquator = computeCellArea(bounds, 70, 0);
    const areaPole = computeCellArea(bounds, 70, 80);
    expect(areaEquator).toBeGreaterThan(areaPole);
  });

  it('should throw for invalid referenceLatitude', () => {
    expect(() => computeCellArea(bounds, 70, 91)).toThrow(RangeError);
    expect(() => computeCellArea(bounds, 70, -91)).toThrow(RangeError);
  });

  it('should throw for gridSize < 1', () => {
    expect(() => computeCellArea(bounds, 0, 28)).toThrow(RangeError);
  });
});
