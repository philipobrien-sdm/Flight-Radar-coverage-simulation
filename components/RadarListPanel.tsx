import React, { useState } from 'react';
import { Radar } from '../types';

interface RadarListPanelProps {
  radars: Radar[];
  selectedRadarId: string | null;
  onSelectRadar: (id: string) => void;
  onCenterMap: (position: { lat: number, lng: number }) => void; // Placeholder
}

const RadarListPanel: React.FC<RadarListPanelProps> = ({ radars, selectedRadarId, onSelectRadar, onCenterMap }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isExpanded) {
    return (
      <div className="absolute top-4 right-4 z-10 font-sans">
        <button 
          onClick={() => setIsExpanded(true)}
          className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-lg p-2 text-gray-300 hover:bg-gray-800/80"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 w-72 bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-gray-400 text-sm font-sans z-10">
      <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
        <h2 className="text-lg font-bold text-cyan-400">
          Radar Network ({radars.length})
        </h2>
        <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-gray-300">&times;</button>
      </div>
      {radars.length === 0 ? (
        <p className="text-gray-500">No radars deployed. Right-click the map to place a new radar.</p>
      ) : (
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {radars.map(radar => (
            <li
              key={radar.id}
              onClick={() => onSelectRadar(radar.id)}
              className={`p-2 rounded-md cursor-pointer transition-colors duration-200 ${
                selectedRadarId === radar.id 
                  ? 'bg-cyan-500/30 border border-cyan-400' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-200">{radar.name}</span>
                {radar.isActive ? (
                  <span className="text-xs font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">ACTIVE</span>
                ) : (
                  <span className="text-xs font-bold text-red-400 bg-red-900/50 px-2 py-0.5 rounded-full">OFFLINE</span>
                )}
              </div>
              {!radar.isActive && (
                <div className="text-xs text-yellow-500 mt-1">
                  Repairing... ({Math.ceil(radar.timeToReactivate)}s left)
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RadarListPanel;