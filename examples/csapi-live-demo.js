/**
 * Live CSAPI Server Demo
 * 
 * Demonstrates using the CSAPI navigator against a real server
 * Server: http://45.55.99.236:8080/sensorhub/api
 * Auth: Basic (ogc/ogc)
 */

import { OgcApiEndpoint } from '../dist/index.js';
import { setFetchOptions } from '../dist/index.js';

// Server configuration
const SERVER_URL = 'http://45.55.99.236:8080/sensorhub/api';
const USERNAME = 'ogc';
const PASSWORD = 'ogc';

// Create Basic Auth header
const authHeader = `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`;

console.log('🚀 CSAPI Live Server Demo\n');
console.log(`Server: ${SERVER_URL}`);
console.log(`Auth: ${USERNAME}:${PASSWORD}\n`);

// Set fetch options for authentication
setFetchOptions({
  headers: {
    'Authorization': authHeader,
    'Accept': 'application/json',
  }
});

console.log('✓ Authentication configured\n');

// Initialize endpoint
console.log('Connecting to server...');
const endpoint = new OgcApiEndpoint(SERVER_URL);

// Wait for endpoint info
endpoint.info
  .then(async (info) => {
    console.log('✓ Connected successfully!\n');
    console.log('Server Info:');
    console.log(`  Title: ${info.title || 'N/A'}`);
    console.log(`  Description: ${info.description || 'N/A'}`);
    console.log();

    // Get collections
    console.log('Fetching collections...');
    const collections = endpoint.collections;
    console.log(`✓ Found ${collections.length} collections\n`);

    // Try to get CSAPI navigator
    console.log('Looking for CSAPI-enabled collection...');
    for (const collection of collections) {
      try {
        const navigator = await endpoint.csapi(collection.id);
        console.log(`✓ Found CSAPI collection: ${collection.id}\n`);
        
        // Build some URLs
        console.log('Generated URLs:');
        console.log(`  Systems: ${navigator.getSystemsUrl({ limit: 10 })}`);
        console.log(`  Datastreams: ${navigator.getDatastreamsUrl({ limit: 10 })}`);
        console.log(`  Observations: ${navigator.getObservationsUrl({ limit: 10 })}`);
        console.log();
        
        // Try to fetch systems
        console.log('Fetching systems...');
        const systemsUrl = navigator.getSystemsUrl({ limit: 5 });
        const response = await fetch(systemsUrl, {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.log(`✗ Failed: ${response.status} ${response.statusText}`);
          return;
        }
        
        const systems = await response.json();
        console.log(`✓ Retrieved systems successfully!`);
        
        if (systems.type === 'FeatureCollection') {
          console.log(`  Found ${systems.features?.length || 0} systems`);
          if (systems.features && systems.features.length > 0) {
            console.log('\n  First System:');
            const first = systems.features[0];
            console.log(`    ID: ${first.id}`);
            console.log(`    Name: ${first.properties?.name || 'N/A'}`);
            console.log(`    Type: ${first.properties?.type || 'N/A'}`);
          }
        } else if (Array.isArray(systems)) {
          console.log(`  Found ${systems.length} systems`);
        }
        
        console.log('\n✅ Demo completed successfully!');
        break;
      } catch (error) {
        // Try next collection
        continue;
      }
    }
  })
  .catch((error) => {
    console.error('✗ Error:', error.message);
    process.exit(1);
  });
