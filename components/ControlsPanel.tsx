import React, { useState } from 'react';

interface EconomicSettings {
  radarCost: number;
  visibleIncome: number;
  unseenPenalty: number;
}
interface ControlsPanelProps {
  isPaused: boolean;
  onTogglePause: () => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  aircraftCount: number;
  radarCount: number;
  treasury: number;
  netProfit: number;
  economicSettings: EconomicSettings;
  onEconomicSettingsChange: (settings: EconomicSettings) => void;
}

const speedOptions = [1, 5, 10, 20, 50];

const HelpModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-lg text-gray-300 relative" onClick={e => e.stopPropagation()}>
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-200 transition-colors"
        aria-label="Close help modal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 className="text-xl font-bold text-cyan-400 mb-4">How to Play</h2>
      <div className="space-y-3 text-gray-400">
        <p><strong>Objective:</strong> Build a profitable radar network to monitor European airspace.</p>
        <div>
          <h3 className="font-semibold text-gray-300">Controls:</h3>
          <ul className="list-disc list-inside ml-2">
            <li><strong className="text-cyan-400">Right-Click Map:</strong> Place a new radar station for <strong className="text-red-400">€50</strong>.</li>
            <li><strong className="text-cyan-400">Right-Click Radar:</strong> Decommission an existing radar.</li>
            <li><strong className="text-cyan-400">Left-Click Entities:</strong> Select a radar or aircraft to view details.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-300">Economy:</h3>
          <ul className="list-disc list-inside ml-2">
            <li>You start with <strong className="text-green-400">€1,000</strong>.</li>
            <li>Earn income for each aircraft your network can see.</li>
            <li>Incur costs for each active radar and for each aircraft you <span className="text-red-400">cannot</span> see.</li>
            <li><strong className="text-yellow-400">Note:</strong> Each radar built after the 10th increases the hourly running cost of <strong className="text-red-400">all</strong> radars by €0.50.</li>
          </ul>
        </div>
        <p>Adjust the economic settings below to change the difficulty. Your treasury must not fall below zero!</p>
      </div>
    </div>
  </div>
);


const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isPaused,
  onTogglePause,
  simulationSpeed,
  onSpeedChange,
  aircraftCount,
  radarCount,
  treasury,
  netProfit,
  economicSettings,
  onEconomicSettingsChange
}) => {
  const [showHelp, setShowHelp] = useState(false);
  
  const handleSettingChange = (field: keyof EconomicSettings, value: string) => {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
          onEconomicSettingsChange({ ...economicSettings, [field]: numValue });
      }
  }

  return (
    <>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <div className="w-full max-w-4xl bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 text-gray-300 grid grid-cols-3 gap-4">
        {/* Left: Sim Controls */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <button onClick={onTogglePause} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold transition-colors duration-300 w-24">
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={() => setShowHelp(true)} className="w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold transition-colors duration-200 bg-gray-700 hover:bg-gray-600 text-cyan-400">
              ?
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Speed:</span>
            {speedOptions.map((speed) => (
              <button key={speed} onClick={() => onSpeedChange(speed)} className={`w-8 h-8 rounded-full text-xs font-bold transition-colors duration-200 ${simulationSpeed === speed ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Economy Stats */}
        <div className="text-center border-x border-gray-700 px-4">
            <h3 className="text-sm font-semibold text-gray-400">Network Economy</h3>
            <p className="text-2xl font-bold">€{treasury.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className={`text-sm font-semibold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netProfit >= 0 ? '+' : ''}€{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / hr
            </p>
            <div className="flex justify-around text-xs mt-1 text-gray-400">
              <span><strong className="text-gray-200">{aircraftCount}</strong> Aircraft</span>
              <span><strong className="text-gray-200">{radarCount}</strong> Radars</span>
            </div>
        </div>
        
        {/* Right: Economy Settings */}
        <div className="text-sm space-y-1">
            <h3 className="text-sm font-semibold text-gray-400 text-center">Economic Settings (€/hr)</h3>
            <div className="flex items-center justify-between">
                <label htmlFor="visibleIncome" className="text-green-400">Visible Income:</label>
                <input type="number" step="0.1" id="visibleIncome" value={economicSettings.visibleIncome} onChange={e => handleSettingChange('visibleIncome', e.target.value)} className="w-16 bg-gray-800 text-right rounded-sm p-0.5 border border-gray-600" />
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="radarCost" className="text-red-400">Base Radar Cost:</label>
                <input type="number" id="radarCost" value={economicSettings.radarCost} onChange={e => handleSettingChange('radarCost', e.target.value)} className="w-16 bg-gray-800 text-right rounded-sm p-0.5 border border-gray-600" />
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="unseenPenalty" className="text-red-400">Unseen Penalty:</label>
                {/* FIX: Corrected typo from `e.targe` to `e.target` and completed the input element. */}
                <input type="number" id="unseenPenalty" value={economicSettings.unseenPenalty} onChange={e => handleSettingChange('unseenPenalty', e.target.value)} className="w-16 bg-gray-800 text-right rounded-sm p-0.5 border border-gray-600" />
            </div>
        </div>
      </div>
    </>
  );
};

// FIX: Added missing default export.
export default ControlsPanel;