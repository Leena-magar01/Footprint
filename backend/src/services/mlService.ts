import { spawn } from 'child_process';
import path from 'path';

interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD
  emission: number;
}

interface PredictionInput {
  historical_data: HistoricalDataPoint[];
  target_reduction_pct: number;
}

interface PredictionResponse {
  linear_regression: number;
  random_forest: number;
  trend: string;
  expected_improvement: number;
  message: string;
  status: string;
}

export const runMLPrediction = async (
  historicalData: HistoricalDataPoint[],
  targetReductionPct: number = 10.0
): Promise<PredictionResponse> => {
  return new Promise((resolve) => {
    // Resolve absolute path to python executable in virtual env and predict.py script
    // On Windows, the venv python is at ml/venv/Scripts/python.exe
    const workspaceRoot = path.resolve(__dirname, '../../..');
    const isWindows = process.platform === 'win32';
    const pythonBin = isWindows ? 'Scripts/python.exe' : 'bin/python';
    const pythonPath = path.join(workspaceRoot, 'ml', 'venv', pythonBin);
    const scriptPath = path.join(workspaceRoot, 'ml', 'predict.py');

    const inputData: PredictionInput = {
      historical_data: historicalData,
      target_reduction_pct: targetReductionPct,
    };

    console.log(`Spawning python process at: ${pythonPath} with script: ${scriptPath}`);

    const pyProcess = spawn(pythonPath, [scriptPath]);

    let stdoutData = '';
    let stderrData = '';

    // Write input JSON to python process stdin
    pyProcess.stdin.write(JSON.stringify(inputData));
    pyProcess.stdin.end();

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}. Stderr: ${stderrData}`);
        resolve(getFallbackPrediction(historicalData, targetReductionPct, `Error running ML models (exit code ${code}).`));
        return;
      }

      try {
        const response: PredictionResponse = JSON.parse(stdoutData.trim());
        resolve(response);
      } catch (err) {
        console.error('Failed to parse Python script stdout:', err, 'Raw stdout:', stdoutData);
        resolve(getFallbackPrediction(historicalData, targetReductionPct, 'Failed to parse ML results.'));
      }
    });

    pyProcess.on('error', (err) => {
      console.error('Failed to start Python subprocess:', err);
      resolve(getFallbackPrediction(historicalData, targetReductionPct, 'Python ML script not available.'));
    });
  });
};

// Fallback logic in TS in case Python is unavailable
const getFallbackPrediction = (
  historical: HistoricalDataPoint[],
  targetPct: number,
  reason: string
): PredictionResponse => {
  console.log(`Using Node.js typescript fallback prediction. Reason: ${reason}`);
  if (historical.length === 0) {
    return {
      linear_regression: 0.0,
      random_forest: 0.0,
      trend: 'stable',
      expected_improvement: 0.0,
      message: 'No data available to forecast. Start tracking footprint logs to see predictions.',
      status: 'fallback'
    };
  }

  // Calculate simple statistics
  const values = historical.map((h) => h.emission);
  const currentVal = values[values.length - 1];
  const avgVal = values.reduce((sum, v) => sum + v, 0) / values.length;
  
  let trend = 'stable';
  let predVal = currentVal;

  if (historical.length >= 2) {
    const diff = currentVal - values[0];
    trend = diff > 0.5 ? 'increasing' : (diff < -0.5 ? 'decreasing' : 'stable');
    predVal = Math.max(0, currentVal + (diff / historical.length));
  }

  const expected = Math.max(0, currentVal * (1.0 - targetPct / 100.0));

  return {
    linear_regression: predVal,
    random_forest: avgVal,
    trend,
    expected_improvement: expected,
    message: `Forecast (TypeScript Fallback): Predicted: ${predVal.toFixed(1)} kg CO2. Target: ${expected.toFixed(1)} kg CO2. (${reason})`,
    status: 'fallback'
  };
};
