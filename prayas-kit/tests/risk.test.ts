import { describe, it, expect } from 'vitest';
import {
  classifyFloodRisk,
  classifyAlertLevel,
  classifyPercentageRisk,
} from '../src/index';

describe('classifyFloodRisk', () => {
  it('should return "Very Low" for depth ≤ 0.1', () => {
    expect(classifyFloodRisk(0)).toBe('Very Low');
    expect(classifyFloodRisk(0.05)).toBe('Very Low');
    expect(classifyFloodRisk(0.1)).toBe('Very Low');
  });

  it('should return "Low" for depth 0.1 – 0.5', () => {
    expect(classifyFloodRisk(0.2)).toBe('Low');
    expect(classifyFloodRisk(0.5)).toBe('Low');
  });

  it('should return "Moderate" for depth 0.5 – 2.0', () => {
    expect(classifyFloodRisk(0.51)).toBe('Moderate');
    expect(classifyFloodRisk(1.5)).toBe('Moderate');
    expect(classifyFloodRisk(2.0)).toBe('Moderate');
  });

  it('should return "High" for depth > 2.0', () => {
    expect(classifyFloodRisk(2.01)).toBe('High');
    expect(classifyFloodRisk(10)).toBe('High');
  });

  it('should clamp negative values to "Very Low"', () => {
    expect(classifyFloodRisk(-5)).toBe('Very Low');
  });

  it('should handle NaN gracefully as "Very Low"', () => {
    expect(classifyFloodRisk(NaN)).toBe('Very Low');
  });
});

describe('classifyAlertLevel', () => {
  it('should return "Safe" for rainfall ≤ 5', () => {
    expect(classifyAlertLevel(0)).toBe('Safe');
    expect(classifyAlertLevel(5)).toBe('Safe');
  });

  it('should return "Watch" for rainfall 5 – 15', () => {
    expect(classifyAlertLevel(5.1)).toBe('Watch');
    expect(classifyAlertLevel(10)).toBe('Watch');
    expect(classifyAlertLevel(15)).toBe('Watch');
  });

  it('should return "Warning" for rainfall > 15', () => {
    expect(classifyAlertLevel(15.1)).toBe('Warning');
    expect(classifyAlertLevel(100)).toBe('Warning');
  });

  it('should clamp negative values to "Safe"', () => {
    expect(classifyAlertLevel(-10)).toBe('Safe');
  });

  it('should handle NaN as "Safe"', () => {
    expect(classifyAlertLevel(NaN)).toBe('Safe');
  });
});

describe('classifyPercentageRisk', () => {
  it('should return Low for score < 30', () => {
    const info = classifyPercentageRisk(15);
    expect(info.level).toBe('Low');
    expect(info.color).toBe('#10B981');
    expect(info.bgColor).toBe('#ECFDF5');
  });

  it('should return Medium for score 30 – 69', () => {
    const info = classifyPercentageRisk(50);
    expect(info.level).toBe('Medium');
    expect(info.color).toBe('#F59E0B');
    expect(info.bgColor).toBe('#FFFBEB');
  });

  it('should return High for score ≥ 70', () => {
    const info = classifyPercentageRisk(85);
    expect(info.level).toBe('High');
    expect(info.color).toBe('#EF4444');
    expect(info.bgColor).toBe('#FEF2F2');
  });

  it('should clamp values below 0 to Low', () => {
    expect(classifyPercentageRisk(-20).level).toBe('Low');
  });

  it('should clamp values above 100 to High', () => {
    expect(classifyPercentageRisk(150).level).toBe('High');
  });

  it('should handle boundary value 30 as Medium', () => {
    expect(classifyPercentageRisk(30).level).toBe('Medium');
  });

  it('should handle boundary value 70 as High', () => {
    expect(classifyPercentageRisk(70).level).toBe('High');
  });

  it('should handle NaN as Low', () => {
    expect(classifyPercentageRisk(NaN).level).toBe('Low');
  });
});
