import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { equipmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentAPI.getById(id);
      setEquipment(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      toast.error('Failed to load equipment details');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!dateRange.start_date || !dateRange.end_date) {
      return;
    }

    try {
      const response = await equipmentAPI.checkAvailability({
        equipmentId: id,
        startDate: dateRange.start_date,
        endDate: dateRange.end_date
      });
      setAvailability(response);
    } catch (error) {
      console.error('Availability check failed:', error);
      toast.error('Failed to check availability');
    }
  };

  useEffect(() => {
    if (dateRange.start_date && dateRange.end_date) {
      const timer = setTimeout(checkAvailability, 500);
      return () => clearTimeout(timer);
    }
  }, [dateRange.start_date, dateRange.end_date]);

  const handleRentNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/equipment/${id}` } });
      return;
    }

    if (!availability?.available) {
      toast.error('Please select available dates first');
      return;
    }

    // Navigate to checkout with equipment ID
    navigate('/checkout', {
      state: {
        equipmentId: id
      }
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading equipment details..." />;
  }

  if (!equipment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipment Not Found</h2>
          <p className="text-gray-600 mb-4">The equipment you're looking for doesn't exist.</p>
          <Link to="/equipment" className="btn-primary">
            Browse Equipment
          </Link>
        </div>
      </div>
    );
  }

// ✅ FIXED: Calculate specsData *after* confirming 'equipment' is not null
  const specsData = equipment.specifications
    ? typeof equipment.specifications === 'string'
      ? JSON.parse(equipment.specifications)
      : equipment.specifications
    : null; // Set to null if specifications property doesn't exist

  const duration = dateRange.start_date && dateRange.end_date 
    ? Math.ceil((new Date(dateRange.end_date) - new Date(dateRange.start_date)) / (1000 * 60 * 60 * 24))
    : 0;

  const totalCost = duration * equipment.daily_rate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link to="/" className="hover:text-gray-900">Home</Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <Link to="/equipment" className="hover:text-gray-900">Equipment</Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <span className="text-gray-900 font-medium">{equipment.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Equipment Images */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {equipment.image_url ? (
              <img
               src={equipment.image_url ?`http://localhost:5000${equipment.image_url}`
                             :'/placeholder-equipment.jpg'}
                alt={equipment.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Equipment Details */}
        <div>
          <div className="mb-6">
            <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              {equipment.category_name}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{equipment.name}</h1>
            <p className="text-gray-600 text-lg">{equipment.description}</p>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-bold text-gray-900">${equipment.daily_rate}</span>
              <span className="text-lg text-gray-600 ml-2">per day</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              {equipment.hourly_rate && (
                <div>
                  <span className="font-medium">Hourly:</span>
                  <span className="ml-2">${equipment.hourly_rate}/hr</span>
                </div>
              )}
              {equipment.weekly_rate && (
                <div>
                  <span className="font-medium">Weekly:</span>
                  <span className="ml-2">${equipment.weekly_rate}/wk</span>
                </div>
              )}
              {equipment.monthly_rate && (
                <div>
                  <span className="font-medium">Monthly:</span>
                  <span className="ml-2">${equipment.monthly_rate}/mo</span>
                </div>
              )}
            </div>
          </div>

          {/* Availability Check */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Availability</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                  min={dateRange.start_date || new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
            </div>

            {availability && (
              <div className={`p-4 rounded-lg ${
                availability.available 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {availability.available ? (
                    <>
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-800 font-medium">Available for selected dates</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-red-800 font-medium">Not available for selected dates</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {duration > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-blue-900 font-medium">
                    {duration} day{duration !== 1 ? 's' : ''} rental
                  </span>
                  <span className="text-lg font-bold text-blue-900">
                    ${totalCost}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleRentNow}
              disabled={!availability?.available}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition duration-200 ${
                availability?.available 
                  ? 'btn-primary' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAuthenticated ? 'Rent Now' : 'Sign in to Rent'}
            </button>
            <Link
              to="/equipment"
              className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {specsData && Object.keys(specsData).length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {Object.entries(specsData).map(([key, value], index) => (
                <div
                  key={key}
                  className={`p-4 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } border-b border-gray-200 last:border-b-0`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 capitalize">
                      {/* Replaces underscores with spaces and capitalizes the first letter */}
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetails;