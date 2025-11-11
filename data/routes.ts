import { FlightPlan } from '../types';
import { airportsWithPositions } from './airports';

// Procedurally generate a dense network of routes for a more realistic simulation.
// This is not based on real-world data but creates a plausible set of connections.
const majorHubs = new Set(['LHR', 'CDG', 'FRA', 'AMS', 'IST', 'MAD', 'BCN', 'MUC', 'LGW', 'FCO']);
const secondaryHubs = new Set(['DUB', 'ZRH', 'CPH', 'OSL', 'ARN', 'VIE', 'ATH', 'LIS', 'BRU', 'MAN', 'MXP', 'WAW', 'PRG', 'DUS']);

const generatedPlans: FlightPlan[] = [];
const addedPairs = new Set<string>();

const addPlan = (from: string, to: string) => {
    const key1 = `${from}-${to}`;
    const key2 = `${to}-${from}`;
    if (addedPairs.has(key1) || addedPairs.has(key2) || from === to) return;

    generatedPlans.push({ from, to, frequency: '121.5' });
    addedPairs.add(key1);
    addedPairs.add(key2);
};

const allAirportCodes = new Set(airportsWithPositions.map(ap => ap.code));

// 1. Connect all major hubs to each other
majorHubs.forEach(hub1 => {
    if (!allAirportCodes.has(hub1)) return;
    majorHubs.forEach(hub2 => {
        if (allAirportCodes.has(hub2)) addPlan(hub1, hub2);
    });
});

// 2. Connect all major hubs to all secondary hubs
majorHubs.forEach(major => {
    if (!allAirportCodes.has(major)) return;
    secondaryHubs.forEach(secondary => {
        if (allAirportCodes.has(secondary)) addPlan(major, secondary);
    });
});

// 3. Connect a good portion of secondary hubs to each other
secondaryHubs.forEach(hub1 => {
    if (!allAirportCodes.has(hub1)) return;
    secondaryHubs.forEach(hub2 => {
        if (allAirportCodes.has(hub2) && Math.random() > 0.6) {
          addPlan(hub1, hub2);
        }
    });
});

// 4. Connect major and secondary hubs to a random selection of other airports
airportsWithPositions.forEach(airport => {
    const code = airport.code;
    if (!majorHubs.has(code) && !secondaryHubs.has(code)) {
        // Connect to 1-2 major hubs
        majorHubs.forEach(hub => {
            if (allAirportCodes.has(hub) && Math.random() < 0.2) {
                addPlan(hub, code);
            }
        });
        // Connect to 1-2 secondary hubs
        secondaryHubs.forEach(hub => {
            if (allAirportCodes.has(hub) && Math.random() < 0.15) {
                addPlan(hub, code);
            }
        });
    }
});

const FLIGHT_PLANS: FlightPlan[] = generatedPlans;
const reverseRoutes = FLIGHT_PLANS.map(r => ({ from: r.to, to: r.from, frequency: r.frequency }));
export const ALL_FLIGHT_PLANS = [...FLIGHT_PLANS, ...reverseRoutes];
