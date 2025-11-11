import React from 'react';

interface WelcomeModalProps {
  onStart: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center font-sans">
        <div className="w-full max-w-3xl mx-auto bg-gray-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 p-8 text-left">
            <h1 className="text-3xl font-bold text-center text-gray-100 mb-4">Radar Network Analysis Tool</h1>
            <p className="text-gray-400 mb-6 text-center leading-relaxed">
                This is a tool for analyzing the robustness of a radar network. Simulate a year of air traffic to identify coverage gaps based on the current radar configuration.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="bg-gray-900/50 p-4 rounded-md space-y-4">
                    <h2 className="text-lg font-semibold text-cyan-400 border-b border-cyan-400/20 pb-1">How It Works</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li>The simulation starts by loading a predefined set of radar sites across Europe.</li>
                        <li>You can view details for any radar by clicking on it.</li>
                        <li>The main goal is to test the network's resilience to outages.</li>
                    </ul>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-md space-y-4">
                    <h2 className="text-lg font-semibold text-cyan-400 border-b border-cyan-400/20 pb-1">Running an Analysis</h2>
                     <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li><strong>Simulate Outages:</strong> Manually turn radars on or off by right-clicking their map icon or using the controls in the radar list.</li>
                        <li><strong>Run Simulation:</strong> Click the "Run 1-Year Simulation" button. This will quickly process ~20,000 flights against your current active radar network.</li>
                        <li><strong>Analyze Results:</strong> A report will show how many flights were cancelled (due to uncovered airports) and how many times an aircraft was lost from radar tracking mid-flight.</li>
                    </ul>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onStart}
                    className="w-1/2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white text-lg font-bold transition-colors duration-300"
                >
                    Start Analysis
                </button>
            </div>
        </div>
    </div>
  );
};

export default WelcomeModal;
