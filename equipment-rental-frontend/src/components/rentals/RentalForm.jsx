import React, { useState, useEffect } from 'react';
import { equipmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RentalForm = ({ equipmentId, onSubmit, onCancel }) => {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(null);
  const [formData, setFormData] = useState({
    quantity: 1,
    start_date: '',
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, [equipmentId]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentAPI.getById(equipmentId);
      setEquipment(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      toast.error('Failed to load equipment details');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!formData.start_date || !formData.end_date) {
      return;
    }

    try {
      const response = await equipmentAPI.checkAvailability({
        equipmentId,
        startDate: formData.start_date,
        endDate: formData.end_date
      });
      setAvailability(response);
    } catch (error) {
      console.error('Availability check failed:', error);
      toast.error('Failed to check availability');
    }
  };

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const timer = setTimeout(checkAvailability, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.start_date, formData.end_date]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!availability?.available) {
      toast.error('Please select available dates');
      return;
    }

    onSubmit({
      equipment_id: equipmentId,
      ...formData
    });
  };

  const calculateDuration = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Equipment not found.</p>
      </div>
    );
  }

  const duration = calculateDuration();
  const totalCost = duration * equipment.daily_rate * formData.quantity;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Equipment Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          {equipment.image_url && (
            <img
              src={equipment.image_url}
              alt={equipment.name}
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{equipment.name}</h3>
            <p className="text-sm text-gray-600">{equipment.category_name}</p>
            <p className="text-lg font-bold text-primary-600">
              ${equipment.daily_rate} <span className="text-sm font-normal text-gray-500">per day</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quantity Selection */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity *
        </label>
        <select
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          required
          className="input-field"
        >
          {Array.from({ length: Math.min(equipment.available_quantity, 10) }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">
          Available: {equipment.available_quantity} out of {equipment.quantity} total
        </p>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            required
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date *
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleInputChange}
            min={formData.start_date || new Date().toISOString().split('T')[0]}
            required
            className="input-field"
          />
        </div>
      </div>

      {/* Availability Check */}
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

      {/* Duration and Cost Calculation */}
      {duration > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Rental Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Duration:</span>
              <span className="ml-2 font-medium">{duration} day{duration !== 1 ? 's' : ''}</span>
            </div>
            <div>
              <span className="text-blue-700">Quantity:</span>
              <span className="ml-2 font-medium">{formData.quantity}</span>
            </div>
            <div>
              <span className="text-blue-700">Daily Rate:</span>
              <span className="ml-2 font-medium">${equipment.daily_rate}</span>
            </div>
            <div className="col-span-2 border-t border-blue-200 pt-2">
              <span className="text-blue-900 font-semibold">Total Cost:</span>
              <span className="ml-2 text-lg font-bold text-blue-900">${totalCost}</span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Any special requirements or notes..."
          className="input-field resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!availability?.available}
          className={`flex-1 ${
            availability?.available ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Payment
        </button>
      </div>
    </form>
  );
};

export default RentalForm;