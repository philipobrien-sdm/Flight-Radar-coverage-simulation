import { Point } from '../types';

export interface Airport {
  code: string;
  name: string;
  lat: number;
  lon: number;
  position: Point;
}

const AIRPORTS_DATA: Omit<Airport, 'position'>[] = [
  { code: 'LHR', name: 'London Heathrow', lat: 51.47, lon: -0.45 },
  { code: 'CDG', name: 'Paris C. de Gaulle', lat: 49.01, lon: 2.55 },
  { code: 'FRA', name: 'Frankfurt', lat: 50.03, lon: 8.57 },
  { code: 'AMS', name: 'Amsterdam Schiphol', lat: 52.31, lon: 4.76 },
  { code: 'MAD', name: 'Madrid Barajas', lat: 40.49, lon: -3.56 },
  { code: 'FCO', name: 'Rome Fiumicino', lat: 41.80, lon: 12.23 },
  { code: 'BCN', name: 'Barcelona El Prat', lat: 41.29, lon: 2.07 },
  { code: 'MUC', name: 'Munich', lat: 48.35, lon: 11.78 },
  { code: 'IST', name: 'Istanbul', lat: 41.27, lon: 28.75 },
  { code: 'DUB', name: 'Dublin', lat: 53.42, lon: -6.24 },
  { code: 'ZRH', name: 'Zurich', lat: 47.46, lon: 8.54 },
  { code: 'CPH', name: 'Copenhagen', lat: 55.61, lon: 12.65 },
  { code: 'OSL', name: 'Oslo Gardermoen', lat: 60.19, lon: 11.10 },
  { code: 'ARN', name: 'Stockholm Arlanda', lat: 59.65, lon: 17.91 },
  { code: 'HEL', name: 'Helsinki Vantaa', lat: 60.31, lon: 24.96 },
  { code: 'WAW', name: 'Warsaw Chopin', lat: 52.16, lon: 20.96 },
  { code: 'PRG', name: 'Prague', lat: 50.10, lon: 14.26 },
  { code: 'VIE', name: 'Vienna', lat: 48.11, lon: 16.56 },
  { code: 'BUD', name: 'Budapest', lat: 47.43, lon: 19.26 },
  { code: 'ATH', name: 'Athens', lat: 37.93, lon: 23.94 },
  { code: 'LIS', name: 'Lisbon', lat: 38.77, lon: -9.13 },
  { code: 'BRU', name: 'Brussels', lat: 50.90, lon: 4.48 },
  { code: 'BER', name: 'Berlin Brandenburg', lat: 52.36, lon: 13.50 },
  { code: 'MXP', name: 'Milan Malpensa', lat: 45.63, lon: 8.72 },
];

export const airportsWithPositions = AIRPORTS_DATA.map(ap => ({
  ...ap,
  position: { lat: ap.lat, lng: ap.lon },
}));

export const airportMap = new Map(airportsWithPositions.map(ap => [ap.code, ap]));