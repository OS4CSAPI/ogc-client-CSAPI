/**
 * CSAPI Validation
 * 
 * Validation utilities for CSAPI data structures:
 * - GeoJSON feature validation for all 7 resource types
 * - SWE Common component validation
 * - Observation and Command validation
 * 
 * @module csapi/validation
 */

export * from './geojson-validator.js';
export * from './swe-validator.js';
export * from './sensorml-validator.js';

// Re-export ValidationResult type for convenience
export type { ValidationResult } from './geojson-validator.js';
