/**
 * GeoJSON validation for CSAPI feature types
 *
 * Validates that objects conform to both GeoJSON structure and CSAPI property requirements.
 * Uses runtime type checking since we're working with untyped JSON from API responses.
 *
 * @module csapi/validation/geojson-validator
 */

import type {
  SystemFeature,
  SystemFeatureCollection,
  DeploymentFeature,
  DeploymentFeatureCollection,
  ProcedureFeature,
  ProcedureFeatureCollection,
  SamplingFeature,
  SamplingFeatureCollection,
  PropertyFeature,
  PropertyFeatureCollection,
  DatastreamFeature,
  DatastreamFeatureCollection,
  ControlStreamFeature,
  ControlStreamFeatureCollection,
} from '../geojson/index.js';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Base validator for GeoJSON structure
 */
function isFeature(obj: unknown): obj is { type: 'Feature'; properties: unknown } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'Feature' &&
    'properties' in obj
  );
}

/**
 * Base validator for FeatureCollection structure
 */
function isFeatureCollection(
  obj: unknown
): obj is { type: 'FeatureCollection'; features: unknown[] } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'FeatureCollection' &&
    'features' in obj &&
    Array.isArray((obj as any).features)
  );
}

/**
 * Validate common CSAPI feature properties
 */
function hasCSAPIProperties(properties: unknown): boolean {
  if (typeof properties !== 'object' || properties === null) {
    return false;
  }
  const props = properties as any;
  return 'featureType' in props && typeof props.featureType === 'string' && 'uid' in props;
}

// ========== GEOMETRY VALIDATION ==========

/**
 * Validate that a position (coordinate array) is valid
 * @param position - [lon, lat] or [lon, lat, elevation]
 * @returns Array of error messages (empty if valid)
 */
function validatePosition(position: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(position)) {
    errors.push('Position must be an array');
    return errors;
  }

  if (position.length < 2 || position.length > 3) {
    errors.push(`Position must have 2 or 3 coordinates, got ${position.length}`);
    return errors;
  }

  const [lon, lat, elev] = position;

  // Validate longitude
  if (typeof lon !== 'number' || isNaN(lon)) {
    errors.push('Longitude must be a number');
  } else if (lon < -180 || lon > 180) {
    errors.push(`Longitude must be between -180 and 180, got ${lon}`);
  }

  // Validate latitude
  if (typeof lat !== 'number' || isNaN(lat)) {
    errors.push('Latitude must be a number');
  } else if (lat < -90 || lat > 90) {
    errors.push(`Latitude must be between -90 and 90, got ${lat}`);
  }

  // Validate elevation (if present)
  if (elev !== undefined) {
    if (typeof elev !== 'number' || isNaN(elev)) {
      errors.push('Elevation must be a number');
    }
  }

  return errors;
}

/**
 * Validate Point geometry
 */
function validatePointGeometry(geometry: any): string[] {
  const errors: string[] = [];

  if (!geometry.coordinates) {
    errors.push('Point geometry must have coordinates');
    return errors;
  }

  errors.push(...validatePosition(geometry.coordinates));
  return errors;
}

/**
 * Validate LineString geometry
 */
function validateLineStringGeometry(geometry: any): string[] {
  const errors: string[] = [];

  if (!Array.isArray(geometry.coordinates)) {
    errors.push('LineString coordinates must be an array');
    return errors;
  }

  if (geometry.coordinates.length < 2) {
    errors.push(`LineString must have at least 2 positions, got ${geometry.coordinates.length}`);
    return errors;
  }

  geometry.coordinates.forEach((position: unknown, index: number) => {
    const positionErrors = validatePosition(position);
    positionErrors.forEach(error => {
      errors.push(`Position ${index}: ${error}`);
    });
  });

  return errors;
}

/**
 * Validate Polygon geometry
 */
