import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Shield,
  Users,
  Zap
} from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'security@breachbuddy.com',
      subContent: 'We respond within 2 hours',
      color: 'var(--accent-cyan)'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+1 (555) 123-SECURE',
      subContent: '24/7 Emergency Support',
      color: 'var(--success-green)'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: '123 Security Blvd',
      subContent: 'San Francisco, CA 94105',
      color: 'var(--secondary-purple)'
    },
    {
      icon: Clock,
      title: 'Office Hours',
      content: 'Mon - Fri: 9AM - 6PM PST',
      subContent: 'Emergency support 24/7',
      color: 'var(--warning-orange)'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: MessageSquare },
    { value: 'security', label: 'Security Concern', icon: Shield },
    { value: 'enterprise', label: 'Enterprise Sales', icon: Users },
    { value: 'support', label: 'Technical Support', icon: Zap }
  ];

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <motion.div
          className="contact-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="section-badge">
            <Mail size={16} />
            <span>Get In Touch</span>
          </div>
          <h2 className="section-title">
            Ready to Secure Your
            <span className="gradient-text"> Digital Future?</span>
          </h2>
          <p className="section-description">
            Have questions about BreachBuddy? Our security experts are here to help. 
            Reach out for demos, enterprise solutions, or technical support.
          </p>
        </motion.div>

        <div className="contact-content">
          {/* Contact Information */}
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3>Get in Touch</h3>
            <p>Choose the best way to reach our team</p>
            
            <div className="contact-cards">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  className="contact-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                >
                  <div className="contact-icon-wrapper">
                    <info.icon 
                      className="contact-icon"
                      style={{ color: info.color }}
                    />
                    <div 
                      className="contact-glow"
                      style={{ backgroundColor: info.color }}
                    ></div>
                  </div>
                  <div className="contact-details">
                    <h4>{info.title}</h4>
                    <p className="contact-primary">{info.content}</p>
                    <p className="contact-secondary">{info.subContent}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="emergency-contact">
              <AlertCircle className="emergency-icon" />
              <div>
                <h4>Security Emergency?</h4>
                <p>Call our 24/7 incident response team</p>
                <a href="tel:+15551234567" className="emergency-number">
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="contact-form-wrapper"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              <h3>Send us a Message</h3>
              
              {/* Inquiry Type Selection */}
              <div className="inquiry-types">
                {inquiryTypes.map((type) => (
                  <label key={type.value} className="inquiry-type">
                    <input
                      type="radio"
                      name="inquiryType"
                      value={type.value}
                      checked={formData.inquiryType === type.value}
                      onChange={handleInputChange}
                    />
                    <div className="inquiry-card">
                      <type.icon size={20} />
                      <span>{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Your Company"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="How can we help?"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder="Tell us more about your security needs..."
                ></textarea>
              </div>

              <motion.button
                type="submit"
                className={`btn btn-primary submit-btn ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send size={20} />
                  </>
                )}
              </motion.button>

              {/* Success/Error Messages */}
              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.div
                    className="form-message success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <CheckCircle size={20} />
                    <span>Message sent successfully! We'll get back to you soon.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
