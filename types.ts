export interface Point {
  lat: number;
  lng: number;
}

export type AircraftVisibilityStatus = 'unseen' | 'visible' | 'lost';

export interface Aircraft {
  id: string;
  flightNumber: string;
  airline: string;
  position: Point;
  heading: number; // degrees
  speed: number; // knots
  altitude: number; // feet - calculated dynamically
  cruisingAltitude: number; // feet - target cruise altitude
  origin: string; // airport code
  destination: string; // airport code
  route: { from: Point, to: Point };
  progress: number; // 0 to 1
  visibilityStatus: AircraftVisibilityStatus;
}

export interface Radar {
  id: string;
  name: string;
  position: Point;
  range: number; // in nautical miles
  isActive: boolean;
  timeToReactivate: number; // in game seconds
  supportedIncome: number; // in € per game hour
}
