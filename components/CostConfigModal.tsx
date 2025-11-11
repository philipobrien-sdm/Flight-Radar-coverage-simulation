import React, { useState, useEffect } from 'react';
import { FinancialConfig } from '../App';

interface CostConfigModalProps {
  config: FinancialConfig;
  onSave: (newConfig: FinancialConfig) => void;
  onClose: () => void;
}

const CostConfigModal: React.FC<CostConfigModalProps> = ({ config, onSave, onClose }) => {
  const [currentConfig, setCurrentConfig] = useState<FinancialConfig>(config);

  useEffect(() => {
    setCurrentConfig(config);
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentConfig(prev => ({
      ...prev,
      [name]: Number(value) || 0,
    }));
  };

  const handleSave = () => {
    onSave(currentConfig);
  };

  const CostInput: React.FC<{ label: string; name: keyof FinancialConfig; value: number }> = ({ label, name, value }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">&euro;</span>
        <input
          type="number"
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full bg-gray-900/80 border border-gray-600 rounded-md shadow-sm py-2 pl-7 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
    </div>
  );


  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-sans z-50">
      <div className="w-full max-w-md bg-gray-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 p-8 text-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-100">Financial Settings</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-3xl leading-none">&times;</button>
        </div>
        
        <p className="text-gray-400 mb-6 text-sm">
            Adjust the cost and revenue variables for the simulation. Changes will apply to both the live view and the 1-Year Analysis.
        </p>

        <div className="space-y-4">
            <CostInput label="Radar Cost Per Year" name="radarCostPerYear" value={currentConfig.radarCostPerYear} />
            <CostInput label="Revenue Per Flight" name="flightRevenue" value={currentConfig.flightRevenue} />
            <CostInput label="Cost Per Cancelled Flight" name="cancellationCost" value={currentConfig.cancellationCost} />
            <CostInput label="Cost Per Minute of Lost Tracking" name="lostTrackingCostPerMinute" value={currentConfig.lostTrackingCostPerMinute} />
        </div>

        <div className="mt-8 flex justify-end items-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-bold transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold transition-colors duration-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CostConfigModal;
