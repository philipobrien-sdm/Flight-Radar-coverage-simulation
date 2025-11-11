import React from 'react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-sans z-50">
      <div className="w-full max-w-3xl bg-gray-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 p-8 text-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-100">About the Radar Network Analysis Tool</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-3xl leading-none">&times;</button>
        </div>
        
        <p className="text-gray-400 mb-6 leading-relaxed">
            This application is a strategic simulation tool designed for analyzing the robustness and financial viability of an airspace monitoring radar network. It allows you to explore how network configurations and outages impact air traffic safety and operational costs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm max-h-[50vh] overflow-y-auto pr-4">
            <div className="bg-gray-900/50 p-4 rounded-md space-y-3">
                <h2 className="text-lg font-semibold text-cyan-400 border-b border-cyan-400/20 pb-1">Key Simulation Concepts</h2>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li><strong>Live View:</strong> Observe a dynamic visualization of air traffic. Manually toggle radar stations to see immediate effects on coverage and the live Profit &amp; Loss metric.</li>
                    <li><strong>1-Month & 1-Year Analysis:</strong> Run high-speed simulations for different timeframes to generate detailed reports on key performance and financial indicators.</li>
                    <li><strong>Financial Modeling:</strong> Use the Settings (gear icon) to configure economic variables like radar costs, flight revenue, and cancellation penalties to tailor the simulation to your business case.</li>
                    <li><strong>Strategic Analysis:</strong> The final report includes a "Redundancy Analysis" to find cost-saving opportunities and an "Inactive Radar Analysis" that runs a what-if scenario on the financial impact of offline assets.</li>
                </ul>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-md space-y-3">
                <h2 className="text-lg font-semibold text-cyan-400 border-b border-cyan-400/20 pb-1">How to Use</h2>
                 <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li><strong>1. Configure:</strong> Click the "Settings" (gear icon) on the control panel to set your financial parameters.</li>
                    <li><strong>2. Experiment:</strong> Manually turn radars on or off by right-clicking them on the map or using the list panel. Use the "50% Outage" button for a random stress test.</li>
                    <li><strong>3. Analyze:</strong> Run the "1-Month" or "1-Year Analysis" for a comprehensive report. Use the "Find Redundant Radars" tool for cost-saving insights.</li>
                    <li><strong>4. Review:</strong> The analysis report provides a detailed breakdown of finances, operational failures, and strategic opportunities.</li>
                </ul>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-md space-y-3 md:col-span-2">
                <h2 className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-1">Disclaimer</h2>
                <p className="text-gray-400">This is a strategic modeling tool, not a real-time air traffic control system. Flight paths are simplified (great-circle routes) for performance and do not represent official airways.</p>
            </div>
        </div>

        <div className="mt-8 text-center">
            <button
                onClick={onClose}
                className="px-8 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold transition-colors duration-300"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;