import { flood, geo, weather, audio } from '../src/index.js';

async function run() {
  console.log('--- Flood Simulation ---');
  const cells = [{ coordinate: { latitude: 28, longitude: 77 }, elevation: 200 }];
  console.log(flood.simulateFlood(cells, 50, 400));

  console.log('--- Distance Calculation ---');
  console.log(geo.haversineDistance(
    { latitude: 28.6, longitude: 77.2 },
    { latitude: 28.7, longitude: 77.3 }
  ));
}

run();
