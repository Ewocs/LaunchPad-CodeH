import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github, 
  ArrowRight,
  Lock,
  Eye,
  Zap,
  AlertTriangle,
  FileText,
  HelpCircle,
  Users,
  Calendar
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features', icon: Zap },
      { name: 'Security Dashboard', href: '#dashboard', icon: Lock },
      { name: 'Breach Monitoring', href: '#monitoring', icon: Eye },
      { name: 'API Scanner', href: '#scanner', icon: AlertTriangle },
      { name: 'Pricing', href: '#pricing', icon: FileText }
    ],
    company: [
      { name: 'About Us', href: '#about', icon: Users },
      { name: 'Careers', href: '#careers', icon: Calendar },
      { name: 'News & Updates', href: '#news', icon: FileText },
      { name: 'Security Center', href: '#security', icon: Shield },
      { name: 'Contact', href: '#contact', icon: Mail }
    ],
    resources: [
      { name: 'Documentation', href: '#docs', icon: FileText },
      { name: 'API Reference', href: '#api', icon: Zap },
      { name: 'Help Center', href: '#help', icon: HelpCircle },
      { name: 'Security Blog', href: '#blog', icon: Lock },
      { name: 'Community', href: '#community', icon: Users }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy', icon: Lock },
      { name: 'Terms of Service', href: '#terms', icon: FileText },
      { name: 'Cookie Policy', href: '#cookies', icon: Eye },
      { name: 'GDPR Compliance', href: '#gdpr', icon: Shield },
      { name: 'Bug Bounty', href: '#bounty', icon: AlertTriangle }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/breachbuddy', color: '#1DA1F2' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/breachbuddy', color: '#0A66C2' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/breachbuddy', color: '#181717' }
  ];

  const securityBadges = [
    'SOC 2 Type II Certified',
    'ISO 27001 Compliant',
    'GDPR Ready',
    'CCPA Compliant'
  ];

  return (
    <footer className="footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-main">
          <motion.div
            className="footer-brand"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="brand-logo">
              <Shield className="logo-icon" />
              <span className="logo-text">BreachBuddy</span>
            </div>
            <p className="brand-description">
              Your comprehensive digital security guardian. Monitor, protect, and control 
              your online presence across all platforms with AI-powered intelligence.
            </p>
            
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={16} />
                <span>security@breachbuddy.com</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+1 (555) 123-SECURE</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>San Francisco, CA</span>
              </div>
            </div>

            <div className="social-links">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: social.color
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <div className="footer-links">
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                className="footer-column"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="column-title">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <ul className="column-links">
                  {links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: linkIndex * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <a 
                        href={link.href} 
                        className="footer-link"
                      >
                        <link.icon size={14} />
                        <span>{link.name}</span>
                        <ArrowRight size={12} className="link-arrow" />
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          className="newsletter-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="newsletter-content">
            <div className="newsletter-info">
              <h3>Stay Secure & Informed</h3>
              <p>Get the latest security insights, breach alerts, and product updates delivered to your inbox.</p>
            </div>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="newsletter-input"
              />
              <motion.button
                type="submit"
                className="btn btn-primary newsletter-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
                <ArrowRight size={16} />
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Security Badges */}
        <motion.div
          className="security-badges"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h4>Security & Compliance</h4>
          <div className="badges-grid">
            {securityBadges.map((badge, index) => (
              <motion.div
                key={badge}
                className="security-badge"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Shield size={16} />
                <span>{badge}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer Bottom */}
        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} BreachBuddy. All rights reserved.</p>
              <p className="tagline">Securing your digital future, one platform at a time.</p>
            </div>
            
            <div className="footer-meta">
              <span className="status-indicator">
                <div className="status-dot"></div>
                All systems operational
              </span>
              <div className="build-info">
                v2.1.0 • Built with ❤️ for security
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="footer-bg">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
      </div>
    </footer>
  );
};

export default Footer;
