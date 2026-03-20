import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { equipmentAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminEquipmentForm = ({ isEdit = false }) => {
  const navigate = useNavigate(); 
  const { id } = useParams();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    daily_rate: '',
    condition: 'excellent',
    location: '',
    quantity: '',
    available_quantity: '',
    specifications: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && id) {
      fetchEquipment();
    }
  }, [id, isEdit]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentAPI.getById(id);
      const equipment = response.data;
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        category: equipment.category || '',
        daily_rate: equipment.daily_rate || '',
        condition: equipment.condition || 'excellent',
        location: equipment.location || '',
        quantity: equipment.total_quantity || '',
        available_quantity: equipment.available_quantity || '',
        specifications: equipment.specifications || '',
      });
      
      // Set image preview if image exists
      if (equipment.image_url) {
        setImagePreview(equipment.image_url);
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      toast.error('Failed to load equipment data');
      navigate('/admin/equipment');
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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.daily_rate || parseFloat(formData.daily_rate) <= 0) {
      newErrors.daily_rate = 'Daily rate must be greater than 0';
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Total quantity must be 0 or greater';
    }
    if (!formData.available_quantity || parseInt(formData.available_quantity) < 0) {
      newErrors.available_quantity = 'Available quantity must be 0 or greater';
    }
    if (parseInt(formData.available_quantity) > parseInt(formData.quantity)) {
      newErrors.available_quantity = 'Available quantity cannot exceed total quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSaving(true);

      // Create FormData object for file upload
      const submitFormData = new FormData();
      
      // Append form fields
      submitFormData.append('name', formData.name);
      submitFormData.append('description', formData.description);
      submitFormData.append('category', formData.category);
      submitFormData.append('daily_rate', parseFloat(formData.daily_rate));
      submitFormData.append('condition', formData.condition);
      submitFormData.append('location', formData.location);
      submitFormData.append('quantity', parseInt(formData.quantity));
      submitFormData.append('available_quantity', parseInt(formData.available_quantity));
      submitFormData.append('specifications', formData.specifications || '');

      // Append image file if selected
      if (imageFile) {
        submitFormData.append('image', imageFile);
      }



      if (isEdit) {
        console.log('Submitting form data:', submitFormData);

        await equipmentAPI.update(id, submitFormData);
        toast.success('Equipment updated successfully');
      } else {
        console.log('Submitting form data:', submitFormData);
        await equipmentAPI.create(submitFormData);
        toast.success('Equipment created successfully');
      }

      navigate('/admin/equipment');
    } catch (error) {
      console.error('Failed to save equipment:', error);
      toast.error(error.response?.data?.error || 'Failed to save equipment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading equipment..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isEdit ? 'Update equipment information' : 'Create a new equipment item'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter equipment name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter equipment description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              <option value="Construction">Construction</option>
              <option value="Power Tools">Power Tools</option>
              <option value="Heavy Equipment">Heavy Equipment</option>
              <option value="Lawn & Garden">Lawn & Garden</option>
              <option value="Party & Events">Party & Events</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          {/* Daily Rate */}
          <div>
            <label htmlFor="daily_rate" className="block text-sm font-medium text-gray-700 mb-2">
              Daily Rate ($) *
            </label>
            <input
              type="number"
              id="daily_rate"
              name="daily_rate"
              step="0.01"
              min="0"
              value={formData.daily_rate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.daily_rate ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.daily_rate && <p className="mt-1 text-sm text-red-600">{errors.daily_rate}</p>}
          </div>

          {/* Total Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Total Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="0"
              value={formData.quantity}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.quantity ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
          </div>

          {/* Available Quantity */}
          <div>
            <label htmlFor="available_quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Available Quantity *
            </label>
            <input
              type="number"
              id="available_quantity"
              name="available_quantity"
              min="0"
              value={formData.available_quantity}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.available_quantity ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.available_quantity && <p className="mt-1 text-sm text-red-600">{errors.available_quantity}</p>}
          </div>

          {/* Condition */}
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Storage location"
            />
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Image
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img 
                    // src={imagePreview} 
                    src={imagePreview ?`http://localhost:5000${imagePreview}`
                             :'/placeholder-equipment.jpg'}
                    alt="Equipment preview" 
                    className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                </div>



              )}
              
              {/* File Input */}
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Upload equipment image (JPEG, PNG, GIF, max 5MB)
            </p>
          </div>

          {/* Specifications */}
          <div className="md:col-span-2">
            <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-2">
              Specifications
            </label>
            <textarea
              id="specifications"
              name="specifications"
              rows={3}
              value={formData.specifications}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Technical specifications, dimensions, etc."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/equipment')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center"
          >
            {saving && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {saving ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Equipment' : 'Create Equipment')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEquipmentForm;