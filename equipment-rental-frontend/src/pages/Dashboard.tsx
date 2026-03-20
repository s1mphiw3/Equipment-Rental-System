
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rentalsAPI, equipmentAPI, usersAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChartComponent from '../components/common/ChartComponent';
import toast from 'react-hot-toast';

// Type definitions
interface Rental {
  id: number;
  equipment_name: string;
  customer_name: string;
  total_amount: string;
  status: string;
  created_at: string;
  image_url?: string;
}

interface EquipmentUtilization {
  equipment_name: string;
  rental_count: number;
}

interface RevenueTrend {
  month: string;
  rental_count: number;
  monthly_revenue: number;
}

interface RevenueAnalytics {
  monthlyTrends: RevenueTrend[];
  previousYearTrends: any[];
  totalRevenue: number;
  averageMonthlyRevenue: number;
}

interface BookingPattern {
  frequencyDistribution: Record<string, number>;
}

interface AnalyticsData {
  equipmentUtilization: {
    mostRentedEquipment: EquipmentUtilization[];
    utilizationRates: any[];
  };
  customerBookingPatterns: {
    monthlyTrends: any[];
    bookingFrequency: any[];
    frequencyDistribution: Record<string, number>;
  };
  revenueAnalytics: {
    monthlyTrends: RevenueAnalytics[];
    previousYearTrends: any[];
    totalRevenue: number;
    averageMonthlyRevenue: number;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRentals: 0,
    pendingRentals: 0,
    activeRentals: 0,
    totalRevenue: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    totalUsers: 0
  });
  const [recentRentals, setRecentRentals] = useState<Rental[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    equipmentUtilization: { mostRentedEquipment: [], utilizationRates: [] },
    customerBookingPatterns: { monthlyTrends: [], bookingFrequency: [], frequencyDistribution: {} },
    revenueAnalytics: { monthlyTrends: [], previousYearTrends: [], totalRevenue: 0, averageMonthlyRevenue: 0 }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

// In your Dashboard component, add this useEffect to debug
useEffect(() => {
  if (analyticsData.revenueAnalytics.monthlyTrends.length > 0) {
    console.log('Revenue analytics data:', analyticsData.revenueAnalytics);
    console.log('Monthly trends for chart:', analyticsData.revenueAnalytics.monthlyTrends);
  }
}, [analyticsData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [rentalsRes, equipmentRes, usersRes] = await Promise.all([
        rentalsAPI.getAll(),
        equipmentAPI.getAll(),
        usersAPI.getAll()
      ]);

      const rentals = rentalsRes.data;
      const equipment = equipmentRes.data;
      const users = usersRes.data;

      // Calculate stats
      const totalRentals = rentals.length;
      const pendingRentals = rentals.filter((r: any) => r.status === 'pending').length;
      const activeRentals = rentals.filter((r: any) => ['confirmed', 'picked_up'].includes(r.status)).length;
      const totalRevenue = rentals
        .filter((r: any) => ['confirmed', 'picked_up', 'returned'].includes(r.status))
        .reduce((sum: number, rental: any) => sum + parseFloat(rental.total_amount), 0);

      const totalEquipment = equipment.length;
      const availableEquipment = equipment.filter((e: any) => e.available_quantity > 0).length;
      const totalUsers = users.length;

      setStats({
        totalRentals,
        pendingRentals,
        activeRentals,
        totalRevenue,
        totalEquipment,
        availableEquipment,
        totalUsers
      });

      // Get recent rentals (last 5)
      setRecentRentals(rentals.slice(0, 5));

      // Fetch analytics data for admin/staff users
      if (user?.role === 'admin' || user?.role === 'staff') {
        try {
          const [utilizationRes, patternsRes, revenueRes] = await Promise.all([
            analyticsAPI.getEquipmentUtilization(),
            analyticsAPI.getCustomerBookingPatterns(),
            analyticsAPI.getRevenueAnalytics()
          ]);

          setAnalyticsData({
            equipmentUtilization: utilizationRes.data,
            customerBookingPatterns: patternsRes.data,
            revenueAnalytics: revenueRes.data
          });
        } catch (analyticsError) {
          console.error('Failed to fetch analytics data:', analyticsError);
          // Don't show error toast for analytics, just log it
        }
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
      picked_up: { color: 'bg-purple-100 text-purple-800', text: 'Picked Up' },
      returned: { color: 'bg-green-100 text-green-800', text: 'Returned' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.first_name}! Here's what's happening with your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rentals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRentals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section for Admin/Staff */}
      {(user?.role === 'admin' || user?.role === 'staff') && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
            {/* Equipment Utilization Chart */}
            <ChartComponent
              type="bar"
              data={analyticsData.equipmentUtilization.mostRentedEquipment || []}
              title="Top Equipment Utilization"
              xKey="equipment_name"
              dataKey="rental_count"
              height={300}
            />

            {/* Customer Booking Patterns Chart */}
            <ChartComponent
              type="pie"
              data={Object.entries(analyticsData.customerBookingPatterns.frequencyDistribution || {}).map(([key, value]) => ({
                name: key,
                value: value
              }))}
              title="Customer Booking Frequency"
              dataKey="value"
              height={300}
            />

            {/* Revenue Analytics Chart */}
            <ChartComponent
              type="line"
              data={analyticsData.revenueAnalytics.monthlyTrends || []}
              title="Monthly Revenue Trends"
              xKey="month"
              dataKey="monthly_revenue"
              height={300}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Rentals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Rentals</h2>
              <Link to="/admin/rentals" className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentRentals.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500">No rentals yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRentals.map((rental) => (
                 <div key={rental.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                     <Link to="/admin/rentals" className="flex items-center justify-between w-full hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
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
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rental.equipment_name}</p>
                        <p className="text-xs text-gray-500">{rental.customer_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${rental.total_amount}</p>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(rental.status)}
                        <span className="text-xs text-gray-500">{formatDate(rental.created_at)}</span>
                      </div>
                    </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/admin/equipment"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition duration-200"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Manage Equipment</h3>
                  <p className="text-sm text-gray-500">Add, edit, or view equipment</p>
                </div>
              </Link>

              <Link
                to="/admin/rentals"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition duration-200"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Manage Rentals</h3>
                  <p className="text-sm text-gray-500">View and manage all rental bookings</p>
                </div>
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition duration-200"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Manage Users</h3>
                  <p className="text-sm text-gray-500">View and manage user accounts</p>
                </div>
              </Link>

              <Link
                to="/admin/damage-reports"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition duration-200"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Manage Damage Reports</h3>
                  <p className="text-sm text-gray-500">View and manage equipment damage reports</p>
                </div>
              </Link>

              <Link
                to="/admin/maintenance"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition duration-200"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Manage Maintenance</h3>
                  <p className="text-sm text-gray-500">Schedule and track equipment maintenance</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;