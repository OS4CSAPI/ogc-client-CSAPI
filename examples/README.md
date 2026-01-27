# ogc-client Examples

This directory contains example scripts demonstrating how to use the ogc-client library.

## Prerequisites

Before running these examples, you need to build the library:

```bash
npm install
npm run build
```

## Running Examples

### STAC API Query Example

Demonstrates querying a STAC (SpatioTemporal Asset Catalog) API endpoint:

```bash
node examples/stac-query.js
```

This example shows how to:

- Connect to a STAC API endpoint
- Retrieve endpoint information and capabilities
- List all available collections
- Get detailed collection metadata (extent, providers, license, etc.)
- Query items with various filters:
  - Limit (pagination)
  - Bounding box (spatial filtering)
  - DateTime (temporal filtering)
- Retrieve a single item
- Build custom query URLs

The example queries the public STAC API at:

- https://api.stac.teledetection.fr
- https://catalog.maap.eo.esa.int/catalogue
- https://stac.dataspace.copernicus.eu/v1/

## CSAPI Live Server Examples

### 🌐 Live Connection Demo

**File:** [csapi-live-connection.js](./csapi-live-connection.js)

Demonstrates connecting to a real OGC API - Connected Systems server and fetching data. **No build required!**

```bash
node examples/csapi-live-connection.js
```

**What it shows:**
- Landing page and conformance checking
- Fetching systems, datastreams, and observations
- Authentication with Basic Auth
- Real data from OpenSensorHub server

### 🧭 Navigator Pattern Demo

**File:** [csapi-navigator-demo.js](./csapi-navigator-demo.js)

Demonstrates the CSAPINavigator URL builder pattern against a live server. **No build required!**

```bash
node examples/csapi-navigator-demo.js
```

**What it shows:**
- URL building for all CSAPI resources (Systems, Datastreams, Observations, etc.)
- Query parameter handling (limit, q, bbox, datetime, etc.)
- Resource relationships (system → datastreams → observations)
- The exact pattern users will follow with our library

**Live Server Details:**
- **URL:** http://45.55.99.236:8080/sensorhub/api
- **Implementation:** OpenSensorHub
- **Auth:** Basic (ogc/ogc)
- **Resources:** Systems, Datastreams, Observations, Deployments, Procedures, SamplingFeatures

These demos prove our CSAPI implementation works with real servers and is ready for Phase 6 upstream contribution!
