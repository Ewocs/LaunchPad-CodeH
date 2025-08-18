const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class SurfaceService {
  constructor() {
    this.shodanApiKey = process.env.SHODAN_API_KEY;
  }

  /**
   * Main method to discover all APIs and subdomains for a domain
   */
  async discoverAPIs(domain) {
    const results = {
      subdomains: [],
      endpoints: [],
      tools: {
        basic: { used: true, duration: 0, results: 0 },
        shodan: { used: false, queriesUsed: 0, results: 0 }
      },
      errors: []
    };

    try {
      console.log(`🔍 Starting subdomain discovery for ${domain}`);
      const startTime = Date.now();
      
      // Basic subdomain enumeration using common patterns
      const subdomains = await this.fallbackSubdomainDiscovery(domain);
      results.subdomains.push(...subdomains);
      
      // Endpoint discovery
      console.log(`🔍 Discovering endpoints for ${results.subdomains.length} subdomains`);
      for (const subdomainObj of results.subdomains) {
        try {
          const endpoints = await this.discoverEndpoints(subdomainObj.subdomain);
          results.endpoints.push(...endpoints);
        } catch (error) {
          results.errors.push({
            message: `Endpoint discovery failed for ${subdomainObj.subdomain}: ${error.message}`,
            tool: 'endpoint-discovery'
          });
        }
      }

      // Shodan integration for exposure check
      if (this.shodanApiKey) {
        console.log('🔍 Checking exposure with Shodan');
        await this.enrichWithShodan(results.subdomains);
        results.tools.shodan.used = true;
        results.tools.shodan.queriesUsed = results.subdomains.length;
      }

      results.tools.basic.duration = Date.now() - startTime;
      results.tools.basic.results = results.subdomains.length;

      console.log(`✅ Discovery completed: ${results.subdomains.length} subdomains, ${results.endpoints.length} endpoints`);
      return results;

    } catch (error) {
      results.errors.push({
        message: `API discovery failed: ${error.message}`,
        tool: 'discovery-service'
      });
      return results;
    }
  }

  /**
   * Fallback subdomain discovery using common patterns
   */
  async fallbackSubdomainDiscovery(domain) {
    const commonSubdomains = [
      'api', 'www', 'app', 'admin', 'test', 'dev', 'staging', 'prod',
      'api-v1', 'api-v2', 'v1', 'v2', 'rest', 'graphql', 'gateway',
      'mobile', 'web', 'backend', 'internal', 'external', 'public',
      'mail', 'email', 'smtp', 'imap', 'pop', 'webmail', 'mx'
    ];

    const discoveredSubdomains = [];

    for (const sub of commonSubdomains) {
      const subdomain = `${sub}.${domain}`;
      try {
        // Quick HTTP check
        const response = await axios.get(`http://${subdomain}`, {
          timeout: 5000,
          validateStatus: () => true,
          maxRedirects: 5
        });

        if (response.status < 500) {
          discoveredSubdomains.push({
            subdomain: subdomain.toLowerCase(),
            lastSeen: new Date(),
            isActive: true,
            status: response.status,
            protocol: 'http'
          });
        }
      } catch (error) {
        // Try HTTPS
        try {
          const httpsResponse = await axios.get(`https://${subdomain}`, {
            timeout: 5000,
            validateStatus: () => true,
            maxRedirects: 5
          });

          if (httpsResponse.status < 500) {
            discoveredSubdomains.push({
              subdomain: subdomain.toLowerCase(),
              lastSeen: new Date(),
              isActive: true,
              status: httpsResponse.status,
              protocol: 'https'
            });
          }
        } catch (httpsError) {
          // Subdomain doesn't exist or isn't accessible
        }
      }
    }

    return discoveredSubdomains;
  }

  /**
   * Discover API endpoints for a subdomain
   */
  async discoverEndpoints(subdomain) {
    const endpoints = [];
    const commonPaths = [
      '/api', '/api/v1', '/api/v2', '/api/v3',
      '/rest', '/rest/v1', '/rest/v2',
      '/graphql', '/graphql/v1',
      '/swagger', '/swagger-ui', '/api-docs',
      '/openapi.json', '/swagger.json',
      '/health', '/status', '/ping',
      '/users', '/user', '/auth', '/login',
      '/admin', '/dashboard',
      '/v1', '/v2', '/v3'
    ];

    const protocols = ['https', 'http'];

    for (const protocol of protocols) {
      for (const path of commonPaths) {
        try {
          const url = `${protocol}://${subdomain}${path}`;
          const response = await axios.get(url, {
            timeout: 10000,
            validateStatus: () => true,
            maxRedirects: 3,
            headers: {
              'User-Agent': 'Surface-Checker/1.0'
            }
          });

          if (response.status < 500 && response.status !== 404) {
            endpoints.push({
              url,
              method: 'GET',
              subdomain,
              path,
              responseCode: response.status,
              responseTime: response.headers['x-response-time'] || null,
              contentType: response.headers['content-type'] || 'unknown',
              isPublic: response.status < 400,
              requiresAuth: response.status === 401 || response.status === 403,
              lastChecked: new Date(),
              isActive: true,
              headers: {
                server: response.headers.server,
                'x-powered-by': response.headers['x-powered-by'],
                'access-control-allow-origin': response.headers['access-control-allow-origin']
              }
            });
          }

        } catch (error) {
          continue;
        }
      }
    }

    return endpoints;
  }

  /**
   * Enrich subdomain data with Shodan information
   */
  async enrichWithShodan(subdomains) {
    if (!this.shodanApiKey) return;

    for (const subdomainObj of subdomains) {
      try {
        const response = await axios.get(`https://api.shodan.io/shodan/host/search`, {
          params: {
            key: this.shodanApiKey,
            query: `hostname:${subdomainObj.subdomain}`
          },
          timeout: 10000
        });

        if (response.data.matches && response.data.matches.length > 0) {
          const match = response.data.matches[0];
          subdomainObj.ipAddress = match.ip_str;
          subdomainObj.ports = match.ports || [];
          subdomainObj.technologies = match.tags || [];
          subdomainObj.shodanData = {
            country: match.location?.country_name,
            city: match.location?.city,
            isp: match.isp,
            org: match.org,
            lastUpdate: match.timestamp
          };
        }

        // Small delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.warn(`Shodan lookup failed for ${subdomainObj.subdomain}:`, error.message);
        continue;
      }
    }
  }

  /**
   * Perform basic security checks
   */
  performSecurityChecks(endpoints) {
    const vulnerabilities = [];

    for (const endpoint of endpoints) {
      // Check for HTTP vs HTTPS
      if (endpoint.url.startsWith('http://')) {
        vulnerabilities.push({
          type: 'insecure_protocol',
          severity: 'high',
          title: 'Insecure Protocol (HTTP)',
          description: `The endpoint ${endpoint.url} is using HTTP instead of HTTPS.`,
          recommendation: 'Implement HTTPS/TLS encryption for all API endpoints.',
          evidence: { location: endpoint.url }
        });
      }

      // Check for missing authentication
      if (endpoint.isPublic && endpoint.responseCode === 200) {
        vulnerabilities.push({
          type: 'no_authentication',
          severity: 'medium',
          title: 'No Authentication Required',
          description: `The endpoint ${endpoint.url} is publicly accessible without authentication.`,
          recommendation: 'Implement proper authentication mechanisms.',
          evidence: { location: endpoint.url, response: `HTTP ${endpoint.responseCode}` }
        });
      }

      // Check for CORS misconfigurations
      if (endpoint.headers && endpoint.headers['access-control-allow-origin'] === '*') {
        vulnerabilities.push({
          type: 'cors_misconfiguration',
          severity: 'medium',
          title: 'CORS Wildcard Configuration',
          description: `The endpoint ${endpoint.url} allows CORS requests from any origin.`,
          recommendation: 'Configure CORS to allow only specific trusted origins.',
          evidence: { location: endpoint.url, response: 'Access-Control-Allow-Origin: *' }
        });
      }

      // Check for information disclosure in headers
      if (endpoint.headers) {
        const sensitiveHeaders = ['server', 'x-powered-by'];
        for (const header of sensitiveHeaders) {
          if (endpoint.headers[header]) {
            vulnerabilities.push({
              type: 'information_disclosure',
              severity: 'low',
              title: 'Information Disclosure in Headers',
              description: `The endpoint ${endpoint.url} reveals server information in HTTP headers.`,
              recommendation: 'Remove or obfuscate server information from HTTP response headers.',
              evidence: { location: endpoint.url, response: `${header}: ${endpoint.headers[header]}` }
            });
          }
        }
      }

      // Check for potential admin interfaces
      if (endpoint.path && (endpoint.path.includes('admin') || endpoint.path.includes('dashboard'))) {
        if (endpoint.responseCode < 400) {
          vulnerabilities.push({
            type: 'exposed_sensitive_data',
            severity: 'high',
            title: 'Exposed Administrative Interface',
            description: `The endpoint ${endpoint.url} appears to be an administrative interface.`,
            recommendation: 'Restrict access to administrative interfaces.',
            evidence: { location: endpoint.url }
          });
        }
      }
    }

    return vulnerabilities;
  }

  /**
   * Analyze domain for quick scan
   */
  async quickScan(domain) {
    try {
      const results = await this.discoverAPIs(domain);
      const vulnerabilities = this.performSecurityChecks(results.endpoints);
      
      // Calculate risk score
      const severityScores = { high: 3, medium: 2, low: 1 };
      const totalScore = vulnerabilities.reduce((sum, vuln) => sum + (severityScores[vuln.severity] || 0), 0);
      const riskScore = Math.min(10, Math.round((totalScore / Math.max(1, vulnerabilities.length)) * 3.33));

      return {
        domain,
        subdomains: results.subdomains.length,
        endpoints: results.endpoints.length,
        vulnerabilities: vulnerabilities.length,
        riskScore,
        severityBreakdown: {
          high: vulnerabilities.filter(v => v.severity === 'high').length,
          medium: vulnerabilities.filter(v => v.severity === 'medium').length,
          low: vulnerabilities.filter(v => v.severity === 'low').length
        },
        topIssues: vulnerabilities.slice(0, 3),
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Quick scan failed: ${error.message}`);
    }
  }
}

module.exports = new SurfaceService();
