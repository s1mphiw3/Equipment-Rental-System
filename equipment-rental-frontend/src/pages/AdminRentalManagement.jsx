import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rentalsAPI, equipmentAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminRentalManagement = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRentals(currentPage);
    fetchEquipment();
  }, [statusFilter, currentPage]);

  const fetchRentals = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);
      const response = await rentalsAPI.getAll(params.toString());
      setRentals(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
      setError('Failed to load rentals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll();
      setEquipment(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  const handleStatusUpdate = async (rentalId, newStatus) => {
    try {
      await rentalsAPI.updateStatus(rentalId, newStatus);
      setRentals(rentals.map(rental =>
        rental.id === rentalId ? { ...rental, status: newStatus } : rental
      ));
      toast.success(`Rental status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update rental status:', error);
      toast.error('Failed to update rental status. Please try again.');
    }
  };

  const handleMaintenanceToggle = async (equipmentId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await equipmentAPI.setMaintenance(equipmentId, newStatus);
      setEquipment(equipment.map(item =>
        item.id === equipmentId ? { ...item, under_maintenance: newStatus } : item
      ));
      toast.success(`Equipment ${newStatus ? 'marked for maintenance' : 'removed from maintenance'}`);
    } catch (error) {
      console.error('Failed to update maintenance status:', error);
      toast.error('Failed to update maintenance status. Please try again.');
    }
  };

  const handleCancelOrder = async (rentalId) => {
    if (window.confirm('Are you sure you want to cancel this rental order?')) {
      try {
        await rentalsAPI.updateStatus(rentalId, 'cancelled');
        setRentals(rentals.map(rental =>
          rental.id === rentalId ? { ...rental, status: 'cancelled' } : rental
        ));
        toast.success('Rental order cancelled successfully');
      } catch (error) {
        console.error('Failed to cancel rental order:', error);
        toast.error('Failed to cancel rental order. Please try again.');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
      picked_up: { color: 'bg-purple-100 text-purple-800', text: 'Picked Up' },
      returned: { color: 'bg-green-100 text-green-800', text: 'Returned' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['pending', 'confirmed', 'picked_up', 'returned', 'cancelled'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner text="Loading rentals..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rental Management</h1>
          <p className="mt-2 text-gray-600">View and manage all rental bookings</p>
        </div>
      </div>

      {/* Equipment Maintenance Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipment Maintenance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">Available: {item.available_quantity}</p>
                </div>
                <button
                  onClick={() => handleMaintenanceToggle(item.id, item.under_maintenance)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.under_maintenance
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {item.under_maintenance ? 'In Maintenance' : 'Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="picked_up">Picked Up</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {pagination ? `${pagination.totalCount} rental${pagination.totalCount !== 1 ? 's' : ''} found` : `${rentals.length} rental${rentals.length !== 1 ? 's' : ''} found`}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Rentals Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rental Details
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rentals found</h3>
                    <p className="text-gray-500">No rental bookings match the current filters.</p>
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {rental.image_url ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={`http://localhost:5000${rental.image_url}`}
                              alt={rental.equipment_name}
                              onError={(e) => {
                                e.target.src = '/placeholder-equipment.jpg';
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{rental.equipment_name}</div>
                          <div className="text-sm text-gray-500">ID: {rental.id}</div>
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rental.customer_name}</div>
                      <div className="text-sm text-gray-500">{rental.customer_email}</div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(rental.start_date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {formatDate(rental.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(rental.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(rental.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/admin/rentals/${rental.id}`)}
                          className="text-primary-600 hover:text-primary-900 bg-primary-50 px-3 py-1 rounded-md text-sm border border-primary-300"
                        >
                          View Details
                        </button>
                        {rental.status !== 'cancelled' && rental.status !== 'returned' && (
                          <button
                            onClick={() => handleCancelOrder(rental.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md text-sm border border-red-300"
                          >
                            Cancel Order
                          </button>
                        )}
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleStatusUpdate(rental.id, e.target.value);
                              e.target.value = ''; // Reset select
                            }
                          }}
                          className="text-primary-600 hover:text-primary-900 bg-primary-50 px-3 py-1 rounded-md text-sm border border-primary-300"
                        >
                          <option value="">Update Status</option>
                          {getStatusOptions(rental.status).map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
    </div>
  );
};

export default AdminRentalManagement;
