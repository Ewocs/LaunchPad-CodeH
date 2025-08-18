import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Mail, 
  Shield, 
  Eye, 
  Zap, 
  Lock, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Search,
  Database,
  Bell,
  Settings,
  BarChart3,
  FileText
} from 'lucide-react';
import './Features.css';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const timelineRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const timeline = timelineRef.current;
    const features = featuresRef.current;

    // Animate timeline items
    gsap.fromTo(
      timeline.querySelectorAll('.timeline-item'),
      {
        opacity: 0,
        x: -50
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: timeline,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animate feature cards
    gsap.fromTo(
      features.querySelectorAll('.feature-card'),
      {
        y: 50,
        opacity: 0,
        scale: 0.9
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: features,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const timelineSteps = [
    {
      step: '01',
      title: 'Connect Your Accounts',
      description: 'Securely link your email accounts (Gmail, Outlook, etc.) using OAuth 2.0',
      icon: Mail,
      duration: '30 seconds',
      color: 'var(--accent-cyan)'
    },
    {
      step: '02',
      title: 'AI Email Analysis',
      description: 'Our AI scans your emails to identify all connected services and platforms',
      icon: Search,
      duration: '2-5 minutes',
      color: 'var(--secondary-purple)'
    },
    {
      step: '03',
      title: 'Database Cross-Reference',
      description: 'Check each service against breach databases (HIBP) and vulnerability reports',
      icon: Database,
      duration: '1-2 minutes',
      color: 'var(--warning-orange)'
    },
    {
      step: '04',
      title: 'Security Scoring',
      description: 'Generate comprehensive security scores and risk assessments for each platform',
      icon: BarChart3,
      duration: '30 seconds',
      color: 'var(--success-green)'
    },
    {
      step: '05',
      title: 'Real-time Monitoring',
      description: 'Continuous monitoring for new breaches, dormant accounts, and security threats',
      icon: Eye,
      duration: 'Ongoing',
      color: 'var(--danger-red)'
    },
    {
      step: '06',
      title: 'Instant Alerts',
      description: 'Receive immediate notifications for security incidents and recommended actions',
      icon: Bell,
      duration: 'Real-time',
      color: 'var(--primary-blue)'
    }
  ];

  const keyFeatures = [
    {
      icon: Shield,
      title: 'AI-Powered Security Analysis',
      description: 'Advanced machine learning algorithms analyze your digital footprint and identify potential vulnerabilities across all connected platforms.',
      benefits: ['Pattern Recognition', 'Threat Prediction', 'Automated Risk Assessment']
    },
    {
      icon: AlertTriangle,
      title: 'Breach Detection & Monitoring',
      description: 'Real-time integration with multiple breach databases including Have I Been Pwned, providing instant alerts when your data is compromised.',
      benefits: ['Instant Breach Alerts', 'Historical Breach Data', 'Dark Web Monitoring']
    },
    {
      icon: Settings,
      title: 'Centralized Access Control',
      description: 'Unified dashboard to view, manage, and revoke access permissions across all your connected platforms and services from one place.',
      benefits: ['One-Click Revocation', 'Permission Auditing', 'Access Timeline']
    },
    {
      icon: Clock,
      title: 'Timeline & Audit Trail',
      description: 'Comprehensive tracking of all interactions, login attempts, and security events with detailed timestamps and location data.',
      benefits: ['Activity Logs', 'Forensic Analysis', 'Compliance Reporting']
    },
    {
      icon: Lock,
      title: 'API Vulnerability Scanner',
      description: 'Scan and analyze website APIs for potential security exposures, misconfigurations, and compliance issues.',
      benefits: ['Automated Scanning', 'Vulnerability Reports', 'Remediation Guidance']
    },
    {
      icon: FileText,
      title: 'Privacy-First Architecture',
      description: 'All data processing happens locally with end-to-end encryption. Your sensitive information never leaves your control.',
      benefits: ['Local Processing', 'Zero-Knowledge', 'GDPR Compliant']
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="features" className="features-section">
      <div className="container">
        <motion.div
          className="features-header"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="section-badge" variants={itemVariants}>
            <Zap size={16} />
            <span>How BreachBuddy Works</span>
          </motion.div>

          <motion.h2 className="section-title" variants={itemVariants}>
            Complete Security in
            <span className="gradient-text"> 6 Simple Steps</span>
          </motion.h2>

          <motion.p className="section-description" variants={itemVariants}>
            Our AI-powered platform provides comprehensive digital security analysis 
            in minutes, not hours. Here's exactly how we protect your digital life.
          </motion.p>
        </motion.div>

        {/* Timeline Section */}
        <div className="timeline-section" ref={timelineRef}>
          <div className="timeline-container">
            {timelineSteps.map((step, index) => (
              <div key={step.step} className="timeline-item">
                <div className="timeline-marker">
                  <div 
                    className="timeline-icon"
                    style={{ backgroundColor: step.color }}
                  >
                    <step.icon size={24} />
                  </div>
                  <div className="timeline-line"></div>
                </div>
                <div className="timeline-content">
                  <div className="timeline-step">Step {step.step}</div>
                  <h3 className="timeline-title">{step.title}</h3>
                  <p className="timeline-description">{step.description}</p>
                  <div className="timeline-duration">
                    <Clock size={14} />
                    <span>{step.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features Section */}
        <motion.div
          className="key-features-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">
            Advanced Security
            <span className="gradient-text"> Features</span>
          </h2>
          <p className="section-description">
            Comprehensive protection powered by cutting-edge technology and security expertise.
          </p>
        </motion.div>

        <div className="features-grid" ref={featuresRef}>
          {keyFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              whileHover={{ 
                scale: 1.02,
                rotateY: 5
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-icon-wrapper">
                <feature.icon className="feature-icon" />
                <div className="feature-glow"></div>
              </div>
              
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              
              <div className="feature-benefits">
                {feature.benefits.map((benefit, idx) => (
                  <div key={idx} className="benefit-item">
                    <CheckCircle size={14} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="feature-number">
                {String(index + 1).padStart(2, '0')}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="features-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3>Experience the Future of Digital Security</h3>
          <p>Join thousands of users who trust BreachBuddy to protect their digital lives.</p>
          <motion.button
            className="btn btn-primary cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Free Security Analysis
            <Shield size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
