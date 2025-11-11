import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Components
import MapComponent from './components/Map';
import InfoPanel from './components/InfoPanel';
import ControlsPanel from './components/ControlsPanel';
import RadarListPanel from './components/RadarListPanel';
import WelcomeModal from './components/WelcomeModal';
import SimulationResultModal from './components/SimulationResultModal';
import RedundantRadarsModal from './components/RedundantRadarsModal';
import CostConfigModal from './components/CostConfigModal';
import AboutModal from './components/AboutModal';
import RadarScopeModal from './components/RadarScopeModal'; // New component

// Types
import { Aircraft, Airport, Radar, Point, FlightPlan, SimulationResult } from './types';

// Data
import { airportsWithPositions } from './data/airports';
import { ALL_FLIGHT_PLANS } from './data/routes';
import { PREDEFINED_RADARS } from './data/radars';
import { AIRLINE_CODES } from './data/airlines';

// Utils
import { calculateDistanceNM, lerpPoint, calculateBearing } from './utils';

// Constants for the simulation
const AIRCRAFT_SPEED_KNOTS = 450;
const CRUISE_ALTITUDE_FEET = 35000;
const RADAR_DEFAULT_RANGE_NM = 250;
const RADAR_REPAIR_TIME_HOURS = 4; // Restored after 4 hours of sim time
const FLIGHTS_PER_DAY = 2000;

const MAP_CENTER: Point = { lat: 49.5, lng: 15.0 };
const MAP_ZOOM = 5;

// A simple unique ID generator
let nextId = 0;
const uniqueId = (prefix: string = 'id') => `${prefix}-${nextId++}`;

// Live metrics structure
interface LiveMetrics {
    totalSpawnedFlights: number;
    cancelledFlights: number;
    lostFlightMinutes: number;
    airportDowntime: Map<string, number>;
    totalFlightsWithLostTracking: number;
    flightsWithLostTracking: Set<string>;
    cancellationSources: Map<string, number>;
    problematicRoutes: Map<string, number>;
}

const initialLiveMetrics: LiveMetrics = {
    totalSpawnedFlights: 0,
    cancelledFlights: 0,
    lostFlightMinutes: 0,
    airportDowntime: new Map<string, number>(), // airport.code -> minutes
    totalFlightsWithLostTracking: 0,
    flightsWithLostTracking: new Set<string>(), // aircraft.id
    cancellationSources: new Map<string, number>(),
    problematicRoutes: new Map<string, number>(),
};


interface SimulationState {
    airports: Airport[];
    radars: Radar[];
    aircrafts: Aircraft[];
    totalSimulatedTimeHours: number;
}

export interface FinancialConfig {
    radarCostPerYear: number;
    flightRevenue: number;
    cancellationCost: number;
    lostTrackingCostPerMinute: number;
}


