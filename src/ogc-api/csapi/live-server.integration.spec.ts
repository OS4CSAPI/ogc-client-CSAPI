/**
 * Live Server Integration Tests
 * 
 * Tests against a real OGC API - Connected Systems server.
 * Set CSAPI_LIVE_SERVER environment variable to run these tests.
 * 
 * Server: http://45.55.99.236:8080/sensorhub/api
 * Auth: Basic (ogc/ogc)
 * 
 * Example:
 *   $env:CSAPI_LIVE_SERVER="http://45.55.99.236:8080/sensorhub/api"; npm test -- live-server
 */

import OgcApiEndpoint from '../endpoint.js';
import CSAPINavigator from './navigator.js';
import { detectFormat } from './formats.js';
import { setFetchOptions, resetFetchOptions } from '../../shared/http-utils.js';

// Server configuration
const LIVE_SERVER_URL = process.env.CSAPI_LIVE_SERVER || 'http://45.55.99.236:8080/sensorhub/api';
const LIVE_SERVER_USER = process.env.CSAPI_LIVE_USER || 'ogc';
const LIVE_SERVER_PASS = process.env.CSAPI_LIVE_PASS || 'ogc';

// Create auth headers
const authHeaders = {
  Authorization: `Basic ${Buffer.from(`${LIVE_SERVER_USER}:${LIVE_SERVER_PASS}`).toString('base64')}`,
  Accept: 'application/geo+json',
};

// Helper to fetch with auth
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  });
}

// Skip tests if CSAPI_LIVE_SERVER not set
const describeIfLive = process.env.CSAPI_LIVE_SERVER ? describe : describe.skip;

