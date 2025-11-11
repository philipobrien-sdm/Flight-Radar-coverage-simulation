import React from 'react';

interface ControlsPanelProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onLoadRadars: () => void;
  onRandomizeRadars: () => void;
  onRunMonthSimulation: () => void;
  onRunYearSimulation: () => void;
  onGenerateLiveReport: () => void;
  onFindRedundantRadars: () => void;
  onOpenCostModal: () => void;
  isSimulating: boolean;
  isFindingRedundancy: boolean;
  radarCount: number;
  activeRadarCount: number;
  simulationSpeed: number;
  onSimulationSpeedChange: (speed: number) => void;
  trackedAircraftCount: number;
  untrackedAircraftCount: number;
  uncoveredAirportsCount: number;
  simulatedTimeOfDay: number;
  totalSimulatedTimeHours: number;
  liveProfitLoss: number;
  simulationProgress: number;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isPaused,
  onTogglePause,
  onLoadRadars,
  onRandomizeRadars,
  onRunMonthSimulation,
  onRunYearSimulation,
  onGenerateLiveReport,
  onFindRedundantRadars,
  onOpenCostModal,
  isSimulating,
  isFindingRedundancy,
  radarCount,
  activeRadarCount,
  simulationSpeed,
  onSimulationSpeedChange,
  trackedAircraftCount,
  untrackedAircraftCount,
  uncoveredAirportsCount,
  simulatedTimeOfDay,
  totalSimulatedTimeHours,
  liveProfitLoss,
  simulationProgress,
}) => {
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} UTC`;
  };

  const formatTotalTime = (totalHours: number) => {
    const days = Math.floor(totalHours / 24);
    const hours = Math.floor(totalHours % 24);
    return `${days}d ${hours}h`;
  };


  return (
    <div className="w-full max-w-7xl mx-auto bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 text-gray-300 flex items-center justify-between">
      {/* Left: Sim Visualization Controls */}
      <div className="flex items-center space-x-3">
        <button onClick={onTogglePause} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold transition-colors duration-300 w-28 flex-shrink-0">
          {isPaused ? 'Resume View' : 'Pause View'}
        </button>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="speed-slider" className="text-sm font-semibold text-gray-200 whitespace-nowrap">View Speed:</label>
          <input 
            id="speed-slider"
            type="range" 
            min="1" 
            max="300" 
            step="1"
            value={simulationSpeed} 
            onChange={(e) => onSimulationSpeedChange(Number(e.target.value))}
            className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            aria-label="Simulation speed"
          />
          <span className="text-sm text-cyan-400 font-mono w-24 text-left">
            1s = {simulationSpeed >= 60 ? `${(simulationSpeed / 60).toFixed(1)} min` : `${simulationSpeed} sec`}
          </span>
        </div>
        
        <div className="text-center border-l border-gray-700 pl-3">
          <h3 className="text-xs font-semibold text-gray-400">Sim Time</h3>
          <p className="text-md font-mono text-cyan-400">
            {formatTime(simulatedTimeOfDay)}
          </p>
        </div>
        
        <div className="text-center border-l border-gray-700 pl-3">
          <h3 className="text-xs font-semibold text-gray-400">Elapsed</h3>
          <p className="text-md font-mono text-cyan-400">
            {formatTotalTime(totalSimulatedTimeHours)}
          </p>
        </div>

        <div className="text-center border-l border-gray-700 pl-3">
          <h3 className="text-xs font-semibold text-gray-400">Radars</h3>
          <p className="text-sm">
            <strong className="text-green-400">{activeRadarCount}</strong> / {radarCount}
          </p>
        </div>
        <div className="text-center border-l border-gray-700 pl-3 flex flex-col">
          <h3 className="text-xs font-semibold text-gray-400">Live Traffic</h3>
          <p className="text-xs text-gray-400 flex space-x-2">
            <span>Tracked: <strong className="text-green-400">{trackedAircraftCount}</strong></span>
            <span>Lost: <strong className="text-red-400">{untrackedAircraftCount}</strong></span>
            <span>Uncovered APs: <strong className="text-yellow-400">{uncoveredAirportsCount}</strong></span>
          </p>
        </div>
         <div className="text-center border-l border-gray-700 pl-3">
          <h3 className="text-xs font-semibold text-gray-400">Live P&L</h3>
          <p className={`text-md font-mono ${liveProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {liveProfitLoss >= 0 ? '+' : '-'}&euro;{Math.abs(Math.round(liveProfitLoss / 1000))}k
          </p>
        </div>
      </div>


      {/* Right: Simulation Actions */}
      <div className="flex items-center space-x-2">
         <button 
          onClick={onOpenCostModal} 
          className="p-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-bold transition-colors duration-300 disabled:bg-gray-800 disabled:cursor-not-allowed"
          disabled={isSimulating || isFindingRedundancy}
          title="Configure simulation costs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={onLoadRadars} 
          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-bold transition-colors duration-300 disabled:bg-gray-800 disabled:cursor-not-allowed"
          disabled={isSimulating || isFindingRedundancy}
        >
          Reset
        </button>
        <button 
          onClick={onRandomizeRadars} 
          className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md text-white font-bold transition-colors duration-300 disabled:bg-yellow-800 disabled:cursor-not-allowed"
          disabled={isSimulating || radarCount === 0 || isFindingRedundancy}
          title="Turn half of the radars off randomly"
        >
          50% Outage
        </button>
        <button 
          onClick={onFindRedundantRadars} 
          className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-white font-bold transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-wait text-xs"
          disabled={isSimulating || isFindingRedundancy}
          title="Run a 1-week analysis to find the 20% most redundant radars"
        >
          {isFindingRedundancy ? 'Analyzing...' : 'Find Redundant Radars'}
        </button>
        <button 
          onClick={onRunMonthSimulation} 
          className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded-md text-white font-bold transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-wait text-xs"
          disabled={isSimulating || isFindingRedundancy}
        >
          {isSimulating ? `Simulating... (${simulationProgress}%)` : 'Run 1-Month Analysis'}
        </button>
         <button 
          onClick={onRunYearSimulation} 
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-bold transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-wait text-xs"
          disabled={isSimulating || isFindingRedundancy}
        >
          {isSimulating ? `Simulating... (${simulationProgress}%)` : 'Run 1-Year Analysis'}
        </button>
      </div>
    </div>
  );
};

export default ControlsPanel;