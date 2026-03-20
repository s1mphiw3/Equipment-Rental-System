const cron = require('node-cron');
const Penalty = require('../models/Penalty');

class PenaltyScheduler {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the penalty scheduler
   * Runs daily at midnight (00:00)
   */
  start() {
    if (this.isRunning) {
      console.log('Penalty scheduler is already running');
      return;
    }

    // Schedule daily check at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('🔄 Running daily penalty check for overdue rentals...');
      await this.checkAndApplyPenalties();
    });

    this.isRunning = true;
    console.log('✅ Penalty scheduler started - will check for overdue rentals daily at midnight');

    // Also run immediately for testing (optional - remove in production)
    // this.checkAndApplyPenalties();
  }

  /**
   * Check for overdue rentals and apply penalties
   */
  async checkAndApplyPenalties() {
    try {
      // Get all overdue rentals
      const overdueRentals = await Penalty.getOverdueRentals();

      if (overdueRentals.length === 0) {
        console.log('ℹ️ No overdue rentals found');
        return;
      }

      console.log(`📋 Found ${overdueRentals.length} overdue rental(s)`);

      let penaltiesApplied = 0;
      let errors = 0;

      for (const rental of overdueRentals) {
        try {
          const penaltyId = await Penalty.applyLateReturnPenalty(rental.id);

          if (penaltyId) {
            penaltiesApplied++;
            console.log(`💰 Applied late return penalty for rental ${rental.id} (${rental.days_overdue} days overdue)`);
          } else {
            console.log(`⚠️ No penalty applied for rental ${rental.id} (already has unpaid penalty)`);
          }
        } catch (error) {
          errors++;
          console.error(`❌ Failed to apply penalty for rental ${rental.id}:`, error.message);
        }
      }

      console.log(`✅ Penalty check completed: ${penaltiesApplied} penalties applied, ${errors} errors`);

    } catch (error) {
      console.error('❌ Error during penalty check:', error);
    }
  }

  /**
   * Manually trigger penalty check (for testing)
   */
  async runManualCheck() {
    console.log('🔄 Running manual penalty check...');
    await this.checkAndApplyPenalties();
  }

  /**
   * Stop the scheduler
   */
  stop() {
    // Note: node-cron doesn't provide a direct way to stop all jobs
    // In a production app, you might want to store job references
    this.isRunning = false;
    console.log('🛑 Penalty scheduler stopped');
  }
}

module.exports = new PenaltyScheduler();
