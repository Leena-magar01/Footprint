import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const FootprintTracker: React.FC = () => {
  const { refreshUser } = useAuth();
  
  // Form State
  const [category, setCategory] = useState<'transportation' | 'electricity' | 'food' | 'water' | 'shopping'>('transportation');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Details
  const [vehicleType, setVehicleType] = useState('car');
  const [fuelType, setFuelType] = useState('petrol');
  const [dietType, setDietType] = useState('poultry');
  const [waterType, setWaterType] = useState('shower');
  const [shoppingCategory, setShoppingCategory] = useState('general');
  
  // UI States
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setHistoryLoading(true);
      const data = await api.getFootprintHistory(page, 5);
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  // Live Carbon Preview Calculation (matching backend logic)
  const getPreviewCarbon = (): number => {
    if (amount <= 0) return 0;
    
    if (category === 'transportation') {
      if (vehicleType === 'walk' || vehicleType === 'bike') return 0;
      if (vehicleType === 'public') return amount * 0.04;
      if (vehicleType === 'flight') return amount * 0.15;
      
      if (fuelType === 'electric') return amount * 0.05;
      if (fuelType === 'diesel') return amount * 0.17;
      return amount * 0.18; // petrol
    }
    
    if (category === 'electricity') return amount * 0.45;
    
    if (category === 'food') {
      if (dietType === 'vegan') return amount * 0.3;
      if (dietType === 'vegetarian') return amount * 0.6;
      if (dietType === 'poultry') return amount * 1.2;
      return amount * 2.5; // meat-heavy
    }
    
    if (category === 'water') return amount * 0.0003;
    
    if (category === 'shopping') {
      if (shoppingCategory === 'electronics') return amount * 20.0;
      if (shoppingCategory === 'clothing') return amount * 5.0;
      if (shoppingCategory === 'household') return amount * 2.0;
      return amount * 1.5;
    }
    
    return 0;
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMsg('Please enter a positive activity amount.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const details: any = {};
    if (category === 'transportation') {
      details.vehicleType = vehicleType;
      if (vehicleType === 'car') details.fuelType = fuelType;
    } else if (category === 'food') {
      details.dietType = dietType;
    } else if (category === 'water') {
      details.waterType = waterType;
    } else if (category === 'shopping') {
      details.shoppingCategory = shoppingCategory;
    }

    try {
      const response = await api.logFootprint({
        category,
        amount,
        details,
        date
      });

      setSuccessMsg(`Footprint logged! +${response.pointsEarned} points earned.`);
      setAmount(0); // reset amount
      fetchLogs();
      refreshUser(); // update points in navbar
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to log footprint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container pb-5">
      <div className="row g-4">
        {/* Footprint logging form */}
        <div className="col-lg-6">
          <div className="eco-card h-100">
            <h1 className="fs-4 fw-bold mb-3 d-flex align-items-center">
              <i className="bi bi-plus-circle text-success me-2" aria-hidden="true"></i>
              Log Carbon Activity
            </h1>
            
            {successMsg && (
              <div className="alert alert-success" role="alert" style={{ borderRadius: '12px' }}>
                <i className="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-danger" role="alert" style={{ borderRadius: '12px' }}>
                <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogSubmit}>
              {/* Category Select */}
              <div className="mb-3">
                <label htmlFor="logCategory" className="form-label text-white-50 small fw-bold">ACTIVITY CATEGORY</label>
                <select
                  className="form-select bg-transparent text-white border-secondary border-opacity-25"
                  id="logCategory"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as any);
                    setAmount(0); // reset value when switching
                  }}
                >
                  <option className="bg-dark" value="transportation">🚗 Transportation (Travel)</option>
                  <option className="bg-dark" value="electricity">⚡ Electricity (Utilities)</option>
                  <option className="bg-dark" value="food">🥗 Food (Diet)</option>
                  <option className="bg-dark" value="water">💧 Water Consumption</option>
                  <option className="bg-dark" value="shopping">🛍️ Shopping (Purchases)</option>
                </select>
              </div>

              {/* Dynamic details input fields based on category selected */}
              {category === 'transportation' && (
                <div className="row mb-3">
                  <div className="col-6">
                    <label htmlFor="vehicleType" className="form-label text-white-50 small fw-medium">Vehicle Mode</label>
                    <select
                      id="vehicleType"
                      className="form-select bg-transparent text-white border-secondary border-opacity-25"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                    >
                      <option className="bg-dark" value="car">Car / SUV</option>
                      <option className="bg-dark" value="public">Public Transit</option>
                      <option className="bg-dark" value="flight">Flight (Airplane)</option>
                      <option className="bg-dark" value="bike">Bicycle</option>
                      <option className="bg-dark" value="walk">Walking</option>
                    </select>
                  </div>
                  {vehicleType === 'car' && (
                    <div className="col-6">
                      <label htmlFor="fuelType" className="form-label text-white-50 small fw-medium">Fuel Type</label>
                      <select
                        id="fuelType"
                        className="form-select bg-transparent text-white border-secondary border-opacity-25"
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                      >
                        <option className="bg-dark" value="petrol">Petrol</option>
                        <option className="bg-dark" value="diesel">Diesel</option>
                        <option className="bg-dark" value="electric">Electric / EV</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {category === 'food' && (
                <div className="mb-3">
                  <label htmlFor="dietType" className="form-label text-white-50 small fw-medium">Meal Diet Type</label>
                  <select
                    id="dietType"
                    className="form-select bg-transparent text-white border-secondary border-opacity-25"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                  >
                    <option className="bg-dark" value="meat-heavy">Red Meat-Heavy (Beef, Pork)</option>
                    <option className="bg-dark" value="poultry">Average Diet (Poultry, Fish, Egg)</option>
                    <option className="bg-dark" value="vegetarian">Vegetarian (Dairy, no meat)</option>
                    <option className="bg-dark" value="vegan">Strict Vegan (Plant-based)</option>
                  </select>
                </div>
              )}

              {category === 'water' && (
                <div className="mb-3">
                  <label htmlFor="waterType" className="form-label text-white-50 small fw-medium">Usage Scenario</label>
                  <select
                    id="waterType"
                    className="form-select bg-transparent text-white border-secondary border-opacity-25"
                    value={waterType}
                    onChange={(e) => setWaterType(e.target.value)}
                  >
                    <option className="bg-dark" value="shower">Shower / Bath</option>
                    <option className="bg-dark" value="tap">Tap / Drinking / Cooking</option>
                    <option className="bg-dark" value="washing-machine">Laundry / Dishwasher</option>
                  </select>
                </div>
              )}

              {category === 'shopping' && (
                <div className="mb-3">
                  <label htmlFor="shoppingCategory" className="form-label text-white-50 small fw-medium">Shopping Item Category</label>
                  <select
                    id="shoppingCategory"
                    className="form-select bg-transparent text-white border-secondary border-opacity-25"
                    value={shoppingCategory}
                    onChange={(e) => setShoppingCategory(e.target.value)}
                  >
                    <option className="bg-dark" value="general">General Packaged Retail Goods</option>
                    <option className="bg-dark" value="clothing">Clothing (Apparel / Shoes)</option>
                    <option className="bg-dark" value="electronics">Electronics (Computers / Gadgets)</option>
                    <option className="bg-dark" value="household">Household furniture / utensils</option>
                  </select>
                </div>
              )}

              {/* Amount input */}
              <div className="mb-3">
                <label htmlFor="logAmount" className="form-label text-white-50 small fw-bold">
                  {category === 'transportation' && 'DISTANCE TRAVELLED (KM)'}
                  {category === 'electricity' && 'POWER CONSUMPTION (KWH)'}
                  {category === 'food' && 'NUMBER OF MEALS'}
                  {category === 'water' && 'WATER VOLUME (LITERS)'}
                  {category === 'shopping' && 'NUMBER OF ITEMS PURCHASED'}
                </label>
                <input
                  type="number"
                  className="form-control bg-transparent text-white border-secondary border-opacity-25"
                  id="logAmount"
                  value={amount || ''}
                  onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Enter amount..."
                  min="0.1"
                  step="any"
                  required
                  aria-required="true"
                />
              </div>

              {/* Date selection */}
              <div className="mb-4">
                <label htmlFor="logDate" className="form-label text-white-50 small fw-bold">LOG DATE</label>
                <input
                  type="date"
                  className="form-control bg-transparent text-white border-secondary border-opacity-25"
                  id="logDate"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Live Preview section */}
              {amount > 0 && (
                <div className="p-3 mb-4 rounded-3 border border-success border-opacity-20 bg-success bg-opacity-5 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="small text-muted d-block">Emission Estimate</span>
                    <strong className="text-white">Preview Carbon Weight</strong>
                  </div>
                  <h4 className="m-0 text-success fw-bold">
                    {getPreviewCarbon().toFixed(2)} <small className="fs-6 text-muted">kg CO₂</small>
                  </h4>
                </div>
              )}

              <button
                type="submit"
                className="w-100 eco-btn-primary py-2.5 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging...
                  </>
                ) : (
                  'Log Footprint'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footprint Logs history */}
        <div className="col-lg-6">
          <div className="eco-card h-100 d-flex flex-column justify-content-between">
            <div>
              <h1 className="fs-4 fw-bold mb-3">Recent Activity Logs</h1>
              {historyLoading ? (
                <div className="py-5 text-center text-muted">
                  <span className="spinner-border spinner-border-sm text-success me-2" role="status"></span>
                  Loading historical logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-cloud-slash fs-2 mb-2" aria-hidden="true"></i>
                  <p className="small">No logs recorded yet. Start logging your activities to track trends.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {logs.map((log) => (
                    <div 
                      key={log._id} 
                      className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-10 d-flex align-items-center justify-content-between hover-grow"
                    >
                      <div className="d-flex gap-3 align-items-center">
                        <div className="equiv-icon-container bg-opacity-10 bg-success text-success" style={{ width: '40px', height: '40px', fontSize: '1.25rem' }}>
                          {log.category === 'transportation' && <i className="bi bi-car-button" aria-hidden="true"></i>}
                          {log.category === 'electricity' && <i className="bi bi-lightning-charge" aria-hidden="true"></i>}
                          {log.category === 'food' && <i className="bi bi-egg-fried" aria-hidden="true"></i>}
                          {log.category === 'water' && <i className="bi bi-droplet" aria-hidden="true"></i>}
                          {log.category === 'shopping' && <i className="bi bi-bag" aria-hidden="true"></i>}
                        </div>
                        <div>
                          <h6 className="m-0 fw-bold text-white-50 text-capitalize">{log.category}</h6>
                          <span className="text-muted small" style={{ fontSize: '0.8rem' }}>
                            {log.amount} {log.category === 'transportation' ? 'km' : (log.category === 'electricity' ? 'kWh' : (log.category === 'food' ? 'meals' : (log.category === 'water' ? 'L' : 'items')))}
                            {' • '}
                            {new Date(log.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-end">
                        <h6 className="m-0 fw-bold text-danger">+{log.carbonEmission.toFixed(2)}</h6>
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>kg CO₂</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 border-top border-secondary border-opacity-10 pt-3">
                <button
                  className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  aria-label="Previous page of logs"
                >
                  Previous
                </button>
                <span className="small text-muted">Page {page} of {totalPages}</span>
                <button
                  className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  aria-label="Next page of logs"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FootprintTracker;
