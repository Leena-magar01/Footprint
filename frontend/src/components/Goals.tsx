import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export const Goals: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  // Goal Form State
  const [category, setCategory] = useState<'total' | 'transportation' | 'electricity' | 'food' | 'water' | 'shopping'>('total');
  const [targetReductionPercentage, setTargetReductionPercentage] = useState<number>(10);
  const [durationDays, setDurationDays] = useState<number>(7);
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await api.getGoals();
      setGoals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFormLoading(true);

    try {
      await api.createGoal({
        category,
        targetReductionPercentage,
        durationDays
      });
      setSuccessMsg('Goal created successfully! Tracking started.');
      setTargetReductionPercentage(10); // reset
      await fetchGoals();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create goal.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading Goals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container pb-5">
      <div className="row g-4">
        {/* Create Goal Form */}
        <div className="col-lg-5">
          <div className="eco-card h-100">
            <h1 className="fs-4 fw-bold mb-3 d-flex align-items-center">
              <i className="bi bi-flag text-success me-2" aria-hidden="true"></i>
              Set Reduction Goal
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

            <form onSubmit={handleCreateGoal}>
              {/* Category Select */}
              <div className="mb-3">
                <label htmlFor="goalCategory" className="form-label text-white-50 small fw-bold">GOAL CATEGORY</label>
                <select
                  className="form-select bg-transparent text-white border-secondary border-opacity-25"
                  id="goalCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option className="bg-dark" value="total">🌿 Total Carbon Footprint</option>
                  <option className="bg-dark" value="transportation">🚗 Transportation</option>
                  <option className="bg-dark" value="electricity">⚡ Electricity</option>
                  <option className="bg-dark" value="food">🥗 Food</option>
                  <option className="bg-dark" value="water">💧 Water</option>
                  <option className="bg-dark" value="shopping">🛍️ Shopping</option>
                </select>
              </div>

              {/* Target Reduction Slider */}
              <div className="mb-3">
                <label htmlFor="goalReduction" className="form-label text-white-50 small fw-bold d-flex justify-content-between">
                  <span>TARGET REDUCTION</span>
                  <span className="text-success fw-bold">{targetReductionPercentage}%</span>
                </label>
                <input
                  type="range"
                  className="form-range"
                  id="goalReduction"
                  min="5"
                  max="50"
                  step="5"
                  value={targetReductionPercentage}
                  onChange={(e) => setTargetReductionPercentage(parseInt(e.target.value))}
                />
                <div className="d-flex justify-content-between text-muted fs-8">
                  <span>5%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Duration Select */}
              <div className="mb-4">
                <label htmlFor="goalDuration" className="form-label text-white-50 small fw-bold">TRACKING DURATION</label>
                <select
                  className="form-select bg-transparent text-white border-secondary border-opacity-25"
                  id="goalDuration"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                >
                  <option className="bg-dark" value="7">7 Days (Weekly Budget)</option>
                  <option className="bg-dark" value="30">30 Days (Monthly Budget)</option>
                </select>
              </div>

              {/* Interactive preview box */}
              <div className="p-3 mb-4 rounded-3 border border-success border-opacity-20 bg-success bg-opacity-5 small text-white-50">
                <i className="bi bi-info-circle-fill text-success me-2" aria-hidden="true"></i>
                Based on your averages, we will establish a carbon budget of{' '}
                <strong>{(category === 'total' ? 20 : 4) * durationDays * (1 - targetReductionPercentage/100)} kg CO₂</strong> for this{' '}
                {durationDays} day period. Log activities below this budget to hit your goal!
              </div>

              <button
                type="submit"
                className="w-100 eco-btn-primary py-2.5 d-flex align-items-center justify-content-center"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Initializing Tracking...
                  </>
                ) : (
                  'Start Carbon Goal'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Goals tracking list */}
        <div className="col-lg-7">
          <div className="eco-card h-100">
            <h2 className="fs-4 fw-bold mb-3">Active & Historical Goals</h2>
            
            {goals.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-flag fs-1 text-success opacity-25 d-block mb-2" aria-hidden="true"></i>
                <p className="small m-0">No active goals found. Set a target in the panel on the left to start tracking reduction progress.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {goals.map((goal) => {
                  const carbonRemaining = Math.max(0, goal.targetValue - goal.currentValue);
                  const budgetConsumedPercent = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
                  const isOverBudget = goal.currentValue > goal.targetValue;
                  
                  return (
                    <div 
                      key={goal._id} 
                      className="p-3.5 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-10 hover-grow"
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h3 className="fs-6 fw-bold text-white mb-0.5 text-capitalize">
                            {goal.category === 'total' ? 'Overall Footprint' : `${goal.category} footprint`} Goal
                          </h3>
                          <span className="text-muted small" style={{ fontSize: '0.8rem' }}>
                            Target: {goal.targetReductionPercentage}% reduction
                          </span>
                        </div>
                        <div>
                          {goal.status === 'active' ? (
                            <span className="eco-badge badge-violet text-uppercase">Active</span>
                          ) : goal.status === 'achieved' ? (
                            <span className="eco-badge badge-green text-uppercase">Achieved</span>
                          ) : (
                            <span className="eco-badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20 text-uppercase">Failed</span>
                          )}
                        </div>
                      </div>

                      {/* Carbon Stats detail */}
                      <div className="d-flex justify-content-between align-items-center small text-white-50 mt-3 mb-1.5">
                        <span>Carbon Budget Consumed: <strong>{goal.currentValue.toFixed(1)}</strong> / {goal.targetValue.toFixed(1)} kg</span>
                        <span className={`fw-semibold ${isOverBudget ? 'text-danger' : 'text-success'}`}>
                          {isOverBudget ? 'Over Budget' : `${carbonRemaining.toFixed(1)} kg left`}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="progress mb-2" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${isOverBudget ? 'bg-danger' : 'bg-success'}`}
                          role="progressbar" 
                          style={{ width: `${budgetConsumedPercent}%` }}
                          aria-valuenow={budgetConsumedPercent} 
                          aria-valuemin={0} 
                          aria-valuemax={100}
                          aria-label={`Carbon budget progress: ${budgetConsumedPercent.toFixed(0)}% consumed`}
                        ></div>
                      </div>

                      <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                        <span>Start: {new Date(goal.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(goal.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Goals;
