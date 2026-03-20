import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { damageReportsAPI } from '../services/api';
import ChartComponent from '../components/common/ChartComponent';
import toast from 'react-hot-toast';

const AdminDamageStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
    fetchTrends();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await damageReportsAPI.getEnhancedStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching damage statistics:', error);
      toast.error('Failed to fetch damage statistics');
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await damageReportsAPI.getDamageTrends();
      // Transform trends data to suitable format: [{ date: 'YYYY-MM-DD', count: number }, ...]
      // Strip time from date string if present
      const formattedData = (response.data || []).map(item => ({
        ...item,
        date: item.date.split('T')[0]
      }));
      setTrendsData(formattedData);
    } catch (error) {
      console.error('Error fetching damage trends:', error);
      toast.error('Failed to fetch damage trends');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Damage Statistics</h1>
        <Link
          to="/admin/damage-reports"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          View All Reports
        </Link>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Severity Statistics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Damage Severity Breakdown</h2>
            <div className="space-y-4">
              {statistics.severity_breakdown && statistics.severity_breakdown.map((stat) => (
                <div key={stat.severity_level} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {stat.severity_level}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">{stat.count} reports</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(stat.count / Math.max(...statistics.severity_breakdown.map(s => s.count))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Statistics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Cost Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Total Estimated Cost</span>
                <span className="text-lg font-bold text-green-600">
                  ${statistics.total_costs?.total_estimated || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Total Actual Cost</span>
                <span className="text-lg font-bold text-red-600">
                  ${statistics.total_costs?.total_actual || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Cost Difference</span>
                <span className={`text-lg font-bold ${(statistics.total_costs?.total_actual || 0) - (statistics.total_costs?.total_estimated || 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${(statistics.total_costs?.total_actual || 0) - (statistics.total_costs?.total_estimated || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Reports</h3>
          <p className="text-3xl font-bold text-blue-600">
            {statistics?.severity_breakdown?.reduce((sum, stat) => sum + stat.count, 0) || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Critical Damages</h3>
          <p className="text-3xl font-bold text-red-600">
            {statistics?.severity_breakdown?.find(stat => stat.severity_level === 'critical')?.count || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reviews</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {statistics?.pending_count || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Repaired</h3>
          <p className="text-3xl font-bold text-green-600">
            {statistics?.repaired_count || 0}
          </p>
        </div>
      </div>

      {/* Damage Trends Chart */}
      <ChartComponent
        type="line"
        data={trendsData}
        title="Damage Trends (Last 30 days)"
        xKey="date"
        dataKey="count"
        height={300}
      />
    </div>
  );
};

export default AdminDamageStatistics;