const App: React.FC = () => {
    const apiKey = 'AIzaSyD53W5DwzbqvGLhjU9f1pavEKeKuyDSQ9E';

    // State
    const [radars, setRadars] = useState<Radar[]>([]);
    const [airports, setAirports] = useState<Airport[]>([]);
    const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
    const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
    const [selectedRadarId, setSelectedRadarId] = useState<string | null>(null);
    const [viewingRadarId, setViewingRadarId] = useState<string | null>(null); // New state for scope modal

    const [isPaused, setIsPaused] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isFindingRedundancy, setIsFindingRedundancy] = useState(false);
    const [simulationSpeed, setSimulationSpeed] = useState(120);
    const [totalSimulatedTimeHours, setTotalSimulatedTimeHours] = useState(0);
    const [simulationProgress, setSimulationProgress] = useState(0);

    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(true);
    const [redundantRadarIds, setRedundantRadarIds] = useState<string[]>([]);
    const [isCostModalOpen, setIsCostModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isInfoPanelExpanded, setIsInfoPanelExpanded] = useState(true);
    const [financialConfig, setFinancialConfig] = useState<FinancialConfig>({
        radarCostPerYear: 500000,
        flightRevenue: 200,
        cancellationCost: 10000,
        lostTrackingCostPerMinute: 1,
    });


    const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>(initialLiveMetrics);
    const [liveFinancials, setLiveFinancials] = useState({ revenue: 0, costs: 0 });

    // Refs
    const animationFrameId = useRef<number | null>(null);
    const lastTimestamp = useRef<number>(performance.now());
    const simulationStateRef = useRef<SimulationState>({ airports, radars, aircrafts, totalSimulatedTimeHours });
    useEffect(() => {
        simulationStateRef.current = { airports, radars, aircrafts, totalSimulatedTimeHours };
    }, [airports, radars, aircrafts, totalSimulatedTimeHours]);
    
    // Handlers
    const handleStart = () => setShowWelcomeModal(false);
    const handleDeselect = () => {
        setSelectedAircraftId(null);
        setSelectedRadarId(null);
    };
    const handleSelectAircraft = (id: string) => {
        setSelectedAircraftId(id);
        setSelectedRadarId(null);
    };
    const handleSelectRadar = (id: string) => {
        setSelectedRadarId(id);
        setSelectedAircraftId(null);
    };
    const handleOpenRadarScope = (id: string) => setViewingRadarId(id);


    const handleLoadRadars = useCallback(() => {
        const newRadars: Radar[] = PREDEFINED_RADARS.map(r => ({
            ...r,
            id: uniqueId('radar'),
            range: RADAR_DEFAULT_RANGE_NM,
            isActive: true,
        }));
        setRadars(newRadars);
        setTotalSimulatedTimeHours(0);
        setAircrafts([]);
        setLiveMetrics(initialLiveMetrics);
        setLiveFinancials({ revenue: 0, costs: 0 });
    }, []);

    const handleRandomizeRadars = useCallback(() => {
        setRadars(prevRadars => {
            const shuffled = [...prevRadars].sort(() => 0.5 - Math.random());
            const countToDeactivate = Math.floor(shuffled.length / 2);
            const idsToDeactivate = new Set(shuffled.slice(0, countToDeactivate).map(r => r.id));
            const newSimTime = simulationStateRef.current.totalSimulatedTimeHours;
            return prevRadars.map(r => {
                if (idsToDeactivate.has(r.id)) {
                    return { ...r, isActive: false, reactivationTime: newSimTime + RADAR_REPAIR_TIME_HOURS };
                }
                return r;
            });
        });
    }, []);

    const handleToggleRadarStatus = useCallback((id: string) => {
        setRadars(prevRadars => prevRadars.map(r => {
            if (r.id === id) {
                const newStatus = !r.isActive;
                return {
                    ...r,
                    isActive: newStatus,
                    reactivationTime: newStatus ? undefined : simulationStateRef.current.totalSimulatedTimeHours + RADAR_REPAIR_TIME_HOURS
                };
            }
            return r;
        }));
    }, []);
    
    // Core simulation logic
    const runAnalysis = useCallback(async (simulationDays: number) => {
        setIsSimulating(true);
        setSimulationProgress(0);
        await new Promise(resolve => setTimeout(resolve, 50));

        const initialRadars: Radar[] = simulationStateRef.current.radars;
        const initiallyInactiveRadars = initialRadars.filter(r => !r.isActive);
        const initialRadarMap = new Map<string, Radar>(initialRadars.map(r => [r.id, r]));
        const airportMap = new Map<string, Airport>(airportsWithPositions.map(a => [a.code, a]));
        
        const result: Omit<SimulationResult, 'problematicRoutes' | 'redundancyAnalysis' | 'maintenanceImpact' | 'cancellationSources' | 'inactiveRadarAnalysis'> & { problematicRoutes: Map<string, number>, redundancyAnalysis: Map<string, number>, maintenanceImpact: Map<string, { outages: number; downtimeHours: number }>, cancellationSources: Map<string, number>, inactiveRadarAnalysis: Map<string, number> } = {
            totalFlights: 0,
            totalDays: simulationDays,
            cancelledFlights: 0,
            totalFlightsWithLostTracking: 0,
            lostFlightMinutes: 0,
            cancellationSources: new Map<string, number>(),
            maintenanceImpact: new Map<string, { outages: number; downtimeHours: number }>(),
            problematicRoutes: new Map<string, number>(),
            redundancyAnalysis: new Map<string, number>(),
            inactiveRadarAnalysis: new Map<string, number>(),
            totalRevenue: 0,
            totalOperationalCost: 0,
            totalCancellationCost: 0,
            totalLostTrackingCost: 0,
            netProfitLoss: 0,
        };
        initialRadars.forEach(r => {
            result.maintenanceImpact.set(r.name, { outages: 0, downtimeHours: 0 });
            result.redundancyAnalysis.set(r.name, 0);
        });

        initiallyInactiveRadars.forEach(r => {
            const proratedCost = (financialConfig.radarCostPerYear / 365) * simulationDays;
            result.inactiveRadarAnalysis.set(r.name, -proratedCost);
        });


        // Schedule major outages
        const shuffledRadarIds = [...initialRadars].sort(() => 0.5 - Math.random()).map(r => r.id);
        const halfOutageIds = new Set(shuffledRadarIds.slice(0, Math.floor(shuffledRadarIds.length / 2)));
        const outageDay1 = Math.floor(Math.random() * simulationDays);
        let outageDay2;
        do {
            outageDay2 = Math.floor(Math.random() * simulationDays);
        } while (outageDay2 === outageDay1);

        if (halfOutageIds.size > 0) {
            halfOutageIds.forEach(id => {
                const radarName = initialRadarMap.get(id)?.name;
                if(radarName) {
                    const impact = result.maintenanceImpact.get(radarName);
                    if (impact) {
                        impact.outages += 2; // Two major outages
                        impact.downtimeHours += 8; // 4 hours each
                    }
                }
            });
        }


        // Pre-calculate daily maintenance schedules
        const maintenanceSchedule = new Map<number, {radarId: string, startHour: number}>();
        for (let day = 0; day < simulationDays; day++) {
            const activeRadarIdsToday = new Set(initialRadars.filter(r => r.isActive).map(r => r.id));
            if (activeRadarIdsToday.size > 0) {
                const radarForMaintenanceId = [...activeRadarIdsToday][Math.floor(Math.random() * activeRadarIdsToday.size)];
                maintenanceSchedule.set(day, { radarId: radarForMaintenanceId, startHour: Math.floor(Math.random() * 20) });

                const radarName = initialRadarMap.get(radarForMaintenanceId)?.name;
                if(radarName) {
                    const impact = result.maintenanceImpact.get(radarName);
                    if (impact) {
                        impact.outages += 1;
                        impact.downtimeHours += 4;
                    }
                }
            }
        }
        
        const getCoveringRadarsAtTime = (point: Point, day: number, hour: number) => {
            let activeRadarsNow = initialRadars.filter(r => r.isActive);
            
            if ((day === outageDay1 || day === outageDay2) && hour >= 8 && hour < 12) {
                 activeRadarsNow = activeRadarsNow.filter(r => !halfOutageIds.has(r.id));
            }
            
            const maintenance = maintenanceSchedule.get(day);
            if (maintenance && hour >= maintenance.startHour && hour < maintenance.startHour + 4) {
                activeRadarsNow = activeRadarsNow.filter(r => r.id !== maintenance.radarId);
            }
            
            return activeRadarsNow.filter(r => calculateDistanceNM(point, r.position) <= r.range);
        };

        const activeRadarsAtStart = initialRadars.filter(r => r.isActive);
        result.totalOperationalCost = activeRadarsAtStart.length * (financialConfig.radarCostPerYear / 365) * simulationDays;


        // --- Simulation Loop ---
        for (let day = 0; day < simulationDays; day++) {
            for (let i = 0; i < FLIGHTS_PER_DAY; i++) {
                result.totalFlights++;
                const isPredictable = Math.random() < 0.75;
                let flightPlan: FlightPlan;
                if (isPredictable && ALL_FLIGHT_PLANS.length > 0) {
                    flightPlan = ALL_FLIGHT_PLANS[Math.floor(Math.random() * ALL_FLIGHT_PLANS.length)];
                } else {
                    const ap1 = airportsWithPositions[Math.floor(Math.random() * airportsWithPositions.length)];
                    const ap2 = airportsWithPositions[Math.floor(Math.random() * airportsWithPositions.length)];
                    flightPlan = { from: ap1.code, to: ap2.code, frequency: '123.45' };
                }

                const origin = airportMap.get(flightPlan.from);
                const destination = airportMap.get(flightPlan.to);

                if (!origin || !destination || origin.code === destination.code) continue;

                const departureHour = Math.random() * 24;
                if (getCoveringRadarsAtTime(origin.position, day, departureHour).length === 0) {
                    result.cancelledFlights++;
                    result.cancellationSources.set(origin.code, (result.cancellationSources.get(origin.code) || 0) + 1);
                    result.totalCancellationCost += financialConfig.cancellationCost;

                    const potentialSavers = initiallyInactiveRadars.filter(r => calculateDistanceNM(origin.position, r.position) <= r.range);
                    if (potentialSavers.length > 0) {
                        const savedValuePerRadar = financialConfig.cancellationCost / potentialSavers.length;
                        potentialSavers.forEach(r => {
                            result.inactiveRadarAnalysis.set(r.name, (result.inactiveRadarAnalysis.get(r.name) || 0) + savedValuePerRadar);
                        });
                    }
                    continue;
                }

                result.totalRevenue += financialConfig.flightRevenue;

                const totalDistance = calculateDistanceNM(origin.position, destination.position);
                const flightDurationHours = totalDistance / AIRCRAFT_SPEED_KNOTS;
                let lostMinutesForFlight = 0;
                
                const timeSteps = Math.ceil(flightDurationHours * 60); // 1-minute steps
                for (let t = 0; t < timeSteps; t++) {
                    const progress = t / timeSteps;
                    const currentHour = departureHour + (t / 60);
                    const currentDay = day + Math.floor(currentHour / 24);
                    const hourOfDay = currentHour % 24;
                    const currentPosition = lerpPoint(origin.position, destination.position, progress);
                    
                    const coveringRadars = getCoveringRadarsAtTime(currentPosition, currentDay, hourOfDay);

                    if (coveringRadars.length === 0) {
                        lostMinutesForFlight++;
                        const potentialTrackers = initiallyInactiveRadars.filter(r => calculateDistanceNM(currentPosition, r.position) <= r.range);
                        if (potentialTrackers.length > 0) {
                            const savedValuePerRadar = financialConfig.lostTrackingCostPerMinute / potentialTrackers.length;
                            potentialTrackers.forEach(r => {
                                result.inactiveRadarAnalysis.set(r.name, (result.inactiveRadarAnalysis.get(r.name) || 0) + savedValuePerRadar);
                            });
                        }
                    } else if (coveringRadars.length === 1) {
                        const soleRadarName = coveringRadars[0].name;
                        result.redundancyAnalysis.set(soleRadarName, (result.redundancyAnalysis.get(soleRadarName) || 0) + 1);
                    }
                }

                if (lostMinutesForFlight > 0) {
                    result.totalFlightsWithLostTracking++;
                    result.lostFlightMinutes += lostMinutesForFlight;
                    result.totalLostTrackingCost += lostMinutesForFlight * financialConfig.lostTrackingCostPerMinute;
                    const routeKey = `${origin.code}-${destination.code}`;
                    result.problematicRoutes.set(routeKey, (result.problematicRoutes.get(routeKey) || 0) + lostMinutesForFlight);
                }
            }
             // Update progress
            const newProgress = Math.round(((day + 1) / simulationDays) * 100);
            if (newProgress > simulationProgress) {
                setSimulationProgress(newProgress);
                // Yield to the event loop to allow UI to update
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
        }
        
        const finalResult: SimulationResult = {
            ...result,
            problematicRoutes: Array.from(result.problematicRoutes.entries()).map(([route, lostMinutes]) => ({ route, lostMinutes })),
            redundancyAnalysis: Array.from(result.redundancyAnalysis.entries()).map(([radarName, soleCoverageMinutes]) => ({ radarName, soleCoverageMinutes })),
            maintenanceImpact: Array.from(result.maintenanceImpact.entries()).map(([radarName, data]) => ({ radarName, ...data})),
            cancellationSources: Array.from(result.cancellationSources.entries()).map(([airportCode, cancellations]) => ({ airportCode, cancellations })),
            inactiveRadarAnalysis: Array.from(result.inactiveRadarAnalysis.entries()).map(([radarName, potentialPnlChange]) => ({ radarName, potentialPnlChange })),
            netProfitLoss: result.totalRevenue - (result.totalOperationalCost + result.totalCancellationCost + result.totalLostTrackingCost)
        };


        setSimulationResult(finalResult);
        setIsSimulating(false);
        setSimulationProgress(0);
    }, [financialConfig, simulationProgress]);

    const handleRunMonthSimulation = () => runAnalysis(30);
    const handleRunYearSimulation = () => runAnalysis(365);


    const handleGenerateLiveReport = useCallback(() => {
        const cancellationCost = liveMetrics.cancelledFlights * financialConfig.cancellationCost;
        const lostTrackingCost = liveMetrics.lostFlightMinutes * financialConfig.lostTrackingCostPerMinute;
        const operationalCost = liveFinancials.costs - cancellationCost - lostTrackingCost;
        const netProfitLoss = liveFinancials.revenue - liveFinancials.costs;

        const reportResult: SimulationResult = {
            totalFlights: liveMetrics.totalSpawnedFlights,
            totalDays: totalSimulatedTimeHours / 24,
            cancelledFlights: liveMetrics.cancelledFlights,
            totalFlightsWithLostTracking: liveMetrics.flightsWithLostTracking.size,
            lostFlightMinutes: liveMetrics.lostFlightMinutes,
            cancellationSources: Array.from(liveMetrics.cancellationSources.entries()).map(([airportCode, cancellations]) => ({airportCode, cancellations})),
            maintenanceImpact: [], // Not applicable for live report
            problematicRoutes: Array.from(liveMetrics.problematicRoutes.entries()).map(([route, lostMinutes]) => ({route, lostMinutes})),
            redundancyAnalysis: [], // Not applicable for live report
            inactiveRadarAnalysis: [], // Not applicable for live report
            totalRevenue: liveFinancials.revenue,
            totalOperationalCost: operationalCost > 0 ? operationalCost : 0,
            totalCancellationCost: cancellationCost,
            totalLostTrackingCost: lostTrackingCost,
            netProfitLoss: netProfitLoss,
        };
        setSimulationResult(reportResult);
    }, [liveMetrics, totalSimulatedTimeHours, liveFinancials, financialConfig]);
    
    const handleFindRedundantRadars = useCallback(async () => {
        setIsFindingRedundancy(true);
        await new Promise(resolve => setTimeout(resolve, 50));

        const initialActiveRadars = simulationStateRef.current.radars.filter(r => r.isActive);
        if (initialActiveRadars.length === 0) {
            setIsFindingRedundancy(false);
            return;
        }
        const airportMap = new Map<string, Airport>(airportsWithPositions.map(a => [a.code, a]));

        const soleCoverageTime = new Map<string, number>(); // radarId -> minutes
        const SIMULATION_DURATION_DAYS = 7;
        const FLIGHTS_PER_DAY_SHORT_SIM = 500;

        const getCoveringRadarsAtTime = (point: Point): Radar[] => {
            const coveringRadars: Radar[] = [];
            for (const radar of initialActiveRadars) {
                if (calculateDistanceNM(point, radar.position) <= radar.range) {
                    coveringRadars.push(radar);
                }
            }
            return coveringRadars;
        };

        for (let day = 0; day < SIMULATION_DURATION_DAYS; day++) {
            for (let i = 0; i < FLIGHTS_PER_DAY_SHORT_SIM; i++) {
                const flightPlan = ALL_FLIGHT_PLANS[Math.floor(Math.random() * ALL_FLIGHT_PLANS.length)];
                const origin = airportMap.get(flightPlan.from);
                const destination = airportMap.get(flightPlan.to);

                if (!origin || !destination || origin.code === destination.code) continue;

                if (getCoveringRadarsAtTime(origin.position).length === 0) continue;

                const totalDistance = calculateDistanceNM(origin.position, destination.position);
                const flightDurationHours = totalDistance / AIRCRAFT_SPEED_KNOTS;
                const timeSteps = Math.ceil(flightDurationHours * 60);

                for (let t = 0; t < timeSteps; t++) {
                    const progress = t / timeSteps;
                    const currentPosition = lerpPoint(origin.position, destination.position, progress);
                    const coveringRadars = getCoveringRadarsAtTime(currentPosition);

                    if (coveringRadars.length === 1) {
                        const soleRadarId = coveringRadars[0].id;
                        soleCoverageTime.set(soleRadarId, (soleCoverageTime.get(soleRadarId) || 0) + 1);
                    }
                }
            }
        }

        const sortedRadars = [...initialActiveRadars].sort((a, b) => {
            const timeA = soleCoverageTime.get(a.id) || 0;
            const timeB = soleCoverageTime.get(b.id) || 0;
            return timeA - timeB;
        });

        const countToSuggest = Math.ceil(initialActiveRadars.length * 0.2);
        const topRedundantIds = sortedRadars.slice(0, countToSuggest).map(r => r.id);

        setRedundantRadarIds(topRedundantIds);
        setIsFindingRedundancy(false);
    }, []);

    const handleDeactivateListedRadars = (idsToDeactivate: string[]) => {
        const idSet = new Set(idsToDeactivate);
        setRadars(prevRadars =>
            prevRadars.map(r =>
                idSet.has(r.id) ? { ...r, isActive: false, reactivationTime: undefined } : r
            )
        );
        setRedundantRadarIds([]);
    };


    // Memoized values
    const selectedAircraft = useMemo(() => aircrafts.find(a => a.id === selectedAircraftId), [selectedAircraftId, aircrafts]);
    const selectedRadar = useMemo(() => radars.find(r => r.id === selectedRadarId), [selectedRadarId, radars]);
    const viewingRadar = useMemo(() => radars.find(r => r.id === viewingRadarId), [viewingRadarId, radars]);
    const radarsTrackingAircraft = useMemo(() => {
        if (!selectedAircraft) return [];
        return radars.filter(r => r.isActive && calculateDistanceNM(selectedAircraft.position, r.position) <= r.range);
    }, [selectedAircraft, radars]);
    const aircraftVisibleByRadar = useMemo(() => {
        if (!selectedRadar || !selectedRadar.isActive) return [];
        return aircrafts.filter(a => calculateDistanceNM(a.position, selectedRadar.position) <= selectedRadar.range);
    }, [selectedRadar, aircrafts]);
    const aircraftVisibleByViewingRadar = useMemo(() => {
        if (!viewingRadar || !viewingRadar.isActive) return [];
        return aircrafts.filter(a => calculateDistanceNM(a.position, viewingRadar.position) <= viewingRadar.range);
    }, [viewingRadar, aircrafts]);

    const trackedAircraftCount = useMemo(() => aircrafts.filter(a => a.visibilityStatus === 'tracked').length, [aircrafts]);
    const uncoveredAirportsCount = useMemo(() => airports.filter(a => !a.isCovered).length, [airports]);
    const RADAR_COST_PER_HOUR = useMemo(() => financialConfig.radarCostPerYear / (365 * 24), [financialConfig.radarCostPerYear]);

    // Effect to update airport coverage status based on active radars
    useEffect(() => {
        const activeRadars = radars.filter(r => r.isActive);
        const isCovered = (point: Point) => {
            for (const radar of activeRadars) {
                if (calculateDistanceNM(point, radar.position) <= radar.range) {
                    return true;
                }
            }
            return false;
        };
        setAirports(prev => prev.map(ap => ({
            ...ap,
            isCovered: isCovered(ap.position)
        })));
    }, [radars]);
    
    // Main animation loop for visual simulation
    useEffect(() => {
        const tick = (timestamp: number) => {
            animationFrameId.current = requestAnimationFrame(tick);
            const delta = timestamp - lastTimestamp.current;
            lastTimestamp.current = timestamp;

            const clampedDelta = Math.min(delta, 200);

            if (isPaused) return;
            
            const timePassedHours = (clampedDelta / 1000) * (simulationSpeed / 3600);
            
            // --- State updates using functional form to avoid stale closures ---
            setTotalSimulatedTimeHours(prevTime => prevTime + timePassedHours);

            setRadars(prevRadars => {
                const currentSimTime = simulationStateRef.current.totalSimulatedTimeHours;
                return prevRadars.map(r => {
                    if (!r.isActive && r.reactivationTime && currentSimTime >= r.reactivationTime) {
                        return { ...r, isActive: true, reactivationTime: undefined };
                    }
                    return r;
                });
            });
            
            setAircrafts(prevAircrafts => {
                const { airports: currentAirports, radars: currentRadars, totalSimulatedTimeHours: currentSimTime } = simulationStateRef.current;
                
                const activeRadars = currentRadars.filter(r => r.isActive);
                const isAircraftCovered = (point: Point) => {
                    for (const radar of activeRadars) {
                        if (calculateDistanceNM(point, radar.position) <= radar.range) return true;
                    }
                    return false;
                };

                const updatedAircrafts = prevAircrafts.map(ac => {
                    const flightDurationHours = ac.totalDistance / ac.speed;
                    const progress = ac.progress + (timePassedHours / flightDurationHours);
                    const origin = currentAirports.find(a => a.code === ac.origin)!;
                    const destination = currentAirports.find(a => a.code === ac.destination)!;
                    const newPosition = lerpPoint(origin.position, destination.position, Math.min(progress, 1));
                    const visibilityStatus: 'tracked' | 'lost' = isAircraftCovered(newPosition) ? 'tracked' : 'lost';
                    
                    let newHeading = ac.heading;
                    if (newPosition.lat !== ac.position.lat || newPosition.lng !== ac.position.lng) {
                      newHeading = calculateBearing(ac.position, newPosition);
                    }
                    
                    return { ...ac, progress, position: newPosition, visibilityStatus, heading: newHeading };
                });
                
                let availableAircraft = updatedAircrafts.filter(ac => ac.progress < 1);
                const completedCount = updatedAircrafts.length - availableAircraft.length;
                if (completedCount > 0) {
                    setLiveFinancials(prev => ({ ...prev, revenue: prev.revenue + (completedCount * financialConfig.flightRevenue)}));
                }


                for (let i = 0; i < completedCount; i++) {
                    const route = ALL_FLIGHT_PLANS[Math.floor(Math.random() * ALL_FLIGHT_PLANS.length)];
                    const origin = currentAirports.find(a => a.code === route.from);
                    if (origin && origin.isCovered) {
                       const destination = currentAirports.find(a => a.code === route.to)!;
                       availableAircraft.push({
                           id: uniqueId('ac'),
                           flightNumber: `${AIRLINE_CODES[Math.floor(Math.random() * AIRLINE_CODES.length)]}${Math.floor(100 + Math.random() * 900)}`,
                           origin: route.from, destination: route.to, position: origin.position,
                           altitude: CRUISE_ALTITUDE_FEET, speed: AIRCRAFT_SPEED_KNOTS,
                           heading: calculateBearing(origin.position, destination.position),
                           visibilityStatus: 'tracked', progress: 0,
                           totalDistance: calculateDistanceNM(origin.position, destination.position),
                           startTime: currentSimTime,
                       });
                    }
                }
                
                const targetCount = 500 + Math.max(0, Math.sin((currentSimTime * Math.PI) / 12 - 3 * Math.PI / 4)) * 500;
                while (availableAircraft.length < targetCount && Math.random() < 0.5) {
                    const route = ALL_FLIGHT_PLANS[Math.floor(Math.random() * ALL_FLIGHT_PLANS.length)];
                    const origin = currentAirports.find(a => a.code === route.from);
                    if (origin) {
                        if (origin.isCovered) {
                           const destination = currentAirports.find(a => a.code === route.to)!;
                           availableAircraft.push({
                               id: uniqueId('ac'),
                               flightNumber: `${AIRLINE_CODES[Math.floor(Math.random() * AIRLINE_CODES.length)]}${Math.floor(100 + Math.random() * 900)}`,
                               origin: route.from, destination: route.to, position: origin.position,
                               altitude: CRUISE_ALTITUDE_FEET, speed: AIRCRAFT_SPEED_KNOTS,
                               heading: calculateBearing(origin.position, destination.position),
                               visibilityStatus: 'tracked', progress: 0,
                               totalDistance: calculateDistanceNM(origin.position, destination.position),
                               startTime: currentSimTime,
                           });
                        } else {
                           setLiveFinancials(prev => ({...prev, costs: prev.costs + financialConfig.cancellationCost}));
                           setLiveMetrics(prev => {
                               const newSources = new Map<string, number>(prev.cancellationSources);
                               newSources.set(origin.code, (newSources.get(origin.code) || 0) + 1);
                               return {...prev, cancelledFlights: prev.cancelledFlights + 1, totalSpawnedFlights: prev.totalSpawnedFlights + 1, cancellationSources: newSources };
                           });
                        }
                    }
                }
                return availableAircraft;
            });
            
             setLiveMetrics(prev => {
                const { aircrafts: currentAircrafts, airports: currentAirports, radars: currentRadars } = simulationStateRef.current;
                const timePassedMinutes = timePassedHours * 60;
                let lostTrackingCostThisTick = 0;
                let newLostMinutes = prev.lostFlightMinutes;
                const newFlightsWithLost = new Set(prev.flightsWithLostTracking);
                const newProblematicRoutes = new Map<string, number>(prev.problematicRoutes);
                
                currentAircrafts.forEach(ac => {
                    if (ac.visibilityStatus === 'lost') {
                        const lostMinutesThisTick = timePassedMinutes;
                        newLostMinutes += lostMinutesThisTick;
                        lostTrackingCostThisTick += lostMinutesThisTick * financialConfig.lostTrackingCostPerMinute;
                        newFlightsWithLost.add(ac.id);
                        const routeKey = `${ac.origin}-${ac.destination}`;
                        newProblematicRoutes.set(routeKey, (newProblematicRoutes.get(routeKey) || 0) + lostMinutesThisTick);
                    }
                });
                
                const operationalCostThisTick = currentRadars.filter(r => r.isActive).length * RADAR_COST_PER_HOUR * timePassedHours;

                if (lostTrackingCostThisTick > 0 || operationalCostThisTick > 0) {
                    setLiveFinancials(prevFinancials => ({...prevFinancials, costs: prevFinancials.costs + lostTrackingCostThisTick + operationalCostThisTick }));
                }


                const newAirportDowntime = new Map<string, number>(prev.airportDowntime);
                currentAirports.forEach(ap => {
                    if (!ap.isCovered) {
                        newAirportDowntime.set(ap.code, (newAirportDowntime.get(ap.code) || 0) + timePassedMinutes);
                    }
                });
                return { ...prev, lostFlightMinutes: newLostMinutes, flightsWithLostTracking: newFlightsWithLost, airportDowntime: newAirportDowntime, problematicRoutes: newProblematicRoutes };
             });

        };
        animationFrameId.current = requestAnimationFrame(tick);
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isPaused, simulationSpeed, financialConfig, RADAR_COST_PER_HOUR]);


    // Initial data load
    useEffect(() => {
        setAirports(airportsWithPositions);
        handleLoadRadars();
    }, [handleLoadRadars]);
    
    return (
        <div className="w-screen h-screen bg-gray-900 text-white font-sans relative overflow-hidden">
            {showWelcomeModal && <WelcomeModal onStart={handleStart} />}
            
            <MapComponent
                apiKey={apiKey}
                center={MAP_CENTER}
                zoom={MAP_ZOOM}
                aircrafts={aircrafts}
                radars={radars}
                airports={airports}
                selectedAircraftId={selectedAircraftId}
                selectedRadarId={selectedRadarId}
                onSelectAircraft={handleSelectAircraft}
                onSelectRadar={handleSelectRadar}
                onDeselect={handleDeselect}
                onToggleRadarStatus={handleToggleRadarStatus}
            />

            <InfoPanel
                selectedAircraft={selectedAircraft}
                selectedRadar={selectedRadar}
                radarsTrackingAircraft={radarsTrackingAircraft}
                aircraftVisibleByRadar={aircraftVisibleByRadar}
                onToggleRadarStatus={handleToggleRadarStatus}
                totalSimulatedTimeHours={totalSimulatedTimeHours}
                onOpenAboutModal={() => setIsAboutModalOpen(true)}
                isExpanded={isInfoPanelExpanded}
                onToggleExpand={() => setIsInfoPanelExpanded(p => !p)}
                onOpenRadarScope={handleOpenRadarScope}
            />
            
            <RadarListPanel 
                radars={radars}
                selectedRadarId={selectedRadarId}
                onSelectRadar={handleSelectRadar}
                onToggleRadarStatus={handleToggleRadarStatus}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4 z-10">
                 <ControlsPanel
                    isPaused={isPaused}
                    onTogglePause={() => setIsPaused(p => !p)}
                    onLoadRadars={handleLoadRadars}
                    onRandomizeRadars={handleRandomizeRadars}
                    onRunMonthSimulation={handleRunMonthSimulation}
                    onRunYearSimulation={handleRunYearSimulation}
                    onGenerateLiveReport={handleGenerateLiveReport}
                    onFindRedundantRadars={handleFindRedundantRadars}
                    onOpenCostModal={() => setIsCostModalOpen(true)}
                    isSimulating={isSimulating}
                    isFindingRedundancy={isFindingRedundancy}
                    radarCount={radars.length}
                    activeRadarCount={radars.filter(r => r.isActive).length}
                    simulationSpeed={simulationSpeed}
                    onSimulationSpeedChange={setSimulationSpeed}
                    trackedAircraftCount={trackedAircraftCount}
                    untrackedAircraftCount={aircrafts.length - trackedAircraftCount}
                    uncoveredAirportsCount={uncoveredAirportsCount}
                    simulatedTimeOfDay={totalSimulatedTimeHours % 24}
                    totalSimulatedTimeHours={totalSimulatedTimeHours}
                    liveProfitLoss={liveFinancials.revenue - liveFinancials.costs}
                    simulationProgress={simulationProgress}
                 />
            </div>
            
            {simulationResult && (
                <SimulationResultModal 
                    result={simulationResult} 
                    onClose={() => setSimulationResult(null)} 
                />
            )}

            {redundantRadarIds.length > 0 && (
                <RedundantRadarsModal
                    radarIds={redundantRadarIds}
                    allRadars={radars}
                    onDeactivate={handleDeactivateListedRadars}
                    onClose={() => setRedundantRadarIds([])}
                />
            )}

            {isCostModalOpen && (
                <CostConfigModal
                    config={financialConfig}
                    onSave={(newConfig) => {
                        setFinancialConfig(newConfig);
                        setIsCostModalOpen(false);
                    }}
                    onClose={() => setIsCostModalOpen(false)}
                />
            )}

            {isAboutModalOpen && (
                <AboutModal onClose={() => setIsAboutModalOpen(false)} />
            )}
            
            {viewingRadar && (
                <RadarScopeModal
                    radar={viewingRadar}
                    visibleAircraft={aircraftVisibleByViewingRadar}
                    onClose={() => setViewingRadarId(null)}
                />
            )}
        </div>
    );
};

export default App;