function validatePolygonGeometry(geometry: any): string[] {
  const errors: string[] = [];

  if (!Array.isArray(geometry.coordinates)) {
    errors.push('Polygon coordinates must be an array');
    return errors;
  }

  if (geometry.coordinates.length === 0) {
    errors.push('Polygon must have at least one ring');
    return errors;
  }

  geometry.coordinates.forEach((ring: unknown, ringIndex: number) => {
    if (!Array.isArray(ring)) {
      errors.push(`Ring ${ringIndex} must be an array`);
      return;
    }

    if (ring.length < 4) {
      errors.push(`Ring ${ringIndex} must have at least 4 positions (closed), got ${ring.length}`);
      return;
    }

    // Check if ring is closed (first position === last position)
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (Array.isArray(first) && Array.isArray(last)) {
      if (first[0] !== last[0] || first[1] !== last[1]) {
        errors.push(`Ring ${ringIndex} is not closed (first position !== last position)`);
      }
    }

    // Validate each position
    ring.forEach((position: unknown, posIndex: number) => {
      const positionErrors = validatePosition(position);
      positionErrors.forEach(error => {
        errors.push(`Ring ${ringIndex}, Position ${posIndex}: ${error}`);
      });
    });
  });

  return errors;
}

/**
 * Validate MultiPoint geometry
 */
function validateMultiPointGeometry(geometry: any): string[] {
  const errors: string[] = [];

  if (!Array.isArray(geometry.coordinates)) {
    errors.push('MultiPoint coordinates must be an array');
    return errors;
  }

  if (geometry.coordinates.length === 0) {
    errors.push('MultiPoint must have at least one position');
    return errors;
  }

  geometry.coordinates.forEach((position: unknown, index: number) => {
    const positionErrors = validatePosition(position);
    positionErrors.forEach(error => {
      errors.push(`Position ${index}: ${error}`);
    });
  });

  return errors;
}

/**
 * Validate MultiLineString geometry
 */
function validateMultiLineStringGeometry(geometry: any): string[] {
  const errors: string[] = [];

  if (!Array.isArray(geometry.coordinates)) {
    errors.push('MultiLineString coordinates must be an array');
    return errors;
  }

  if (geometry.coordinates.length === 0) {
    errors.push('MultiLineString must have at least one LineString');
    return errors;
  }

  geometry.coordinates.forEach((lineString: unknown, lineIndex: number) => {
    if (!Array.isArray(lineString)) {
      errors.push(`LineString ${lineIndex} must be an array`);
      return;
    }

    if (lineString.length < 2) {
      errors.push(`LineString ${lineIndex} must have at least 2 positions, got ${lineString.length}`);
      return;
    }

    lineString.forEach((position: unknown, posIndex: number) => {
      const positionErrors = validatePosition(position);
      positionErrors.forEach(error => {
        errors.push(`LineString ${lineIndex}, Position ${posIndex}: ${error}`);
      });
    });
  });

  return errors;
}

/**
 * Validate MultiPolygon geometry
 */
function validateMultiPolygonGeometry(geometry: any): string[] {
  const errors: string[] = [];

  if (!Array.isArray(geometry.coordinates)) {
    errors.push('MultiPolygon coordinates must be an array');
    return errors;
  }

  if (geometry.coordinates.length === 0) {
    errors.push('MultiPolygon must have at least one Polygon');
    return errors;
  }

  geometry.coordinates.forEach((polygon: unknown, polygonIndex: number) => {
    if (!Array.isArray(polygon)) {
      errors.push(`Polygon ${polygonIndex} must be an array`);
      return;
    }

    if (polygon.length === 0) {
      errors.push(`Polygon ${polygonIndex} must have at least one ring`);
      return;
    }

    polygon.forEach((ring: unknown, ringIndex: number) => {
      if (!Array.isArray(ring)) {
        errors.push(`Polygon ${polygonIndex}, Ring ${ringIndex} must be an array`);
        return;
      }

      if (ring.length < 4) {
        errors.push(`Polygon ${polygonIndex}, Ring ${ringIndex} must have at least 4 positions (closed), got ${ring.length}`);
        return;
      }

      // Check if ring is closed
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (Array.isArray(first) && Array.isArray(last)) {
        if (first[0] !== last[0] || first[1] !== last[1]) {
          errors.push(`Polygon ${polygonIndex}, Ring ${ringIndex} is not closed (first position !== last position)`);
        }
      }

      // Validate each position
      ring.forEach((position: unknown, posIndex: number) => {
        const positionErrors = validatePosition(position);
        positionErrors.forEach(error => {
          errors.push(`Polygon ${polygonIndex}, Ring ${ringIndex}, Position ${posIndex}: ${error}`);
        });
      });
    });
  });

  return errors;
}

