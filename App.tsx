import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
// FIX: Renamed Map component import to avoid conflict with the native Map object, which was causing errors with `new Map()`.
import MapComponent from './components/Map';
import InfoPanel from './components/InfoPanel';
import ControlsPanel from './components/ControlsPanel';
import WelcomeModal from './components/WelcomeModal';
import ApiKeyModal from './components/ApiKeyModal';
import RadarListPanel from './components/RadarListPanel';
import { Aircraft, Point, Radar } from './types';
// FIX: `findNearestAirport` is exported from `utils.ts`, not `data/airports.ts`. The import path has been corrected.
import { airportMap } from './data/airports';
import { ALL_ROUTES } from './data/routes';
import { AIRLINE_CODES } from './data/airlines';
import { lerpPoint, calculateBearing, calculateDistanceNM, findNearestAirport } from './utils';

// Game constants
const INITIAL_TREASURY = 1000;
const RADAR_DEPLOYMENT_COST = 50;
const MAX_RADARS = 15;
const RADAR_RANGE_NM = 250;
const RADAR_FAILURE_CHANCE_PER_HOUR = 0.1;
const RADAR_REPAIR_TIME_MIN_S = 120; // 2 game minutes
const RADAR_REPAIR_TIME_MAX_S = 480; // 8 game minutes (0-4 hours with 1min=1hr)

