const axios = require('axios');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

class HIBPService {
  constructor() {
    this.baseURL = 'https://haveibeenpwned.com/api/v3';
    this.apiKey = process.env.HIBP_API_KEY; // User needs to set this
    this.rateLimitDelay = 1500; // HIBP requires 1.5 second delays between requests
  }

  async checkBreachedAccount(email) {
    try {
      if (!this.apiKey) {
        throw new Error('HIBP API key not configured');
      }

      console.log(`🔍 Checking breaches for email: ${email}`);

      const response = await axios.get(`${this.baseURL}/breachedaccount/${encodeURIComponent(email)}`, {
        headers: {
          'hibp-api-key': this.apiKey,
          'user-agent': 'Gmail-Subscription-Manager'
        },
        timeout: 10000
      });

      return response.data || [];
    } catch (error) {
      if (error.response?.status === 404) {
        // No breaches found - this is good!
        console.log(`✅ No breaches found for ${email}`);
        return [];
      }
      
      if (error.response?.status === 429) {
        console.log('⚠️ HIBP rate limit exceeded, waiting...');
        await this.delay(3000);
        throw new Error('HIBP_RATE_LIMITED');
      }

      console.error('HIBP API error:', error.message);
      throw new Error(`HIBP API error: ${error.message}`);
    }
  }

