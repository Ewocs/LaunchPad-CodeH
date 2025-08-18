import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, emailAPI, subscriptionAPI } from '../utils/api';
import {
  FiMail,
  FiUsers,
  FiBarChart,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiSearch,
  FiSettings
} from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [overview, setOverview] = useState(null);
  const [recentSubscriptions, setRecentSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);
  const [error, setError] = useState(null);

  // Mock data for dashboard
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    cancelledSubscriptions: 0,
    estimatedMonthlyCost: 0
  });
  const [recentEmails, setRecentEmails] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, just set some mock data
      setStats({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        cancelledSubscriptions: 0,
        estimatedMonthlyCost: 0
      });
      setRecentEmails([]);
      setSubscriptions([]);

      // Uncomment when backend is working properly
      /*
      const [overviewRes, subscriptionsRes, analyticsRes, scanStatusRes] = await Promise.all([
        dashboardAPI.getOverview(),
        subscriptionAPI.getSubscriptions({ limit: 10, sortBy: 'firstDetected' }),
        dashboardAPI.getAnalytics({ period: '30d' }),
        emailAPI.getScanStatus()
      ]);

      setOverview(overviewRes.data.overview);
      setRecentSubscriptions(subscriptionsRes.data.subscriptions || []);
      setAnalytics(analyticsRes.data);
      setScanStatus(scanStatusRes.data);
      */
    } catch (error) {
      console.error('Dashboard load error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleScanEmails = async () => {
    try {
      setScanning(true);
      setError(null);
      console.log('🔍 Starting email scan...');

      const response = await emailAPI.scanEmails({ daysBack: 30 });
      console.log('✅ Email scan completed:', response.data);
      
      // Refresh dashboard data after scan
      await loadDashboardData();
    } catch (error) {
      console.error('Email scan error:', error);
      const errorMessage = error.response?.data?.message || 'Email scan failed';
      setError(errorMessage);
    } finally {
      setScanning(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleToggleSubscription = async (subscriptionId, currentStatus) => {
    try {
      if (currentStatus === 'active') {
        await subscriptionAPI.revokeSubscription(subscriptionId);
      } else {
        await subscriptionAPI.grantSubscription(subscriptionId);
      }
      // Refresh data
      await loadDashboardData();
    } catch (error) {
      console.error('Toggle subscription error:', error);
      setError('Failed to update subscription status');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <LoadingSpinner text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="alert alert-error">
            <FiAlertCircle />
            {error}
            <button className="btn btn-sm btn-primary" onClick={loadDashboardData}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p className="header-subtitle">
              Here's your subscription overview and recent activity
            </p>
          </div>
          <div className="header-actions">
            <button
              className={`btn btn-primary ${scanning ? 'loading' : ''}`}
              onClick={handleScanEmails}
              disabled={scanning || !scanStatus?.canScan}
            >
              {scanning ? (
                <>
                  <FiRefreshCw className="spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <FiSearch />
                  Scan Emails
                </>
              )}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleRefresh}
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Subscriptions</h3>
            <span className="stat-number">{stats.totalSubscriptions}</span>
          </div>
          <div className="stat-card">
            <h3>Active</h3>
            <span className="stat-number active">{stats.activeSubscriptions}</span>
          </div>
          <div className="stat-card">
            <h3>Cancelled</h3>
            <span className="stat-number cancelled">{stats.cancelledSubscriptions}</span>
          </div>
          <div className="stat-card">
            <h3>Estimated Monthly Cost</h3>
            <span className="stat-number cost">${stats.estimatedMonthlyCost}</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentEmails.length > 0 ? (
              recentEmails.map((email, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-info">
                    <strong>{email.subject}</strong>
                    <span className="activity-date">
                      {new Date(email.receivedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="activity-meta">
                    From: {email.sender} | Status: {email.processed ? 'Processed' : 'Pending'}
                  </div>
                </div>
              ))
            ) : (
              <p>No recent email activity found. Click "Scan Emails" to start discovering your subscriptions.</p>
            )}
          </div>
        </div>

        {/* Subscriptions Section */}
        <div className="subscriptions-section">
          <h3>Your Subscriptions</h3>
          <div className="subscriptions-list">
            {subscriptions.length > 0 ? (
              subscriptions.map((subscription) => (
                <div key={subscription._id} className="subscription-item">
                  <div className="subscription-info">
                    <h4>{subscription.serviceName}</h4>
                    <p>Status: <span className={`status ${subscription.status}`}>{subscription.status}</span></p>
                    <p>Cost: ${subscription.estimatedCost}/month</p>
                  </div>
                  <div className="subscription-actions">
                    <button 
                      onClick={() => handleToggleSubscription(subscription._id, subscription.status)}
                      className={`toggle-button ${subscription.status === 'active' ? 'cancel' : 'activate'}`}
                    >
                      {subscription.status === 'active' ? 'Cancel' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No subscriptions found. Scan your emails to discover subscriptions.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