/**
 * Validate geometry structure and coordinates
 * @param geometry - GeoJSON geometry object or null
 * @returns Array of error messages (empty if valid)
 */
function validateGeometry(geometry: unknown): string[] {
  const errors: string[] = [];

  // null geometry is valid
  if (geometry === null) {
    return errors;
  }

  if (typeof geometry !== 'object') {
    errors.push('Geometry must be an object or null');
    return errors;
  }

  const geom = geometry as any;

  // Check for required type property
  if (!geom.type || typeof geom.type !== 'string') {
    errors.push('Geometry must have a type property');
    return errors;
  }

  // Validate based on geometry type
  switch (geom.type) {
    case 'Point':
      return validatePointGeometry(geom);
    case 'LineString':
      return validateLineStringGeometry(geom);
    case 'Polygon':
      return validatePolygonGeometry(geom);
    case 'MultiPoint':
      return validateMultiPointGeometry(geom);
    case 'MultiLineString':
      return validateMultiLineStringGeometry(geom);
    case 'MultiPolygon':
      return validateMultiPolygonGeometry(geom);
    default:
      errors.push(`Unknown geometry type: ${geom.type}`);
  }

  return errors;
}


// ========== LINK VALIDATION ==========

/**
 * Validate URI format (URN or URL)
 * @param uri - URI string to validate
 * @returns Array of error messages (empty if valid)
 */
function validateURI(uri: string): string[] {
  const errors: string[] = [];

  // Empty string is invalid
  if (uri.trim().length === 0) {
    errors.push('URI cannot be empty');
    return errors;
  }

  // Check for spaces (invalid in URIs)
  if (/\s/.test(uri)) {
    errors.push(`URI contains spaces: "${uri}"`);
    return errors;
  }

  // URN format: urn:namespace:specific
  const urnPattern = /^urn:[a-z0-9][a-z0-9-]{0,31}:[a-z0-9()+,\-.:=@;$_!*'%/?#]+$/i;
  
  // URL format: http:// or https://
  const urlPattern = /^https?:\/\/.+/i;

  if (!urnPattern.test(uri) && !urlPattern.test(uri)) {
    errors.push(`Invalid URI format: "${uri}" (must be URN like "urn:namespace:value" or URL like "http://example.org/resource")`);
  }

  return errors;
}

/**
 * Validate a single link (can be string URI or object with rel/href)
 * @param link - Link value to validate (string or object)
 * @param propertyName - Name of the property for error messages
 * @returns Array of error messages (empty if valid)
 */
function validateLink(link: unknown, propertyName: string): string[] {
  const errors: string[] = [];

  // Link can be a string (URI) or an object with href
  if (typeof link === 'string') {
    // String link - validate as URI
    const uriErrors = validateURI(link);
    uriErrors.forEach(error => {
      errors.push(`${propertyName}: ${error}`);
    });
    return errors;
  }

  // Link object - must have href property
  if (typeof link !== 'object' || link === null) {
    errors.push(`${propertyName} must be a string URI or object with href`);
    return errors;
  }

  const linkObj = link as any;

  // href is required for link objects
  if (!linkObj.href) {
    errors.push(`${propertyName} object must have href property`);
    return errors;
  }

  if (typeof linkObj.href !== 'string') {
    errors.push(`${propertyName}.href must be a string`);
    return errors;
  }

  // Validate the href URI
  const hrefErrors = validateURI(linkObj.href);
  hrefErrors.forEach(error => {
    errors.push(`${propertyName}.href: ${error}`);
  });

  // Validate rel if present (optional but must be string if provided)
  if (linkObj.rel !== undefined) {
    if (typeof linkObj.rel !== 'string') {
      errors.push(`${propertyName}.rel must be a string`);
    } else if (linkObj.rel.trim().length === 0) {
      errors.push(`${propertyName}.rel cannot be empty`);
    }
  }

  return errors;
}

/**
 * Validate links array
 * @param links - Array of link objects to validate
 * @returns Array of error messages (empty if valid)
 */
function validateLinksArray(links: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(links)) {
    errors.push('links must be an array');
    return errors;
  }

  links.forEach((link, index) => {
    const linkErrors = validateLink(link, `links[${index}]`);
    errors.push(...linkErrors);
  });

  return errors;
}


