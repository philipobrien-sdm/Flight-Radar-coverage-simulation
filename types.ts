// FIX: Define all necessary types for the application.
export interface Point {
  lat: number;
  lng: number;
}

export interface Airport {
  code: string;
  name: string;
  position: Point;
  isCovered: boolean;
  lat: number;
  lon: number;
}

export interface Radar {
  id: string;
  name:string;
  position: Point;
  range: number; // nautical miles
  isActive: boolean;
  reactivationTime?: number;
}

export interface Aircraft {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  position: Point;
  altitude: number; // feet
  speed: number; // knots
  heading: number; // degrees
  visibilityStatus: 'tracked' | 'lost';
  progress: number; // 0 to 1
  totalDistance: number;
  startTime: number; // in hours from simulation start
}

export interface FlightPlan {
  from: string; // airport code
  to: string; // airport code
  frequency: string;
}

export interface SimulationResult {
  totalFlights: number;
  totalDays: number;
  
  // High level metrics
  cancelledFlights: number;
  totalFlightsWithLostTracking: number;
  lostFlightMinutes: number;

  // Detailed breakdowns for the report
  cancellationSources: { airportCode: string; cancellations: number }[];
  maintenanceImpact: { radarName: string; outages: number; downtimeHours: number }[];
  problematicRoutes: { route: string; lostMinutes: number }[];
  redundancyAnalysis: { radarName: string; soleCoverageMinutes: number }[];

  // Financial Metrics
  totalRevenue: number;
  totalOperationalCost: number;
  totalCancellationCost: number;
  totalLostTrackingCost: number;
  netProfitLoss: number;

  // "What-if" analysis for inactive radars
  inactiveRadarAnalysis: { radarName: string; potentialPnlChange: number }[];
}