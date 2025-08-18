import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Shield, 
  Eye, 
  Zap, 
  Lock, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Brain,
  Globe,
  Clock
} from 'lucide-react';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const features = featuresRef.current;

    // Animate feature cards on scroll
    gsap.fromTo(
      features.children,
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
        stagger: 0.2,
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

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Scanning',
      description: 'Our advanced AI analyzes your email patterns and automatically detects all connected services and potential vulnerabilities.',
      color: 'var(--secondary-purple)'
    },
    {
      icon: Eye,
      title: 'Breach Monitoring',
      description: 'Real-time monitoring using Have I Been Pwned database to instantly alert you of any data breaches affecting your accounts.',
      color: 'var(--danger-red)'
    },
    {
      icon: Shield,
      title: 'Access Control',
      description: 'Centralized dashboard to view, manage, and revoke access permissions across all your connected platforms and services.',
      color: 'var(--accent-cyan)'
    },
    {
      icon: Globe,
      title: 'API Vulnerability Detection',
      description: 'Scan website APIs for potential security exposures and misconfigurations that could compromise your data.',
      color: 'var(--warning-orange)'
    },
    {
      icon: Clock,
      title: 'Timeline Tracking',
      description: 'Track first and last interactions with services, identify dormant accounts, and maintain a complete audit trail.',
      color: 'var(--success-green)'
    },
    {
      icon: Lock,
      title: 'Privacy-First Design',
      description: 'Your data never leaves your control. All scanning and analysis happens locally with end-to-end encryption.',
      color: 'var(--primary-blue)'
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
    <section id="about" className="about-section" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="about-header"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="section-badge" variants={itemVariants}>
            <Zap size={16} />
            <span>Why Choose BreachBuddy</span>
          </motion.div>

          <motion.h2 className="section-title" variants={itemVariants}>
            Revolutionizing Digital Security
            <span className="gradient-text"> Management</span>
          </motion.h2>

          <motion.p className="section-description" variants={itemVariants}>
            Traditional security tools give you fragments of the picture. BreachBuddy provides 
            complete visibility and control over your entire digital footprint, putting you back 
            in charge of your online security.
          </motion.p>
        </motion.div>

        <div className="about-content">
          <motion.div
            className="problem-solution"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="problem-card">
              <div className="card-header">
                <AlertTriangle className="card-icon problem" />
                <h3>The Problem</h3>
              </div>
              <ul className="problem-list">
                <li>Fragmented security tools with limited visibility</li>
                <li>Hidden API vulnerabilities go undetected</li>
                <li>Manual breach monitoring is time-consuming</li>
                <li>No centralized access control management</li>
                <li>Dormant accounts create security risks</li>
              </ul>
            </div>

            <div className="arrow-connector">
              <ArrowRight size={32} />
            </div>

            <div className="solution-card">
              <div className="card-header">
                <CheckCircle className="card-icon solution" />
                <h3>Our Solution</h3>
              </div>
              <ul className="solution-list">
                <li>Unified dashboard for complete visibility</li>
                <li>AI-powered API vulnerability scanning</li>
                <li>Automated breach detection and alerts</li>
                <li>One-click access revocation across platforms</li>
                <li>Intelligent dormant account identification</li>
              </ul>
            </div>
          </motion.div>

          <div className="features-grid" ref={featuresRef}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-card"
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="feature-icon-wrapper">
                  <feature.icon 
                    className="feature-icon"
                    style={{ color: feature.color }}
                  />
                  <div 
                    className="feature-glow"
                    style={{ backgroundColor: feature.color }}
                  ></div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-number">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="about-cta"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3>Ready to Take Control?</h3>
            <p>Join thousands of users who trust BreachBuddy to protect their digital lives.</p>
            <motion.button
              className="btn btn-primary cta-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Free Security Scan
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
