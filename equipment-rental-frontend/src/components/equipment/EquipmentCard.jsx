import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { equipmentAPI } from '../../services/api';

const EquipmentCard = ({ equipment }) => {
  const [daysUntilAvailable, setDaysUntilAvailable] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (equipment.available_quantity <= 0) {
      setLoading(true);
      equipmentAPI.getDaysUntilAvailable(equipment.id)
        .then(response => {
          setDaysUntilAvailable(response.daysUntilAvailable);
          console.log(daysUntilAvailable);
        })
        .catch(error => {
          console.error('Error fetching days until available:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [equipment.id, equipment.available_quantity]);

  const getStatusBadge = (isAvailable) => {
    if (isAvailable) {
      return (
        <span className="badge badge-success">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
          Available
        </span>
      );
    }
    return (
      <span className="badge badge-error">
        <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
        Unavailable
      </span>
    );
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-white relative overflow-hidden">
        {equipment.image_url ? (
          <img
            src={equipment.image_url ?`http://localhost:5000${equipment.image_url}`
                             :'/placeholder-equipment.jpg'}
            alt={equipment.name}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3">
          {getStatusBadge(equipment.available_quantity > 0)}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
            {equipment.category_name}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {equipment.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {equipment.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${equipment.daily_rate}
            </span>
            <span className="text-sm text-gray-500 ml-1">/day</span>
          </div>
          {equipment.hourly_rate && (
            <span className="text-sm text-gray-500">
              ${equipment.hourly_rate}/hr
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Stock: {equipment.available_quantity}/{equipment.quantity}</span>
          {equipment.weekly_rate && (
            <span>${equipment.weekly_rate}/wk</span>
          )}
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/equipment/${equipment.id}`}
            className="flex-1 btn-secondary text-center text-sm py-2"
          >
            View Details
          </Link>
          <Link
            to={`/checkout?equipment=${equipment.id}`}
            className={`flex-1 text-center text-sm py-2 rounded-lg font-medium transition duration-200 ${
              equipment.available_quantity > 0
                ? 'btn-primary'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => !(equipment.available_quantity > 0) && e.preventDefault()}
          >
            {equipment.available_quantity > 0 ? 'Rent Now' :
             loading ? 'Loading...' :
             
             daysUntilAvailable === 0 ? 'Available Soon' :
             daysUntilAvailable === 1 ? 'Available in 1 day' :
             daysUntilAvailable ? `Available in ${daysUntilAvailable} days` : 'Unavailable'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;