export class PrayasKitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Base error class for all Weather SDK errors.
 * Carries the HTTP status code from the OpenWeatherMap API response.
 */
export class WeatherApiError extends PrayasKitError {
  /**
   * HTTP status code returned by the API (e.g. `401`, `404`, `500`).
   */
  public readonly statusCode: number;

  /**
   * Creates a new {@link WeatherApiError}.
   *
   * @param message - Human-readable error description.
   * @param statusCode - HTTP status code from the API response.
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'WeatherApiError';
    this.statusCode = statusCode;
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the requested city cannot be found (HTTP 404).
 */
export class CityNotFoundError extends WeatherApiError {
  /**
   * Creates a new {@link CityNotFoundError}.
   *
   * @param city - The city name that was not found.
   */
  constructor(city: string) {
    super(`City not found: "${city}"`, 404);
    this.name = 'CityNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API key is rejected by OpenWeatherMap (HTTP 401).
 */
export class InvalidApiKeyError extends WeatherApiError {
  /**
   * Creates a new {@link InvalidApiKeyError}.
   */
  constructor() {
    super(
      'Invalid API key. Please check your OpenWeatherMap API key.',
      401,
    );
    this.name = 'InvalidApiKeyError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a network-level error occurs (no HTTP response received).
 */
export class WeatherNetworkError extends PrayasKitError {
  /**
   * The original error that caused the network failure.
   */
  public readonly cause: unknown;

  /**
   * Creates a new {@link WeatherNetworkError}.
   *
   * @param message - Human-readable error description.
   * @param cause - The underlying error.
   */
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'WeatherNetworkError';
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
