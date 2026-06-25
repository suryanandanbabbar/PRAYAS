import type { AlertLevel, FloodRiskLevel, PercentageRiskInfo } from '../types';

/**
 * Classify a cell's flood risk based on the standing water depth.
 *
 * | Depth range          | Risk level |
 * |----------------------|------------|
 * | ≤ 0 m               | Very Low   |
 * | 0 – 0.1 m           | Very Low   |
 * | 0.1 – 0.5 m         | Low        |
 * | 0.5 – 2.0 m         | Moderate   |
 * | > 2.0 m             | High       |
 *
 * @param waterDepthMeters - Depth of flood water in metres.
 *                           Negative values are clamped to 0.
 * @returns The qualitative {@link FloodRiskLevel}.
 *
 * @example
 * ```ts
 * classifyFloodRisk(0.05); // 'Very Low'
 * classifyFloodRisk(1.2);  // 'Moderate'
 * classifyFloodRisk(3.0);  // 'High'
 * ```
 */
export function classifyFloodRisk(waterDepthMeters: number): FloodRiskLevel {
  const depth = Number.isFinite(waterDepthMeters)
    ? Math.max(0, waterDepthMeters)
    : 0;

  if (depth > 2) return 'High';
  if (depth > 0.5) return 'Moderate';
  if (depth > 0.1) return 'Low';
  return 'Very Low';
}

/**
 * Derive an alert level from the current rainfall intensity.
 *
 * | Rainfall (mm / h) | Alert level |
 * |--------------------|-------------|
 * | ≤ 0                | Safe        |
 * | 0 – 5              | Safe        |
 * | 5 – 15             | Watch       |
 * | > 15               | Warning     |
 *
 * @param rainfallMmPerHour - Rainfall intensity in millimetres per hour.
 *                            Negative values are clamped to 0.
 * @returns The {@link AlertLevel}.
 *
 * @example
 * ```ts
 * classifyAlertLevel(3);   // 'Safe'
 * classifyAlertLevel(10);  // 'Watch'
 * classifyAlertLevel(20);  // 'Warning'
 * ```
 */
export function classifyAlertLevel(rainfallMmPerHour: number): AlertLevel {
  const rainfall = Number.isFinite(rainfallMmPerHour)
    ? Math.max(0, rainfallMmPerHour)
    : 0;

  if (rainfall > 15) return 'Warning';
  if (rainfall > 5) return 'Watch';
  return 'Safe';
}

/**
 * Convert a 0 – 100 percentage risk score into a labelled risk level
 * with associated UI colour hints.
 *
 * | Score range | Level  | Colour  | Background |
 * |-------------|--------|---------|------------|
 * | 0 – 29      | Low    | #10B981 | #ECFDF5    |
 * | 30 – 69     | Medium | #F59E0B | #FFFBEB    |
 * | 70 – 100    | High   | #EF4444 | #FEF2F2    |
 *
 * @param riskPercentage - A numeric risk score between 0 and 100.
 *                         Values outside this range are clamped.
 * @returns A {@link PercentageRiskInfo} object.
 *
 * @example
 * ```ts
 * const info = classifyPercentageRisk(45);
 * // { level: 'Medium', color: '#F59E0B', bgColor: '#FFFBEB' }
 * ```
 */
export function classifyPercentageRisk(
  riskPercentage: number,
): PercentageRiskInfo {
  const score = Number.isFinite(riskPercentage)
    ? Math.max(0, Math.min(100, riskPercentage))
    : 0;

  if (score < 30) {
    return { level: 'Low', color: '#10B981', bgColor: '#ECFDF5' };
  }
  if (score < 70) {
    return { level: 'Medium', color: '#F59E0B', bgColor: '#FFFBEB' };
  }
  return { level: 'High', color: '#EF4444', bgColor: '#FEF2F2' };
}
