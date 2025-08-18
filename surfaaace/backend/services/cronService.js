import cron from 'node-cron';
import Domain from '../models/Domain.js';
import Scan from '../models/Scan.js';
import User from '../models/User.js';
import discoveryService from './discoveryService.js';
import vulnerabilityService from './vulnerabilityService.js';
import aiAnalysisService from './aiAnalysisService.js';

class CronService {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Start all cron jobs
   */
  startCronJobs() {
    console.log('🕐 Starting cron jobs...');

    // Daily monitoring scans (runs at 2 AM)
    this.scheduleJob('daily-monitoring', '0 2 * * *', this.runDailyMonitoring.bind(this));

    // Weekly monitoring scans (runs at 3 AM on Sundays)
    this.scheduleJob('weekly-monitoring', '0 3 * * 0', this.runWeeklyMonitoring.bind(this));

    // Monthly monitoring scans (runs at 4 AM on 1st of month)
    this.scheduleJob('monthly-monitoring', '0 4 1 * *', this.runMonthlyMonitoring.bind(this));

    // Reset monthly usage counters (runs at midnight on 1st of month)
    this.scheduleJob('reset-usage', '0 0 1 * *', this.resetMonthlyUsage.bind(this));

    // Cleanup old scan data (runs at 5 AM daily)
    this.scheduleJob('cleanup-scans', '0 5 * * *', this.cleanupOldScans.bind(this));

    console.log('✅ Cron jobs started successfully');
  }

