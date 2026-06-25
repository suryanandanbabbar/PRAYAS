import type {
  WeatherClientOptions,
  WeatherData,
  WeatherQuery,
  OpenWeatherMapResponse,
} from '../types';
import {
  WeatherApiError,
  CityNotFoundError,
  InvalidApiKeyError,
  WeatherNetworkError,
} from '../shared/errors';

/** Default OpenWeatherMap API base URL. */
const DEFAULT_BASE_URL = 'https://api.openweathermap.org';

/**
 * A typed, framework-agnostic client for the OpenWeatherMap Current Weather
 * API. Supports fetching weather data by city name or geographic coordinates.
 *
 * @example
 * ```ts
 * import { WeatherClient } from '@suryanb/weather-sdk';
 *
 * const client = new WeatherClient({ apiKey: 'YOUR_KEY' });
 * const weather = await client.getByCity('Delhi');
 * console.log(weather.temperature); // e.g. 34.2
 * ```
 */
export class WeatherClient {
  private readonly apiKey: string;
  private readonly units: 'metric' | 'imperial' | 'standard';
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  /**
   * Creates a new {@link WeatherClient}.
   *
   * @param options - Configuration for the client.
   * @throws {Error} If `apiKey` is missing or empty.
   */
  constructor(options: WeatherClientOptions) {
    if (!options || typeof options !== 'object') {
      throw new Error('WeatherClient requires an options object.');
    }

    if (!options.apiKey || typeof options.apiKey !== 'string' || options.apiKey.trim() === '') {
      throw new Error('A non-empty apiKey is required.');
    }

    this.apiKey = options.apiKey.trim();
    this.units = options.units ?? 'metric';
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.fetchFn = options.fetchFn ?? globalThis.fetch;

    if (typeof this.fetchFn !== 'function') {
      throw new Error(
        'No fetch implementation available. Provide a fetchFn option or use a runtime that supports fetch.',
      );
    }
  }

  /**
   * Fetches current weather data for a city name.
   *
   * @param city - The city name to look up (e.g. `"Delhi"`, `"London,GB"`).
   * @returns Normalized {@link WeatherData} for the city.
   * @throws {Error} If `city` is empty.
   * @throws {CityNotFoundError} If the city does not exist.
   * @throws {InvalidApiKeyError} If the API key is invalid.
   * @throws {WeatherApiError} For other non-200 API responses.
   * @throws {WeatherNetworkError} If a network-level error occurs.
   */
  async getByCity(city: string): Promise<WeatherData> {
    if (!city || typeof city !== 'string' || city.trim() === '') {
      throw new Error('City name must be a non-empty string.');
    }

    const url = this.buildUrl({ q: city.trim() });
    return this.request(url, city.trim());
  }

  /**
   * Fetches current weather data for geographic coordinates.
   *
   * @param lat - Latitude (−90 to 90).
   * @param lon - Longitude (−180 to 180).
   * @returns Normalized {@link WeatherData} for the location.
   * @throws {Error} If coordinates are out of range.
   * @throws {InvalidApiKeyError} If the API key is invalid.
   * @throws {WeatherApiError} For other non-200 API responses.
   * @throws {WeatherNetworkError} If a network-level error occurs.
   */
  async getByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    if (typeof lat !== 'number' || !Number.isFinite(lat)) {
      throw new Error('Latitude must be a finite number.');
    }
    if (typeof lon !== 'number' || !Number.isFinite(lon)) {
      throw new Error('Longitude must be a finite number.');
    }
    if (lat < -90 || lat > 90) {
      throw new Error(`Latitude must be between -90 and 90. Received: ${lat}`);
    }
    if (lon < -180 || lon > 180) {
      throw new Error(`Longitude must be between -180 and 180. Received: ${lon}`);
    }

    const url = this.buildUrl({ lat: String(lat), lon: String(lon) });
    return this.request(url);
  }

  /**
   * Flexible query method — provide either `city` or both `lat`/`lon`.
   *
   * @param query - A {@link WeatherQuery} object.
   * @returns Normalized {@link WeatherData}.
   * @throws {Error} If the query is ambiguous or incomplete.
   */
  async get(query: WeatherQuery): Promise<WeatherData> {
    if (!query || typeof query !== 'object') {
      throw new Error('Query must be a non-null object.');
    }

    if (query.city) {
      return this.getByCity(query.city);
    }

    if (query.lat !== undefined && query.lon !== undefined) {
      return this.getByCoordinates(query.lat, query.lon);
    }

    throw new Error(
      'Query must contain either "city" or both "lat" and "lon".',
    );
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Builds a full API URL with the given query parameters.
   *
   * @param params - Key-value pairs to append to the query string.
   * @returns The fully-qualified URL string.
   */
  private buildUrl(params: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}/data/2.5/weather`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    url.searchParams.set('appid', this.apiKey);
    url.searchParams.set('units', this.units);
    return url.toString();
  }

  /**
   * Performs the HTTP request and maps the response to {@link WeatherData}.
   *
   * @param url - The full request URL.
   * @param cityHint - Optional city name used for error messages.
   * @returns Normalized weather data.
   */
  private async request(url: string, cityHint?: string): Promise<WeatherData> {
    let response: Response;

    try {
      response = await this.fetchFn(url);
    } catch (error: unknown) {
      throw new WeatherNetworkError(
        'Network request failed. Check your internet connection.',
        error,
      );
    }

    let data: OpenWeatherMapResponse;

    try {
      data = (await response.json()) as OpenWeatherMapResponse;
    } catch {
      throw new WeatherApiError(
        `Unexpected response format (HTTP ${response.status}).`,
        response.status,
      );
    }

    // Handle error codes
    if (data.cod !== 200) {
      if (data.cod === 401) {
        throw new InvalidApiKeyError();
      }
      if (data.cod === 404) {
        throw new CityNotFoundError(cityHint ?? 'unknown');
      }
      throw new WeatherApiError(
        data.message ?? `API error (HTTP ${data.cod}).`,
        data.cod,
      );
    }

    return this.normalize(data);
  }

  /**
   * Normalizes the raw OpenWeatherMap response into a {@link WeatherData}
   * object, applying rainfall fallback logic.
   *
   * @param data - Raw API response.
   * @returns A normalized {@link WeatherData} object.
   */
  private normalize(data: OpenWeatherMapResponse): WeatherData {
    const weather = data.weather[0];

    // Rainfall normalization: prefer 1h, fall back to 3h, then 0
    let rainfallMm = 0;
    if (data.rain) {
      rainfallMm = data.rain['1h'] ?? data.rain['3h'] ?? 0;
    }

    return {
      location: data.name,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      condition: weather?.main ?? 'Unknown',
      conditionDetail: weather?.description ?? 'Unknown',
      rainfallMm,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      pressure: data.main.pressure,
      visibility: data.visibility,
      clouds: data.clouds.all,
      timestamp: data.dt,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
    };
  }
}

/**
 * Factory function to create a {@link WeatherClient} instance.
 *
 * @param options - Configuration for the client.
 * @returns A new {@link WeatherClient}.
 *
 * @example
 * ```ts
 * import { createWeatherClient } from '@suryanb/weather-sdk';
 *
 * const client = createWeatherClient({ apiKey: 'YOUR_KEY' });
 * const weather = await client.getByCity('Mumbai');
 * ```
 */
export function createWeatherClient(options: WeatherClientOptions): WeatherClient {
  return new WeatherClient(options);
}
