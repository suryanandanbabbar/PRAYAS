import { describe, it, expect, vi } from 'vitest';
import {
  WeatherClient,
  createWeatherClient,
  CityNotFoundError,
  InvalidApiKeyError,
  WeatherApiError,
  WeatherNetworkError,
} from '../src/index';
import type { OpenWeatherMapResponse } from '../src/index';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A complete, valid API response for Delhi. */
function makeDelhiResponse(overrides?: Partial<OpenWeatherMapResponse>): OpenWeatherMapResponse {
  return {
    cod: 200,
    name: 'Delhi',
    dt: 1700000000,
    visibility: 10000,
    coord: { lat: 28.6667, lon: 77.2167 },
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    main: {
      temp: 34.2,
      feels_like: 36.1,
      humidity: 42,
      pressure: 1010,
      temp_min: 32.0,
      temp_max: 36.0,
    },
    wind: { speed: 5.4, deg: 270 },
    clouds: { all: 10 },
    ...overrides,
  };
}

/** Helper to create a mock fetch that resolves with the given JSON body. */
function mockFetch(body: unknown, status = 200): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

/** Shorthand for creating a client with a mock fetch. */
function createClient(fetchFn: typeof fetch) {
  return new WeatherClient({ apiKey: 'test-api-key', fetchFn });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WeatherClient', () => {
  // ---- Constructor validation ----

  it('should throw when constructed without an apiKey', () => {
    expect(() => new WeatherClient({ apiKey: '' })).toThrow(
      'A non-empty apiKey is required.',
    );
  });

  it('should throw when constructed with a whitespace-only apiKey', () => {
    expect(() => new WeatherClient({ apiKey: '   ' })).toThrow(
      'A non-empty apiKey is required.',
    );
  });

  // ---- getByCity – happy path ----

  it('should fetch weather by city name', async () => {
    const response = makeDelhiResponse();
    const client = createClient(mockFetch(response));

    const result = await client.getByCity('Delhi');

    expect(result.location).toBe('Delhi');
    expect(result.temperature).toBe(34.2);
    expect(result.feelsLike).toBe(36.1);
    expect(result.humidity).toBe(42);
    expect(result.condition).toBe('Clear');
    expect(result.conditionDetail).toBe('clear sky');
    expect(result.windSpeed).toBe(5.4);
    expect(result.windDeg).toBe(270);
    expect(result.pressure).toBe(1010);
    expect(result.visibility).toBe(10000);
    expect(result.clouds).toBe(10);
    expect(result.coordinates).toEqual({ lat: 28.6667, lon: 77.2167 });
    expect(result.rainfallMm).toBe(0);
  });

  // ---- getByCoordinates – happy path ----

  it('should fetch weather by coordinates', async () => {
    const response = makeDelhiResponse();
    const fetchFn = mockFetch(response);
    const client = createClient(fetchFn);

    const result = await client.getByCoordinates(28.6667, 77.2167);

    expect(result.location).toBe('Delhi');
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // Verify URL contains lat/lon params
    const calledUrl = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('lat=28.6667');
    expect(calledUrl).toContain('lon=77.2167');
  });

  // ---- get() – flexible query ----

  it('should route city queries through getByCity', async () => {
    const client = createClient(mockFetch(makeDelhiResponse()));
    const result = await client.get({ city: 'Delhi' });
    expect(result.location).toBe('Delhi');
  });

  it('should route lat/lon queries through getByCoordinates', async () => {
    const client = createClient(mockFetch(makeDelhiResponse()));
    const result = await client.get({ lat: 28.6667, lon: 77.2167 });
    expect(result.location).toBe('Delhi');
  });

  it('should throw when query has neither city nor coordinates', async () => {
    const client = createClient(mockFetch(makeDelhiResponse()));
    await expect(client.get({})).rejects.toThrow(
      'Query must contain either "city" or both "lat" and "lon".',
    );
  });

  // ---- City not found (404) ----

  it('should throw CityNotFoundError for unknown city', async () => {
    const errorResponse = {
      cod: 404,
      message: 'city not found',
    };
    const client = createClient(mockFetch(errorResponse, 404));

    await expect(client.getByCity('Xyzzyville')).rejects.toThrow(CityNotFoundError);
    await expect(client.getByCity('Xyzzyville')).rejects.toThrow('City not found: "Xyzzyville"');
  });

  // ---- Invalid API key (401) ----

  it('should throw InvalidApiKeyError for invalid key', async () => {
    const errorResponse = {
      cod: 401,
      message: 'Invalid API key.',
    };
    const client = createClient(mockFetch(errorResponse, 401));

    await expect(client.getByCity('Delhi')).rejects.toThrow(InvalidApiKeyError);
  });

  // ---- Generic API error ----

  it('should throw WeatherApiError for other error codes', async () => {
    const errorResponse = {
      cod: 500,
      message: 'Internal server error',
    };
    const client = createClient(mockFetch(errorResponse, 500));

    await expect(client.getByCity('Delhi')).rejects.toThrow(WeatherApiError);
    try {
      await client.getByCity('Delhi');
    } catch (err) {
      expect(err).toBeInstanceOf(WeatherApiError);
      expect((err as WeatherApiError).statusCode).toBe(500);
    }
  });

  // ---- Network error ----

  it('should throw WeatherNetworkError on fetch failure', async () => {
    const failingFetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const client = createClient(failingFetch as unknown as typeof fetch);

    await expect(client.getByCity('Delhi')).rejects.toThrow(WeatherNetworkError);
    await expect(client.getByCity('Delhi')).rejects.toThrow(
      'Network request failed.',
    );
  });

  // ---- Input validation ----

  it('should throw for empty city name', async () => {
    const client = createClient(mockFetch(makeDelhiResponse()));
    await expect(client.getByCity('')).rejects.toThrow(
      'City name must be a non-empty string.',
    );
  });

  it('should throw for latitude out of range', async () => {
    const client = createClient(mockFetch(makeDelhiResponse()));
    await expect(client.getByCoordinates(91, 0)).rejects.toThrow(
      'Latitude must be between -90 and 90.',
    );
  });

  it('should throw for longitude out of range', async () => {
    const client = createClient(mockFetch(makeDelhiResponse()));
    await expect(client.getByCoordinates(0, 181)).rejects.toThrow(
      'Longitude must be between -180 and 180.',
    );
  });

  it('should throw for NaN coordinates', async () => {
    const client = createClient(mockFetch(makeDelhiResponse()));
    await expect(client.getByCoordinates(NaN, 0)).rejects.toThrow(
      'Latitude must be a finite number.',
    );
    await expect(client.getByCoordinates(0, Infinity)).rejects.toThrow(
      'Longitude must be a finite number.',
    );
  });

  // ---- Rainfall normalization ----

  it('should extract rainfall from rain["1h"]', async () => {
    const response = makeDelhiResponse({ rain: { '1h': 2.5 } });
    const client = createClient(mockFetch(response));
    const result = await client.getByCity('Delhi');
    expect(result.rainfallMm).toBe(2.5);
  });

  it('should fall back to rain["3h"] when rain["1h"] is absent', async () => {
    const response = makeDelhiResponse({ rain: { '3h': 7.8 } });
    const client = createClient(mockFetch(response));
    const result = await client.getByCity('Delhi');
    expect(result.rainfallMm).toBe(7.8);
  });

  it('should prefer rain["1h"] over rain["3h"] when both exist', async () => {
    const response = makeDelhiResponse({ rain: { '1h': 1.0, '3h': 4.0 } });
    const client = createClient(mockFetch(response));
    const result = await client.getByCity('Delhi');
    expect(result.rainfallMm).toBe(1.0);
  });

  it('should default rainfallMm to 0 when rain object is absent', async () => {
    const response = makeDelhiResponse(); // no rain key
    const client = createClient(mockFetch(response));
    const result = await client.getByCity('Delhi');
    expect(result.rainfallMm).toBe(0);
  });

  // ---- Edge cases ----

  it('should accept boundary coordinates (-90, -180) and (90, 180)', async () => {
    const client = createClient(mockFetch(makeDelhiResponse()));
    await expect(client.getByCoordinates(-90, -180)).resolves.toBeDefined();
    await expect(client.getByCoordinates(90, 180)).resolves.toBeDefined();
  });

  it('should pass configured units in the URL', async () => {
    const fetchFn = mockFetch(makeDelhiResponse());
    const client = new WeatherClient({
      apiKey: 'test-key',
      units: 'imperial',
      fetchFn,
    });

    await client.getByCity('Delhi');
    const calledUrl = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('units=imperial');
  });

  it('should trim the city name before sending', async () => {
    const fetchFn = mockFetch(makeDelhiResponse());
    const client = createClient(fetchFn);
    await client.getByCity('  Delhi  ');
    const calledUrl = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('q=Delhi');
    expect(calledUrl).not.toContain('q=+');
  });
});

// ---------------------------------------------------------------------------
// Factory function
// ---------------------------------------------------------------------------

describe('createWeatherClient', () => {
  it('should return a WeatherClient instance', () => {
    const client = createWeatherClient({
      apiKey: 'abc',
      fetchFn: vi.fn() as unknown as typeof fetch,
    });
    expect(client).toBeInstanceOf(WeatherClient);
  });
});
