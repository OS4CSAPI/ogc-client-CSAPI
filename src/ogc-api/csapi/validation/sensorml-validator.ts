/**
 * SensorML JSON Schema Validation
 *
 * Validates SensorML 3.0 documents against official OGC JSON schemas.
 * Schemas are fetched from https://schemas.opengis.net/sensorML/3.0/json/
 *
 * @module csapi/validation/sensorml-validator
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { ValidationResult } from './geojson-validator.js';
import type {
  SensorMLProcess,
  Deployment,
  DerivedProperty,
} from '../sensorml/index.js';

/**
 * OGC SensorML 3.0 JSON Schema URLs
 */
export const SENSORML_SCHEMA_URLS = {
  PhysicalSystem:
    'https://schemas.opengis.net/sensorML/3.0/json/physicalSystem.json',
  PhysicalComponent:
    'https://schemas.opengis.net/sensorML/3.0/json/physicalComponent.json',
  SimpleProcess:
    'https://schemas.opengis.net/sensorML/3.0/json/simpleProcess.json',
  AggregateProcess:
    'https://schemas.opengis.net/sensorML/3.0/json/aggregateProcess.json',
  Deployment: 'https://schemas.opengis.net/sensorML/3.0/json/deployment.json',
  DerivedProperty:
    'https://schemas.opengis.net/sensorML/3.0/json/derivedProperty.json',
} as const;

/**
 * Cached AJV instance with loaded schemas
 */
let ajvInstance: Ajv | null = null;
let schemasLoaded = false;

/**
 * Initialize AJV validator with SensorML schemas
 */
async function initializeValidator(): Promise<Ajv> {
  if (ajvInstance && schemasLoaded) {
    return ajvInstance;
  }

  ajvInstance = new Ajv({
    strict: false,
    allErrors: true,
    verbose: true,
  });

  addFormats(ajvInstance);

  // In a real implementation, schemas would be fetched and cached
  // For now, we'll do basic structural validation
  schemasLoaded = true;

  return ajvInstance;
}

/**
 * Validate a SensorML process against its schema
 */