// ========== TEMPORAL VALIDATION ==========

/**
 * Validate ISO 8601 timestamp format
 * @param timestamp - Timestamp string to validate
 * @param propertyName - Name of the property for error messages
 * @returns Array of error messages (empty if valid)
 */
function validateTimestamp(timestamp: string, propertyName: string): string[] {
  const errors: string[] = [];

  // Empty string is invalid
  if (timestamp.trim().length === 0) {
    errors.push(`${propertyName}: Timestamp cannot be empty`);
    return errors;
  }

  // ISO 8601 timestamp pattern
  // Supports: YYYY-MM-DD, YYYY-MM-DDTHH:MM:SSZ, YYYY-MM-DDTHH:MM:SS±HH:MM, YYYY-MM-DDTHH:MM:SS.sssZ
  const iso8601Pattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

  if (!iso8601Pattern.test(timestamp)) {
    errors.push(`${propertyName}: Invalid ISO 8601 timestamp format "${timestamp}" (expected formats: YYYY-MM-DD, YYYY-MM-DDTHH:MM:SSZ, or YYYY-MM-DDTHH:MM:SS±HH:MM)`);
    return errors;
  }

  // Check if date is parseable and valid
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    errors.push(`${propertyName}: Timestamp "${timestamp}" represents an impossible date`);
    return errors;
  }

  // Warn if timezone is missing (ambiguous)
  if (timestamp.includes('T') && !timestamp.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(timestamp)) {
    errors.push(`${propertyName}: Timestamp "${timestamp}" is missing timezone (should end with Z or ±HH:MM)`);
  }

  return errors;
}

/**
 * Validate ISO 8601 temporal interval (start/end)
 * @param interval - Interval string to validate (e.g., "2024-01-01T00:00:00Z/2024-01-31T23:59:59Z")
 * @param propertyName - Name of the property for error messages
 * @returns Array of error messages (empty if valid)
 */
function validateTemporalInterval(interval: string, propertyName: string): string[] {
  const errors: string[] = [];

  // Check for interval separator
  if (!interval.includes('/')) {
    errors.push(`${propertyName}: Temporal interval must contain "/" separator (format: start/end)`);
    return errors;
  }

  const parts = interval.split('/');
  if (parts.length !== 2) {
    errors.push(`${propertyName}: Temporal interval must have exactly two parts separated by "/" (got ${parts.length} parts)`);
    return errors;
  }

  const [start, end] = parts;

  // Validate start timestamp (unless open-ended with "..")
  if (start !== '..') {
    const startErrors = validateTimestamp(start, `${propertyName} (start)`);
    errors.push(...startErrors);
  }

  // Validate end timestamp (unless open-ended with "..")
  if (end !== '..') {
    const endErrors = validateTimestamp(end, `${propertyName} (end)`);
    errors.push(...endErrors);
  }

  // Validate temporal range (start must be before end) for closed intervals
  if (start !== '..' && end !== '..' && errors.length === 0) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.getTime() >= endDate.getTime()) {
      errors.push(`${propertyName}: Start time "${start}" must be before end time "${end}"`);
    }
  }

  return errors;
}

/**
 * Validate temporal property (timestamp or interval)
 * @param temporal - Temporal value to validate (string)
 * @param propertyName - Name of the property for error messages
 * @returns Array of error messages (empty if valid)
 */
function validateTemporal(temporal: unknown, propertyName: string): string[] {
  const errors: string[] = [];

  if (typeof temporal !== 'string') {
    errors.push(`${propertyName} must be a string`);
    return errors;
  }

  // Check if it's an interval (contains "/")
  if (temporal.includes('/')) {
    return validateTemporalInterval(temporal, propertyName);
  } else {
    return validateTimestamp(temporal, propertyName);
  }
}

// ========== FEATURE VALIDATORS ==========

/**
 * Validate SystemFeature
 */
