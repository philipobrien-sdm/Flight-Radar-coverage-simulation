import React from 'react';
import { Aircraft, Radar } from '../types';

interface InfoPanelProps {
  selectedAircraft: Aircraft | null;
  selectedRadar: Radar | null;
  radarsTrackingAircraft: Radar[];
  aircraftVisibleByRadar: Aircraft[];
  onRemoveRadar: (id: string) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  selectedAircraft, 
  selectedRadar,
  radarsTrackingAircraft,
  aircraftVisibleByRadar,
  onRemoveRadar,
}) => {
  const content = () => {
    if (!selectedAircraft && !selectedRadar) {
      return (
        <>
          <p className="font-semibold text-gray-300">No Target Selected</p>
          <p>Click on an aircraft or radar to view details. Right-click the map to place a radar.</p>
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
      return (
        <>
          <h2 className="text-lg font-bold text-cyan-400 mb-2 border-b border-gray-700 pb-1">Radar Details</h2>
          <div className="space-y-1">
            <p><strong>Station:</strong> {selectedRadar.name}</p>
            <p>
              <strong>Status:</strong>{' '}
              {selectedRadar.isActive 
                ? <span className="text-green-400 font-semibold">Active</span> 
                : <span className="text-red-400 font-semibold">Offline</span>}
            </p>
            {!selectedRadar.isActive && (
              <p><strong>Time to Repair:</strong> {Math.ceil(selectedRadar.timeToReactivate).toLocaleString()} s</p>
            )}
            <p><strong>Range:</strong> {selectedRadar.range.toLocaleString()} NM</p>
            <p><strong>Supported Income:</strong> 
              <span className="text-green-400"> €{selectedRadar.supportedIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / hr</span>
            </p>
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
                onClick={() => onRemoveRadar(selectedRadar.id)}
                className="w-full bg-red-600 hover:bg-red-500/90 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                Decommission Radar
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
      {content()}
    </div>
  );
};

export default InfoPanel;