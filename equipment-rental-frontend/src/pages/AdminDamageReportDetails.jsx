import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { damageReportsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDamageReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    repair_notes: '',
    actual_cost: ''
  });

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await damageReportsAPI.getById(id);
      setReport(response.data);
      setStatusData({
        status: response.data.status,
        repair_notes: response.data.repair_notes || '',
        actual_cost: response.data.actual_cost || ''
      });
    } catch (error) {
      console.error('Error fetching damage report:', error);
      toast.error('Failed to fetch damage report');
      navigate('/admin/damage-reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await damageReportsAPI.updateStatus(id, statusData);
      toast.success('Damage report status updated successfully');
      fetchReport(); // Refresh the data
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update damage report status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this damage report? This action cannot be undone.')) {
      return;
    }

    try {
      await damageReportsAPI.delete(id);
      toast.success('Damage report deleted successfully');
      navigate('/admin/damage-reports');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete damage report');
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'repaired': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Damage Report Not Found</h1>
          <Link
            to="/admin/damage-reports"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-col sm:flex-row sm:items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Damage Report Details</h1>
          <p className="mt-2 text-gray-600">View detailed information and update the status of this damage report.</p>
        </div>
        <div className="space-x-4 mt-4 sm:mt-0">
          <Link
            to="/admin/damage-reports"
            className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-lg font-semibold shadow-sm transition duration-300 ease-in-out hover:shadow-lg"
          >
            Back to Reports
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold shadow-sm transition duration-300 ease-in-out hover:shadow-lg"
          >
            Delete Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Details Card */}
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 border-b-2 border-gray-100 pb-2">Report Information</h2>
          <div className="space-y-4 text-gray-900">
            <div>
              <p className="text-xs font-medium text-gray-500">Report ID</p>
              <p className="text-lg font-semibold text-gray-900">#{report.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Equipment</p>
              <p className="text-lg font-semibold text-gray-900">{report.equipment_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Customer</p>
              <p className="text-lg font-semibold text-gray-900">{report.customer_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Reported By</p>
              <p className="text-lg font-semibold text-gray-900">{report.reported_by_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Severity Level</p>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeColor(report.severity_level)}`}>
                {report.severity_level}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Status</p>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(report.status)}`}>
                {report.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Estimated Cost</p>
              <p className="text-lg font-semibold text-gray-900">${report.estimated_cost}</p>
            </div>
            {report.actual_cost && (
              <div>
                <p className="text-xs font-medium text-gray-500">Actual Cost</p>
                <p className="text-lg font-semibold text-gray-900">${report.actual_cost}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-500">Reported Date</p>
              <p className="text-lg font-semibold text-gray-900">{new Date(report.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900">{new Date(report.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Damage Description Card */}
      <div className="bg-white p-8 rounded-lg shadow-md flex flex-col border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 border-b-2 border-gray-100 pb-2">Damage Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap flex-grow">{report.damage_description}</p>

          {report.repair_notes && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-3">Repair Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{report.repair_notes}</p>
          </div>
          )}
        </div>
      </div>

      {/* Damage Images Section */}
      {report.image_urls && report.image_urls.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md mt-10 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 border-b-2 border-gray-100 pb-2">Damage Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {report.image_urls.map((imageUrl, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg shadow-sm transform transition-transform duration-300 hover:scale-105">
                <img
                  src={`http://localhost:3000${imageUrl}`}
                  alt={`Damage ${index + 1}`}
                  className="w-full h-52 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Form Section */}
      <div className="bg-white p-8 rounded-lg shadow-md mt-10 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 border-b-2 border-gray-100 pb-2">Update Status</h2>
        <form onSubmit={handleStatusUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusData.status}
                onChange={(e) => setStatusData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="repaired">Repaired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cost</label>
              <input
                type="number"
                step="0.01"
                value={statusData.actual_cost}
                onChange={(e) => setStatusData(prev => ({ ...prev, actual_cost: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition duration-300 ease-in-out hover:shadow-lg"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Repair Notes</label>
            <textarea
              value={statusData.repair_notes}
              onChange={(e) => setStatusData(prev => ({ ...prev, repair_notes: e.target.value }))}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Add repair notes..."
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDamageReportDetails;