export function validateSystemFeature(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeature(data)) {
    errors.push('Object is not a valid GeoJSON Feature');
    return { valid: false, errors };
  }

  if (!hasCSAPIProperties(data.properties)) {
    errors.push('Missing required CSAPI properties (featureType, uid)');
    return { valid: false, errors };
  }

  const props = data.properties as any;

  // Validate validTime if present
  if (props.validTime) {
    const validTimeErrors = validateTemporal(props.validTime, 'validTime');
    errors.push(...validTimeErrors);
  }
  if (props.featureType !== 'System') {
    errors.push(`Expected featureType 'System', got '${props.featureType}'`);
  }

  // Validate links array if present
  if (props.links) {
    const linksErrors = validateLinksArray(props.links);
    errors.push(...linksErrors);
  }

  // Validate geometry
  const feature = data as any;
  const geometryErrors = validateGeometry(feature.geometry);
  errors.push(...geometryErrors);

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate SystemFeatureCollection
 */
export function validateSystemFeatureCollection(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeatureCollection(data)) {
    errors.push('Object is not a valid GeoJSON FeatureCollection');
    return { valid: false, errors };
  }

  const features = (data as any).features;
  features.forEach((feature: unknown, index: number) => {
    const result = validateSystemFeature(feature);
    if (!result.valid) {
      errors.push(`Feature at index ${index}: ${result.errors?.join(', ')}`);
    }
  });

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate DeploymentFeature
 */
export function validateDeploymentFeature(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeature(data)) {
    errors.push('Object is not a valid GeoJSON Feature');
    return { valid: false, errors };
  }

  if (!hasCSAPIProperties(data.properties)) {
    errors.push('Missing required CSAPI properties (featureType, uid)');
    return { valid: false, errors };
  }

  const props = data.properties as any;
  if (props.featureType !== 'Deployment') {
    errors.push(`Expected featureType 'Deployment', got '${props.featureType}'`);
  }

  // Validate validTime if present
  if (props.validTime) {
    const validTimeErrors = validateTemporal(props.validTime, 'validTime');
    errors.push(...validTimeErrors);
  }

  if (!props.system) {
    errors.push('Missing required property: system');
  }

  // Validate system link
  if (props.system !== undefined && props.system !== null) {
    const systemLinkErrors = validateLink(props.system, 'system');
    errors.push(...systemLinkErrors);
  }

  // Validate links array if present
  if (props.links) {
    const linksErrors = validateLinksArray(props.links);
    errors.push(...linksErrors);
  }

  // Validate geometry
  const feature = data as any;
  const geometryErrors = validateGeometry(feature.geometry);
  errors.push(...geometryErrors);

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate DeploymentFeatureCollection
 */
export function validateDeploymentFeatureCollection(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeatureCollection(data)) {
    errors.push('Object is not a valid GeoJSON FeatureCollection');
    return { valid: false, errors };
  }

  const features = (data as any).features;
  features.forEach((feature: unknown, index: number) => {
    const result = validateDeploymentFeature(feature);
    if (!result.valid) {
      errors.push(`Feature at index ${index}: ${result.errors?.join(', ')}`);
    }
  });

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate ProcedureFeature
 */
export function validateProcedureFeature(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeature(data)) {
    errors.push('Object is not a valid GeoJSON Feature');
    return { valid: false, errors };
  }

  if (!hasCSAPIProperties(data.properties)) {
    errors.push('Missing required CSAPI properties (featureType, uid)');
    return { valid: false, errors };
  }

  const props = data.properties as any;
  if (props.featureType !== 'Procedure') {
    errors.push(`Expected featureType 'Procedure', got '${props.featureType}'`);
  }

  // Validate validTime if present
  if (props.validTime) {
    const validTimeErrors = validateTemporal(props.validTime, 'validTime');
    errors.push(...validTimeErrors);
  }

  // Validate links array if present
  if (props.links) {
    const linksErrors = validateLinksArray(props.links);
    errors.push(...linksErrors);
  }

  // Validate geometry
  const feature = data as any;
  const geometryErrors = validateGeometry(feature.geometry);
  errors.push(...geometryErrors);

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate ProcedureFeatureCollection
 */