  async getBreachDetails(breachName) {
    try {
      if (!this.apiKey) {
        throw new Error('HIBP API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/breach/${encodeURIComponent(breachName)}`, {
        headers: {
          'hibp-api-key': this.apiKey,
          'user-agent': 'Gmail-Subscription-Manager'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error(`Error getting breach details for ${breachName}:`, error.message);
      return null;
    }
  }

  async runBreachCheckForUser(userId) {
    try {
      console.log(`🔐 Starting HIBP breach check for user ${userId}`);

      // Get user email
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userEmail = user.email;
      console.log(`📧 Checking breaches for: ${userEmail}`);

      // Get user's subscriptions (Gmail scan results)
      const subscriptions = await Subscription.find({ userId, isActive: true });
      console.log(`📊 Found ${subscriptions.length} subscriptions to check against breaches`);

      // Check for breaches
      const breachedAccounts = await this.checkBreachedAccount(userEmail);
      
      if (breachedAccounts.length === 0) {
        console.log('🎉 No breaches found! User is safe.');
        return {
          breachesFound: 0,
          totalSubscriptions: subscriptions.length,
          securityScore: 100,
          breachedServices: 0,
          safeServices: subscriptions.length,
          matchedBreaches: [],
          breachDetails: [],
          lastChecked: new Date()
        };
      }

      console.log(`⚠️ Found ${breachedAccounts.length} breaches`);

      // Match breaches with user's subscriptions
      const breachResults = await this.matchBreachesWithSubscriptions(breachedAccounts, subscriptions);

      // Calculate security score
      const securityScore = this.calculateSecurityScore(breachResults, subscriptions.length);

      // Update subscriptions with breach status
      await this.updateSubscriptionsWithBreachStatus(breachResults.matchedBreaches);

      // Update user's breach check timestamp
      await User.findByIdAndUpdate(userId, { 
        lastBreachCheck: new Date(),
        securityScore: securityScore
      });

      return {
        breachesFound: breachedAccounts.length,
        totalSubscriptions: subscriptions.length,
        securityScore: securityScore,
        breachedServices: breachResults.matchedBreaches.length,
        safeServices: subscriptions.length - breachResults.matchedBreaches.length,
        breachDetails: breachResults.breachDetails,
        matchedBreaches: breachResults.matchedBreaches,
        lastChecked: new Date()
      };

    } catch (error) {
      console.error('Error during HIBP breach check:', error);
      throw error;
    }
  }

  async matchBreachesWithSubscriptions(breachedAccounts, subscriptions) {
    const matchedBreaches = [];
    const breachDetails = [];

    console.log('🔍 Matching breaches with user subscriptions...');

    for (const breach of breachedAccounts) {
      // Get detailed breach information
      await this.delay(this.rateLimitDelay); // Respect HIBP rate limits
      const breachDetail = await this.getBreachDetails(breach.Name);
      
      if (breachDetail) {
        breachDetails.push(breachDetail);

        // Find matching subscriptions
        const matchingSubscriptions = subscriptions.filter(sub => {
          const subDomain = sub.domain.toLowerCase();
          const breachDomain = breachDetail.Domain?.toLowerCase() || breach.Name.toLowerCase();
          
          // Direct domain match
          if (subDomain === breachDomain) return true;
          
          // Check if subscription domain contains breach domain or vice versa
          if (subDomain.includes(breachDomain) || breachDomain.includes(subDomain)) return true;
          
          // Special cases for common service names
          const serviceName = sub.serviceName.toLowerCase();
          const breachName = breach.Name.toLowerCase();
          
          if (serviceName.includes(breachName) || breachName.includes(serviceName)) return true;
          
          return false;
        });

        for (const subscription of matchingSubscriptions) {
          matchedBreaches.push({
            subscription: subscription,
            breach: breachDetail,
            severity: this.assessBreachSeverity(breachDetail),
            actionRequired: true
          });
          
          console.log(`⚠️ MATCH: ${subscription.serviceName} (${subscription.domain}) affected by ${breach.Name} breach`);
        }
      }
    }

    return {
      matchedBreaches,
      breachDetails
    };
  }

  assessBreachSeverity(breach) {
    let severity = 'low';
    
    // Check data classes exposed
    const dataClasses = breach.DataClasses || [];
    const highRiskData = ['passwords', 'email addresses', 'credit cards', 'social security numbers', 'phone numbers'];
    const mediumRiskData = ['usernames', 'names', 'dates of birth', 'postal codes'];
    
    const hasHighRiskData = dataClasses.some(data => 
      highRiskData.some(risk => data.toLowerCase().includes(risk.toLowerCase()))
    );
    
    const hasMediumRiskData = dataClasses.some(data => 
      mediumRiskData.some(risk => data.toLowerCase().includes(risk.toLowerCase()))
    );
    
    if (hasHighRiskData) {
      severity = 'high';
    } else if (hasMediumRiskData) {
      severity = 'medium';
    }
    
    // Recent breaches are more concerning
    const breachDate = new Date(breach.BreachDate);
    const monthsAgo = (new Date() - breachDate) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsAgo < 12 && severity === 'medium') {
      severity = 'high';
    }
    
    return severity;
  }

  calculateSecurityScore(breachResults, totalSubscriptions) {
    if (totalSubscriptions === 0) return 100;
    
    const breachedCount = breachResults.matchedBreaches.length;
    const baseScore = Math.max(0, 100 - (breachedCount * 15)); // -15 points per breach
    
    // Additional deductions for severity
    let severityDeduction = 0;
    breachResults.matchedBreaches.forEach(breach => {
      switch (breach.severity) {
        case 'high': severityDeduction += 20; break;
        case 'medium': severityDeduction += 10; break;
        default: severityDeduction += 5; break;
      }
    });
    
    return Math.max(0, Math.min(100, baseScore - severityDeduction));
  }

  async updateSubscriptionsWithBreachStatus(matchedBreaches) {
    for (const match of matchedBreaches) {
      await Subscription.findByIdAndUpdate(match.subscription._id, {
        breachStatus: {
          isBreached: true,
          breachName: match.breach.Name,
          breachDate: match.breach.BreachDate,
          severity: match.severity,
          dataClasses: match.breach.DataClasses || [],
          description: match.breach.Description,
          lastChecked: new Date()
        }
      });
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateSecurityRecommendations(breachResults) {
    const recommendations = [];
    
    // Check if matchedBreaches exists and has content
    const matchedBreaches = breachResults.matchedBreaches || [];
    
    if (matchedBreaches.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'Great Security Posture!',
        message: 'No breaches found for your email address. Keep up the good security practices!',
        actions: ['Enable 2FA where possible', 'Use unique passwords', 'Regular security checkups']
      });
    } else {
      const highSeverityBreaches = matchedBreaches.filter(b => b.severity === 'high');
      const mediumSeverityBreaches = matchedBreaches.filter(b => b.severity === 'medium');
      
      if (highSeverityBreaches.length > 0) {
        recommendations.push({
          type: 'critical',
          title: 'Immediate Action Required',
          message: `${highSeverityBreaches.length} high-risk breaches found. Change passwords immediately.`,
          actions: ['Change passwords now', 'Enable 2FA', 'Monitor accounts closely']
        });
      }
      
      if (mediumSeverityBreaches.length > 0) {
        recommendations.push({
          type: 'warning',
          title: 'Security Review Needed',
          message: `${mediumSeverityBreaches.length} medium-risk breaches found. Review your account security.`,
          actions: ['Update passwords', 'Review account permissions', 'Enable notifications']
        });
      }
    }
    
    return recommendations;
  }
}

module.exports = new HIBPService();
