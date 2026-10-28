const cron = require('node-cron');
const shippingFollowUpService = require('../services/shippingFollowUpService');

let schedulerTask = null;
let isTickRunning = false;

const start = () => {
  if (schedulerTask) {
    return schedulerTask;
  }

  if (process.env.SHIPPING_FOLLOWUP_CRON === 'false') {
    console.log('ℹ️ [SHIPPING-FOLLOWUP-CRON] Disabled by environment');
    return null;
  }

  // Run every 30 minutes
  schedulerTask = cron.schedule('*/30 * * * *', async () => {
    if (isTickRunning) {
      console.log('⚠️ [SHIPPING-FOLLOWUP-CRON] Previous check still running, skipping');
      return;
    }

    isTickRunning = true;
    try {
      const result = await shippingFollowUpService.runAll();
      if (result.alerts > 0 || result.tickets > 0) {
        console.log(
          `✅ [SHIPPING-FOLLOWUP-CRON] Scanned ${result.scanned} orders. Sent: ${result.alerts} alerts, ${result.tickets} tickets.`
        );
      }
    } catch (error) {
      console.error('❌ [SHIPPING-FOLLOWUP-CRON] Check execution failed:', error);
    } finally {
      isTickRunning = false;
    }
  });

  console.log('✅ [SHIPPING-FOLLOWUP-CRON] Started (running every 30 minutes)');
  return schedulerTask;
};

const stop = () => {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
  }
};

module.exports = {
  start,
  stop,
};
