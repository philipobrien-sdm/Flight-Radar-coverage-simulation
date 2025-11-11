import React from 'react';
import { Radar } from '../types';

interface RedundantRadarsModalProps {
  radarIds: string[];
  allRadars: Radar[];
  onDeactivate: (ids: string[]) => void;
  onClose: () => void;
}

const RedundantRadarsModal: React.FC<RedundantRadarsModalProps> = ({ radarIds, allRadars, onDeactivate, onClose }) => {
  const redundantRadars = radarIds.map(id => allRadars.find(r => r.id === id)).filter(Boolean) as Radar[];
  const radarCount = redundantRadars.length;

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-sans z-50">
      <div className="w-full max-w-2xl bg-gray-800 border-2 border-purple-500/30 rounded-lg shadow-2xl shadow-purple-500/10 p-8 text-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-100">Redundancy Analysis Complete</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-3xl leading-none">&times;</button>
        </div>
        
        <p className="text-gray-400 mb-4">
          The following {radarCount} radars (top 20% of active) were least likely to be the sole provider of coverage during a 1-week simulation. Deactivating them may offer significant cost savings with minimal impact on network integrity.
        </p>

        <div className="bg-gray-900/50 p-4 rounded-md max-h-60 overflow-y-auto mb-6">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {redundantRadars.map(radar => (
              <li key={radar.id} className="truncate" title={radar.name}>
                <span className="text-purple-400">&#8227;</span> {radar.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex justify-center items-center space-x-4">
          <button
            onClick={() => onDeactivate(radarIds)}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md text-white font-bold transition-colors duration-300"
          >
            Deactivate {radarCount} Radars
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-bold transition-colors duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedundantRadarsModal;