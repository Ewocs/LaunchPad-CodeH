const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const surfaceService = require('../services/surfaceService');

const router = express.Router();

// Rate limiting for surface checks
const surfaceCheckLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many surface check requests, please try again later.'
  }
});

/**
 * Quick surface scan for a domain
 */
router.post('/scan', [
  surfaceCheckLimit,
  body('domain')
    .isURL({ require_tld: true, require_protocol: false })
    .withMessage('Please provide a valid domain name')
    .customSanitizer(value => {
      // Remove protocol if present
      return value.replace(/^https?:\/\//, '').replace(/\/$/, '');
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }

    const { domain } = req.body;
    
    console.log(`Starting surface scan for domain: ${domain}`);
    
    const result = await surfaceService.quickScan(domain);
    
    res.json({
      success: true,
      message: 'Surface scan completed',
      data: result
    });

  } catch (error) {
    console.error('Surface scan error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Surface scan failed',
      error: error.message
    });
  }
});

/**
 * Detailed discovery for a domain
 */
router.post('/discover', [
  surfaceCheckLimit,
  body('domain')
    .isURL({ require_tld: true, require_protocol: false })
    .withMessage('Please provide a valid domain name')
    .customSanitizer(value => {
      return value.replace(/^https?:\/\//, '').replace(/\/$/, '');
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }

    const { domain } = req.body;
    
    console.log(`Starting detailed discovery for domain: ${domain}`);
    
    const discoveryResults = await surfaceService.discoverAPIs(domain);
    const vulnerabilities = surfaceService.performSecurityChecks(discoveryResults.endpoints);
    
    const result = {
      domain,
      discovery: discoveryResults,
      security: {
        vulnerabilities,
        summary: {
          total: vulnerabilities.length,
          high: vulnerabilities.filter(v => v.severity === 'high').length,
          medium: vulnerabilities.filter(v => v.severity === 'medium').length,
          low: vulnerabilities.filter(v => v.severity === 'low').length
        }
      },
      timestamp: new Date()
    };
    
    res.json({
      success: true,
      message: 'Detailed discovery completed',
      data: result
    });

  } catch (error) {
    console.error('Discovery error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Discovery failed',
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Surface checking service is healthy',
    timestamp: new Date()
  });
});

module.exports = router;
