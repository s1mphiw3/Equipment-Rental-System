import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rentalsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const RentalHistory = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRentals(currentPage);
  }, [currentPage]);

  const fetchRentals = async (page = 1) => {
    try {
      setLoading(true);
      const response = await rentalsAPI.getMyRentals({ page, limit: 10 });
      setRentals(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
      setError('Failed to load rental history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'badge-warning', text: 'Pending' },
      confirmed: { color: 'badge-info', text: 'Confirmed' },
      picked_up: { color: 'badge-info', text: 'Picked Up' },
      returned: { color: 'badge-success', text: 'Returned' },
      cancelled: { color: 'badge-error', text: 'Cancelled' }
    };

    const config = statusConfig[status] || { color: 'badge-gray', text: status };
    return <span className={`badge ${config.color}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCancelRental = async (rentalId) => {
    if (!window.confirm('Are you sure you want to cancel this rental?')) {
      return;
    }

    try {
      await rentalsAPI.cancel(rentalId);
      fetchRentals(); // Refresh the list
    } catch (error) {
      console.error('Failed to cancel rental:', error);
      alert('Failed to cancel rental. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your rentals..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Rentals</h2>
        <span className="text-sm text-gray-500">
          {pagination ? `${pagination.totalCount} rental${pagination.totalCount !== 1 ? 's' : ''}` : `${rentals.length} rental${rentals.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {rentals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rentals yet</h3>
          <p className="text-gray-500 mb-4">Start by browsing our equipment and make your first rental!</p>
          <a
            href="/equipment"
            className="btn-primary inline-block"
          >
            Browse Equipment
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <div key={rental.id} className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    {rental.image_url && (
         <img
            src={rental.image_url ?`http://localhost:5000${rental.image_url}`
                             :'/placeholder-equipment.jpg'}
            alt={rental.name}
             className="w-16 h-16 object-cover rounded-lg"
          />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rental.equipment_name}
                        </h3>
                        {getStatusBadge(rental.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span>${rental.total_amount}</span>
                        </div>
                      </div>
                      
                      {rental.category_name && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                            {rental.category_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-2">
                  {(rental.status === 'pending' || rental.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancelRental(rental.id)}
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition duration-200"
                    >
                      Cancel
                    </button>
                  )}
                  <Link
                    to={`/rentals/${rental.id}`}
                    className="px-4 py-2 text-sm text-primary-600 hover:text-primary-800 border border-primary-300 rounded-lg hover:bg-primary-50 transition duration-200 inline-block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              
              {rental.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Notes:</strong> {rental.notes}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RentalHistory;