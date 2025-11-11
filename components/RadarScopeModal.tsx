import React from 'react';
import { Aircraft, Radar } from '../types';
import { calculateBearing, calculateDistanceNM } from '../utils';

interface RadarScopeModalProps {
  radar: Radar;
  visibleAircraft: Aircraft[];
  onClose: () => void;
}

const SCOPE_SIZE = 500; // px

const RadarScopeModal: React.FC<RadarScopeModalProps> = ({ radar, visibleAircraft, onClose }) => {

  const aircraftBlips = visibleAircraft.map(aircraft => {
    const bearing = calculateBearing(radar.position, aircraft.position);
    const distance = calculateDistanceNM(radar.position, aircraft.position);
    
    // Normalize distance to a 0-1 scale based on radar range
    const normalizedDistance = Math.min(distance / radar.range, 1);
    
    // Convert polar coordinates (bearing, distance) to Cartesian (x, y)
    // The scope radius is half the size. We use 45% to keep blips inside the outer ring.
    const radius = normalizedDistance * (SCOPE_SIZE * 0.45);
    // Adjust bearing by -90 degrees because 0 degrees in CSS is to the right, not up.
    const angleRad = (bearing - 90) * (Math.PI / 180);
    
    const x = radius * Math.cos(angleRad);
    const y = radius * Math.sin(angleRad);

    return {
      id: aircraft.id,
      flightNumber: aircraft.flightNumber,
      style: {
        transform: `translate(${x}px, ${y}px)`,
      },
    };
  });
  
  const rangeRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center font-sans z-50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-gray-900 border-2 border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 p-6 text-gray-300 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-100">Radar Scope: <span className="text-cyan-400">{radar.name}</span></h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-3xl leading-none">&times;</button>
        </div>
        
        <div className="flex justify-center items-center p-4">
          <div 
            className="relative bg-black rounded-full"
            style={{ width: SCOPE_SIZE, height: SCOPE_SIZE }}
          >
            {/* Background Grid and Rings */}
            <div className="absolute inset-0 border-2 border-green-500/30 rounded-full" />
            <div className="absolute top-1/2 left-0 w-full h-px bg-green-500/20" />
            <div className="absolute top-0 left-1/2 h-full w-px bg-green-500/20" />
            {rangeRings.map(r => (
              <div 
                key={r}
                className="absolute top-1/2 left-1/2 border border-dashed border-green-500/20 rounded-full"
                style={{
                  width: `${r * 90}%`,
                  height: `${r * 90}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                 <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-green-500/50">
                    {Math.round(radar.range * (r/1.0 * 0.9 / 2) * 2)} NM
                </span>
              </div>
            ))}
            
            {/* Center point */}
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2" />

            {/* Aircraft Blips */}
            <div className="absolute top-1/2 left-1/2">
                {aircraftBlips.map(blip => (
                    <div key={blip.id} className="absolute group" style={blip.style}>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-900/80 text-cyan-300 text-[10px] px-1 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {blip.flightNumber}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarScopeModal;
