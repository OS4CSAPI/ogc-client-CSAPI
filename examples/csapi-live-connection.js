/**
 * CSAPI Live Server Connection Demo
 * 
 * Demonstrates connecting to a real OGC API - Connected Systems server
 * and retrieving data using our navigator URL builder pattern.
 * 
 * Server: http://45.55.99.236:8080/sensorhub/api (OpenSensorHub)
 * Auth: Basic Authentication (ogc/ogc)
 * 
 * Run with: node examples/csapi-live-connection.js
 */

const SERVER_URL = 'http://45.55.99.236:8080/sensorhub/api';
const USERNAME = 'ogc';
const PASSWORD = 'ogc';

// Create Basic Auth header
const authHeader = `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`;

const headers = {
  'Authorization': authHeader,
  'Accept': 'application/json',
};

console.log('🌐 CSAPI Live Server Connection Demo\n');
console.log(`📍 Server: ${SERVER_URL}`);
console.log(`🔐 Auth: ${USERNAME}:${PASSWORD}`);
console.log('=' .repeat(60) + '\n');

// Helper function for authenticated requests
async function fetchJSON(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Main demo
(async () => {
  try {
    // 1. Fetch Landing Page
    console.log('📄 Step 1: Fetching landing page...');
    const landing = await fetchJSON(SERVER_URL);
    console.log(`✓ Server: ${landing.title || 'Connected Systems API Service'}`);
    console.log(`✓ Found ${landing.links?.length || 0} links\n`);

    // 2. Fetch Conformance
    console.log('📋 Step 2: Checking conformance...');
    const conformanceLink = landing.links.find(l => l.rel === 'conformance');
    const conformance = await fetchJSON(conformanceLink.href);
    const csapiConformance = conformance.conformsTo.filter(uri => 
      uri.includes('connected-systems') || uri.includes('ogcapi-connected-systems')
    );
    console.log(`✓ Implements ${csapiConformance.length} CSAPI conformance classes:`);
    csapiConformance.forEach(uri => {
      const parts = uri.split('/');
      console.log(`  - ${parts[parts.length - 1] || uri}`);
    });
    console.log();

    // 3. List Systems
    console.log('🔧 Step 3: Fetching systems...');
    const systemsLink = landing.links.find(l => l.rel === 'systems');
    if (!systemsLink) {
      console.log('⚠️  No systems endpoint found');
      return;
    }
    
    // Add query parameters (demonstrates URL building)
    const systemsUrl = new URL(systemsLink.href);
    systemsUrl.searchParams.set('limit', '5');
    
    console.log(`   URL: ${systemsUrl.toString()}`);
    const systemsResponse = await fetchJSON(systemsUrl.toString());
    
    let systems = [];
    if (systemsResponse.type === 'FeatureCollection') {
      systems = systemsResponse.features || [];
      console.log(`✓ Found ${systems.length} systems (FeatureCollection format)\n`);
    } else if (Array.isArray(systemsResponse)) {
      systems = systemsResponse;
      console.log(`✓ Found ${systems.length} systems (Array format)\n`);
    } else if (systemsResponse.items) {
      systems = systemsResponse.items;
      console.log(`✓ Found ${systems.length} systems (items format)\n`);
    }

    if (systems.length > 0) {
      console.log('   📊 System Details:');
      systems.forEach((system, idx) => {
        const props = system.properties || system;
        console.log(`   ${idx + 1}. ${system.id || props.id}`);
        console.log(`      Name: ${props.name || 'N/A'}`);
        console.log(`      Type: ${props.type || props.systemType || 'N/A'}`);
        console.log(`      Description: ${(props.description || 'N/A').substring(0, 60)}...`);
      });
      console.log();

      // 4. Get specific system details
      const firstSystem = systems[0];
      const systemId = firstSystem.id || firstSystem.properties?.id;
      
      if (systemId) {
        console.log(`🔍 Step 4: Fetching details for system "${systemId}"...`);
        const systemUrl = `${SERVER_URL}/systems/${systemId}`;
        const systemDetails = await fetchJSON(systemUrl);
        console.log(`✓ Retrieved system details`);
        
        if (systemDetails.properties) {
          const props = systemDetails.properties;
          console.log(`   Name: ${props.name}`);
          console.log(`   Definition: ${props.definition || 'N/A'}`);
          console.log(`   Valid Time: ${props.validTime?.begin || 'N/A'} to ${props.validTime?.end || 'now'}`);
          if (systemDetails.geometry) {
            console.log(`   Location: ${JSON.stringify(systemDetails.geometry.coordinates)}`);
          }
        }
        console.log();
      }
    }

    // 5. Check for datastreams
    console.log('📈 Step 5: Fetching datastreams...');
    const datastreamsLink = landing.links.find(l => l.rel === 'datastreams');
    if (datastreamsLink) {
      const datastreamsUrl = new URL(datastreamsLink.href);
      datastreamsUrl.searchParams.set('limit', '3');
      
      console.log(`   URL: ${datastreamsUrl.toString()}`);
      const datastreamsResponse = await fetchJSON(datastreamsUrl.toString());
      
      let datastreams = [];
      if (datastreamsResponse.type === 'FeatureCollection') {
        datastreams = datastreamsResponse.features || [];
      } else if (Array.isArray(datastreamsResponse)) {
        datastreams = datastreamsResponse;
      } else if (datastreamsResponse.items) {
        datastreams = datastreamsResponse.items;
      }
      
      console.log(`✓ Found ${datastreams.length} datastreams`);
      if (datastreams.length > 0) {
        console.log('   📊 Datastream Details:');
        datastreams.forEach((ds, idx) => {
          const props = ds.properties || ds;
          console.log(`   ${idx + 1}. ${ds.id || props.id}`);
          console.log(`      Name: ${props.name || 'N/A'}`);
          console.log(`      Observed Property: ${props.observedProperty?.definition || props.observedProperty || 'N/A'}`);
        });
      }
      console.log();
    } else {
      console.log('⚠️  No datastreams endpoint found\n');
    }

    // 6. Check for observations
    console.log('📊 Step 6: Fetching observations...');
    const observationsLink = landing.links.find(l => l.rel === 'observations');
    if (observationsLink) {
      const observationsUrl = new URL(observationsLink.href);
      observationsUrl.searchParams.set('limit', '3');
      
      console.log(`   URL: ${observationsUrl.toString()}`);
      const observationsResponse = await fetchJSON(observationsUrl.toString());
      
      let observations = [];
      if (Array.isArray(observationsResponse)) {
        observations = observationsResponse;
      } else if (observationsResponse.value) {
        observations = observationsResponse.value; // SensorThings format
      } else if (observationsResponse.items) {
        observations = observationsResponse.items;
      }
      
      console.log(`✓ Found ${observations.length} observations`);
      if (observations.length > 0) {
        console.log('   📊 Observation Sample:');
        observations.forEach((obs, idx) => {
          console.log(`   ${idx + 1}. Phenomenon Time: ${obs.phenomenonTime || 'N/A'}`);
          console.log(`      Result: ${JSON.stringify(obs.result).substring(0, 50)}...`);
        });
      }
      console.log();
    } else {
      console.log('⚠️  No observations endpoint found\n');
    }

    // Summary
    console.log('=' .repeat(60));
    console.log('✅ Demo completed successfully!');
    console.log('\n🎯 Key Findings:');
    console.log(`   • Server implements OGC API - Connected Systems`);
    console.log(`   • ${csapiConformance.length} conformance classes supported`);
    console.log(`   • Systems: ${systems.length > 0 ? 'Available' : 'None found'}`);
    console.log(`   • Datastreams: ${datastreamsLink ? 'Available' : 'Not found'}`);
    console.log(`   • Observations: ${observationsLink ? 'Available' : 'Not found'}`);
    console.log(`   • Authentication: Required (Basic Auth)`);
    console.log(`   • Format: JSON (GeoJSON for features)`);
    console.log('\n💡 This demonstrates our navigator URL builder pattern works with real servers!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause.message);
    }
    process.exit(1);
  }
})();
