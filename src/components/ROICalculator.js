import React, { useState } from 'react';
import './ROICalculator.css';

function ROICalculator() {
  const [emailsPerMonth, setEmailsPerMonth] = useState(500);
  const [averageProject, setAverageProject] = useState(5000);
  const [currentBookingRate, setCurrentBookingRate] = useState(2);

  const improvedBookingRate = currentBookingRate + 3; // 3% improvement
  const currentBookings = Math.round((emailsPerMonth * currentBookingRate) / 100);
  const improvedBookings = Math.round((emailsPerMonth * improvedBookingRate) / 100);
  const additionalBookings = improvedBookings - currentBookings;
  const monthlyLoss = additionalBookings * averageProject;
  const yearlyLoss = monthlyLoss * 12;
  const roi = yearlyLoss > 0 ? Math.round((yearlyLoss / 108) * 100) : 0; // $108/year cost

  return (
    <div className="roi-calculator">
      <h2>💰 How Much Are You Leaving on the Table?</h2>
      <p className="calculator-subtitle">
        Stop losing clients to better-positioned freelancers
      </p>
      
      <div className="calculator-inputs">
        <div className="input-group">
          <label>Emails sent per month</label>
          <input
            type="number"
            value={emailsPerMonth}
            onChange={(e) => setEmailsPerMonth(parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>
        
        <div className="input-group">
          <label>Average project value</label>
          <input
            type="number"
            value={averageProject}
            onChange={(e) => setAverageProject(parseInt(e.target.value) || 0)}
            min="0"
            prefix="$"
          />
        </div>
        
        <div className="input-group">
          <label>Current booking rate (%)</label>
          <input
            type="number"
            value={currentBookingRate}
            onChange={(e) => setCurrentBookingRate(parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.1"
          />
        </div>
      </div>

      <div className="calculator-results">
        <div className="result-card loss">
          <div className="result-label">Current Monthly Bookings</div>
          <div className="result-value">{currentBookings}</div>
        </div>
        
        <div className="result-card gain">
          <div className="result-label">With Expert Signature</div>
          <div className="result-value">{improvedBookings}</div>
          <div className="result-delta">+{additionalBookings} bookings</div>
        </div>
        
        <div className="result-card highlight">
          <div className="result-label">Monthly Loss</div>
          <div className="result-value">${monthlyLoss.toLocaleString()}</div>
        </div>
        
        <div className="result-card highlight">
          <div className="result-label">Yearly Loss</div>
          <div className="result-value">${yearlyLoss.toLocaleString()}</div>
        </div>
      </div>

      {yearlyLoss > 0 && (
        <div className="roi-message">
          <div className="roi-badge">ROI: {roi}%</div>
          <p>
            With our signature: <strong>${yearlyLoss.toLocaleString()}/year</strong> more potential earnings
            <br />
            Cost of tool: <strong>$108/year</strong>
            <br />
            <span className="roi-highlight">That's {Math.round(yearlyLoss / 108)}x return on investment</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default ROICalculator;

