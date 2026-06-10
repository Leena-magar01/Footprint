import React, { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { api } from '../services/api';

// Register ChartJS modules
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalytics();
      setAnalytics(data);
      
      // Load insights asynchronously to prevent locking the UI
      loadAIInsights();
      loadForecastData();
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      setInsightsLoading(true);
      const data = await api.getAIInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const loadForecastData = async () => {
    try {
      setForecastLoading(true);
      const data = await api.getForecast();
      setForecast(data);
    } catch (error) {
      console.error('Error loading forecast:', error);
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
        <h5 className="text-muted">Loading EcoPilot Dashboard...</h5>
      </div>
    );
  }

  // Setup Doughnut Chart
  const categories = Object.keys(analytics.breakdown);
  const emissions = Object.values(analytics.breakdown);
  
  const doughnutData = {
    labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    datasets: [{
      data: emissions,
      backgroundColor: [
        '#2ec4b6', // transportation - primary teal
        '#7209b7', // electricity - purple
        '#20bf55', // food - success green
        '#ffb703', // water - warning yellow
        '#e63946'  // shopping - red
      ],
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
    }]
  };

  // Setup Line Chart
  const lineLabels = analytics.trends.weekly.map((t: any) => t.date);
  const lineValues = analytics.trends.weekly.map((t: any) => t.emission);

  const lineData = {
    labels: lineLabels,
    datasets: [{
      label: 'Daily Carbon Emission (kg CO2)',
      data: lineValues,
      fill: false,
      borderColor: '#2ec4b6',
      tension: 0.2,
      pointBackgroundColor: '#20bf55'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#adb5bd',
          font: { family: 'Outfit', size: 12 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#adb5bd', font: { family: 'Outfit' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#adb5bd', font: { family: 'Outfit' } }
      }
    }
  };

  const totalCO2 = analytics.totals.totalEmissions.toFixed(1);
  const avgDaily = analytics.totals.averageDaily.toFixed(1);

  return (
    <div className="container pb-5">
      {/* Title Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="fw-bold m-0" style={{ fontSize: '2.25rem' }}>Overview Dashboard</h1>
          <p className="text-muted m-0">Live sustainability metrics and carbon equivalents</p>
        </div>
        <button 
          className="btn btn-outline-secondary btn-sm eco-card py-1.5 hover-grow" 
          onClick={fetchDashboardData}
          aria-label="Refresh dashboard metrics"
        >
          <i className="bi bi-arrow-clockwise me-1.5" aria-hidden="true"></i>
          Refresh
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="row g-4 mb-4">
        {/* Total Emissions */}
        <div className="col-md-4">
          <div className="eco-card d-flex align-items-center justify-content-between p-3.5 h-100">
            <div>
              <span className="text-muted small fw-medium text-uppercase">Total Footprint</span>
              <h2 className="fw-extrabold my-1" style={{ fontSize: '2.5rem', color: 'var(--eco-primary)' }}>{totalCO2}</h2>
              <span className="text-white-50 small">kg CO₂ logged overall</span>
            </div>
            <div className="equiv-icon-container bg-opacity-10 bg-info border border-info border-opacity-10 text-info">
              <i className="bi bi-cloud-haze2-fill" aria-hidden="true"></i>
            </div>
          </div>
        </div>

        {/* Daily Average */}
        <div className="col-md-4">
          <div className="eco-card d-flex align-items-center justify-content-between p-3.5 h-100">
            <div>
              <span className="text-muted small fw-medium text-uppercase">Daily Average</span>
              <h2 className="fw-extrabold my-1" style={{ fontSize: '2.5rem', color: 'var(--eco-success)' }}>{avgDaily}</h2>
              <span className="text-white-50 small">kg CO₂ per tracked day</span>
            </div>
            <div className="equiv-icon-container bg-opacity-10 bg-success border border-success border-opacity-10 text-success">
              <i className="bi bi-activity" aria-hidden="true"></i>
            </div>
          </div>
        </div>

        {/* Days Logged */}
        <div className="col-md-4">
          <div className="eco-card d-flex align-items-center justify-content-between p-3.5 h-100">
            <div>
              <span className="text-muted small fw-medium text-uppercase">Tracking Span</span>
              <h2 className="fw-extrabold my-1 text-white" style={{ fontSize: '2.5rem' }}>{analytics.totals.daysTracked}</h2>
              <span className="text-white-50 small">active footprint days</span>
            </div>
            <div className="equiv-icon-container bg-opacity-10 bg-secondary border border-secondary border-opacity-20 text-white">
              <i className="bi bi-calendar3" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Equivalents Cards */}
      <h3 className="fs-5 fw-bold mb-3">Your Eco Impact Equivalents</h3>
      <div className="row g-4 mb-4">
        {/* Trees saved */}
        <div className="col-md-4">
          <div className="eco-card h-100 d-flex gap-3 align-items-start">
            <div className="equiv-icon-container bg-success bg-opacity-15 text-success border border-success border-opacity-10">
              <i className="bi bi-tree-fill" aria-hidden="true"></i>
            </div>
            <div>
              <h4 className="fs-6 fw-bold text-white mb-1">Trees Saved</h4>
              <p className="fs-4 fw-extrabold text-success mb-1">{analytics.equivalents.treesSaved.toFixed(2)}</p>
              <p className="text-muted small mb-0">Annual carbon absorbed equivalent by seedlings.</p>
            </div>
          </div>
        </div>

        {/* KM Avoided */}
        <div className="col-md-4">
          <div className="eco-card h-100 d-flex gap-3 align-items-start">
            <div className="equiv-icon-container bg-info bg-opacity-15 text-info border border-info border-opacity-10">
              <i className="bi bi-car-button" aria-hidden="true"></i>
            </div>
            <div>
              <h4 className="fs-6 fw-bold text-white mb-1">Driving Avoided</h4>
              <p className="fs-4 fw-extrabold text-info mb-1">{analytics.equivalents.kmAvoided.toFixed(1)} km</p>
              <p className="text-muted small mb-0">Driving offset compared to standard carbon averages.</p>
            </div>
          </div>
        </div>

        {/* Energy Conserved */}
        <div className="col-md-4">
          <div className="eco-card h-100 d-flex gap-3 align-items-start">
            <div className="equiv-icon-container bg-warning bg-opacity-15 text-warning border border-warning border-opacity-10">
              <i className="bi bi-lightning-charge-fill" aria-hidden="true"></i>
            </div>
            <div>
              <h4 className="fs-6 fw-bold text-white mb-1">Energy Saved</h4>
              <p className="fs-4 fw-extrabold text-warning mb-1">{analytics.equivalents.energyConserved.toFixed(1)} kWh</p>
              <p className="text-muted small mb-0">Equivalent grid electrical units conserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="row g-4 mb-4">
        {/* Category Breakdown (Doughnut) */}
        <div className="col-lg-5">
          <div className="eco-card h-100 d-flex flex-column">
            <h3 className="fs-5 fw-bold mb-3 text-white">Carbon Breakdown</h3>
            <div className="flex-grow-1 position-relative d-flex align-items-center justify-content-center" style={{ minHeight: '260px' }}>
              {emissions.every(e => e === 0) ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-pie-chart fs-1 mb-2"></i>
                  <p>No emissions logged yet. Add logs to see breakdown.</p>
                </div>
              ) : (
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
              )}
            </div>
          </div>
        </div>

        {/* Daily Emissions Trend (Line) */}
        <div className="col-lg-7">
          <div className="eco-card h-100 d-flex flex-column">
            <h3 className="fs-5 fw-bold mb-3 text-white">Weekly Emissions Trend</h3>
            <div className="flex-grow-1 position-relative" style={{ minHeight: '260px' }}>
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Panel & ML Predictions Grid */}
      <div className="row g-4">
        {/* AI Powered Personalized Insights */}
        <div className="col-lg-6">
          <div className="eco-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-5 fw-bold text-white m-0 d-flex align-items-center">
                <i className="bi bi-cpu-fill text-success me-2" aria-hidden="true"></i>
                AI Personalized Coaching
              </h3>
              {insightsLoading && <span className="spinner-border spinner-border-sm text-success" role="status"></span>}
            </div>

            {insightsLoading ? (
              <div className="py-5 text-center text-muted">Analyzing your footprints to generate insights...</div>
            ) : insights.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-info-circle fs-3 mb-2" aria-hidden="true"></i>
                <p className="small">Please log activities to receive AI coach recommendations.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {insights.map((insight, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-success border-opacity-10 d-flex gap-3 hover-grow"
                  >
                    <div className="equiv-icon-container bg-success bg-opacity-10 text-success align-self-start mt-1" style={{ width: '36px', height: '36px', fontSize: '1.1rem' }}>
                      {insight.category === 'transportation' && <i className="bi bi-car-button" aria-hidden="true"></i>}
                      {insight.category === 'electricity' && <i className="bi bi-lightning" aria-hidden="true"></i>}
                      {insight.category === 'food' && <i className="bi bi-egg-fried" aria-hidden="true"></i>}
                      {insight.category === 'water' && <i className="bi bi-droplet-fill" aria-hidden="true"></i>}
                      {insight.category === 'shopping' && <i className="bi bi-bag-fill" aria-hidden="true"></i>}
                    </div>
                    <div>
                      <p className="m-0 fw-medium text-white-50 small text-capitalize">{insight.category} recommendation</p>
                      <p className="m-0 mt-1 text-white fw-bold fs-7">{insight.recommendation}</p>
                      <div className="d-flex flex-wrap gap-3 mt-2 small text-muted">
                        <span>
                          <i className="bi bi-cloud-arrow-down text-success me-1"></i>
                          Reduces <strong>{insight.estimatedReduction} kg CO₂</strong> / week
                        </span>
                        <span>
                          <i className="bi bi-arrow-down-short text-info me-0.5"></i>
                          {insight.percentageImprovement}% better
                        </span>
                        <span className={`fw-semibold text-${insight.impact === 'High' ? 'danger' : (insight.impact === 'Medium' ? 'warning' : 'success')}`}>
                          Impact: {insight.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI prediction system */}
        <div className="col-lg-6">
          <div className="eco-card h-100">
            <h3 className="fs-5 fw-bold mb-3 text-white d-flex align-items-center">
              <i className="bi bi-graph-up-arrow text-success me-2" aria-hidden="true"></i>
              ML Carbon Forecast
            </h3>
            {forecastLoading ? (
              <div className="py-5 text-center text-muted">
                <span className="spinner-border spinner-border-sm text-success me-2" role="status"></span>
                Training forecast models (Linear Regression & Random Forest)...
              </div>
            ) : !forecast ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-info-circle fs-3 mb-2" aria-hidden="true"></i>
                <p className="small">Limited tracking data. Log monthly emissions to run ML predictions.</p>
              </div>
            ) : (
              <div className="d-flex flex-column h-100 justify-content-between">
                <div>
                  <p className="text-muted small mb-3">{forecast.prediction.message}</p>
                  
                  <div className="row g-3">
                    {/* Linear Regression Card */}
                    <div className="col-6">
                      <div className="p-3 rounded-3 bg-secondary bg-opacity-20 border border-secondary border-opacity-10 text-center">
                        <span className="text-muted small d-block">Linear Regression</span>
                        <span className="fs-5 fw-bold text-white mt-1 d-block">
                          {forecast.prediction.linear_regression.toFixed(1)} <small className="fs-8 text-muted">kg CO₂</small>
                        </span>
                      </div>
                    </div>

                    {/* Random Forest Card */}
                    <div className="col-6">
                      <div className="p-3 rounded-3 bg-secondary bg-opacity-20 border border-secondary border-opacity-10 text-center">
                        <span className="text-muted small d-block">Random Forest</span>
                        <span className="fs-5 fw-bold text-white mt-1 d-block">
                          {forecast.prediction.random_forest.toFixed(1)} <small className="fs-8 text-muted">kg CO₂</small>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-3 bg-success bg-opacity-5 border border-success border-opacity-10">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-semibold text-success small d-block">Next Month Reduction Budget</span>
                        <span className="text-white small">Target carbon budget under active goals</span>
                      </div>
                      <span className="fs-5 fw-bold text-white">
                        {forecast.prediction.expected_improvement.toFixed(1)} <small className="fs-8 text-muted">kg</small>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center border-top border-secondary border-opacity-10 pt-3">
                  <div className="d-inline-flex align-items-center gap-2 small text-white-50">
                    <span className="d-flex align-items-center">
                      <span className="d-inline-block bg-success rounded-circle me-1.5" style={{ width: '8px', height: '8px' }}></span>
                      Trend: <strong className="text-capitalize text-success ms-1">{forecast.prediction.trend}</strong>
                    </span>
                    <span className="text-muted">|</span>
                    <span>Algorithm status: <strong className="text-success">{forecast.prediction.status}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
