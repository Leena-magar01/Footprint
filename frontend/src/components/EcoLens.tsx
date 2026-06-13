import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EcoLens: React.FC = () => {
  const { refreshUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setLogSuccess(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setLogSuccess(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image file to analyze.');
      return;
    }

    setError(null);
    setLoading(true);
    setLogSuccess(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const data = await api.uploadEcoLensImage(formData);
      setResult(data.analysis);
      refreshUser(); // update points in navbar since they get 15 points
    } catch (err: any) {
      setError(err.message || 'Image analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLog = async () => {
    if (!result) return;
    try {
      setLoading(true);
      setError(null);
      
      const details: any = {};
      if (result.category === 'transportation') {
        details.vehicleType = 'car';
        details.fuelType = 'petrol';
      } else if (result.category === 'food') {
        details.dietType = 'poultry';
      } else if (result.category === 'shopping') {
        details.shoppingCategory = 'general';
      }

      await api.logFootprint({
        category: result.category,
        amount: 1, // unit log
        carbonEmission: result.estimatedFootprint,
        details,
        date: new Date().toISOString().split('T')[0]
      });

      setLogSuccess(`Logged! Activity carbon footprint of ${result.estimatedFootprint.toFixed(1)} kg CO₂ added to your history.`);
      refreshUser(); // update points for logging
    } catch (err: any) {
      setError(err.message || 'Failed to save activity log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container pb-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold m-0" style={{ fontSize: '2.25rem' }}>EcoLens AI</h1>
        <p className="text-muted mt-1">Upload receipts, product photos, food, or appliance pictures to analyze carbon footprint details instantly using AI.</p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Upload Container */}
        <div className="col-lg-6">
          <div className="eco-card h-100 d-flex flex-column justify-content-between">
            <div>
              <h2 className="fs-5 fw-bold text-white mb-3">Upload Sustainability Photo</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert" style={{ borderRadius: '12px' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
                  {error}
                </div>
              )}

              {/* Drag and Drop Box */}
              <div 
                className="border border-dashed border-secondary border-opacity-50 rounded-3 p-5 text-center mb-4 cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('ecoLensInput')?.click()}
                style={{ background: 'rgba(255,255,255,0.01)', cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label="Upload zone. Drag and drop file or click to choose."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    document.getElementById('ecoLensInput')?.click();
                  }
                }}
              >
                <input
                  type="file"
                  id="ecoLensInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="d-none"
                />
                
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Uploaded preview" 
                    className="img-fluid rounded-3 mb-2" 
                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                  />
                ) : (
                  <>
                    <i className="bi bi-cloud-arrow-up-fill text-success fs-1 mb-2 d-block" aria-hidden="true"></i>
                    <span className="fw-bold d-block text-white-50">Drag & Drop Image here</span>
                    <span className="small text-muted d-block mt-1">Supports PNG, JPG, JPEG up to 5MB</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-100 eco-btn-primary py-2.5 d-flex align-items-center justify-content-center"
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Analyzing via EcoLens...
                </>
              ) : (
                <>
                  <i className="bi bi-stars me-2" aria-hidden="true"></i>
                  Analyze Image
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Results panel */}
        <div className="col-lg-6">
          <div className="eco-card h-100 d-flex flex-column justify-content-between">
            <div>
              <h2 className="fs-5 fw-bold text-white mb-3">AI Estimation Results</h2>
              
              {logSuccess && (
                <div className="alert alert-success" role="alert" style={{ borderRadius: '12px' }}>
                  <i className="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
                  {logSuccess}
                </div>
              )}

              {!result ? (
                <div className="py-5 text-center text-muted">
                  <i className="bi bi-stars fs-1 text-success opacity-25 d-block mb-2" aria-hidden="true"></i>
                  <p className="small m-0">Upload and submit an image. EcoLens will identify the item and estimate carbon intensity, and suggest alternatives.</p>
                </div>
              ) : (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-10 pb-3">
                    <div>
                      <span className="small text-muted d-block text-uppercase">Identified Item</span>
                      <strong className="fs-5 text-white">{result.itemAnalyzed}</strong>
                    </div>
                    <div className="text-end">
                      <span className="small text-muted d-block">Confidence Rating</span>
                      <strong className="text-success">{(result.confidence * 100).toFixed(0)}%</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-3 bg-danger bg-opacity-5 border border-danger border-opacity-10 mb-4 d-flex align-items-center justify-content-between">
                    <div>
                      <span className="small text-muted d-block">Estimated Footprint Weight</span>
                      <strong className="text-white-50 small text-capitalize">{result.category} category</strong>
                    </div>
                    <h3 className="m-0 text-danger fw-extrabold">
                      {result.estimatedFootprint.toFixed(2)} <small className="fs-6 text-muted">kg CO₂</small>
                    </h3>
                  </div>

                  <div className="mb-4">
                    <h3 className="fs-6 fw-bold text-white-50">Footprint Analysis</h3>
                    <p className="small text-muted" style={{ lineHeight: '1.6' }}>{result.explanation}</p>
                  </div>

                  <div>
                    <h3 className="fs-6 fw-bold text-success-emphasis">Greener Alternatives Recommended</h3>
                    <ul className="list-unstyled d-flex flex-column gap-2.5">
                      {result.greenAlternatives.map((alt: string, index: number) => (
                        <li 
                          key={index}
                          className="p-2.5 rounded-3 bg-success bg-opacity-5 border border-success border-opacity-5 small text-white-50 d-flex gap-2 align-items-start"
                        >
                          <i className="bi bi-patch-check-fill text-success mt-0.5" aria-hidden="true"></i>
                          <span>{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {result && !logSuccess && (
              <button
                onClick={handleSaveToLog}
                className="w-100 eco-btn-outline py-2.5 mt-4 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                <i className="bi bi-cloud-arrow-up me-2" aria-hidden="true"></i>
                Log Footprint to Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EcoLens;
