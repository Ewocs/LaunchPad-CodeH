const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Email = require('../models/Email');

const router = express.Router();

// Get dashboard overview
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get subscription statistics
    const totalSubscriptions = await Subscription.countDocuments({ userId, isActive: true });
    const activeSubscriptions = await Subscription.countDocuments({ userId, status: 'active', isActive: true });
    const revokedSubscriptions = await Subscription.countDocuments({ userId, status: 'revoked', isActive: true });

    // Get category breakdown
    const categoryStats = await Subscription.aggregate([
      { $match: { userId: userId, isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEmails = await Email.countDocuments({
      userId,
      receivedDate: { $gte: thirtyDaysAgo }
    });

    const recentSubscriptions = await Subscription.countDocuments({
      userId,
      firstDetected: { $gte: thirtyDaysAgo },
      isActive: true
    });

    // Get top domains
    const topDomains = await Subscription.aggregate([
      { $match: { userId: userId, isActive: true } },
      { $group: { _id: '$domain', count: { $sum: 1 }, serviceName: { $first: '$serviceName' } } },
      { $sort: { count: -1 } },
      { $limit: 20 } // Show more domains
    ]);

    // Get unique domains count
    const uniqueDomains = await Subscription.distinct('domain', { userId: userId, isActive: true });

    res.json({
      overview: {
        totalSubscriptions,
        activeSubscriptions,
        revokedSubscriptions,
        uniqueCompanies: uniqueDomains.length, // Add unique companies count
        recentEmails,
        recentSubscriptions
      },
      categoryStats,
      topDomains,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard overview' });
  }
});

// Get all subscriptions with filtering and pagination
router.get('/subscriptions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      category,
      status,
      search,
      sortBy = 'lastEmailReceived',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build filter query
    const filter = { userId, isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { serviceEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get subscriptions
    const subscriptions = await Subscription.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalCount = await Subscription.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPreviousPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
});

// Get subscription details
router.get('/subscriptions/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptionId = req.params.id;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
      isActive: true
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Get related emails
    const emails = await Email.find({
      subscriptionId: subscriptionId,
      userId
    })
    .sort({ receivedDate: -1 })
    .limit(10)
    .select('subject snippet receivedDate from')
    .lean();

    res.json({
      subscription,
      recentEmails: emails
    });
  } catch (error) {
    console.error('Get subscription details error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription details' });
  }
});

// Get recent activity
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 7, limit = 50 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    // Get recent subscriptions
    const recentSubscriptions = await Subscription.find({
      userId,
      firstDetected: { $gte: cutoffDate },
      isActive: true
    })
    .sort({ firstDetected: -1 })
    .limit(parseInt(limit) / 2)
    .lean();

    // Get recent emails
    const recentEmails = await Email.find({
      userId,
      receivedDate: { $gte: cutoffDate }
    })
    .sort({ receivedDate: -1 })
    .limit(parseInt(limit) / 2)
    .select('subject from receivedDate category')
    .lean();

    // Combine and sort activity
    const activity = [
      ...recentSubscriptions.map(sub => ({
        type: 'subscription',
        data: sub,
        timestamp: sub.firstDetected
      })),
      ...recentEmails.map(email => ({
        type: 'email',
        data: email,
        timestamp: email.receivedDate
      }))
    ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));

    res.json({ activity });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activity' });
  }
});

// Get analytics data
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    let days;
    switch (period) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 30;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get email volume over time
    const emailVolume = await Email.aggregate([
      {
        $match: {
          userId: userId,
          receivedDate: { $gte: cutoffDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$receivedDate"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get category distribution
    const categoryDistribution = await Subscription.aggregate([
      { $match: { userId: userId, isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get subscription growth
    const subscriptionGrowth = await Subscription.aggregate([
      {
        $match: {
          userId: userId,
          firstDetected: { $gte: cutoffDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$firstDetected"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      emailVolume,
      categoryDistribution,
      subscriptionGrowth,
      period,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
