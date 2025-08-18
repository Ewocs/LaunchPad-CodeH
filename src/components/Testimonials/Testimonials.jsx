import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import './Testimonials.css';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'CISO, TechCorp',
      company: 'Fortune 500 Technology Company',
      avatar: 'SC',
      rating: 5,
      text: 'BreachBuddy transformed our security posture overnight. The AI-powered scanning discovered vulnerabilities we never knew existed across our team\'s personal accounts that could have been enterprise risks.',
      highlight: 'Discovered hidden vulnerabilities'
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      role: 'Security Engineer',
      company: 'CyberDefense Inc.',
      avatar: 'MR',
      rating: 5,
      text: 'The unified dashboard is a game-changer. Instead of juggling multiple tools, I can now monitor, detect, and respond to threats across all platforms from one place. The time savings are incredible.',
      highlight: 'Unified threat management'
    },
    {
      id: 3,
      name: 'Emily Watson',
      role: 'IT Director',
      company: 'Global Healthcare Solutions',
      avatar: 'EW',
      rating: 5,
      text: 'BreachBuddy\'s breach monitoring saved us from a major incident. We received alerts within minutes of a breach affecting one of our vendor\'s systems. The timeline tracking feature is invaluable.',
      highlight: 'Real-time breach detection'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'DevOps Lead',
      company: 'StartupScale',
      avatar: 'DK',
      rating: 5,
      text: 'As a startup, we needed enterprise-level security without the enterprise budget. BreachBuddy gives us comprehensive protection while being incredibly user-friendly.',
      highlight: 'Enterprise security, startup budget'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'Privacy Officer',
      company: 'LegalTech Partners',
      avatar: 'LT',
      rating: 5,
      text: 'The privacy-first approach was crucial for our law firm. BreachBuddy scans and analyzes everything locally, ensuring client confidentiality is never compromised.',
      highlight: 'Privacy-first security'
    },
    {
      id: 6,
      name: 'Ahmed Hassan',
      role: 'Security Consultant',
      company: 'SecureVantage',
      avatar: 'AH',
      rating: 5,
      text: 'I recommend BreachBuddy to all my clients. The API vulnerability detection has uncovered issues that traditional scanners miss. It\'s like having a security expert on your team 24/7.',
      highlight: 'Expert-level vulnerability detection'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <motion.div
          className="testimonials-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="section-badge">
            <Star size={16} />
            <span>What Our Users Say</span>
          </div>
          <h2 className="section-title">
            Trusted by Security
            <span className="gradient-text"> Professionals</span>
          </h2>
          <p className="section-description">
            Join thousands of security experts who rely on BreachBuddy to protect 
            their digital assets and maintain comprehensive security oversight.
          </p>
        </motion.div>

        <div className="testimonials-container">
          <div className="testimonials-wrapper">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="testimonial-card"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="quote-icon">
                  <Quote size={32} />
                </div>
                
                <div className="testimonial-content">
                  <div className="rating">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} size={20} className="star filled" />
                    ))}
                  </div>
                  
                  <blockquote className="testimonial-text">
                    "{testimonials[currentIndex].text}"
                  </blockquote>
                  
                  <div className="testimonial-highlight">
                    <span className="highlight-badge">
                      {testimonials[currentIndex].highlight}
                    </span>
                  </div>
                </div>

                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonials[currentIndex].avatar}
                  </div>
                  <div className="author-info">
                    <h4 className="author-name">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="author-role">
                      {testimonials[currentIndex].role}
                    </p>
                    <p className="author-company">
                      {testimonials[currentIndex].company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="testimonial-controls">
              <button 
                className="control-btn prev" 
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="testimonial-dots">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => goToTestimonial(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                className="control-btn next" 
                onClick={nextTestimonial}
                aria-label="Next testimonial"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Background testimonials grid */}
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className={`grid-testimonial ${index === currentIndex ? 'active' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => goToTestimonial(index)}
              >
                <div className="grid-avatar">{testimonial.avatar}</div>
                <div className="grid-info">
                  <h5>{testimonial.name}</h5>
                  <p>{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <motion.div
          className="trust-indicators"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="trust-stats">
            <div className="trust-stat">
              <div className="trust-number">4.9/5</div>
              <div className="trust-label">Average Rating</div>
            </div>
            <div className="trust-stat">
              <div className="trust-number">10,000+</div>
              <div className="trust-label">Security Professionals</div>
            </div>
            <div className="trust-stat">
              <div className="trust-number">99.8%</div>
              <div className="trust-label">Customer Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