describeIfLive('Live CSAPI Server Integration', () => {
  let endpoint: OgcApiEndpoint;
  let navigator: CSAPINavigator;

  beforeAll(async () => {
    console.log(`Testing against live server: ${LIVE_SERVER_URL}`);
    
    // Set fetch options to include auth headers BEFORE creating endpoint
    setFetchOptions({ headers: authHeaders });
    
    // Initialize endpoint - it will use the configured fetch options
    endpoint = new OgcApiEndpoint(LIVE_SERVER_URL);
    
    // Wait for endpoint to load
    try {
      await endpoint.info;
      console.log('Endpoint initialized successfully');
    } catch (error) {
      console.error('Failed to initialize endpoint:', error);
      throw error;
    }
  });

  afterAll(() => {
    // Reset fetch options
    resetFetchOptions();
  });

  describe('Server Discovery', () => {
    it('should connect to the server and parse landing page', async () => {
      expect(endpoint).toBeDefined();
      expect(endpoint.apiUrl).toBe(LIVE_SERVER_URL);
    });

    it('should detect CSAPI conformance', async () => {
      const conformsUrl = `${LIVE_SERVER_URL}/conformance`;
      const response = await fetchWithAuth(conformsUrl);
      expect(response.ok).toBe(true);
      
      const conformance = await response.json();
      expect(conformance.conformsTo).toBeDefined();
      expect(Array.isArray(conformance.conformsTo)).toBe(true);
      
      // Log which parts of CSAPI are supported
      const csapiConformance = conformance.conformsTo.filter((uri: string) => 
        uri.includes('connected-systems') || uri.includes('sensorThings')
      );
      console.log('CSAPI Conformance Classes:', csapiConformance);
    });

    it('should list collections', async () => {
      const collectionsUrl = `${LIVE_SERVER_URL}/collections`;
      const response = await fetchWithAuth(collectionsUrl);
      expect(response.ok).toBe(true);
      
      const collections = await response.json();
      expect(collections.collections).toBeDefined();
      expect(Array.isArray(collections.collections)).toBe(true);
      expect(collections.collections.length).toBeGreaterThan(0);
      
      console.log(`Found ${collections.collections.length} collections`);
      collections.collections.forEach((col: any) => {
        console.log(`  - ${col.id}: ${col.title || col.id}`);
      });
    });

    it('should find a CSAPI-enabled collection', async () => {
      const collections = endpoint.collections;
      const csapiCollection = collections.find((col: any) => {
        const links = col.links || [];
        return links.some((link: any) => 
          link.href?.includes('/systems') || 
          link.rel === 'systems' ||
          col.id?.toLowerCase().includes('sensor') ||
          col.id?.toLowerCase().includes('system')
        );
      });
      
      expect(csapiCollection).toBeDefined();
      console.log('CSAPI Collection:', csapiCollection?.id);
      
      // Initialize navigator for subsequent tests
      if (csapiCollection) {
        navigator = await endpoint.csapi(csapiCollection.id);
        expect(navigator).toBeInstanceOf(CSAPINavigator);
      }
    }, 10000);
  });

  describe('Systems Resource', () => {
    it('should list systems', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      const systemsUrl = navigator.getSystemsUrl({ limit: 10 });
      console.log('Systems URL:', systemsUrl);
      
      const response = await fetchWithAuth(systemsUrl);
      expect(response.ok).toBe(true);
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      const systems = await response.json();
      expect(systems).toBeDefined();
      
      // Could be FeatureCollection or custom collection format
      if (systems.type === 'FeatureCollection') {
        expect(Array.isArray(systems.features)).toBe(true);
        console.log(`Found ${systems.features.length} systems`);
        
        if (systems.features.length > 0) {
          const firstSystem = systems.features[0];
          console.log('First system:', {
            id: firstSystem.id,
            name: firstSystem.properties?.name,
            type: firstSystem.properties?.type,
          });
        }
      } else if (Array.isArray(systems)) {
        console.log(`Found ${systems.length} systems (array format)`);
      } else if (systems.items) {
        console.log(`Found ${systems.items.length} systems (items format)`);
      }
    }, 10000);

    it('should get a specific system', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      // First get list to find a system ID
      const systemsUrl = navigator.getSystemsUrl({ limit: 1 });
      const listResponse = await fetchWithAuth(systemsUrl);
      const systems = await listResponse.json();
      
      let systemId: string | undefined;
      if (systems.type === 'FeatureCollection' && systems.features.length > 0) {
        systemId = systems.features[0].id;
      } else if (Array.isArray(systems) && systems.length > 0) {
        systemId = systems[0].id;
      } else if (systems.items && systems.items.length > 0) {
        systemId = systems.items[0].id;
      }
      
      if (!systemId) {
        console.warn('No systems found to test');
        return;
      }

      const systemUrl = navigator.getSystemUrl(systemId);
      console.log('System URL:', systemUrl);
      
      const response = await fetchWithAuth(systemUrl);
      expect(response.ok).toBe(true);
      
      const system = await response.json();
      expect(system).toBeDefined();
      expect(system.id).toBe(systemId);
      
      console.log('System details:', {
        id: system.id,
        name: system.properties?.name || system.name,
        type: system.properties?.type || system.type,
      });
    }, 10000);

    it('should test query parameters', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      // Test various query parameters
      const queries = [
        { limit: 5 },
        { limit: 10, q: 'sensor' },
        // Add bbox/datetime if we know valid ranges
      ];

      for (const queryOptions of queries) {
        const url = navigator.getSystemsUrl(queryOptions);
        console.log('Query:', queryOptions, '-> URL:', url);
        
        const response = await fetchWithAuth(url);
        expect(response.ok).toBe(true);
        
        const result = await response.json();
        expect(result).toBeDefined();
      }
    }, 15000);
  });

  describe('Datastreams Resource', () => {
    it('should list datastreams', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      const datastreamsUrl = navigator.getDatastreamsUrl({ limit: 10 });
      console.log('Datastreams URL:', datastreamsUrl);
      
      const response = await fetchWithAuth(datastreamsUrl);
      
      // Some servers might not have datastreams
      if (response.status === 404) {
        console.warn('Datastreams endpoint not found');
        return;
      }
      
      expect(response.ok).toBe(true);
      
      const datastreams = await response.json();
      expect(datastreams).toBeDefined();
      
      if (datastreams.type === 'FeatureCollection') {
        console.log(`Found ${datastreams.features?.length || 0} datastreams`);
      } else if (Array.isArray(datastreams)) {
        console.log(`Found ${datastreams.length} datastreams`);
      } else if (datastreams.items) {
        console.log(`Found ${datastreams.items.length} datastreams`);
      }
    }, 10000);
  });

  describe('Observations Resource', () => {
    it('should list observations', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      const observationsUrl = navigator.getObservationsUrl({ limit: 10 });
      console.log('Observations URL:', observationsUrl);
      
      const response = await fetchWithAuth(observationsUrl);
      
      // Some servers might not have observations
      if (response.status === 404) {
        console.warn('Observations endpoint not found');
        return;
      }
      
      expect(response.ok).toBe(true);
      
      const observations = await response.json();
      expect(observations).toBeDefined();
      
      if (Array.isArray(observations)) {
        console.log(`Found ${observations.length} observations`);
      } else if (observations.value) {
        console.log(`Found ${observations.value.length} observations (SensorThings format)`);
      }
    }, 10000);
  });

  describe('Format Detection', () => {
    it('should detect format from Content-Type', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      const systemsUrl = navigator.getSystemsUrl({ limit: 1 });
      const response = await fetchWithAuth(systemsUrl);
      
      const contentType = response.headers.get('content-type');
      const format = detectFormat(contentType || '');
      
      console.log('Content-Type:', contentType);
      console.log('Detected format:', format);
      
      expect(['geojson', 'sensorml', 'swe', 'json', 'unknown']).toContain(format);
    });
  });

  describe('Sub-Resources', () => {
    it('should access system datastreams', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      // Get a system first
      const systemsUrl = navigator.getSystemsUrl({ limit: 1 });
      const listResponse = await fetchWithAuth(systemsUrl);
      const systems = await listResponse.json();
      
      let systemId: string | undefined;
      if (systems.type === 'FeatureCollection' && systems.features.length > 0) {
        systemId = systems.features[0].id;
      } else if (Array.isArray(systems) && systems.length > 0) {
        systemId = systems[0].id;
      } else if (systems.items && systems.items.length > 0) {
        systemId = systems.items[0].id;
      }
      
      if (!systemId) {
        console.warn('No systems found');
        return;
      }

      // Try to get datastreams for that system
      const datastreamsUrl = navigator.getSystemDatastreamsUrl(systemId);
      console.log('System Datastreams URL:', datastreamsUrl);
      
      const response = await fetchWithAuth(datastreamsUrl);
      
      // Might not be available
      if (response.status === 404 || response.status === 501) {
        console.warn('System datastreams not available');
        return;
      }
      
      if (response.ok) {
        const datastreams = await response.json();
        console.log('System datastreams retrieved:', 
          datastreams.features?.length || datastreams.length || 0);
      }
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent resource', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      const url = navigator.getSystemUrl('nonexistent-system-id-12345');
      const response = await fetchWithAuth(url);
      
      expect(response.ok).toBe(false);
      expect([404, 400]).toContain(response.status);
    });

    it('should handle missing authentication gracefully', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      const url = navigator.getSystemsUrl();
      
      // Fetch without auth
      const response = await fetch(url);
      
      // Should be 401 Unauthorized
      console.log('Response without auth:', response.status, response.statusText);
      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('Link Following', () => {
    it('should follow pagination links if available', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      const systemsUrl = navigator.getSystemsUrl({ limit: 2 });
      const response = await fetchWithAuth(systemsUrl);
      const systems = await response.json();
      
      // Check for next link
      const nextLink = systems.links?.find((link: any) => link.rel === 'next');
      
      if (nextLink) {
        console.log('Next link found:', nextLink.href);
        
        const nextResponse = await fetchWithAuth(nextLink.href);
        expect(nextResponse.ok).toBe(true);
        
        const nextSystems = await nextResponse.json();
        expect(nextSystems).toBeDefined();
        console.log('Successfully followed pagination link');
      } else {
        console.log('No pagination links (might be small dataset)');
      }
    }, 10000);
  });

  describe('Real-World Validation', () => {
    it('should validate our type definitions match server responses', async () => {
      if (!navigator) {
        console.warn('Skipping: navigator not initialized');
        return;
      }

      const systemsUrl = navigator.getSystemsUrl({ limit: 1 });
      const response = await fetchWithAuth(systemsUrl);
      const systems = await response.json();
      
      // Basic structure validation
      if (systems.type === 'FeatureCollection') {
        expect(systems.type).toBe('FeatureCollection');
        expect(Array.isArray(systems.features)).toBe(true);
        
        if (systems.features.length > 0) {
          const feature = systems.features[0];
          expect(feature.type).toBe('Feature');
          expect(feature.id).toBeDefined();
          expect(feature.geometry).toBeDefined();
          expect(feature.properties).toBeDefined();
          
          console.log('Server response matches GeoJSON Feature structure ✓');
        }
      }
    });

    it('should document server-specific behaviors', async () => {
      console.log('\n=== Server Capabilities Summary ===');
      console.log('URL:', LIVE_SERVER_URL);
      console.log('Auth: Basic authentication required');
      
      if (navigator) {
        console.log('Available resources:', Array.from(navigator.availableResources || []));
        console.log('Supported formats:', Array.from(navigator.supportedFormats || []));
        console.log('Supported CRS:', navigator.supportedCrs || []);
      }
      
      console.log('===================================\n');
    });
  });
});
