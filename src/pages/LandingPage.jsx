import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiShield, FiBarChart, FiUsers, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import './LandingPage.css';

const LandingPage = () => {
  const features = [
    {
      icon: <FiMail />,
      title: 'Gmail Integration',
      description: 'Securely connect with your Gmail account to scan and analyze your emails automatically.'
    },
    {
      icon: <FiBarChart />,
      title: 'Smart Analytics',
      description: 'AI-powered analysis to identify subscriptions, newsletters, and account signups.'
    },
    {
      icon: <FiShield />,
      title: 'Privacy Focused',
      description: 'Your data stays secure. We only analyze email metadata and patterns.'
    },
    {
      icon: <FiUsers />,
      title: 'Easy Management',
      description: 'Revoke or grant access to services directly from your centralized dashboard.'
    }
  ];

  const benefits = [
    'Discover hidden subscriptions and recurring charges',
    'Monitor where your email address is being used',
    'Easily unsubscribe from unwanted services',
    'Track your digital footprint across the web',
    'Get insights into your online account activity'
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Take Control of Your
              <span className="text-primary"> Digital Subscriptions</span>
            </h1>
            <p className="hero-subtitle">
              Discover, manage, and control all your online subscriptions and account access 
              from one centralized dashboard. Connect your Gmail and get instant insights 
              into where your data flows.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started Free
                <FiArrowRight />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Users Protected</span>
              </div>
              <div className="stat">
                <span className="stat-number">500K+</span>
                <span className="stat-label">Subscriptions Managed</span>
              </div>
              <div className="stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-nav">
                  <div className="nav-item active">Dashboard</div>
                  <div className="nav-item">Subscriptions</div>
                  <div className="nav-item">Settings</div>
                </div>
              </div>
              <div className="preview-content">
                <div className="preview-card">
                  <div className="card-header">
                    <h3>Subscription Overview</h3>
                  </div>
                  <div className="preview-stats">
                    <div className="preview-stat">
                      <span>42</span>
                      <label>Active</label>
                    </div>
                    <div className="preview-stat">
                      <span>8</span>
                      <label>Revoked</label>
                    </div>
                    <div className="preview-stat">
                      <span>15</span>
                      <label>This Month</label>
                    </div>
                  </div>
                </div>
                <div className="preview-list">
                  <div className="preview-item">
                    <div className="item-icon netflix"></div>
                    <div className="item-info">
                      <span>Netflix</span>
                      <small>Entertainment</small>
                    </div>
                    <span className="status active">Active</span>
                  </div>
                  <div className="preview-item">
                    <div className="item-icon spotify"></div>
                    <div className="item-info">
                      <span>Spotify</span>
                      <small>Music</small>
                    </div>
                    <span className="status active">Active</span>
                  </div>
                  <div className="preview-item">
                    <div className="item-icon github"></div>
                    <div className="item-info">
                      <span>GitHub</span>
                      <small>Development</small>
                    </div>
                    <span className="status revoked">Revoked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Gmail Subscription Manager?</h2>
            <p>Powerful features to help you regain control over your digital life</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="row">
            <div className="col-6">
              <h2>What You'll Discover</h2>
              <p className="mb-4">
                Our AI-powered email analysis reveals insights you never knew existed 
                about your digital subscriptions and online accounts.
              </p>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <FiCheckCircle className="check-icon" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-6">
              <div className="benefits-image">
                <div className="insight-card">
                  <h4>Monthly Insights</h4>
                  <div className="insight-stat">
                    <span className="insight-number">23</span>
                    <span className="insight-label">New subscriptions detected</span>
                  </div>
                  <div className="insight-stat">
                    <span className="insight-number">$47</span>
                    <span className="insight-label">Potential monthly savings</span>
                  </div>
                  <div className="insight-chart">
                    <div className="chart-bar" style={{height: '60%'}}></div>
                    <div className="chart-bar" style={{height: '80%'}}></div>
                    <div className="chart-bar" style={{height: '40%'}}></div>
                    <div className="chart-bar" style={{height: '90%'}}></div>
                    <div className="chart-bar" style={{height: '70%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Take Control?</h2>
            <p>
              Join thousands of users who have already discovered their hidden 
              subscriptions and taken control of their digital footprint.
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Free Analysis
                <FiArrowRight />
              </Link>
            </div>
            <p className="cta-note">
              No credit card required • Free Gmail analysis • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <FiMail className="footer-logo" />
              <span>Gmail Subscription Manager</span>
            </div>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#support">Support</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Gmail Subscription Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
