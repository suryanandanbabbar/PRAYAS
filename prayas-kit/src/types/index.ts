// --- FLOOD TYPES ---
/**
 * A geographic coordinate expressed as latitude and longitude in decimal degrees.
 */
export interface Coordinate {
  /** Latitude in decimal degrees (−90 to 90). */
  latitude: number;
  /** Longitude in decimal degrees (−180 to 180). */
  longitude: number;
}

/**
 * An axis-aligned bounding box defined by its four edges in decimal degrees.
 */
export interface BoundingBox {
  /** Southern edge latitude. Must be less than {@link north}. */
  south: number;
  /** Northern edge latitude. Must be greater than {@link south}. */
  north: number;
  /** Western edge longitude. Must be less than {@link east}. */
  west: number;
  /** Eastern edge longitude. Must be greater than {@link west}. */
  east: number;
}

/**
 * A single grid cell with its geographic coordinate and terrain elevation.
 */
export interface ElevationCell {
  /** The geographic position of this cell. */
  coordinate: Coordinate;
  /** Terrain elevation in metres above sea level. */
  elevation: number;
}

/**
 * A grid cell that has been determined to be flooded by the simulation.
 */
export interface FloodedCell {
  /** The geographic position of this cell. */
  coordinate: Coordinate;
  /** Terrain elevation in metres above sea level. */
  elevation: number;
  /** Depth of standing water in metres above the terrain surface. */
  waterDepth: number;
  /** Qualitative risk classification based on {@link waterDepth}. */
  riskLevel: FloodRiskLevel;
}

/**
 * Qualitative flood-risk level assigned to a cell based on water depth.
 *
 * | Level      | Water depth          |
 * |------------|----------------------|
 * | Very Low   | 0 – 0.1 m           |
 * | Low        | 0.1 – 0.5 m         |
 * | Moderate   | 0.5 – 2.0 m         |
 * | High       | > 2.0 m             |
 */
export type FloodRiskLevel = 'Very Low' | 'Low' | 'Moderate' | 'High';

/**
 * Alert level derived from rainfall intensity.
 *
 * | Level   | Rainfall (mm / h) |
 * |---------|-------------------|
 * | Safe    | 0 – 5             |
 * | Watch   | 5 – 15            |
 * | Warning | > 15              |
 */
export type AlertLevel = 'Safe' | 'Watch' | 'Warning';

/**
 * Risk classification with associated UI colour hints,
 * derived from a 0 – 100 percentage risk score.
 */
export interface PercentageRiskInfo {
  /** Qualitative label. */
  level: 'Low' | 'Medium' | 'High';
  /** Foreground / accent colour (hex). */
  color: string;
  /** Background colour (hex). */
  bgColor: string;
}

/**
 * The complete result of a flood simulation run.
 */
export interface SimulationResult {
  /** The computed global flood-water surface elevation (m above sea level). */
  floodLevel: number;
  /** Every cell whose terrain elevation is below {@link floodLevel}. */
  floodedCells: FloodedCell[];
  /** Total number of cells that were evaluated. */
  totalCells: number;
  /** Percentage of cells that are flooded (0 – 100). */
  floodedPercentage: number;
}

/**
 * Options for generating a regular latitude / longitude grid.
 */
export interface GridOptions {
  /** Geographic extent of the grid. */
  bounds: BoundingBox;
  /** Number of divisions along each axis (total cells = gridSize²). */
  gridSize: number;
}


// --- GEO TYPES ---
/**
 * Represents a geographic coordinate with latitude and longitude.
 */
export interface Coordinate {
  /** Latitude in degrees, must be between -90 and 90 inclusive. */
  latitude: number;
  /** Longitude in degrees, must be between -180 and 180 inclusive. */
  longitude: number;
}

/**
 * Represents an axis-aligned bounding box defined by its four edges.
 */
export interface BoundingBox {
  /** Southern boundary latitude in degrees. */
  south: number;
  /** Northern boundary latitude in degrees. */
  north: number;
  /** Western boundary longitude in degrees. */
  west: number;
  /** Eastern boundary longitude in degrees. */
  east: number;
}

/**
 * Any object that contains latitude and longitude properties.
 * Useful for sorting arbitrary items (e.g. shelters) by distance.
 */
