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
  }

  const props = data.properties as any;
  if (props.featureType !== 'System') {
    errors.push(`Expected featureType 'System', got '${props.featureType}'`);
  }

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
  }

  const props = data.properties as any;
  if (props.featureType !== 'Deployment') {
    errors.push(`Expected featureType 'Deployment', got '${props.featureType}'`);
  }

  if (!props.system) {
    errors.push('Missing required property: system');
  }

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
  }

  const props = data.properties as any;
  if (props.featureType !== 'Procedure') {
    errors.push(`Expected featureType 'Procedure', got '${props.featureType}'`);
  }

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
    case 'Datastream':
      return validateDatastreamFeature(data);
    default:
      return {
        valid: false,
        errors: [`Unknown or unsupported featureType: ${featureType}`],
      };
  }
}