export function validateProcedureFeatureCollection(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeatureCollection(data)) {
    errors.push('Object is not a valid GeoJSON FeatureCollection');
    return { valid: false, errors };
  }

  const features = (data as any).features;
  features.forEach((feature: unknown, index: number) => {
    const result = validateProcedureFeature(feature);
    if (!result.valid) {
      errors.push(`Feature at index ${index}: ${result.errors?.join(', ')}`);
    }
  });

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate DatastreamFeature
 */
export function validateDatastreamFeature(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeature(data)) {
    errors.push('Object is not a valid GeoJSON Feature');
    return { valid: false, errors };
  }

  if (!hasCSAPIProperties(data.properties)) {
    errors.push('Missing required CSAPI properties (featureType, uid)');
    return { valid: false, errors };
  }

  const props = data.properties as any;
  if (props.featureType !== 'Datastream') {
    errors.push(`Expected featureType 'Datastream', got '${props.featureType}'`);
  }

  if (!props.system) {
    errors.push('Missing required property: system');
  }

  if (!props.observedProperty) {
    errors.push('Missing required property: observedProperty');
  }

  // Validate phenomenonTime if present
  if (props.phenomenonTime) {
    const phenomenonTimeErrors = validateTemporal(props.phenomenonTime, 'phenomenonTime');
    errors.push(...phenomenonTimeErrors);
  }

  // Validate resultTime if present
  if (props.resultTime) {
    const resultTimeErrors = validateTemporal(props.resultTime, 'resultTime');
    errors.push(...resultTimeErrors);
  }

  // Validate system link
  if (props.system !== undefined && props.system !== null) {
    const systemLinkErrors = validateLink(props.system, 'system');
    errors.push(...systemLinkErrors);
  }

  // Validate observedProperty link
  if (props.observedProperty !== undefined && props.observedProperty !== null) {
    const obsPropErrors = validateLink(props.observedProperty, 'observedProperty');
    errors.push(...obsPropErrors);
  }

  // Validate links array if present
  if (props.links) {
    const linksErrors = validateLinksArray(props.links);
    errors.push(...linksErrors);
  }

  // Validate geometry
  const feature = data as any;
  const geometryErrors = validateGeometry(feature.geometry);
  errors.push(...geometryErrors);

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate DatastreamFeatureCollection
 */
export function validateDatastreamFeatureCollection(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeatureCollection(data)) {
    errors.push('Object is not a valid GeoJSON FeatureCollection');
    return { valid: false, errors };
  }

  const features = (data as any).features;
  features.forEach((feature: unknown, index: number) => {
    const result = validateDatastreamFeature(feature);
    if (!result.valid) {
      errors.push(`Feature at index ${index}: ${result.errors?.join(', ')}`);
    }
  });

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate SamplingFeature
 */
export function validateSamplingFeature(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeature(data)) {
    errors.push('Object is not a valid GeoJSON Feature');
    return { valid: false, errors };
  }

  if (!hasCSAPIProperties(data.properties)) {
    errors.push('Missing required CSAPI properties (featureType, uid)');
    return { valid: false, errors };
  }

  const props = data.properties as any;
  if (props.featureType !== 'SamplingFeature') {
    errors.push(`Expected featureType 'SamplingFeature', got '${props.featureType}'`);
  }

  // Validate samplingTime if present
  if (props.samplingTime) {
    const samplingTimeErrors = validateTemporal(props.samplingTime, 'samplingTime');
    errors.push(...samplingTimeErrors);
  }

  // Validate geometry
  const feature = data as any;

  // Validate sampledFeature link if present
  if (props.sampledFeature !== undefined && props.sampledFeature !== null) {
    const sampledFeatureErrors = validateLink(props.sampledFeature, 'sampledFeature');
    errors.push(...sampledFeatureErrors);
  }
  const geometryErrors = validateGeometry(feature.geometry);
  errors.push(...geometryErrors);

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate SamplingFeatureCollection
 */
export function validateSamplingFeatureCollection(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeatureCollection(data)) {
    errors.push('Object is not a valid GeoJSON FeatureCollection');
    return { valid: false, errors };
  }

  const features = (data as any).features;
  features.forEach((feature: unknown, index: number) => {
    const result = validateSamplingFeature(feature);
    if (!result.valid) {
      errors.push(`Feature at index ${index}: ${result.errors?.join(', ')}`);
    }
  });

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate PropertyFeature
 */
