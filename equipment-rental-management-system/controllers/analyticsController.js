const Rental = require('../models/Rental');
const Equipment = require('../models/Equipment');
const db = require('../config/database');

const getEquipmentUtilization = async (req, res) => {
  try {
    const utilizationData = await Rental.getMostRentedEquipment(10);
    const utilizationRates = await Rental.getEquipmentUtilizationRates();

    res.json({
      success: true,
      data: {
        mostRentedEquipment: utilizationData,
        utilizationRates: utilizationRates
      }
    });
  } catch (error) {
    console.error('Get equipment utilization error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment utilization data' });
  }
};

const getCustomerBookingPatterns = async (req, res) => {
  try {
    const monthlyTrends = await Rental.getMonthlyRentalTrends();
    const bookingFrequency = await Rental.getCustomerBookingFrequency();

    // Calculate booking frequency distribution
    const frequencyDistribution = {
      '1 booking': bookingFrequency.filter(b => b.booking_count === 1).length,
      '2-3 bookings': bookingFrequency.filter(b => b.booking_count >= 2 && b.booking_count <= 3).length,
      '4-5 bookings': bookingFrequency.filter(b => b.booking_count >= 4 && b.booking_count <= 5).length,
      '6+ bookings': bookingFrequency.filter(b => b.booking_count >= 6).length
    };

    res.json({
      success: true,
      data: {
        monthlyTrends: monthlyTrends,
        bookingFrequency: bookingFrequency.slice(0, 10), // Top 10 customers
        frequencyDistribution: frequencyDistribution
      }
    });
  } catch (error) {
    console.error('Get customer booking patterns error:', error);
    res.status(500).json({ error: 'Failed to fetch customer booking patterns' });
  }
};

const getRevenueAnalytics = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const { year = currentYear } = req.query;

    console.log(`Fetching revenue analytics for year: ${year}`); // Debug log

    // Get data for current year and previous year concurrently
    const [monthlyTrends, previousYearTrends] = await Promise.all([
      Rental.getMonthlyRentalTrends(parseInt(year)),
      Rental.getMonthlyRentalTrends(parseInt(year) - 1)
    ]);

    console.log('Monthly trends raw data:', monthlyTrends); // Debug log

    // Create full year trends with all 12 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullYearTrends = monthNames.map((name, index) => {
      const monthNumber = index + 1;
      const trend = monthlyTrends.find(t => parseInt(t.month) === monthNumber);
      const revenue = trend ? parseFloat(trend.monthly_revenue) : 0;

      console.log(`Month ${monthNumber} (${name}):`, {
        found: !!trend,
        revenue,
        rawData: trend
      }); // Debug log

      return {
        month: name,
        monthNumber,
        rental_count: trend ? trend.rental_count : 0,
        monthly_revenue: revenue
      };
    });

    // Calculate metrics
    const currentYearRevenue = fullYearTrends.reduce((sum, month) => sum + month.monthly_revenue, 0);
    const previousYearRevenue = previousYearTrends.reduce((sum, month) => sum + parseFloat(month.monthly_revenue || 0), 0);
    const revenueGrowth = previousYearRevenue > 0 ?
      ((currentYearRevenue - previousYearRevenue) / previousYearRevenue * 100) : 0;

    const totalRentals = fullYearTrends.reduce((sum, month) => sum + month.rental_count, 0);

    const revenueAnalytics = {
      year: parseInt(year),
      monthlyTrends: fullYearTrends,
      previousYearTrends,
      totalRevenue: parseFloat(currentYearRevenue.toFixed(2)),
      averageMonthlyRevenue: parseFloat((currentYearRevenue / fullYearTrends.length).toFixed(2)),
      revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      totalRentals,
      averageOrderValue: totalRentals > 0 ?
        parseFloat((currentYearRevenue / totalRentals).toFixed(2)) : 0
    };

    console.log('Final analytics data:', revenueAnalytics); // Debug log

    res.json({
      success: true,
      data: revenueAnalytics
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue analytics'
    });
  }
};

const getTopCategories = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const topCategories = await Rental.getTopCategoriesByRentals(parseInt(limit));

    res.json({
      success: true,
      data: topCategories
    });
  } catch (error) {
    console.error('Get top categories error:', error);
    res.status(500).json({ error: 'Failed to fetch top categories' });
  }
};

const getMaintenanceAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    // Get maintenance cost data
    const maintenanceCosts = await db.execute(
      `SELECT
        SUM(m.cost) as total_cost,
        COUNT(*) as maintenance_count,
        AVG(m.cost) as average_cost,
        MONTH(m.maintenance_date) as month,
        YEAR(m.maintenance_date) as year
       FROM maintenance m
       WHERE m.maintenance_date BETWEEN ? AND ?
       AND m.cost IS NOT NULL
       GROUP BY YEAR(m.maintenance_date), MONTH(m.maintenance_date)
       ORDER BY m.maintenance_date`,
      [startDateStr, endDateStr]
    );

    // Get upcoming maintenance
    const upcomingMaintenance = await db.execute(
      `SELECT COUNT(*) as upcoming_count FROM maintenance
       WHERE maintenance_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
    );

    // Get overdue maintenance
    const overdueMaintenance = await db.execute(
      `SELECT COUNT(*) as overdue_count FROM maintenance
       WHERE maintenance_date < CURDATE()`
    );

    const analytics = {
      period: {
        start_date: startDateStr,
        end_date: endDateStr
      },
      maintenance_costs: maintenanceCosts[0] || [],
      upcoming_maintenance: upcomingMaintenance[0][0]?.upcoming_count || 0,
      overdue_maintenance: overdueMaintenance[0][0]?.overdue_count || 0,
      total_maintenance_cost: (maintenanceCosts[0] || []).reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0),
      total_maintenance_count: (maintenanceCosts[0] || []).reduce((sum, item) => sum + parseInt(item.maintenance_count || 0), 0)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get maintenance analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance analytics' });
  }
};

module.exports = {
  getEquipmentUtilization,
  getCustomerBookingPatterns,
  getRevenueAnalytics,
  getTopCategories,
  getMaintenanceAnalytics
};