export interface HasCoordinate {
  /** Latitude in degrees. */
  latitude: number;
  /** Longitude in degrees. */
  longitude: number;
  /** Allow additional properties so that concrete domain objects satisfy this interface. */
  [key: string]: unknown;
}


// --- WEATHER TYPES ---
/**
 * Configuration options for the {@link WeatherClient}.
 */
export interface WeatherClientOptions {
  /**
   * Your OpenWeatherMap API key.
   * Obtain one at https://openweathermap.org/appid
   */
  apiKey: string;

  /**
   * Units of measurement.
   * - `'metric'` — Celsius, m/s (default)
   * - `'imperial'` — Fahrenheit, mph
   * - `'standard'` — Kelvin, m/s
   *
   * @defaultValue `'metric'`
   */
  units?: 'metric' | 'imperial' | 'standard';

  /**
   * Override the OpenWeatherMap base URL.
   * Useful for proxying or testing against a local server.
   *
   * @defaultValue `'https://api.openweathermap.org'`
   */
  baseUrl?: string;

  /**
   * Custom `fetch` implementation for environments without a global `fetch`
   * or for injecting a mock during testing.
   *
   * @defaultValue `globalThis.fetch`
   */
  fetchFn?: typeof fetch;
}

/**
 * Normalized weather data returned by every query method.
 */
export interface WeatherData {
  /** Human-readable location name returned by the API. */
  location: string;

  /** Current temperature in the configured unit system. */
  temperature: number;

  /** "Feels like" temperature in the configured unit system. */
  feelsLike: number;

  /** Relative humidity percentage (0–100). */
  humidity: number;

  /** Short weather condition label (e.g. `"Rain"`). */
  condition: string;

  /** Detailed weather condition description (e.g. `"light rain"`). */
  conditionDetail: string;

  /** Rainfall in the last period in millimetres. Falls back to `0` when absent. */
  rainfallMm: number;

  /** Wind speed in the configured unit system. */
  windSpeed: number;

  /** Wind direction in meteorological degrees (0–360). */
  windDeg: number;

  /** Atmospheric pressure in hPa. */
  pressure: number;

  /** Visibility in metres. */
  visibility: number;

  /** Cloud cover percentage (0–100). */
  clouds: number;

  /** Unix timestamp (seconds) of the data point. */
  timestamp: number;

  /** Geographic coordinates of the location. */
  coordinates: {
    lat: number;
    lon: number;
  };
}

/**
 * Flexible query object accepted by {@link WeatherClient.get}.
 *
 * Provide **either** `city` **or** both `lat` and `lon`.
 */
export interface WeatherQuery {
  /** City name (e.g. `"Delhi"`, `"London,GB"`). */
  city?: string;

  /** Latitude (−90 to 90). */
  lat?: number;

  /** Longitude (−180 to 180). */
  lon?: number;
}

/**
 * Shape of the raw JSON returned by the OpenWeatherMap
 * `/data/2.5/weather` endpoint.
 *
 * @internal
 */
export interface OpenWeatherMapResponse {
  cod: number;
  name: string;
  dt: number;
  visibility: number;
  coord: {
    lat: number;
    lon: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  clouds: {
    all: number;
  };
  message?: string;
}


// --- AUDIO TYPES ---
/**
 * Options for configuring WAV file generation from PCM data.
 */
export interface WavOptions {
  /**
   * Number of audio channels.
   * @default 1 (mono)
   */
  numChannels?: number;

  /**
   * Sample rate in Hz.
   * @default 24000
   */
  sampleRate?: number;

  /**
   * Bits per sample. Currently only 16-bit PCM is supported.
   * @default 16
   */
  bitsPerSample?: number;
}

/**
 * Describes the parsed fields of a WAV file header.
 */
export interface WavHeader {
  /** Total size of the RIFF chunk (file size minus 8 bytes). */
  chunkSize: number;

  /** Number of audio channels (1 = mono, 2 = stereo). */
  numChannels: number;

  /** Sample rate in Hz. */
  sampleRate: number;

  /** Byte rate: sampleRate × numChannels × (bitsPerSample / 8). */
  byteRate: number;

  /** Block align: numChannels × (bitsPerSample / 8). */
  blockAlign: number;

  /** Bits per sample (e.g. 16). */
  bitsPerSample: number;

  /** Size of the raw PCM data section in bytes. */
  dataSize: number;
}


