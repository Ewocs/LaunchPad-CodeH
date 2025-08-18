import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Github, 
  MessageSquare, 
  Monitor, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram,
  Chrome,
  Slack
} from 'lucide-react';
import './Marquee.css';

const Marquee = () => {
  const platforms = [
    { name: 'Gmail', icon: Mail, color: '#EA4335' },
    { name: 'GitHub', icon: Github, color: '#181717' },
    { name: 'Slack', icon: Slack, color: '#4A154B' },
    { name: 'Microsoft', icon: Monitor, color: '#00BCF2' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
    { name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'Chrome', icon: Chrome, color: '#4285F4' },
    { name: 'Discord', icon: MessageSquare, color: '#5865F2' }
  ];

  // Duplicate the array for seamless loop
  const duplicatedPlatforms = [...platforms, ...platforms];

  return (
    <section className="marquee-section">
      <div className="container">
        <motion.div
          className="marquee-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Secure Your Digital Presence Across All Platforms</h2>
          <p>Monitor and protect your accounts on 50+ popular services</p>
        </motion.div>
      </div>

      <div className="marquee-container">
        <motion.div
          className="marquee-content"
          animate={{
            x: ['0%', '-50%']
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          {duplicatedPlatforms.map((platform, index) => (
            <motion.div
              key={`${platform.name}-${index}`}
              className="platform-card"
              whileHover={{ 
                scale: 1.1,
                rotateY: 10,
                z: 50
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="platform-icon-wrapper">
                <platform.icon 
                  className="platform-icon"
                  style={{ color: platform.color }}
                />
                <div 
                  className="platform-glow"
                  style={{ backgroundColor: platform.color }}
                ></div>
              </div>
              <span className="platform-name">{platform.name}</span>
              <div className="security-status">
                <div className="status-dot secured"></div>
                <span>Secured</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Security Stats */}
      <motion.div
        className="security-stats"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                  viewport={{ once: true }}
                >
                  50+
                </motion.span>
              </div>
              <div className="stat-label">Platforms Supported</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 2, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  10M+
                </motion.span>
              </div>
              <div className="stat-label">Data Points Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 2, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  99.8%
                </motion.span>
              </div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 2, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  &lt;30s
                </motion.span>
              </div>
              <div className="stat-label">Detection Time</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Marquee;
