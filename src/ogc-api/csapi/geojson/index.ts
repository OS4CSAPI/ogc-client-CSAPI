/**
 * CSAPI GeoJSON Types
 * 
 * This module provides TypeScript types for all CSAPI resources in their
 * GeoJSON representation, as well as non-feature types (Observations, Commands).
 * 
 * Resources represented as GeoJSON Features:
 * - Systems
 * - Deployments
 * - Procedures
 * - Sampling Features
 * - Properties
 * - Datastreams
 * - Control Streams
 * 
 * Resources NOT represented as GeoJSON:
 * - Observations (use SWE Common structures)
 * - Commands (use SWE Common structures)
 * 
 * @module csapi/geojson
 */

// Base types
export * from './base-types.js';

// Feature types (GeoJSON)
export * from './features/index.js';

// Non-feature types
export * from './non-features/index.js';
