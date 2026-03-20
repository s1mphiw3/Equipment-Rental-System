import React, { useState, useEffect } from 'react';
import { pickupReturnsAPI, usersAPI } from '../../services/api';

const PickupReturnForm = ({ rentalId, onSuccess }) => {
  const [pickupReturn, setPickupReturn] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    pickup_staff_id: '',
    pickup_datetime: '',
    pickup_notes: '',
    condition_on_pickup: '',
    return_staff_id: '',
    return_datetime: '',
    return_notes: '',
    condition_on_return: ''
  });

  useEffect(() => {
    loadPickupReturn();
    loadStaff();
  }, [rentalId]);

  const loadPickupReturn = async () => {
    try {
      setLoading(true);
      const response = await pickupReturnsAPI.getByRental(rentalId);
      setPickupReturn(response.data);
    } catch {
      // No pickup/return record exists yet - that's okay
      setPickupReturn(null);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await usersAPI.getAll();
      // Filter to only staff and admin users
      const staffUsers = response.data.filter(user => user.role === 'staff' || user.role === 'admin');
      setStaff(staffUsers);
    } catch (err) {
      console.error('Failed to load staff:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createPickupReturn = async () => {
    try {
      setSaving(true);
      setError('');
      await pickupReturnsAPI.create({ rental_id: rentalId });
      await loadPickupReturn(); // Reload to get the created record
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create pickup/return record');
    } finally {
      setSaving(false);
    }
  };

  const processPickup = async () => {
    try {
      setSaving(true);
      setError('');
      await pickupReturnsAPI.processPickup(pickupReturn.id, {
        pickup_staff_id: formData.pickup_staff_id,
        pickup_datetime: formData.pickup_datetime,
        pickup_notes: formData.pickup_notes,
        condition_on_pickup: formData.condition_on_pickup
      });
      await loadPickupReturn(); // Reload to get updated data
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process pickup');
    } finally {
      setSaving(false);
    }
  };

  const processReturn = async () => {
    try {
      setSaving(true);
      setError('');
      await pickupReturnsAPI.processReturn(pickupReturn.id, {
        return_staff_id: formData.return_staff_id,
        return_datetime: formData.return_datetime,
        return_notes: formData.return_notes,
        condition_on_return: formData.condition_on_return
      });
      await loadPickupReturn(); // Reload to get updated data
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process return');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pickup & Return Management</h2>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading pickup/return information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Pickup & Return Management</h2>
      </div>
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!pickupReturn ? (
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              No pickup/return record has been created for this rental yet.
            </p>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={createPickupReturn}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Creating...
                </>
              ) : (
                'Create Pickup/Return Record'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pickup Information</h3>
              {pickupReturn.pickup_datetime ? (
                <div className="border border-gray-200 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-gray-700">Pickup Date/Time:</strong><br />
                      <span className="text-gray-600">{new Date(pickupReturn.pickup_datetime).toLocaleString()}</span>
                    </div>
                    <div>
                      <strong className="text-gray-700">Pickup Staff:</strong><br />
                      <span className="text-gray-600">{pickupReturn.pickup_staff_first_name && pickupReturn.pickup_staff_last_name ? `${pickupReturn.pickup_staff_first_name} ${pickupReturn.pickup_staff_last_name}` : 'N/A'}</span>
                    </div>
                  </div>
                  {pickupReturn.pickup_notes && (
                    <div className="mt-3">
                      <strong className="text-gray-700">Pickup Notes:</strong><br />
                      <span className="text-gray-600">{pickupReturn.pickup_notes}</span>
                    </div>
                  )}
                  {pickupReturn.condition_on_pickup && (
                    <div className="mt-3">
                      <strong className="text-gray-700">Condition on Pickup:</strong><br />
                      <span className="text-gray-600">{pickupReturn.condition_on_pickup}</span>
                    </div>
                  )}
                </div>
              ) : (
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Staff</label>
                      <select
                        name="pickup_staff_id"
                        value={formData.pickup_staff_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select staff member</option>
                        {staff.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.first_name} {member.last_name} ({member.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date & Time</label>
                      <input
                        type="datetime-local"
                        name="pickup_datetime"
                        value={formData.pickup_datetime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition on Pickup</label>
                    <select
                      name="condition_on_pickup"
                      value={formData.condition_on_pickup}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select condition</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Notes</label>
                    <textarea
                      rows={3}
                      name="pickup_notes"
                      value={formData.pickup_notes}
                      onChange={handleInputChange}
                      placeholder="Any notes about the pickup process..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={processPickup}
                    disabled={saving || !formData.pickup_staff_id || !formData.pickup_datetime || !formData.condition_on_pickup}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        Processing Pickup...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Process Pickup
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Return Information</h3>
              {pickupReturn.return_datetime ? (
                <div className="border border-gray-200 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-gray-700">Return Date/Time:</strong><br />
                      <span className="text-gray-600">{new Date(pickupReturn.return_datetime).toLocaleString()}</span>
                    </div>
                    <div>
                      <strong className="text-gray-700">Return Staff:</strong><br />
                      <span className="text-gray-600">{pickupReturn.return_staff_first_name && pickupReturn.return_staff_last_name ? `${pickupReturn.return_staff_first_name} ${pickupReturn.return_staff_last_name}` : 'N/A'}</span>
                    </div>
                  </div>
                  {pickupReturn.return_notes && (
                    <div className="mt-3">
                      <strong className="text-gray-700">Return Notes:</strong><br />
                      <span className="text-gray-600">{pickupReturn.return_notes}</span>
                    </div>
                  )}
                  {pickupReturn.condition_on_return && (
                    <div className="mt-3">
                      <strong className="text-gray-700">Condition on Return:</strong><br />
                      <span className="text-gray-600">{pickupReturn.condition_on_return}</span>
                    </div>
                  )}
                </div>
              ) : pickupReturn.pickup_datetime ? (
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Staff</label>
                      <select
                        name="return_staff_id"
                        value={formData.return_staff_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select staff member</option>
                        {staff.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.first_name} {member.last_name} ({member.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Date & Time</label>
                      <input
                        type="datetime-local"
                        name="return_datetime"
                        value={formData.return_datetime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition on Return</label>
                    <select
                      name="condition_on_return"
                      value={formData.condition_on_return}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select condition</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Return Notes</label>
                    <textarea
                      rows={3}
                      name="return_notes"
                      value={formData.return_notes}
                      onChange={handleInputChange}
                      placeholder="Any notes about the return process..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={processReturn}
                    disabled={saving || !formData.return_staff_id || !formData.return_datetime || !formData.condition_on_return}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        Processing Return...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Process Return
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <p className="text-gray-500">Equipment must be picked up before it can be returned.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupReturnForm;
