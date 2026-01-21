import React, { useState } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import './FAQPage.css';

const FAQPage = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = [
    {
      id: 'general-1',
      category: 'General',
      question: 'What is BreachBuddy?',
      answer: 'BreachBuddy is a comprehensive digital security platform that helps you manage your Gmail subscriptions, monitor data breaches, and scan API surfaces for vulnerabilities. It combines subscription management, security monitoring, and vulnerability scanning in one unified dashboard.'
    },
    {
      id: 'general-2',
      category: 'General',
      question: 'Is BreachBuddy free?',
      answer: 'Yes, BreachBuddy is currently free to use. However, some features require API keys from third-party services (like Have I Been Pwned) which may have associated costs.'
    },
    {
      id: 'general-3',
      category: 'General',
      question: 'What data does BreachBuddy collect?',
      answer: 'BreachBuddy collects your name and email address, Gmail subscription information (with your permission), security scan results, and anonymous usage analytics. We never store your Gmail password or access your email content beyond sender information.'
    },
    {
      id: 'general-4',
      category: 'General',
      question: 'Is my data secure?',
      answer: 'Yes! BreachBuddy uses industry-standard security practices including encrypted data transmission (HTTPS), JWT-based authentication, password hashing with bcrypt, secure OAuth 2.0 for Gmail access, and regular security audits.'
    },
    {
      id: 'account-1',
      category: 'Account & Authentication',
      question: 'How do I create an account?',
      answer: 'Visit the BreachBuddy homepage, click "Get Started" or "Sign Up", and choose either email/password registration or sign in with Google.'
    },
    {
      id: 'account-2',
      category: 'Account & Authentication',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Password reset feature is coming soon. For now, contact support@breachbuddy.com for assistance.'
    },
    {
      id: 'account-3',
      category: 'Account & Authentication',
      question: 'Can I change my email address?',
      answer: 'Currently, you cannot change your account email address. This is your permanent identifier. If you need to change it, you\'ll need to create a new account.'
    },
    {
      id: 'account-4',
      category: 'Account & Authentication',
      question: 'What is Two-Factor Authentication (2FA)?',
      answer: 'Two-Factor Authentication is an extra layer of security for your account. After entering your password, you\'ll need to verify your identity using a second method like an authenticator app or email code. This prevents unauthorized access even if someone has your password.'
    },
    {
      id: 'gmail-1',
      category: 'Gmail Integration',
      question: 'How do I connect my Gmail account?',
      answer: 'During signup or in your settings, click "Connect Gmail" and authorize BreachBuddy to access your email metadata. We only read email sender information to identify subscriptions.'
    },
    {
      id: 'gmail-2',
      category: 'Gmail Integration',
      question: 'Does BreachBuddy read my email content?',
      answer: 'No, BreachBuddy only analyzes email metadata such as sender address, subject line, and frequency. We never read the email body or attachments.'
    },
    {
      id: 'gmail-3',
      category: 'Gmail Integration',
      question: 'Can I disconnect my Gmail account?',
      answer: 'Yes, you can disconnect your Gmail account at any time in your account settings. This will stop BreachBuddy from accessing new emails, but previously scanned data will remain available.'
    },
    {
      id: 'subscriptions-1',
      category: 'Subscriptions',
      question: 'How does BreachBuddy identify subscriptions?',
      answer: 'Our AI-powered system analyzes your email history to identify recurring senders and patterns. It then categorizes emails into subscription types (newsletters, services, billing notifications) and provides actionable insights.'
    },
    {
      id: 'subscriptions-2',
      category: 'Subscriptions',
      question: 'Can I unsubscribe directly from BreachBuddy?',
      answer: 'We provide unsubscribe links and guidance for each subscription. You can click directly to unsubscribe from most services. Some subscriptions may require manual unsubscribe steps.'
    },
    {
      id: 'subscriptions-3',
      category: 'Subscriptions',
      question: 'What if a subscription isn\'t detected?',
      answer: 'If you notice a missing subscription, you can manually add it to your dashboard. This helps our AI learn and improve detection for future users.'
    },
    {
      id: 'breach-1',
      category: 'Breach Monitoring',
      question: 'What is the breach checker?',
      answer: 'The breach checker scans databases of known data breaches to see if your email has been compromised. It checks against Have I Been Pwned and other sources to alert you about security incidents.'
    },
    {
      id: 'breach-2',
      category: 'Breach Monitoring',
      question: 'How often is breach data updated?',
      answer: 'Breach databases are updated regularly, typically within 24-48 hours of new incidents being discovered and reported. You can manually refresh your breach check anytime.'
    },
    {
      id: 'breach-3',
      category: 'Breach Monitoring',
      question: 'What should I do if I find my email in a breach?',
      answer: 'If your email is found in a breach, immediately change your password on that service. Consider changing related passwords, enable 2FA if available, and monitor your account for suspicious activity.'
    },
    {
      id: 'api-1',
      category: 'API Surface Scanning',
      question: 'What is API Surface scanning?',
      answer: 'API Surface scanning analyzes web services for security vulnerabilities by examining their API endpoints, configurations, and security headers. This helps identify potential attack vectors.'
    },
    {
      id: 'api-2',
      category: 'API Surface Scanning',
      question: 'How do I add a domain for scanning?',
      answer: 'Go to the API Surface page, enter your domain URL, and click "Scan". The system will analyze the API surface and generate a security report.'
    },
    {
      id: 'api-3',
      category: 'API Surface Scanning',
      question: 'What vulnerabilities does it detect?',
      answer: 'It detects issues like missing security headers, insecure API endpoints, outdated SSL/TLS versions, exposed API documentation, and misconfigured CORS policies.'
    },
    {
      id: 'support-1',
      category: 'Support & Troubleshooting',
      question: 'How do I contact support?',
      answer: 'You can reach our support team at support@breachbuddy.com or use the contact form on our website. We typically respond within 24-48 hours.'
    },
    {
      id: 'support-2',
      category: 'Support & Troubleshooting',
      question: 'Why isn\'t my dashboard loading?',
      answer: 'Try clearing your browser cache, disabling browser extensions, or using an incognito window. If the issue persists, contact support with your browser and OS information.'
    },
    {
      id: 'support-3',
      category: 'Support & Troubleshooting',
      question: 'Can I export my data?',
      answer: 'Yes, you can export your subscriptions and scan reports as CSV files from your dashboard. This feature allows you to back up your data or use it in other applications.'
    },
  ];

  const categories = [...new Set(faqData.map(item => item.category))];

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaq = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedFaq = categories.reduce((acc, category) => {
    acc[category] = filteredFaq.filter(item => item.category === category);
    return acc;
  }, {});

  return (
    <div className="faq-page">
      <div className="faq-container">
        {/* Header */}
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find quick answers to common questions about BreachBuddy</p>
        </div>

        {/* Search Bar */}
        <div className="faq-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search FAQ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* No Results Message */}
        {filteredFaq.length === 0 && (
          <div className="no-results">
            <p>No questions match your search. Try different keywords.</p>
          </div>
        )}

        {/* FAQ Items by Category */}
        {filteredFaq.length > 0 && (
          <div className="faq-content">
            {categories.map(category => (
              groupedFaq[category].length > 0 && (
                <div key={category} className="faq-category">
                  <h2 className="category-title">{category}</h2>
                  
                  <div className="faq-items">
                    {groupedFaq[category].map(item => (
                      <div
                        key={item.id}
                        className={`faq-item ${expandedItems[item.id] ? 'expanded' : ''}`}
                      >
                        <button
                          className="faq-question"
                          onClick={() => toggleExpanded(item.id)}
                          aria-expanded={expandedItems[item.id]}
                        >
                          <span className="question-text">{item.question}</span>
                          <FiChevronDown className="chevron-icon" />
                        </button>
                        
                        {expandedItems[item.id] && (
                          <div className="faq-answer">
                            <p>{item.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="faq-contact">
          <h3>Didn't find what you're looking for?</h3>
          <p>Have more questions? Reach out to our support team</p>
          <a href="mailto:support@breachbuddy.com" className="contact-button">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
