import React, { useState } from 'react';
import { Radar } from '../types';

interface RadarListPanelProps {
  radars: Radar[];
  selectedRadarId: string | null;
  onSelectRadar: (id: string) => void;
  onToggleRadarStatus: (id: string) => void;
}

const RadarListPanel: React.FC<RadarListPanelProps> = ({ radars, selectedRadarId, onSelectRadar, onToggleRadarStatus }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const handleToggleClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onToggleRadarStatus(id);
  }

  if (!isExpanded) {
    return (
      <div className="absolute top-4 right-4 z-10 font-sans">
        <button 
          onClick={() => setIsExpanded(true)}
          className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-lg p-2 text-gray-300 hover:bg-gray-800/80"
          aria-label="Expand Radar List"
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
        <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-gray-300 text-2xl leading-none" aria-label="Collapse Radar List">&times;</button>
      </div>
      {radars.length === 0 ? (
        <p className="text-gray-500">No radars loaded. Use the control panel to load a radar set.</p>
      ) : (
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {radars.map(radar => (
            <li
              key={radar.id}
              onClick={() => onSelectRadar(radar.id)}
              className={`p-2 rounded-md cursor-pointer transition-colors duration-200 flex justify-between items-center ${
                selectedRadarId === radar.id 
                  ? 'bg-cyan-500/30 border border-cyan-400' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <div>
                <span className="font-semibold text-gray-200">{radar.name}</span>
                 <div className={`text-xs font-bold ${radar.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {radar.isActive ? 'ONLINE' : 'OFFLINE'}
                 </div>
              </div>
              <button 
                onClick={(e) => handleToggleClick(e, radar.id)} 
                title={radar.isActive ? "Take Offline" : "Bring Online"}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${radar.isActive ? 'text-green-400 hover:bg-gray-700' : 'text-red-400 hover:bg-gray-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RadarListPanel;
