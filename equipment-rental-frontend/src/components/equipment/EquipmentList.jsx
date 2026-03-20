import React, { useState, useEffect } from 'react';
import { equipmentAPI } from '../../services/api';
import EquipmentCard from './EquipmentCard';
import EquipmentFilters from './EquipmentFilters';
import LoadingSpinner from '../common/LoadingSpinner';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    available: false,
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });

  // Initialize filters from URL params on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam || searchParam) {
      setFilters(prev => ({
        ...prev,
        ...(categoryParam && { category: categoryParam }),
        ...(searchParam && { search: searchParam })
      }));
    }
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.available) params.append('available', 'true');
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('page', pagination.current);
      params.append('limit', '12');

      // Pass the URLSearchParams object directly to the API
      const response = await equipmentAPI.getAll(params);
      setEquipment(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      setError('Failed to load equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch equipment when filters or pagination changes
  useEffect(() => {
    fetchEquipment();
  }, [filters, pagination.current]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && equipment.length === 0) {
    return <LoadingSpinner text="Loading equipment..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Equipment</h1>
        <p className="mt-2 text-gray-600">Browse our wide range of rental equipment</p>
      </div> */}

      <EquipmentFilters 
        onFilterChange={handleFilterChange} 
        initialFilters={filters}
      />

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {equipment.map(item => (
          <EquipmentCard key={item.id} equipment={item} />
        ))}
      </div>

      {equipment.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
          <p className="text-gray-500">Try adjusting your search filters or browse all equipment.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-12">
          <button
            onClick={() => handlePageChange(pagination.current - 1)}
            disabled={!pagination.hasPrev}
            className={`px-4 py-2 rounded-lg border ${
              pagination.hasPrev
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {[...Array(pagination.total)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg border ${
                    page === pagination.current
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.current + 1)}
            disabled={!pagination.hasNext}
            className={`px-4 py-2 rounded-lg border ${
              pagination.hasNext
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;