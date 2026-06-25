# @suryanandanbabbar/prayas-kit

[![npm version](https://img.shields.io/npm/v/@suryanandanbabbar/prayas-kit.svg?style=flat-square)](https://www.npmjs.com/package/@suryanandanbabbar/prayas-kit)
[![npm downloads](https://img.shields.io/npm/dm/@suryanandanbabbar/prayas-kit.svg?style=flat-square)](https://www.npmjs.com/package/@suryanandanbabbar/prayas-kit)
[![GitHub stars](https://img.shields.io/github/stars/suryanandanbabbar/PRAYAS.svg?style=flat-square)](https://github.com/suryanandanbabbar/PRAYAS/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://github.com/suryanandanbabbar/PRAYAS/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg?style=flat-square)](https://www.typescriptlang.org/)

**A TypeScript toolkit for flood simulation, geospatial utilities, weather integration, and audio processing.**

`prayas-kit` is the extracted, reusable core of the [PRAYAS Disaster Management Platform](https://github.com/suryanandanbabbar/PRAYAS). It provides a high-performance, strictly typed collection of algorithms and SDKs optimized for Node.js and modern browsers.

---

## Motivation

When building disaster management systems, core algorithms like flood volume simulation and haversine calculations are often tightly coupled to application logic. `prayas-kit` decouples these pure domain functions, offering them as a modular, framework-agnostic SDK for geographic, meteorological, and geospatial computing.

## Features

- **🌊 Flood Simulation**: Terrain-based bucket-fill water volume simulations.
- **🗺 Geospatial Utilities**: Distance sorting, haversine metrics, and bounding box computation.
- **⛅ OpenWeatherMap SDK**: Fully typed and validated client with automatic data normalization.
- **🎧 Audio Processing**: Low-level 16-bit PCM arrays to robust WAV binary formatting.
- **📦 Tree-shakeable**: Zero-dependency architecture with dual CommonJS and ESM support.

## Installation

```bash
npm install @suryanandanbabbar/prayas-kit
```
```bash
yarn add @suryanandanbabbar/prayas-kit
```
```bash
pnpm add @suryanandanbabbar/prayas-kit
```

## Quick Start

You can use standard imports for tree-shaking, or namespace imports depending on your preference.

```typescript
import { flood, geo, weather, audio } from '@suryanandanbabbar/prayas-kit';

// Alternatively:
// import { simulateFlood, haversineDistance } from '@suryanandanbabbar/prayas-kit';
```

### Flood Simulation

Calculate flood risk levels across a given terrain elevation dataset.

```typescript
const cells = [
  { coordinate: { latitude: 28.6, longitude: 77.2 }, elevation: 200 },
  { coordinate: { latitude: 28.61, longitude: 77.21 }, elevation: 195 }
];

const rainfallMm = 50;
const cellAreaSqM = 400;

const result = flood.simulateFlood(cells, rainfallMm, cellAreaSqM);
console.log(`Final water depth level: ${result.floodLevel}`);
console.log(result.floodedCells);
```

### Geospatial Utilities

Sort locations by precise distance and calculate bounding boxes.

```typescript
const distance = geo.haversineDistance(
  { latitude: 28.6, longitude: 77.2 },
  { latitude: 28.7, longitude: 77.3 }
);

const bounds = geo.boundsFromCenter({ latitude: 28.6, longitude: 77.2 }, 5000 /* meters */);
```

### Weather Integration

A resilient wrapper around OpenWeatherMap supporting city or coordinate-based lookups.

```typescript
const client = new weather.WeatherClient({ apiKey: 'YOUR_API_KEY' });

const data = await client.getByCity('Delhi');
console.log(`Condition: ${data.condition}, Rainfall: ${data.rainfallMm}mm`);
```

### Audio Processing

Convert raw PCM 16-bit streams into properly formatted WAV binary blobs.

```typescript
const pcmData = new Int16Array([500, -500, 0, 1000]);
const wavBuffer = audio.pcmToWavBuffer(pcmData, { sampleRate: 16000 });
```

## Module Overview

- **`flood`**: `simulateFlood`, `classifyFloodRisk`, `generateGrid`, `computeCellArea`
- **`geo`**: `haversineDistance`, `sortByDistance`, `boundsFromCenter`, `boundsArea`
- **`weather`**: `WeatherClient`, `WeatherApiError`, `CityNotFoundError`
- **`audio`**: `pcmToWavBuffer`, `pcmToWavBlob`, `base64ToPcm16`

## Platform Support

- **Browser**: Full support (includes `Blob` support for audio generation).
- **Node.js**: Full support (v16+ recommended).
- **TypeScript**: Strict types out of the box (built against `strict: true`).

## Contributing

We welcome community contributions. See our [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed setup and development instructions. Before submitting code, please review our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE) © Suryanandan Babbar
