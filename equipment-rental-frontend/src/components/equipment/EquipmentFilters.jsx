import React, { useState, useEffect } from 'react';
import { equipmentAPI } from '../../services/api';

const EquipmentFilters = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    available: false,
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: ''
  });

  // Initialize filters from props (URL params)
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...(initialFilters.category && { category: initialFilters.category }),
        ...(initialFilters.search && { search: initialFilters.search }),
        ...(initialFilters.available !== undefined && { available: initialFilters.available }),
        ...(initialFilters.startDate && { startDate: initialFilters.startDate }),
        ...(initialFilters.endDate && { endDate: initialFilters.endDate }),
        ...(initialFilters.minPrice && { minPrice: initialFilters.minPrice }),
        ...(initialFilters.maxPrice && { maxPrice: initialFilters.maxPrice })
      }));
    }
  }, [initialFilters]);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await equipmentAPI.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to empty array if API fails
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = { search: '', category: '', available: false, startDate: '', endDate: '', minPrice: '', maxPrice: '' };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = filters.search || filters.category || filters.available || filters.startDate || filters.endDate || filters.minPrice || filters.maxPrice;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="space-y-6">
        {/* First Row: Search, Category, Availability */}
        <div className="flex flex-col lg:flex-row lg:items-end space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Equipment
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
              disabled={loadingCategories}
            >
              <option value="">
                {loadingCategories ? 'Loading categories...' : 'All Categories'}
              </option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="available"
              checked={filters.available}
              onChange={(e) => handleFilterChange('available', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">
              Show Available Only
            </label>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Second Row: Date Range and Price Range */}
        <div className="flex flex-col lg:flex-row lg:items-end space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Start Date */}
          <div className="flex-1">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Rental Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field"
            />
          </div>

          {/* End Date */}
          <div className="flex-1">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Rental End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Min Price */}
          <div className="flex-1">
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Min Price per Day ($)
            </label>
            <input
              type="number"
              id="minPrice"
              placeholder="0"
              min="0"
              step="0.01"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Max Price */}
          <div className="flex-1">
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Max Price per Day ($)
            </label>
            <input
              type="number"
              id="maxPrice"
              placeholder="No limit"
              min="0"
              step="0.01"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Category: {categories.find(c => c.id == filters.category)?.name}
              <button
                onClick={() => handleFilterChange('category', '')}
                className="ml-1 hover:text-green-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.available && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Available Only
              <button
                onClick={() => handleFilterChange('available', false)}
                className="ml-1 hover:text-purple-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.startDate && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              From: {new Date(filters.startDate).toLocaleDateString()}
              <button
                onClick={() => handleFilterChange('startDate', '')}
                className="ml-1 hover:text-orange-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.endDate && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              To: {new Date(filters.endDate).toLocaleDateString()}
              <button
                onClick={() => handleFilterChange('endDate', '')}
                className="ml-1 hover:text-orange-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.minPrice && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Min: ${filters.minPrice}
              <button
                onClick={() => handleFilterChange('minPrice', '')}
                className="ml-1 hover:text-yellow-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Max: ${filters.maxPrice}
              <button
                onClick={() => handleFilterChange('maxPrice', '')}
                className="ml-1 hover:text-yellow-600"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentFilters;