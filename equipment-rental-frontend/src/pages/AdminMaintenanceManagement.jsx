import React, { useState, useEffect } from 'react';
import { maintenanceAPI, equipmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminMaintenanceManagement = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [filters, setFilters] = useState({
    equipment_id: '',
    upcoming_only: false,
    past_only: false
  });

  const [formData, setFormData] = useState({
    equipment_id: '',
    maintenance_date: '',
    description: '',
    cost: '',
    performed_by: '',
    next_maintenance_date: ''
  });

  useEffect(() => {
    loadData();
  }, []); // Only run on mount, not when filters change

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintenanceRes, equipmentRes] = await Promise.all([
        maintenanceAPI.getAll(), // Fetch all without filters
        equipmentAPI.getAll()
      ]);

      setMaintenance(maintenanceRes.data || []);
      setEquipment(equipmentRes.data || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null
      };

      if (editingMaintenance) {
        await maintenanceAPI.update(editingMaintenance.id, data);
        toast.success('Maintenance record updated successfully');
      } else {
        await maintenanceAPI.create(data);
        toast.success('Maintenance record created successfully');
      }

      setShowForm(false);
      setEditingMaintenance(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving maintenance:', error);
      toast.error('Failed to save maintenance record');
    }
  };

  const handleEdit = (maintenance) => {
    setEditingMaintenance(maintenance);
    setFormData({
      equipment_id: maintenance.equipment_id,
      maintenance_date: maintenance.maintenance_date.split('T')[0],
      description: maintenance.description,
      cost: maintenance.cost || '',
      performed_by: maintenance.performed_by || '',
      next_maintenance_date: maintenance.next_maintenance_date ? maintenance.next_maintenance_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) {
      return;
    }

    try {
      await maintenanceAPI.delete(id);
      toast.success('Maintenance record deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      toast.error('Failed to delete maintenance record');
    }
  };

  const resetForm = () => {
    setFormData({
      equipment_id: '',
      maintenance_date: '',
      description: '',
      cost: '',
      performed_by: '',
      next_maintenance_date: ''
    });
  };

  const getEquipmentName = (equipmentId) => {
    const eq = equipment.find(e => e.id === equipmentId);
    return eq ? eq.name : 'Unknown Equipment';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (maintenanceDate) => {
    return new Date(maintenanceDate) < new Date();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Maintenance Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingMaintenance(null);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Maintenance Record
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment
            </label>
            <select
              value={filters.equipment_id}
              onChange={(e) => setFilters({...filters, equipment_id: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Equipment</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.upcoming_only}
                onChange={(e) => setFilters({...filters, upcoming_only: e.target.checked, past_only: false})}
                className="mr-2"
              />
              Upcoming Only
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.past_only}
                onChange={(e) => setFilters({...filters, past_only: e.target.checked, upcoming_only: false})}
                className="mr-2"
              />
              Past Only
            </label>
          </div>
        </div>
      </div>

      {/* Maintenance Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingMaintenance ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment *
                </label>
                <select
                  value={formData.equipment_id}
                  onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Equipment</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance Date *
                </label>
                <input
                  type="date"
                  value={formData.maintenance_date}
                  onChange={(e) => setFormData({...formData, maintenance_date: e.target.value})}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the maintenance performed..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Performed By
                </label>
                <input
                  type="text"
                  value={formData.performed_by}
                  onChange={(e) => setFormData({...formData, performed_by: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Technician name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Maintenance Date
                </label>
                <input
                  type="date"
                  value={formData.next_maintenance_date}
                  onChange={(e) => setFormData({...formData, next_maintenance_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingMaintenance ? 'Update' : 'Create'} Record
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMaintenance(null);
                  resetForm();
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Maintenance List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading maintenance records...</p>
          </div>
        ) : maintenance.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No maintenance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Maintenance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenance.map((item) => (
                  <tr key={item.id} className={isOverdue(item.maintenance_date) ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getEquipmentName(item.equipment_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(item.maintenance_date)}
                      </div>
                      {isOverdue(item.maintenance_date) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.cost ? `$${item.cost}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.performed_by || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.next_maintenance_date ? formatDate(item.next_maintenance_date) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMaintenanceManagement;