  /**
   * Schedule a cron job
   */
  scheduleJob(name, schedule, task) {
    if (this.jobs.has(name)) {
      this.jobs.get(name).stop();
    }

    const job = cron.schedule(schedule, task, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.jobs.set(name, job);
    console.log(`📅 Scheduled job: ${name} (${schedule})`);
  }

  /**
   * Stop all cron jobs
   */
  stopCronJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`🛑 Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Run daily monitoring scans
   */
  async runDailyMonitoring() {
    console.log('🔄 Running daily monitoring scans...');

    try {
      const domains = await Domain.find({
        'monitoringSettings.enabled': true,
        'monitoringSettings.frequency': 'daily',
        status: { $ne: 'scanning' }
      }).populate('userId');

      for (const domain of domains) {
        if (domain.userId && domain.userId.planLimits.realTimeMonitoring) {
          await this.executeMonitoringScan(domain);
        }
      }

      console.log(`✅ Daily monitoring completed for ${domains.length} domains`);
    } catch (error) {
      console.error('❌ Daily monitoring failed:', error);
    }
  }

  /**
   * Run weekly monitoring scans
   */
  async runWeeklyMonitoring() {
    console.log('🔄 Running weekly monitoring scans...');

    try {
      const domains = await Domain.find({
        'monitoringSettings.enabled': true,
        'monitoringSettings.frequency': 'weekly',
        status: { $ne: 'scanning' }
      }).populate('userId');

      for (const domain of domains) {
        if (domain.userId && domain.userId.planLimits.realTimeMonitoring) {
          await this.executeMonitoringScan(domain);
        }
      }

      console.log(`✅ Weekly monitoring completed for ${domains.length} domains`);
    } catch (error) {
      console.error('❌ Weekly monitoring failed:', error);
    }
  }

  /**
   * Run monthly monitoring scans
   */
  async runMonthlyMonitoring() {
    console.log('🔄 Running monthly monitoring scans...');

    try {
      const domains = await Domain.find({
        'monitoringSettings.enabled': true,
        'monitoringSettings.frequency': 'monthly',
        status: { $ne: 'scanning' }
      }).populate('userId');

      for (const domain of domains) {
        if (domain.userId) {
          await this.executeMonitoringScan(domain);
        }
      }

      console.log(`✅ Monthly monitoring completed for ${domains.length} domains`);
    } catch (error) {
      console.error('❌ Monthly monitoring failed:', error);
    }
  }

  /**
   * Execute monitoring scan for a domain
   */
  async executeMonitoringScan(domain) {
    try {
      console.log(`🔍 Starting monitoring scan for ${domain.domain}`);

      // Create monitoring scan
      const scan = new Scan({
        userId: domain.userId._id,
        domainId: domain._id,
        scanType: 'monitoring',
        status: 'pending',
        aiAnalysis: {
          enabled: domain.userId.planLimits.aiAnalysisEnabled
        },
        metadata: {
          startedAt: new Date(),
          triggeredBy: 'scheduled'
        }
      });

      await scan.save();

      // Update domain status
      domain.status = 'scanning';
      domain.monitoringSettings.lastMonitoringRun = new Date();
      await domain.save();

      // Execute the scan
      await this.performMonitoringScan(scan, domain);

      console.log(`✅ Monitoring scan completed for ${domain.domain}`);

    } catch (error) {
      console.error(`❌ Monitoring scan failed for ${domain.domain}:`, error);
      
      // Reset domain status
      domain.status = 'active';
      await domain.save();
    }
  }

  /**
   * Perform the actual monitoring scan
   */
  async performMonitoringScan(scan, domain) {
    try {
      scan.status = 'running';
      scan.progress = 10;
      await scan.save();

      // Step 1: Quick endpoint check
      const activeEndpoints = domain.getActiveEndpoints();
      const changedEndpoints = [];
      
      for (const endpoint of activeEndpoints.slice(0, 20)) { // Limit for monitoring scans
        try {
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            timeout: 10000,
            validateStatus: () => true
          });

          if (response.status !== endpoint.responseCode) {
            changedEndpoints.push({
              ...endpoint,
              newResponseCode: response.status,
              changed: true
            });
          }

          endpoint.lastChecked = new Date();
        } catch (error) {
          // Endpoint might be down
          changedEndpoints.push({
            ...endpoint,
            error: error.message,
            changed: true
          });
        }
      }

      scan.progress = 50;
      await scan.save();

      // Step 2: Basic vulnerability check on changed/new endpoints
      if (changedEndpoints.length > 0) {
        const vulnResults = await vulnerabilityService.scanVulnerabilities(changedEndpoints);
        scan.vulnerabilities = vulnResults.vulnerabilities;
        scan.tools = vulnResults.tools;
      }

      scan.progress = 80;
      await scan.save();

      // Step 3: AI analysis if enabled and vulnerabilities found
      if (scan.aiAnalysis.enabled && scan.vulnerabilities.length > 0) {
        const aiAnalysis = await aiAnalysisService.analyzeVulnerabilities(
          scan.vulnerabilities,
          domain,
          scan
        );
        scan.aiAnalysis = { ...scan.aiAnalysis, ...aiAnalysis };
      }

      // Complete scan
      scan.markCompleted();
      scan.results.discoveredEndpoints = changedEndpoints.length;
      await scan.save();

      // Update domain
      domain.status = 'active';
      domain.statistics.lastScanDate = new Date();
      await domain.save();

      // Send notifications for new high/critical vulnerabilities
      await this.sendMonitoringAlerts(scan, domain, changedEndpoints);

    } catch (error) {
      scan.status = 'failed';
      scan.errors.push({
        message: `Monitoring scan failed: ${error.message}`,
        tool: 'monitoring-service'
      });
      await scan.save();

      domain.status = 'error';
      await domain.save();

      throw error;
    }
  }

  /**
   * Send monitoring alerts
   */
  async sendMonitoringAlerts(scan, domain, changedEndpoints) {
    const user = await User.findById(domain.userId);
    if (!user) return;

    const criticalVulns = scan.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highVulns = scan.vulnerabilities.filter(v => v.severity === 'high').length;

    if (criticalVulns > 0 || highVulns > 0 || changedEndpoints.length > 0) {
      // Send email notification
      if (user.notifications.email) {
        console.log(`📧 Sending monitoring alert to ${user.email}`);
        // TODO: Implement email sending
      }

      // Send Slack notification
      if (user.notifications.slack.enabled && user.notifications.slack.webhookUrl) {
        const message = {
          text: `🔍 Monitoring Alert for ${domain.domain}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Monitoring Scan Results*\n• Critical vulnerabilities: ${criticalVulns}\n• High vulnerabilities: ${highVulns}\n• Changed endpoints: ${changedEndpoints.length}`
              }
            }
          ]
        };

        await this.sendSlackNotification(user.notifications.slack.webhookUrl, message);
      }
    }
  }

  /**
   * Reset monthly usage counters
   */
  async resetMonthlyUsage() {
    console.log('🔄 Resetting monthly usage counters...');

    try {
      const result = await User.updateMany(
        {},
        {
          $set: {
            'usage.scansThisMonth': 0,
            'usage.lastResetDate': new Date()
          }
        }
      );

      console.log(`✅ Reset usage for ${result.modifiedCount} users`);
    } catch (error) {
      console.error('❌ Failed to reset monthly usage:', error);
    }
  }

  /**
   * Cleanup old scan data
   */
  async cleanupOldScans() {
    console.log('🧹 Cleaning up old scan data...');

    try {
      // Delete scans older than 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const result = await Scan.deleteMany({
        createdAt: { $lt: sixMonthsAgo },
        status: { $in: ['completed', 'failed', 'cancelled'] }
      });

      console.log(`✅ Cleaned up ${result.deletedCount} old scans`);
    } catch (error) {
      console.error('❌ Failed to cleanup old scans:', error);
    }
  }

  /**
   * Send Slack notification
   */
  async sendSlackNotification(webhookUrl, message) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }
}

const cronService = new CronService();

export const startCronJobs = () => cronService.startCronJobs();
export const stopCronJobs = () => cronService.stopCronJobs();
export default cronService;