export function validatePropertyFeature(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeature(data)) {
    errors.push('Object is not a valid GeoJSON Feature');
    return { valid: false, errors };
  }

  if (!hasCSAPIProperties(data.properties)) {
    errors.push('Missing required CSAPI properties (featureType, uid)');
    return { valid: false, errors };
  }

  const props = data.properties as any;
  if (props.featureType !== 'Property') {
    errors.push(`Expected featureType 'Property', got '${props.featureType}'`);
  }

  if (!props.definition) {
    errors.push('Missing required property: definition');
  }

  // Validate links array if present
  if (props.links) {
    const linksErrors = validateLinksArray(props.links);
    errors.push(...linksErrors);
  }

  // Validate geometry
  const feature = data as any;
  const geometryErrors = validateGeometry(feature.geometry);
  errors.push(...geometryErrors);

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate PropertyFeatureCollection
 */
export function validatePropertyFeatureCollection(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeatureCollection(data)) {
    errors.push('Object is not a valid GeoJSON FeatureCollection');
    return { valid: false, errors };
  }

  const features = (data as any).features;
  features.forEach((feature: unknown, index: number) => {
    const result = validatePropertyFeature(feature);
    if (!result.valid) {
      errors.push(`Feature at index ${index}: ${result.errors?.join(', ')}`);
    }
  });

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate ControlStreamFeature
 */
export function validateControlStreamFeature(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeature(data)) {
    errors.push('Object is not a valid GeoJSON Feature');
    return { valid: false, errors };
  }

  if (!hasCSAPIProperties(data.properties)) {
    errors.push('Missing required CSAPI properties (featureType, uid)');
    return { valid: false, errors };
  }

  const props = data.properties as any;
  if (props.featureType !== 'ControlStream') {
    errors.push(`Expected featureType 'ControlStream', got '${props.featureType}'`);
  }

  if (!props.system) {
    errors.push('Missing required property: system');
  }

  if (!props.controlledProperty) {
    errors.push('Missing required property: controlledProperty');
  }

  // Validate system link
  if (props.system !== undefined && props.system !== null) {
    const systemLinkErrors = validateLink(props.system, 'system');
    errors.push(...systemLinkErrors);
  }

  // Validate controlledProperty link
  if (props.controlledProperty !== undefined && props.controlledProperty !== null) {
    const ctrlPropErrors = validateLink(props.controlledProperty, 'controlledProperty');
    errors.push(...ctrlPropErrors);
  }

  // Validate links array if present
  if (props.links) {
    const linksErrors = validateLinksArray(props.links);
    errors.push(...linksErrors);
  }

  // Validate geometry
  const feature = data as any;
  const geometryErrors = validateGeometry(feature.geometry);
  errors.push(...geometryErrors);

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate ControlStreamFeatureCollection
 */
export function validateControlStreamFeatureCollection(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isFeatureCollection(data)) {
    errors.push('Object is not a valid GeoJSON FeatureCollection');
    return { valid: false, errors };
  }

  const features = (data as any).features;
  features.forEach((feature: unknown, index: number) => {
    const result = validateControlStreamFeature(feature);
    if (!result.valid) {
      errors.push(`Feature at index ${index}: ${result.errors?.join(', ')}`);
    }
  });

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Generic feature validator based on featureType
 */
export function validateCSAPIFeature(data: unknown): ValidationResult {
  if (!isFeature(data)) {
    return { valid: false, errors: ['Object is not a valid GeoJSON Feature'] };
  }

  const props = data.properties as any;
  const featureType = props?.featureType;

  switch (featureType) {
    case 'System':
      return validateSystemFeature(data);
    case 'Deployment':
      return validateDeploymentFeature(data);
    case 'Procedure':
      return validateProcedureFeature(data);
    case 'SamplingFeature':
      return validateSamplingFeature(data);
    case 'Property':
      return validatePropertyFeature(data);
    case 'Datastream':
      return validateDatastreamFeature(data);
    case 'ControlStream':
      return validateControlStreamFeature(data);
    default:
      return {
        valid: false,
        errors: [`Unknown or unsupported featureType: ${featureType}`],
      };
  }
}







