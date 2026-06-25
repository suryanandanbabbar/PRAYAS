// @suryanandanbabbar/prayas-kit

// 1. Direct Exports
export * from './flood/simulation';
export * from './flood/risk';
export * from './flood/grid';

export * from './geo/bounds';
export * from './geo/coordinates';
export * from './geo/distance';

export * from './weather/client';

export * from './audio/converter';
export * from './audio/base64';

export * from './types';
export * from './shared/errors';

// 2. Namespace Exports
import * as floodNamespace from './flood/namespace';
import * as geoNamespace from './geo/namespace';
import * as weatherNamespace from './weather/namespace';
import * as audioNamespace from './audio/namespace';

export const flood = floodNamespace;
export const geo = geoNamespace;
export const weather = weatherNamespace;
export const audio = audioNamespace;
