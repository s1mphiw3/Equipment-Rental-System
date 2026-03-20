import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rentalsAPI, pickupReturnsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RentalAgreement from '../components/rentals/RentalAgreement';
import PickupReturnForm from '../components/rentals/PickupReturnForm';
import DamageReportForm from '../components/rentals/DamageReportForm';
import PenaltyDisplay from '../components/rentals/PenaltyDisplay';

const RentalDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [rental, setRental] = useState(null);
  const [pickupReturn, setPickupReturn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const backToRentalsPath = user?.role === 'admin' || user?.role === 'staff' ? '/admin/rentals' : '/rentals';

  useEffect(() => {
    loadRental();
    loadPickupReturn();
  }, [id, refreshTrigger]);

  const loadRental = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await rentalsAPI.getById(id);
      setRental(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load rental details');
    } finally {
      setLoading(false);
    }
  };

  const loadPickupReturn = async () => {
    try {
      const response = await pickupReturnsAPI.getByRental(id);
      setPickupReturn(response.data);
    } catch (err) {
      // Silently handle error for pickup return data
      console.error('Failed to load pickup return data:', err);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading rental details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Link to={backToRentalsPath} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200">
            Back to Rentals
          </Link>
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Rental Not Found</h3>
          <p className="text-yellow-700 mb-4">The rental you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to={backToRentalsPath} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200">
            Back to Rentals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to={backToRentalsPath} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200 mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Rentals
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rental Details</h1>
            <p className="mt-2 text-gray-600">Rental #{rental.id}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            rental.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            rental.status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
            rental.status === 'returned' ? 'bg-green-100 text-green-800' :
            rental.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {rental.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Rental Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Equipment Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {rental.image_url && (
                    <img
                      src={rental.image_url?`http://localhost:5000${rental.image_url}`
                             :'/placeholder-equipment.jpg'}
                      alt={rental.equipment_name}
                      className="w-full h-48 object-contain rounded-lg mb-4"
                    />

                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{rental.equipment_name}</h3>

                  {/* Equipment Description */}
                  {rental?.description && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="mt-1 text-sm text-gray-700">{rental.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {rental.category_name || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Condition</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rental?.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                        rental?.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                        rental?.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rental?.condition || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Daily Rate</p>
                      <p className="text-lg font-semibold text-primary-600">${rental.daily_rate}/day</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Available Quantity</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {rental?.available_quantity || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(rental.start_date)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">End Date</p>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(rental.end_date)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rented Quantity</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rental.quantity}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">${rental.total_amount}</p>
                    </div>
                  </div>

                  {rental.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Rental Notes</p>
                      <p className="mt-1 text-sm text-gray-600">{rental.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rental Agreement */}
          {(user?.role === 'admin' || user?.role === 'staff' || rental.user_id === user?.id) && (
            <RentalAgreement rentalId={rental.id} onSuccess={handleRefresh} />
          )}

          {/* Pickup/Return Management */}
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <PickupReturnForm rentalId={rental.id} onSuccess={handleRefresh} />
          )}

          {/* Damage Reports */}
          <DamageReportForm rentalId={rental.id} onSuccess={handleRefresh} />
        </div>

        <div className="space-y-6">
          {/* Penalties & Fees */}
          <PenaltyDisplay rentalId={rental.id} onSuccess={handleRefresh} />

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">${rental.total_amount}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Payment Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  rental.payments.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {rental.payments.payment_status || 'pending'}
                </span>
              </div>

              {rental.payments.created_at && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Payment Date</p>
                  <p className="text-sm text-gray-600">{new Date(rental.payments.created_at).toLocaleString()}</p>
                </div>
              )}

              {rental.payments.payment_method && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-sm text-gray-600">{rental.payments.payment_method}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-lg font-semibold text-primary-600">{rental.first_name} {rental.last_name}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${rental.email}`} className="text-primary-600 hover:text-primary-500">{rental.email}</a>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${rental.phone}`} className="text-primary-600 hover:text-primary-500">{rental.phone}</a>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Role</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  rental.role === 'admin' ? 'bg-red-100 text-red-800' :
                  rental.role === 'staff' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {rental.role || 'customer'}
                </span>
              </div>
              {rental.address && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{rental.address}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Account Created</p>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">{new Date(rental.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup & Return Information */}
          {pickupReturn && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h2 className="text-lg font-medium text-gray-900">Pickup & Return Information</h2>
                </div>
              </div>
              <div className="p-6">
                {pickupReturn.pickup_datetime && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Pickup Date</p>
                    <p className="text-sm text-gray-600">{new Date(pickupReturn.pickup_datetime).toLocaleString()}</p>
                  </div>
                )}
                {pickupReturn.condition_on_pickup && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Pickup Condition</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pickupReturn.condition_on_pickup === 'excellent' ? 'bg-green-100 text-green-800' :
                      pickupReturn.condition_on_pickup === 'good' ? 'bg-blue-100 text-blue-800' :
                      pickupReturn.condition_on_pickup === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pickupReturn.condition_on_pickup}
                    </span>
                  </div>
                )}
                {pickupReturn.return_datetime && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Return Date</p>
                    <p className="text-sm text-gray-600">{new Date(pickupReturn.return_datetime).toLocaleString()}</p>
                  </div>
                )}
                {pickupReturn.condition_on_return && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Return Condition</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pickupReturn.condition_on_return === 'excellent' ? 'bg-green-100 text-green-800' :
                      pickupReturn.condition_on_return === 'good' ? 'bg-blue-100 text-blue-800' :
                      pickupReturn.condition_on_return === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pickupReturn.condition_on_return}
                    </span>
                  </div>
                )}
                {pickupReturn.return_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pickup/Return Notes</p>
                    <p className="text-sm text-gray-600">{pickupReturn.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rental Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-medium text-gray-900">Rental Timeline</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  <div className="relative flex items-start">
                    <div className="absolute left-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-yellow-300">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="ml-12">
                      <h4 className="text-sm font-medium text-gray-900">Rental Created</h4>
                      <p className="text-sm text-gray-500">{new Date(rental.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {rental.status !== 'pending' && (
                    <div className="relative flex items-start">
                      <div className="absolute left-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-300">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="ml-12">
                        <h4 className="text-sm font-medium text-gray-900">Rental Confirmed</h4>
                        <p className="text-sm text-gray-500">Status updated to confirmed</p>
                      </div>
                    </div>
                  )}
                  {rental.status === 'picked_up' && (
                    <div className="relative flex items-start">
                      <div className="absolute left-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center border-2 border-purple-300">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="ml-12">
                        <h4 className="text-sm font-medium text-gray-900">Equipment Picked Up</h4>
                        <p className="text-sm text-gray-500">Equipment collected by customer</p>
                      </div>
                    </div>
                  )}
                  {rental.status === 'returned' && (
                    <div className="relative flex items-start">
                      <div className="absolute left-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-300">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="ml-12">
                        <h4 className="text-sm font-medium text-gray-900">Equipment Returned</h4>
                        <p className="text-sm text-gray-500">Rental completed successfully</p>
                      </div>
                    </div>
                  )}
                  {rental.status === 'cancelled' && (
                    <div className="relative flex items-start">
                      <div className="absolute left-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-300">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="ml-12">
                        <h4 className="text-sm font-medium text-gray-900">Rental Cancelled</h4>
                        <p className="text-sm text-gray-500">Rental was cancelled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalDetails;