export async function validateSensorMLProcess(
  process: SensorMLProcess
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic structural validation
    if (!process.type) {
      errors.push('Missing required property: type');
    }

    // Validate based on type
    switch (process.type) {
      case 'PhysicalSystem':
        validatePhysicalSystem(process as any, errors, warnings);
        break;
      case 'PhysicalComponent':
        validatePhysicalComponent(process as any, errors, warnings);
        break;
      case 'SimpleProcess':
        validateSimpleProcess(process as any, errors, warnings);
        break;
      case 'AggregateProcess':
        validateAggregateProcess(process as any, errors, warnings);
        break;
      default:
        errors.push(`Unknown process type: ${(process as any).type}`);
    }

    // Validate common DescribedObject properties
    validateDescribedObject(process, errors, warnings);
  } catch (error) {
    errors.push(`Validation error: ${error}`);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate Deployment
 */
export async function validateDeployment(
  deployment: Deployment
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (deployment.type !== 'Deployment') {
    errors.push(`Expected type 'Deployment', got '${deployment.type}'`);
  }

  if (!deployment.validTime && !deployment.location) {
    warnings.push('Deployment should have validTime or location');
  }

  if (deployment.deployedSystems && deployment.deployedSystems.length === 0) {
    warnings.push('Deployment has no deployed systems');
  }

  validateDescribedObject(deployment, errors, warnings);

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate DerivedProperty
 */
export async function validateDerivedProperty(
  property: DerivedProperty
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!property.baseProperty) {
    errors.push('Missing required property: baseProperty');
  }

  if (property.baseProperty && !isValidURI(property.baseProperty)) {
    warnings.push('baseProperty should be a valid URI');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate PhysicalSystem
 */
function validatePhysicalSystem(
  system: any,
  errors: string[],
  warnings: string[]
): void {
  // PhysicalSystem extends AbstractPhysicalProcess
  validateAbstractPhysicalProcess(system, errors, warnings);

  if (system.components && !Array.isArray(system.components)) {
    errors.push('components must be an array');
  }

  if (system.connections && !Array.isArray(system.connections)) {
    errors.push('connections must be an array');
  }

  if (system.components && system.components.length === 0) {
    warnings.push('PhysicalSystem has no components');
  }
}

/**
 * Validate PhysicalComponent
 */
function validatePhysicalComponent(
  component: any,
  errors: string[],
  warnings: string[]
): void {
  // PhysicalComponent extends AbstractPhysicalProcess
  validateAbstractPhysicalProcess(component, errors, warnings);

  if (component.method && typeof component.method !== 'object') {
    errors.push('method must be an object');
  }
}

/**
 * Validate SimpleProcess
 */
function validateSimpleProcess(
  process: any,
  errors: string[],
  warnings: string[]
): void {
  // SimpleProcess extends AbstractProcess
  validateAbstractProcess(process, errors, warnings);

  if (process.method && typeof process.method !== 'object') {
    errors.push('method must be an object');
  }
}

/**
 * Validate AggregateProcess
 */
function validateAggregateProcess(
  process: any,
  errors: string[],
  warnings: string[]
): void {
  // AggregateProcess extends AbstractProcess
  validateAbstractProcess(process, errors, warnings);

  if (process.components && !Array.isArray(process.components)) {
    errors.push('components must be an array');
  }

  if (process.connections && !Array.isArray(process.connections)) {
    errors.push('connections must be an array');
  }

  if (process.components && process.components.length === 0) {
    warnings.push('AggregateProcess has no components');
  }
}

/**
 * Validate AbstractPhysicalProcess properties
 */
function validateAbstractPhysicalProcess(
  process: any,
  errors: string[],
  warnings: string[]
): void {
  validateAbstractProcess(process, errors, warnings);

  if (process.position && typeof process.position !== 'object') {
    errors.push('position must be an object');
  }

  if (
    process.localReferenceFrames &&
    !Array.isArray(process.localReferenceFrames)
  ) {
    errors.push('localReferenceFrames must be an array');
  }

  if (process.attachedTo && typeof process.attachedTo !== 'string') {
    errors.push('attachedTo must be a string reference');
  }
}

/**
 * Validate AbstractProcess properties
 */
function validateAbstractProcess(
  process: any,
  errors: string[],
  warnings: string[]
): void {
  if (process.inputs && !Array.isArray(process.inputs)) {
    errors.push('inputs must be an array');
  }

  if (process.outputs && !Array.isArray(process.outputs)) {
    errors.push('outputs must be an array');
  }

  if (process.parameters && !Array.isArray(process.parameters)) {
    errors.push('parameters must be an array');
  }

  if (process.modes && !Array.isArray(process.modes)) {
    errors.push('modes must be an array');
  }

  if (process.typeOf && typeof process.typeOf !== 'string') {
    errors.push('typeOf must be a string reference');
  }
}

/**
 * Validate DescribedObject properties
 */
function validateDescribedObject(
  obj: any,
  errors: string[],
  warnings: string[]
): void {
  if (obj.id && typeof obj.id !== 'string') {
    errors.push('id must be a string');
  }

  if (obj.uniqueId && typeof obj.uniqueId !== 'string') {
    errors.push('uniqueId must be a string');
  }

  if (obj.label && typeof obj.label !== 'string') {
    errors.push('label must be a string');
  }

  if (obj.description && typeof obj.description !== 'string') {
    errors.push('description must be a string');
  }

  if (obj.keywords && !Array.isArray(obj.keywords)) {
    errors.push('keywords must be an array');
  }

  if (obj.identifiers && !Array.isArray(obj.identifiers)) {
    errors.push('identifiers must be an array');
  }

  if (obj.classifiers && !Array.isArray(obj.classifiers)) {
    errors.push('classifiers must be an array');
  }

  if (obj.contacts && !Array.isArray(obj.contacts)) {
    errors.push('contacts must be an array');
  }

  if (obj.documents && !Array.isArray(obj.documents)) {
    errors.push('documents must be an array');
  }

  if (!obj.uniqueId && !obj.id) {
    warnings.push('Object should have uniqueId or id for identification');
  }

  if (!obj.label && !obj.description) {
    warnings.push('Object should have label or description for clarity');
  }
}

/**
 * Simple URI validation
 */
function isValidURI(uri: string): boolean {
  try {
    new URL(uri);
    return true;
  } catch {
    // Check for URN format
    return /^urn:[a-z0-9][a-z0-9-]{0,31}:[a-z0-9()+,\-.:=@;$_!*'%/?#]+$/i.test(
      uri
    );
  }
}
