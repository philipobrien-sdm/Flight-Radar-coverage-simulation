import React from 'react';
import { Aircraft } from '../types';
import AircraftIcon from './icons/AircraftIcon';

interface AircraftProps {
  aircraft: Aircraft;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const AircraftComponent: React.FC<AircraftProps> = ({ aircraft, isSelected, onSelect }) => {
  let color = 'text-yellow-400';
  if (isSelected) {
    color = 'text-cyan-300';
  } else if (aircraft.visibilityStatus === 'lost') {
    color = 'text-red-500';
  }
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(aircraft.id);
  }

  return (
    <div
      className="relative group cursor-pointer"
      onClick={handleClick}
    >
      <AircraftIcon className={`w-5 h-5 ${color} transition-colors duration-300`} 
        style={{ 
          transform: `rotate(${aircraft.heading || 0}deg)`,
          filter: isSelected ? `drop-shadow(0 0 5px #06b6d4)` : 'none'
        }}
      />
    </div>
  );
};

export default AircraftComponent;