const CRUISE_ALTITUDE_MIN_FT = 30000;
const CRUISE_ALTITUDE_MAX_FT = 41000;
const AIRCRAFT_SPEED_KNOTS = 450;

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('googleMapsApiKey'));
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(5);
  
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [radars, setRadars] = useState<Radar[]>([]);
  
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [selectedRadarId, setSelectedRadarId] = useState<string | null>(null);

  const [treasury, setTreasury] = useState(INITIAL_TREASURY);
  const [netProfit, setNetProfit] = useState(0);
  const [totalGameTimeS, setTotalGameTimeS] = useState(0);

  const [economicSettings, setEconomicSettings] = useState({
    radarCost: 10,
    visibleIncome: 0.5,
    unseenPenalty: 1.0,
  });

  const lastUpdateTimeRef = useRef<number | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const createRandomAircraft = useCallback(() => {
    let fromCode, toCode;
    const isStandardRoute = Math.random() < 0.75;

    if (isStandardRoute && ALL_ROUTES.length > 0) {
      const route = ALL_ROUTES[Math.floor(Math.random() * ALL_ROUTES.length)];
      fromCode = route.from;
      toCode = route.to;
    } else {
      const airportCodes = Array.from(airportMap.keys());
      fromCode = airportCodes[Math.floor(Math.random() * airportCodes.length)];
      do {
        toCode = airportCodes[Math.floor(Math.random() * airportCodes.length)];
      } while (fromCode === toCode);
    }
    
    const fromAirport = airportMap.get(fromCode);
    const toAirport = airportMap.get(toCode);
    const airline = AIRLINE_CODES[Math.floor(Math.random() * AIRLINE_CODES.length)];

    if (fromAirport && toAirport) {
      const newAircraft: Aircraft = {
        id: uuidv4(),
        flightNumber: `${airline}${Math.floor(100 + Math.random() * 900)}`,
        airline,
        position: fromAirport.position,
        heading: calculateBearing(fromAirport.position, toAirport.position),
        speed: AIRCRAFT_SPEED_KNOTS,
        altitude: 0,
        cruisingAltitude: Math.round((CRUISE_ALTITUDE_MIN_FT + Math.random() * (CRUISE_ALTITUDE_MAX_FT - CRUISE_ALTITUDE_MIN_FT)) / 100) * 100,
        origin: fromAirport.code,
        destination: toAirport.code,
        route: { from: fromAirport.position, to: toAirport.position },
        progress: 0,
        visibilityStatus: 'unseen',
      };
      return newAircraft;
    }
    return null;
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (isPaused) {
      lastUpdateTimeRef.current = timestamp;
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const realDeltaTimeMs = timestamp - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = timestamp;
    if (realDeltaTimeMs <= 0) {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    const gameDeltaTimeS = (realDeltaTimeMs / 1000) * simulationSpeed;
    const newTotalGameTimeS = totalGameTimeS + gameDeltaTimeS;

    // --- BATCH STATE UPDATES ---
    // 1. Update Radars
    const newRadars = radars.map(r => {
      let { isActive, timeToReactivate } = r;
      if (!isActive) {
        timeToReactivate -= gameDeltaTimeS;
        if (timeToReactivate <= 0) {
          isActive = true;
          timeToReactivate = 0;
        }
      } else {
        const failureChanceThisFrame = (RADAR_FAILURE_CHANCE_PER_HOUR / 3600) * gameDeltaTimeS;
        if (Math.random() < failureChanceThisFrame) {
          isActive = false;
          timeToReactivate = RADAR_REPAIR_TIME_MIN_S + Math.random() * (RADAR_REPAIR_TIME_MAX_S - RADAR_REPAIR_TIME_MIN_S);
        }
      }
      return { ...r, isActive, timeToReactivate, supportedIncome: 0 };
    });

    // 2. Update Aircraft positions and remove completed flights
    let newAircrafts = aircrafts.map(ac => {
      const routeDistance = calculateDistanceNM(ac.route.from, ac.route.to);
      if (routeDistance === 0) return null;
      const distanceToTravel = (ac.speed / 3600) * gameDeltaTimeS;
      const progressDelta = distanceToTravel / routeDistance;
      const newProgress = ac.progress + progressDelta;

      if (newProgress >= 1) return null;

      const newPosition = lerpPoint(ac.route.from, ac.route.to, newProgress);
      const climbDescendPortion = Math.min(0.2, 50 / routeDistance);
      let altitude;
      if (newProgress < climbDescendPortion) {
        altitude = (newProgress / climbDescendPortion) * ac.cruisingAltitude;
      } else if (newProgress > (1 - climbDescendPortion)) {
        altitude = ((1 - newProgress) / climbDescendPortion) * ac.cruisingAltitude;
      } else {
        altitude = ac.cruisingAltitude;
      }

      return {
        ...ac,
        progress: newProgress,
        position: newPosition,
        heading: calculateBearing(ac.position, newPosition),
        altitude: Math.round(altitude),
      };
    }).filter((ac): ac is Aircraft => ac !== null);

    // 3. Spawn new aircraft based on game time
    const T1_HOUR_S = 3600;
    const T2_HOUR_S = 7200;
    let targetAircraftCount;
    if (newTotalGameTimeS < T1_HOUR_S) {
        targetAircraftCount = 50 + Math.floor((150 * newTotalGameTimeS) / T1_HOUR_S);
    } else if (newTotalGameTimeS < T2_HOUR_S) {
        targetAircraftCount = 200 + Math.floor((300 * (newTotalGameTimeS - T1_HOUR_S)) / T1_HOUR_S);
    } else {
        targetAircraftCount = 500;
    }

    if (newAircrafts.length < targetAircraftCount) {
      const newAircraft = createRandomAircraft();
      if (newAircraft) newAircrafts.push(newAircraft);
    }

    // 4. Visibility and Economic Calculations
    const aircraftToTrackingRadars = new Map<string, string[]>();
    newRadars.forEach(r => {
      if (r.isActive) {
        newAircrafts.forEach(ac => {
          if (calculateDistanceNM(r.position, ac.position) <= r.range) {
            const tracking = aircraftToTrackingRadars.get(ac.id) || [];
            tracking.push(r.id);
            aircraftToTrackingRadars.set(ac.id, tracking);
          }
        });
      }
    });

    let frameIncome = 0;
    let frameCost = 0;

    const excessRadars = Math.max(0, newRadars.length - 10);
    const surchargePerRadar = excessRadars * 0.5;
    const currentHourlyRadarCost = economicSettings.radarCost + surchargePerRadar;
    frameCost += newRadars.length * (currentHourlyRadarCost / 3600) * gameDeltaTimeS;

    newAircrafts = newAircrafts.map(ac => {
      const trackingRadars = aircraftToTrackingRadars.get(ac.id) || [];
      const isVisible = trackingRadars.length > 0;
      let newVisibilityStatus = ac.visibilityStatus;

      if (isVisible) {
        newVisibilityStatus = 'visible';
      } else {
        newVisibilityStatus = (ac.visibilityStatus === 'visible' || ac.visibilityStatus === 'lost') ? 'lost' : 'unseen';
      }

      if (newVisibilityStatus === 'visible') {
        frameIncome += (economicSettings.visibleIncome / 3600) * gameDeltaTimeS;
        const incomePerRadar = economicSettings.visibleIncome / trackingRadars.length;
        trackingRadars.forEach(radarId => {
          const radar = newRadars.find(r => r.id === radarId);
          if (radar) radar.supportedIncome += incomePerRadar;
        });
      } else if (newVisibilityStatus === 'lost') {
        frameCost += (economicSettings.unseenPenalty * 3 / 3600) * gameDeltaTimeS;
      } else {
        frameCost += (economicSettings.unseenPenalty / 3600) * gameDeltaTimeS;
      }
      return { ...ac, visibilityStatus: newVisibilityStatus };
    });

    // 5. Commit state updates
    setAircrafts(newAircrafts);
    setRadars(newRadars);
    setTreasury(t => t + frameIncome - frameCost);
    setNetProfit(gameDeltaTimeS > 0 ? ((frameIncome - frameCost) * 3600) / gameDeltaTimeS : 0);
    setTotalGameTimeS(newTotalGameTimeS);
    
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
  }, [isPaused, simulationSpeed, totalGameTimeS, aircrafts, radars, economicSettings, createRandomAircraft]);

  useEffect(() => {
    if (apiKey && showWelcomeModal) {
      // Initialize with 50 aircraft when the game can start
      const initialAircraft = Array.from({ length: 50 }, createRandomAircraft).filter(Boolean) as Aircraft[];
      setAircrafts(initialAircraft);
    }
  }, [apiKey, showWelcomeModal, createRandomAircraft]);


  useEffect(() => {
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameLoop]);

  // Handlers
  const handleSetApiKey = (key: string) => {
    localStorage.setItem('googleMapsApiKey', key);
    setApiKey(key);
    setShowWelcomeModal(true);
  };
  
  const handleStartGame = () => setShowWelcomeModal(false);
  const handleTogglePause = () => setIsPaused(p => !p);
  const handleSpeedChange = (speed: number) => setSimulationSpeed(speed);

  const handleSelectAircraft = (id: string) => {
    setSelectedRadarId(null);
    setSelectedAircraftId(id);
  };

  const handleSelectRadar = (id: string) => {
    setSelectedAircraftId(null);
    setSelectedRadarId(id);
  };
  
  const handleDeselect = () => {
    setSelectedAircraftId(null);
    setSelectedRadarId(null);
  }

  const handleMapRightClick = (point: Point) => {
    if (radars.length >= MAX_RADARS) {
      alert(`Network limit reached: You cannot build more than ${MAX_RADARS} radars.`);
      return;
    }
    if (treasury >= RADAR_DEPLOYMENT_COST) {
      setTreasury(t => t - RADAR_DEPLOYMENT_COST);
      const nearestAirport = findNearestAirport(point);
      const newRadar: Radar = {
        id: uuidv4(),
        name: `${nearestAirport.name} Station`,
        position: point,
        range: RADAR_RANGE_NM,
        isActive: true,
        timeToReactivate: 0,
        supportedIncome: 0,
      };
      setRadars(prev => [...prev, newRadar]);
    } else {
      alert("Not enough funds to build a radar.");
    }
  };

  const handleRemoveRadar = (id: string) => {
    setRadars(radars => radars.filter(r => r.id !== id));
    if (selectedRadarId === id) {
      setSelectedRadarId(null);
    }
  };
  
  const handleCenterMap = () => { /* This functionality can be added to the Map component if needed */ };


  // Memos for performance
  const selectedAircraft = useMemo(() => aircrafts.find(a => a.id === selectedAircraftId) || null, [aircrafts, selectedAircraftId]);
  const selectedRadar = useMemo(() => radars.find(r => r.id === selectedRadarId) || null, [radars, selectedRadarId]);
  const radarsTrackingAircraft = useMemo(() => {
    if (!selectedAircraft) return [];
    return radars.filter(r => r.isActive && calculateDistanceNM(r.position, selectedAircraft.position) <= r.range);
  }, [radars, selectedAircraft]);
  const aircraftVisibleByRadar = useMemo(() => {
    if (!selectedRadar || !selectedRadar.isActive) return [];
    return aircrafts.filter(a => calculateDistanceNM(selectedRadar.position, a.position) <= selectedRadar.range);
  }, [aircrafts, selectedRadar]);
  const visibleAircrafts = useMemo(() => aircrafts.filter(a => a.visibilityStatus === 'visible' || a.visibilityStatus === 'lost'), [aircrafts]);


  if (!apiKey) {
    return <ApiKeyModal onSubmit={handleSetApiKey} />;
  }

  if (showWelcomeModal) {
    return <WelcomeModal onStart={handleStartGame} />;
  }

  return (
    <div className="w-screen h-screen bg-gray-800 text-white overflow-hidden relative font-sans">
      <MapComponent
        apiKey={apiKey}
        center={{ lat: 50.11, lng: 10.5 }}
        zoom={5}
        aircrafts={visibleAircrafts}
        radars={radars}
        selectedAircraftId={selectedAircraftId}
        selectedRadarId={selectedRadarId}
        onMapRightClick={handleMapRightClick}
        onSelectAircraft={handleSelectAircraft}
        onSelectRadar={handleSelectRadar}
        onDeselect={handleDeselect}
        onRemoveRadar={handleRemoveRadar}
      />
      
      <InfoPanel
        selectedAircraft={selectedAircraft}
        selectedRadar={selectedRadar}
        radarsTrackingAircraft={radarsTrackingAircraft}
        aircraftVisibleByRadar={aircraftVisibleByRadar}
        onRemoveRadar={handleRemoveRadar}
      />

      <RadarListPanel
        radars={radars}
        selectedRadarId={selectedRadarId}
        onSelectRadar={handleSelectRadar}
        onCenterMap={handleCenterMap} // Placeholder for future centering logic
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full px-4">
        <ControlsPanel
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          simulationSpeed={simulationSpeed}
          onSpeedChange={handleSpeedChange}
          aircraftCount={aircrafts.length}
          radarCount={radars.length}
          treasury={treasury}
          netProfit={netProfit}
          economicSettings={economicSettings}
          onEconomicSettingsChange={setEconomicSettings}
        />
      </div>
    </div>
  );
};

export default App;