import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSubmit(key.trim());
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center font-sans">
      <div className="w-full max-w-md mx-auto bg-gray-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-200 mb-4">Google Maps API Key Required</h1>
        <p className="text-gray-400 mb-6">
          Please enter your Google Maps API key to begin the simulation.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your API key here"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            aria-label="Google Maps API Key"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={!key.trim()}
          >
            Start Simulation
          </button>
        </form>
        <div className="mt-6 text-sm">
          <p className="text-gray-500">
            Don't have a key?
            <a
              href="https://console.cloud.google.com/google/maps-apis/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline ml-1"
            >
              Get one here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;