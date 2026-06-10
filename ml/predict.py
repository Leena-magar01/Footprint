import sys
import json
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

def main():
    try:
        # Read JSON from stdin
        input_data = json.load(sys.stdin)
        historical = input_data.get("historical_data", [])
        target_reduction_pct = float(input_data.get("target_reduction_pct", 10.0))

        if not historical:
            # Fallback for no data
            response = {
                "linear_regression": 0.0,
                "random_forest": 0.0,
                "trend": "stable",
                "expected_improvement": 0.0,
                "message": "No historical data available yet to generate predictions. Keep tracking to enable forecasts!",
                "status": "fallback"
            }
            print(json.dumps(response))
            return

        df = pd.DataFrame(historical)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        
        # Calculate time steps (days or months) from the first log
        min_date = df['date'].min()
        df['days_since_start'] = (df['date'] - min_date).dt.days
        df['month_of_year'] = df['date'].dt.month
        
        X = df[['days_since_start', 'month_of_year']].values
        y = df['emission'].values
        
        current_val = y[-1]
        
        # Determine forecasting horizon (predicting 30 days into the future from the last date)
        last_days = df['days_since_start'].iloc[-1]
        next_days = last_days + 30
        
        # Next month date estimation
        last_date = df['date'].iloc[-1]
        next_date = last_date + pd.Timedelta(days=30)
        next_month_val = next_date.month
        
        X_next = np.array([[next_days, next_month_val]])
        
        if len(df) < 3:
            # Too few points for meaningful ML training, do simple baseline
            trend = "stable"
            if len(df) == 2:
                diff = y[1] - y[0]
                trend = "increasing" if diff > 0.01 else ("decreasing" if diff < -0.01 else "stable")
                pred_val = float(max(0.0, y[1] + diff))
            else:
                pred_val = float(y[0])
                
            expected = max(0.0, current_val * (1.0 - (target_reduction_pct / 100.0)))
            
            response = {
                "linear_regression": pred_val,
                "random_forest": pred_val,
                "trend": trend,
                "expected_improvement": float(expected),
                "message": f"Emission trends calculated using baseline average due to limited history (need at least 3 logs). Current: {current_val:.1f} kg CO2, Predicted: {pred_val:.1f} kg CO2.",
                "status": "baseline"
            }
            print(json.dumps(response))
            return
            
        # Fit models
        # Linear Regression
        lr = LinearRegression()
        lr.fit(X[:, [0]], y)  # train LR on days_since_start to get clear trend
        lr_pred = lr.predict([[next_days]])[0]
        lr_slope = lr.coef_[0]
        
        # Random Forest
        rf = RandomForestRegressor(n_estimators=50, random_state=42)
        rf.fit(X, y)
        rf_pred = rf.predict(X_next)[0]
        
        # Bound forecasts to positive numbers
        lr_pred = float(max(0.0, lr_pred))
        rf_pred = float(max(0.0, rf_pred))
        
        trend = "increasing" if lr_slope > 0.05 else ("decreasing" if lr_slope < -0.05 else "stable")
        
        # Expected value if they hit their target reduction
        expected_val = float(max(0.0, current_val * (1.0 - (target_reduction_pct / 100.0))))
        
        # Message creation
        if trend == "decreasing":
            msg = f"Great work! Your carbon footprint is on a downward trend. Linear Regression forecasts {lr_pred:.1f} kg CO2 and Random Forest forecasts {rf_pred:.1f} kg CO2 for next month."
        elif trend == "increasing":
            msg = f"Alert: Your footprint is trending upwards. Next month emissions are forecast at {rf_pred:.1f} kg CO2. Try completing challenges to bring this down."
        else:
            msg = f"Your carbon footprint is stable. Predicted next month: {rf_pred:.1f} kg CO2. Target with your {target_reduction_pct}% reduction goal: {expected_val:.1f} kg CO2."
            
        response = {
            "linear_regression": lr_pred,
            "random_forest": rf_pred,
            "trend": trend,
            "expected_improvement": expected_val,
            "message": msg,
            "status": "success"
        }
        print(json.dumps(response))

    except Exception as e:
        error_response = {
            "status": "error",
            "message": str(e),
            "linear_regression": 0.0,
            "random_forest": 0.0,
            "trend": "stable",
            "expected_improvement": 0.0
        }
        print(json.dumps(error_response))

if __name__ == "__main__":
    main()
