import React from 'react';
import { Airport } from '../types';

interface AirportComponentProps {
  airport: Airport;
}

const AirportComponent: React.FC<AirportComponentProps> = ({ airport }) => {
  const color = airport.isCovered ? 'text-green-400' : 'text-red-500';

  return (
    <div className="relative group flex flex-col items-center">
      <div className={`w-2 h-2 rounded-full border ${airport.isCovered ? 'bg-green-500/50 border-green-400' : 'bg-red-500/50 border-red-400'}`}></div>
      <div className={`mt-1 text-xs font-bold ${color} opacity-80 group-hover:opacity-100`}>
        {airport.code}
      </div>
    </div>
  );
};

export default AirportComponent;
