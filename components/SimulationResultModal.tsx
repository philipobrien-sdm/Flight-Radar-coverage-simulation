// FIX: Implement the SimulationResultModal component.
import React from 'react';
import { SimulationResult } from '../types';

const generateReportHTML = (result: SimulationResult): string => {
  const {
    totalFlights, totalDays, cancelledFlights, totalFlightsWithLostTracking, lostFlightMinutes,
    cancellationSources, maintenanceImpact, problematicRoutes, redundancyAnalysis,
    totalRevenue, totalOperationalCost, totalCancellationCost, totalLostTrackingCost, netProfitLoss,
    inactiveRadarAnalysis,
  } = result;

  const cancellationRate = totalFlights > 0 ? (cancelledFlights / totalFlights) * 100 : 0;
  const lostTrackingRate = totalFlights > 0 ? (totalFlightsWithLostTracking / (totalFlights - cancelledFlights)) * 100 : 0;
  const totalCosts = totalOperationalCost + totalCancellationCost + totalLostTrackingCost;
  
  const topCancellationSources = [...cancellationSources].sort((a, b) => b.cancellations - a.cancellations).slice(0, 10);
  const topProblematicRoutes = [...problematicRoutes].sort((a, b) => b.lostMinutes - a.lostMinutes).slice(0, 10);
  const topMaintenanceImpact = [...maintenanceImpact].sort((a, b) => b.outages - a.outages).slice(0, 10);
  const topInactiveRadars = [...inactiveRadarAnalysis].sort((a, b) => b.potentialPnlChange - a.potentialPnlChange).slice(0, 10);


  const tableRow = (cells: (string | number)[]) => `<tr>${cells.map(c => `<td style="border: 1px solid #4A5568; padding: 8px;">${typeof c === 'number' ? c.toLocaleString() : c}</td>`).join('')}</tr>`;
  const tableHeader = (cells: string[]) => `<thead><tr>${cells.map(c => `<th style="border: 1px solid #4A5568; padding: 8px; text-align: left; background-color: #2D3748;">${c}</th>`).join('')}</tr></thead>`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Radar Network Simulation Report</title>
      <style>
        body { font-family: sans-serif; background-color: #1A202C; color: #E2E8F0; margin: 2em; }
        h1, h2, h3 { color: #90CDF4; border-bottom: 1px solid #4A5568; padding-bottom: 0.25em; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 2em; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1em; margin-bottom: 2em; }
        .summary-card { background-color: #2D3748; padding: 1em; border-radius: 8px; }
        .summary-card h3 { margin-top: 0; font-size: 1em; color: #A0AEC0; }
        .summary-card p { margin: 0; font-size: 2em; font-weight: bold; color: #fff; }
      </style>
    </head>
    <body>
      <h1>Radar Network Simulation Report</h1>
      
      <h2>Financial Summary</h2>
      <div class="summary-grid">
        <div class="summary-card"><h3>Total Revenue</h3><p style="color: #68D391;">&euro;${totalRevenue.toLocaleString()}</p></div>
        <div class="summary-card"><h3>Total Costs</h3><p style="color: #FC8181;">&euro;${Math.round(totalCosts).toLocaleString()}</p></div>
        <div class="summary-card" style="grid-column: span 2;">
          <h3>Net Profit / Loss</h3>
          <p style="color: ${netProfitLoss >= 0 ? '#68D391' : '#FC8181'};">
            &euro;${Math.round(netProfitLoss).toLocaleString()}
          </p>
        </div>
      </div>
      <h3>Cost Breakdown</h3>
      <table>
        ${tableHeader(['Cost Type', 'Amount'])}
        <tbody>
          ${tableRow(['Radar Operational Costs', `&euro;${Math.round(totalOperationalCost).toLocaleString()}`])}
          ${tableRow(['Flight Cancellation Costs', `&euro;${totalCancellationCost.toLocaleString()}`])}
          ${tableRow(['Lost Tracking Costs', `&euro;${Math.round(totalLostTrackingCost).toLocaleString()}`])}
        </tbody>
      </table>
      
      <h2>Operational Summary (Simulated over ${totalDays} days)</h2>
      <div class="summary-grid">
        <div class="summary-card"><h3>Total Flights Simulated</h3><p>${totalFlights.toLocaleString()}</p></div>
        <div class="summary-card"><h3>Flights Cancelled</h3><p style="color: #F6E05E;">${cancelledFlights.toLocaleString()} (${cancellationRate.toFixed(1)}%)</p></div>
        <div class="summary-card"><h3>Flights w/ Lost Tracking</h3><p style="color: #FC8181;">${totalFlightsWithLostTracking.toLocaleString()} (${lostTrackingRate.toFixed(1)}%)</p></div>
        <div class="summary-card"><h3>Total Lost Flight Minutes</h3><p>${Math.round(lostFlightMinutes).toLocaleString()}</p></div>
      </div>

      <h2>Analysis & Key Findings</h2>
      
      ${maintenanceImpact.length > 0 ? `
      <h3>Most Critical Radars (by Maintenance Impact)</h3>
      <table>
        ${tableHeader(['Radar Station', 'Simulated Outages', 'Total Downtime (hours)'])}
        <tbody>
          ${topMaintenanceImpact.map(r => tableRow([r.radarName, r.outages, r.downtimeHours])).join('')}
        </tbody>
      </table>` : ''}

      ${inactiveRadarAnalysis.length > 0 ? `
      <h3>Inactive Radar Analysis (Top 10)</h3>
      <p style="font-size: 0.9em; color: #A0AEC0; margin-top: -1.5em; margin-bottom: 1.5em;">This table shows the estimated financial impact if these currently inactive radars were turned on for the simulation period.</p>
      <table>
        ${tableHeader(['Radar Station', 'Potential P&L Change'])}
        <tbody>
          ${topInactiveRadars.map(r => tableRow([r.radarName, `&euro;${Math.round(r.potentialPnlChange).toLocaleString()}`])).join('')}
        </tbody>
      </table>` : ''}
      
      <h3>Top 10 Problematic Routes (by Total Lost Minutes)</h3>
      <table>
        ${tableHeader(['Route', 'Total Lost Minutes'])}
        <tbody>
          ${topProblematicRoutes.map(r => tableRow([r.route, Math.round(r.lostMinutes)])).join('')}
        </tbody>
      </table>
      
      <h3>Top Sources of Flight Cancellations</h3>
      <table>
        ${tableHeader(['Airport Code', 'Cancellations Caused'])}
        <tbody>
          ${topCancellationSources.map(a => tableRow([a.airportCode, a.cancellations])).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
};

const handleDownloadReport = (result: SimulationResult) => {
  const htmlContent = generateReportHTML(result);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'radar-simulation-report.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


interface SimulationResultModalProps {
  result: SimulationResult | null;
  onClose: () => void;
}

const SimulationResultModal: React.FC<SimulationResultModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const {
    totalFlights,
    cancelledFlights,
    totalFlightsWithLostTracking,
    totalRevenue,
    totalOperationalCost,
    totalCancellationCost,
    totalLostTrackingCost,
    netProfitLoss,
    totalDays,
  } = result;

  const cancellationRate = totalFlights > 0 ? (cancelledFlights / totalFlights) * 100 : 0;
  const flightsWithCoverage = totalFlights - cancelledFlights;
  const lostTrackingRate = flightsWithCoverage > 0 ? (totalFlightsWithLostTracking / flightsWithCoverage) * 100 : 0;


  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-sans z-50">
      <div className="w-full max-w-4xl bg-gray-800 border-2 border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 p-8 text-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-100">{totalDays > 31 ? '1-Year' : '1-Month'} Simulation Report</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-3xl leading-none">&times;</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-900/50 p-4 rounded-md text-center">
            <p className="text-sm text-gray-400">Total Flights Analyzed</p>
            <p className="text-3xl font-bold text-cyan-400">{totalFlights.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-md text-center">
            <p className="text-sm text-gray-400">Flights Cancelled</p>
            <p className="text-3xl font-bold text-yellow-400">{cancelledFlights.toLocaleString()} ({cancellationRate.toFixed(1)}%)</p>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-md text-center">
            <p className="text-sm text-gray-400">Flights w/ Lost Tracking</p>
            <p className="text-3xl font-bold text-red-400">{totalFlightsWithLostTracking.toLocaleString()} ({lostTrackingRate.toFixed(1)}%)</p>
          </div>
           <div className="bg-gray-900/50 p-4 rounded-md text-center col-span-2 md:col-span-1">
            <p className="text-sm text-gray-400">Net Profit / Loss</p>
            <p className={`text-3xl font-bold ${netProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              &euro;{netProfitLoss.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="bg-gray-900/50 p-4 rounded-md text-center">
            <p className="text-gray-400 mb-2">A detailed financial breakdown and inactive radar analysis is available in the full report.</p>
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm">
                <span>Revenue: <strong className="text-green-400">&euro;{totalRevenue.toLocaleString()}</strong></span>
                <span>Op. Costs: <strong className="text-yellow-400">&euro;{Math.round(totalOperationalCost).toLocaleString()}</strong></span>
                <span>Cancellation Costs: <strong className="text-yellow-400">&euro;{totalCancellationCost.toLocaleString()}</strong></span>
                <span>Tracking Loss Costs: <strong className="text-yellow-400">&euro;{Math.round(totalLostTrackingCost).toLocaleString()}</strong></span>
            </div>
        </div>

        <div className="mt-8 flex justify-center items-center space-x-4">
          <button
            onClick={() => handleDownloadReport(result)}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-bold transition-colors duration-300"
          >
            Download Full Report
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationResultModal;