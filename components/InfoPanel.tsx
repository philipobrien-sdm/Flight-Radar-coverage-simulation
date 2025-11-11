import React from 'react';
import { Aircraft, Radar } from '../types';

interface InfoPanelProps {
  selectedAircraft: Aircraft | null;
  selectedRadar: Radar | null;
  radarsTrackingAircraft: Radar[];
  aircraftVisibleByRadar: Aircraft[];
  onToggleRadarStatus: (id: string) => void;
  totalSimulatedTimeHours: number;
  onOpenAboutModal: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenRadarScope: (id: string) => void;
}

const formatRemainingTime = (hours: number): string => {
  if (hours <= 0) return "now...";
  const totalMinutes = Math.floor(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
};

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  selectedAircraft, 
  selectedRadar,
  radarsTrackingAircraft,
  aircraftVisibleByRadar,
  onToggleRadarStatus,
  totalSimulatedTimeHours,
  onOpenAboutModal,
  isExpanded,
  onToggleExpand,
  onOpenRadarScope,
}) => {
  if (!isExpanded) {
    return (
      <div className="absolute top-4 left-4 z-10 font-sans">
        <button 
          onClick={onToggleExpand}
          className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-lg p-2 text-gray-300 hover:bg-gray-800/80"
          aria-label="Expand Info Panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    );
  }

  const content = () => {
    if (!selectedAircraft && !selectedRadar) {
      return (
        <>
          <p className="font-semibold text-gray-300">No Target Selected</p>
          <p>Click an aircraft or radar to view details. Use the control panel to reset the simulation or run an analysis.</p>
          <p className="mt-4 text-xs text-gray-500 italic">For the best experience, run this application in fullscreen.</p>
        </>
      );
    }

    if (selectedAircraft) {
      return (
        <>
          <h2 className="text-lg font-bold text-cyan-400 mb-2 border-b border-gray-700 pb-1">Aircraft Details</h2>
          <div className="space-y-1">
            <p><strong>Flight:</strong> {selectedAircraft.flightNumber}</p>
            <p><strong>Origin:</strong> {selectedAircraft.origin}</p>
            <p><strong>Destination:</strong> {selectedAircraft.destination}</p>
            <p><strong>Altitude:</strong> {selectedAircraft.altitude.toLocaleString()} ft</p>
            <p><strong>Speed:</strong> {Math.round(selectedAircraft.speed)} kts</p>
            <div className="pt-2">
              <h3 className="font-semibold text-gray-200">Tracked By:</h3>
              {radarsTrackingAircraft.length > 0 ? (
                <ul className="list-disc list-inside text-gray-400 max-h-24 overflow-y-auto">
                  {radarsTrackingAircraft.map(r => <li key={r.id}>{r.name}</li>)}
                </ul>
              ) : <p className="text-gray-500">No radars in range.</p>}
            </div>
          </div>
        </>
      );
    }
    
    if (selectedRadar) {
      const buttonClass = selectedRadar.isActive
        ? "bg-yellow-600 hover:bg-yellow-500/90"
        : "bg-green-600 hover:bg-green-500/90";

      return (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-cyan-400 mb-2 border-b border-gray-700 pb-1 flex-grow">Radar Details</h2>
            {selectedRadar.isActive && (
              <button 
                onClick={() => onOpenRadarScope(selectedRadar.id)}
                className="ml-2 mb-2 p-1 text-gray-400 hover:text-white transition-colors"
                title="Open Radar Scope"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
          </div>
          <div className="space-y-1">
            <p><strong>Station:</strong> {selectedRadar.name}</p>
            <div className="flex items-baseline space-x-2">
              <p>
                <strong>Status:</strong>{' '}
                {selectedRadar.isActive 
                  ? <span className="text-green-400 font-semibold">Active</span> 
                  : <span className="text-red-400 font-semibold">Offline</span>}
              </p>
              {!selectedRadar.isActive && selectedRadar.reactivationTime && (
                <p className="text-xs text-yellow-400">
                  (Restoring in: {formatRemainingTime(selectedRadar.reactivationTime - totalSimulatedTimeHours)})
                </p>
              )}
            </div>
            <p><strong>Range:</strong> {selectedRadar.range.toLocaleString()} NM</p>
            <div className="pt-2">
              <h3 className="font-semibold text-gray-200">Visible Aircraft ({aircraftVisibleByRadar.length}):</h3>
              {aircraftVisibleByRadar.length > 0 ? (
                <ul className="text-gray-400 max-h-32 overflow-y-auto text-xs space-y-1">
                  {aircraftVisibleByRadar.map(ac => <li key={ac.id} className="bg-gray-800/50 p-1 rounded-sm">{ac.flightNumber} - {ac.altitude.toLocaleString()}ft</li>)}
                </ul>
              ) : <p className="text-gray-500">{selectedRadar.isActive ? 'No aircraft in range.' : 'Radar is offline.'}</p>}
            </div>
            <div className="pt-3 mt-3 border-t border-gray-700/50">
              <button
                onClick={() => onToggleRadarStatus(selectedRadar.id)}
                className={`w-full text-white font-bold py-2 px-4 rounded transition-colors duration-200 ${buttonClass}`}
              >
                {selectedRadar.isActive ? 'Take Offline' : 'Bring Online'}
              </button>
            </div>
          </div>
        </>
      );
    }
    return null;
  }

  return (
    <div className="absolute top-4 left-4 w-72 bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-sm text-gray-300 font-sans z-10">
      <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
          <h2 className="text-lg font-bold text-cyan-400">Info Panel</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAboutModal}
              className="text-gray-400 hover:text-white transition-colors"
              title="About this tool"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
            <button onClick={onToggleExpand} className="text-gray-500 hover:text-gray-300 text-2xl leading-none" aria-label="Collapse Info Panel">&times;</button>
          </div>
        </div>
      {content()}
    </div>
  );
};

export default InfoPanel;
