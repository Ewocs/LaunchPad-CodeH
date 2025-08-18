import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';
import { breachCheckAPI } from '../../utils/api';
import './BreachCheck.css';

const BreachCheck = ({ subscriptions, onBreachCheckComplete }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [breachResults, setBreachResults] = useState(null);
  const [error, setError] = useState('');

  const handleBreachCheck = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await breachCheckAPI.runCheck();

      if (response.data.success) {
        setBreachResults(response.data.data);
        if (onBreachCheckComplete) {
          onBreachCheckComplete(response.data.data);
        }
      } else {
        setError(response.data.message || 'Failed to run breach check');
      }
    } catch (err) {
      console.error('Breach check error:', err);
      setError('Failed to connect to breach check service');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#dc3545';
      case 'medium': return '#fd7e14';
      case 'low': return '#6c757d';
      default: return '#28a745';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '🟡';
      default: return '✅';
    }
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#fd7e14';
    if (score >= 40) return '#dc3545';
    return '#6c757d';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="breach-check-container">
        <div className="breach-check-loading">
          <LoadingSpinner />
          <h3>🔍 Checking for Data Breaches...</h3>
          <p>Scanning {subscriptions?.length || 0} services against Have I Been Pwned database</p>
          <div className="loading-steps">
            <div className="step active">Connecting to HIBP API</div>
            <div className="step active">Analyzing your email</div>
            <div className="step">Matching with your services</div>
            <div className="step">Calculating security score</div>
          </div>
        </div>
      </div>
    );
  }

  if (!breachResults) {
    return (
      <div className="breach-check-container">
        <div className="breach-check-intro">
          <div className="hibp-header">
            <h2>🔐 Data Breach Security Check</h2>
            <p>Check if your email has been compromised in known data breaches using Have I Been Pwned</p>
          </div>

          <div className="breach-check-stats">
            <div className="stat-card">
              <h3>{subscriptions?.length || 0}</h3>
              <p>Services to Check</p>
            </div>
            <div className="stat-card">
              <h3>{user?.email}</h3>
              <p>Email Address</p>
            </div>
          </div>

          <div className="hibp-info">
            <h3>What is Have I Been Pwned?</h3>
            <p>HIBP is a trusted service that checks if your email address has appeared in data breaches. We'll cross-reference your discovered services with known breaches to identify security risks.</p>
            
            <div className="hibp-features">
              <div className="feature">
                <span className="feature-icon">🔍</span>
                <div>
                  <strong>Comprehensive Database</strong>
                  <p>Over 600 million breached accounts tracked</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">🛡️</span>
                <div>
                  <strong>Privacy Protected</strong>
                  <p>Your email is checked securely without being stored</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Real-time Results</strong>
                  <p>Get instant breach notifications and security scores</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              <div>
                <strong>Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <button 
            className="breach-check-btn primary"
            onClick={handleBreachCheck}
            disabled={loading || !subscriptions?.length}
          >
            <span className="btn-icon">🔍</span>
            Run Breach Check ({subscriptions?.length || 0} services)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="breach-check-container">
      <div className="breach-results">
        <div className="results-header">
          <h2>🔐 Breach Check Results</h2>
          <p>Completed at {formatDate(breachResults.lastChecked)}</p>
        </div>

        {/* Security Score */}
        <div className="security-score-card">
          <div className="score-main">
            <div 
              className="score-circle"
              style={{ '--score-color': getSecurityScoreColor(breachResults.securityScore) }}
            >
              <span className="score-number">{breachResults.securityScore || 'N/A'}</span>
              <span className="score-label">Security Score</span>
            </div>
            <div className="score-details">
              <h3>Your Security Status</h3>
              {breachResults.securityScore >= 80 && (
                <p className="score-excellent">🎉 Excellent! Your accounts are well-protected.</p>
              )}
              {breachResults.securityScore >= 60 && breachResults.securityScore < 80 && (
                <p className="score-good">👍 Good security, but some improvements needed.</p>
              )}
              {breachResults.securityScore >= 40 && breachResults.securityScore < 60 && (
                <p className="score-poor">⚠️ Poor security. Immediate action required.</p>
              )}
              {breachResults.securityScore < 40 && (
                <p className="score-critical">🚨 Critical security risks detected!</p>
              )}
            </div>
          </div>
        </div>

        {/* Breach Summary */}
        <div className="breach-summary">
          <div className="summary-cards">
            <div className="summary-card breaches">
              <span className="card-icon">🚨</span>
              <div className="card-info">
                <h3>{breachResults.breachesFound}</h3>
                <p>Total Breaches</p>
              </div>
            </div>
            <div className="summary-card affected">
              <span className="card-icon">⚠️</span>
              <div className="card-info">
                <h3>{breachResults.breachedServices}</h3>
                <p>Affected Services</p>
              </div>
            </div>
            <div className="summary-card safe">
              <span className="card-icon">✅</span>
              <div className="card-info">
                <h3>{breachResults.safeServices}</h3>
                <p>Safe Services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {breachResults.recommendations && breachResults.recommendations.length > 0 && (
          <div className="recommendations">
            <h3>🎯 Security Recommendations</h3>
            {breachResults.recommendations.map((rec, index) => (
              <div key={index} className={`recommendation ${rec.type}`}>
                <div className="rec-header">
                  <h4>{rec.title}</h4>
                  <span className={`rec-badge ${rec.type}`}>
                    {rec.type === 'critical' && '🚨'}
                    {rec.type === 'warning' && '⚠️'}
                    {rec.type === 'success' && '✅'}
                  </span>
                </div>
                <p>{rec.message}</p>
                {rec.actions && (
                  <ul className="rec-actions">
                    {rec.actions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detailed Breach Info */}
        {breachResults.matchedBreaches && breachResults.matchedBreaches.length > 0 && (
          <div className="breach-details">
            <h3>🔍 Detailed Breach Information</h3>
            {breachResults.matchedBreaches.map((match, index) => (
              <div key={index} className="breach-detail-card">
                <div className="breach-header">
                  <div className="service-info">
                    <h4>{match.subscription.serviceName}</h4>
                    <span className="domain">{match.subscription.domain}</span>
                  </div>
                  <div className="severity-badge">
                    <span className="severity-icon">{getSeverityIcon(match.severity)}</span>
                    <span 
                      className="severity-text"
                      style={{ color: getSeverityColor(match.severity) }}
                    >
                      {match.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="breach-info">
                  <div className="breach-meta">
                    <span className="breach-name">{match.breach.Name}</span>
                    <span className="breach-date">Breached: {formatDate(match.breach.BreachDate)}</span>
                  </div>
                  
                  <p className="breach-description">{match.breach.Description}</p>
                  
                  {match.breach.DataClasses && match.breach.DataClasses.length > 0 && (
                    <div className="data-exposed">
                      <strong>Data Exposed:</strong>
                      <div className="data-tags">
                        {match.breach.DataClasses.map((dataClass, i) => (
                          <span key={i} className="data-tag">{dataClass}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="results-actions">
          <button 
            className="breach-check-btn secondary"
            onClick={() => setBreachResults(null)}
          >
            Run New Check
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreachCheck;
