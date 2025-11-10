import React from 'react';

interface WelcomeModalProps {
  onStart: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center font-sans">
        <div className="w-full max-w-2xl mx-auto bg-gray-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">Welcome to Radar Control</h1>
        <p className="text-gray-400 mb-6 leading-relaxed">
            You are in charge of European Airspace Monitoring. Your mission is to establish and manage a network of radar stations to track all commercial flights.
            Buy and place radars, earn money for tracked flights, and ensure no aircraft goes unseen.
        </p>
        <div className="text-left bg-gray-900/50 p-4 rounded-md mb-6 space-y-2">
            <h2 className="text-lg font-semibold text-cyan-400">Quick Start Guide:</h2>
            <ul className="list-disc list-inside text-gray-300">
                <li><strong>The game starts paused.</strong> Use this time to place your first radars!</li>
                <li><strong>Right-click</strong> on the map to place a new radar for <strong>€50</strong>.</li>
                <li><strong>Left-click</strong> on aircraft or radars to see detailed information.</li>
                <li>Monitor your treasury. Don't go bankrupt!</li>
                <li>Use the controls at the bottom to <strong>Resume</strong> or speed up the simulation.</li>
            </ul>
        </div>
        <button
            onClick={onStart}
            className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white text-lg font-bold transition-colors duration-300"
        >
            Begin Operation
        </button>
        </div>
    </div>
  );
};

export default WelcomeModal;