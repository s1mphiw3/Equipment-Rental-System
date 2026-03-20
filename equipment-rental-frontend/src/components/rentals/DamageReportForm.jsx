import React, { useState, useEffect } from 'react';
import { damageReportsAPI } from '../../services/api';

const DamageReportForm = ({ rentalId, onSuccess }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    damage_description: '',
    severity_level: '',
    estimated_cost: '',
    actual_cost: ''
  });

  useEffect(() => {
    loadReports();
  }, [rentalId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await damageReportsAPI.getByRental(rentalId);
      setReports(response.data);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const submitReport = async () => {
    try {
      setSaving(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('rental_id', rentalId);
      formDataToSend.append('damage_description', formData.damage_description);
      formDataToSend.append('severity_level', formData.severity_level);
      formDataToSend.append('estimated_cost', formData.estimated_cost);
      formDataToSend.append('actual_cost', formData.actual_cost);

      selectedFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      await damageReportsAPI.create(formDataToSend);

      // Reset form
      setFormData({
        damage_description: '',
        severity_level: '',
        estimated_cost: '',
        actual_cost: ''
      });
      setSelectedFiles([]);
      setShowForm(false);

      await loadReports(); // Reload reports
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit damage report');
    } finally {
      setSaving(false);
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-blue-100 text-blue-800';
      case 'major': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Damage Reports</h2>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading damage reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="text-lg font-medium text-gray-900">Damage Reports</h2>
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Report Damage'}
          </button>
        </div>
      </div>
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report New Damage</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Damage Description *</label>
                  <textarea
                    rows={4}
                    name="damage_description"
                    value={formData.damage_description}
                    onChange={handleInputChange}
                    placeholder="Describe the damage in detail..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity Level *</label>
                    <select
                      name="severity_level"
                      value={formData.severity_level}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select severity</option>
                      <option value="minor">Minor</option>
                      <option value="moderate">Moderate</option>
                      <option value="major">Major</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="estimated_cost"
                      value={formData.estimated_cost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="actual_cost"
                      value={formData.actual_cost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Upload photos of the damage (optional)
                </p>
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <small className="text-gray-500">
                      {selectedFiles.length} file(s) selected
                    </small>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={submitReport}
                  disabled={saving || !formData.damage_description || !formData.severity_level}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Report
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {reports.length === 0 ? (
          <p className="text-gray-500 text-center">No damage reports found for this rental.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeColor(report.severity_level)}`}>
                        {report.severity_level}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(report.status)}`}>
                        {report.status}
                      </span>
                      <small className="text-gray-500">
                        Reported: {new Date(report.created_at).toLocaleString()}
                      </small>
                    </div>
                    <p className="mb-2 text-gray-700">{report.damage_description}</p>
                    {report.estimated_cost && (
                      <p className="mb-2">
                        <strong className="text-gray-700">Estimated Cost:</strong> ${parseFloat(report.estimated_cost).toFixed(2)}
                      </p>
                    )}
                   {report.actual_cost && (
                      <p className="mb-2">
                        <strong className="text-gray-700">Actual Cost:</strong> ${parseFloat(report.actual_cost).toFixed(2)}
                      </p>
                    )}
                    
                    {report.reported_by_name && (
                      <p className="text-gray-500 text-sm">
                        Reported by: {report.reported_by_name}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    {report.image_urls && Array.isArray(report.image_urls) && report.image_urls.length > 0 && (
                      <div>
                        <strong className="text-gray-700">Images:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {report.image_urls.map((url, index) => (
                                  <img
                                    key={index}
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${url}`}
                                    alt={`Damage ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                                    onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${url}`, '_blank')}
                                    onError={(e) => {
                                      console.error('Image failed to load:', url);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                          ))
                        
                          
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DamageReportForm;
