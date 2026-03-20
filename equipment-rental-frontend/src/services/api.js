import axios from 'axios';

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password, twoFactorCode) => api.post('/auth/login', { email, password, twoFactorCode }),
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  setup2FA: () => api.post('/auth/2fa/setup'),
  verify2FA: (code) => api.post('/auth/2fa/verify', { code }),
  disable2FA: (code) => api.post('/auth/2fa/disable', { code }),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Equipment API
export const equipmentAPI = {
  getAll: (params = {}) => {
    // Handle both plain objects and URLSearchParams
    let queryString = '';
    if (params instanceof URLSearchParams) {
      // URLSearchParams already has a toString method
      queryString = params.toString();
    } else {
      // Filter out empty values from plain object
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      );
      queryString = new URLSearchParams(filteredParams).toString();
    }
    return api.get(`/equipment${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/equipment/${id}`),
  getDaysUntilAvailable: (id) => api.get(`/equipment/${id}/days-until-available`),
  getCategories: () => api.get('/equipment/categories'),
  checkAvailability: (data) => api.post('/equipment/check-availability', data),
  getAvailability: (equipmentId, startDate, endDate) =>
    api.post('/equipment/availability', { equipmentId, startDate, endDate }),
    create: (formData) => {
    return api.post('/equipment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  update: (id, formData) => {
    return api.put(`/equipment/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  setMaintenance: (id, underMaintenance) => api.put(`/equipment/${id}/maintenance`, { underMaintenance }),
  delete: (id) => api.delete(`/equipment/${id}`),
};

// Rentals API
export const rentalsAPI = {
  create: (data) => api.post('/rentals', data),
  getMyRentals: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/rentals/my-rentals${queryString ? `?${queryString}` : ''}`);
  },
  getAll: (params = '') => api.get(`/rentals?${params}`),
  getById: (id) => api.get(`/rentals/${id}`),
  updateStatus: (id, status) => api.put(`/rentals/${id}/status`, { status }),
  cancel: (id) => api.put(`/rentals/${id}/cancel`),
};

// Payments API
export const paymentsAPI = {
  createIntent: (data) => api.post('/payments/create-intent', data),
  confirm: (data) => api.post('/payments/confirm', data),
  getRentalPayments: (rentalId) => api.get(`/payments/rental/${rentalId}`),
  refund: (paymentId) => api.post(`/payments/${paymentId}/refund`),
};

// Users API (Admin only)
export const usersAPI = {
  getAll: (params = {}) => {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
    );
    const queryString = new URLSearchParams(filteredParams).toString();
    return api.get(`/users${queryString ? `?${queryString}` : ''}`);
  },
  updateStatus: (id, is_active) => api.put(`/users/${id}/status`, { is_active }),
};

// Analytics API (Admin/Staff only)
export const analyticsAPI = {
  getEquipmentUtilization: () => api.get('/analytics/equipment-utilization'),
  getCustomerBookingPatterns: () => api.get('/analytics/customer-booking-patterns'),
  getRevenueAnalytics: () => api.get('/analytics/revenue-analytics'),
  getTopCategories: (limit = 5) => api.get(`/analytics/top-categories?limit=${limit}`),
  getMaintenanceAnalytics: (startDate, endDate) => api.get(`/analytics/maintenance?startDate=${startDate}&endDate=${endDate}`)
};

// Maintenance API (Admin/Staff only)
export const maintenanceAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      // Skip empty strings and convert string booleans to actual booleans
      if (value !== undefined && value !== null && value !== '') {
        // Convert string 'true'/'false' to actual boolean
        if (value === 'true') {
          params.append(key, true);
        } else if (value === 'false') {
          // Skip false values
        } else {
          params.append(key, value);
        }
      }
    });
    return api.get(`/maintenance?${params.toString()}`);
  },
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
  getUpcoming: (days = 30) => api.get(`/maintenance/upcoming?days=${days}`),
  getOverdue: () => api.get('/maintenance/overdue'),
  getHistory: (equipmentId) => api.get(`/maintenance/equipment/${equipmentId}`),
  getCosts: (startDate, endDate) => api.get(`/maintenance/costs?startDate=${startDate}&endDate=${endDate}`),
  getNextDates: () => api.get('/maintenance/next-dates')
};

// Rental Agreements API
export const rentalAgreementsAPI = {
  generate: (rentalId) => api.post(`/rental-agreements/${rentalId}/generate`),
  getByRental: (rentalId) => api.get(`/rental-agreements/${rentalId}`),
  download: (rentalId) => api.get(`/rental-agreements/${rentalId}/download`, { responseType: 'blob' }),
  sign: (rentalId) => api.put(`/rental-agreements/${rentalId}/sign`),
  getAll: (params = '') => api.get(`/rental-agreements?${params}`),
};

// Pickup/Returns API
export const pickupReturnsAPI = {
  create: (data) => api.post('/pickup-returns', data),
  getByRental: (rentalId) => api.get(`/pickup-returns/rental/${rentalId}`),
  processPickup: (id, data) => api.put(`/pickup-returns/${id}/pickup`, data),
  processReturn: (id, data) => api.put(`/pickup-returns/${id}/return`, data),
  getPendingPickups: () => api.get('/pickup-returns/pending-pickups'),
  getPendingReturns: () => api.get('/pickup-returns/pending-returns'),
  getOverdueReturns: () => api.get('/pickup-returns/overdue-returns'),
  getAll: (params = '') => api.get(`/pickup-returns?${params}`),
};

  // Damage Reports API
  export const damageReportsAPI = {
    create: (formData) => api.post('/damage-reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getByRental: (rentalId) => api.get(`/damage-reports/rental/${rentalId}`),
    getById: (id) => api.get(`/damage-reports/${id}`),
    update: (id, formData) => api.put(`/damage-reports/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateStatus: (id, data) => api.put(`/damage-reports/${id}/status`, data),
    getPending: () => api.get('/damage-reports/pending'),
    getStatistics: () => api.get('/damage-reports/statistics'),
    getEnhancedStatistics: () => api.get('/damage-reports/enhanced-statistics'),
    getDamageTrends: () => api.get('/damage-reports/trends'),
    getAll: (params = {}) => {
      // Filter out empty values
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      );
      const queryString = new URLSearchParams(filteredParams).toString();
      return api.get(`/damage-reports${queryString ? `?${queryString}` : ''}`);
    },
    delete: (id) => api.delete(`/damage-reports/${id}`),
  };

// Penalties API
export const penaltiesAPI = {
  create: (data) => api.post('/penalties', data),
  getByRental: (rentalId) => api.get(`/penalties/rental/${rentalId}`),
  getById: (id) => api.get(`/penalties/${id}`),
  payPenalty: (id, data) => api.put(`/penalties/${id}/pay`, data),
  calculateLateReturn: (rentalId) => api.get(`/penalties/${rentalId}/calculate-late`),
  applyLateReturn: (rentalId) => api.post(`/penalties/${rentalId}/apply-late`),
  getUnpaidByRental: (rentalId) => api.get(`/penalties/rental/${rentalId}/unpaid`),
  getSummary: () => api.get('/penalties/summary/stats'),
  getOverdueRentals: () => api.get('/penalties/overdue-rentals'),
  getAll: (params = '') => api.get(`/penalties?${params}`),
};

// Penalty Payments API
export const penaltyPaymentsAPI = {
  createIntent: (data) => api.post('/penalty-payments/create-intent', data),
  confirm: (data) => api.post('/penalty-payments/confirm', data),
  getPenaltyPayments: (penaltyId) => api.get(`/penalty-payments/penalty/${penaltyId}`),
};

export default api;
