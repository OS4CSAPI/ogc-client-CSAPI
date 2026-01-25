/**
 * SWE Common validation
 * 
 * Basic validation for SWE Common data components using type guards.
 * For full JSON schema validation, schemas can be downloaded from
 * https://schemas.opengis.net/sweCommon/3.0/json/
 * 
 * @module csapi/validation/swe-validator
 */

import type {
  AnyDataComponent,
  SimpleComponent,
  RangeComponent,
  AggregateComponent,
  BlockComponent,
  DataRecordComponent,
  DataArrayComponent,
  QuantityComponent,
} from '../swe-common/index.js';

/**
 * Validation error
 */
export interface ValidationError {
  message: string;
  path?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Validate that object has required AbstractDataComponent properties
 */
function hasDataComponentProperties(obj: unknown): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    typeof (obj as any).type === 'string'
  );
}

/**
 * Validate QuantityComponent
 */
export function validateQuantity(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!hasDataComponentProperties(data)) {
    errors.push({ message: 'Missing required DataComponent properties' });
    return { valid: false, errors };
  }

  const component = data as any;

  if (component.type !== 'Quantity') {
    errors.push(`Expected type 'Quantity', got '${component.type}'`);
  }

  if (!component.uom) {
    errors.push({ message: 'Missing required property: uom' });
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate DataRecordComponent
 */
export function validateDataRecord(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!hasDataComponentProperties(data)) {
    errors.push({ message: 'Missing required DataComponent properties' });
    return { valid: false, errors };
  }

  const component = data as any;

  if (component.type !== 'DataRecord') {
    errors.push(`Expected type 'DataRecord', got '${component.type}'`);
  }

  if (!component.fields || !Array.isArray(component.fields)) {
    errors.push({ message: 'Missing or invalid property: fields (must be an array)' });
  } else if (component.fields.length === 0) {
    errors.push({ message: 'DataRecord must have at least one field' });
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate DataArrayComponent
 */
export function validateDataArray(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!hasDataComponentProperties(data)) {
    errors.push({ message: 'Missing required DataComponent properties' });
    return { valid: false, errors };
  }

  const component = data as any;

  if (component.type !== 'DataArray') {
    errors.push(`Expected type 'DataArray', got '${component.type}'`);
  }

  if (!component.elementCount) {
    errors.push({ message: 'Missing required property: elementCount' });
  }

  if (!component.elementType) {
    errors.push({ message: 'Missing required property: elementType' });
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Generic SWE Common component validator based on type
 */
export function validateSWEComponent(data: unknown): ValidationResult {
  if (!hasDataComponentProperties(data)) {
    return {
      valid: false,
      errors: [{ message: 'Object is not a valid SWE Common data component' }],
    };
  }

  const component = data as any;
  const type = component.type;

  // Simple validation based on type
  const validTypes = [
    'Boolean',
    'Text',
    'Category',
    'Count',
    'Quantity',
    'Time',
    'CategoryRange',
    'CountRange',
    'QuantityRange',
    'TimeRange',
    'DataRecord',
    'Vector',
    'DataChoice',
    'DataArray',
    'Matrix',
    'DataStream',
    'Geometry',
  ];

  if (!validTypes.includes(type)) {
    return {
      valid: false,
      errors: [`Unknown or unsupported component type: ${type}`],
    };
  }

  // Type-specific validation for common types
  switch (type) {
    case 'Quantity':
      return validateQuantity(data);
    case 'DataRecord':
      return validateDataRecord(data);
    case 'DataArray':
      return validateDataArray(data);
    default:
      // Basic validation passed
      return { valid: true };
  }
}

/**
 * Validate observation result structure
 * Observations use SWE Common for their result field
 */
export function validateObservationResult(data: unknown): ValidationResult {
  // Result can be any SWE Common component or simple value
  if (data === null || data === undefined) {
    return { valid: false, errors: ['Observation result cannot be null or undefined'] };
  }

  // If it's an object with a type property, validate as SWE component
  if (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    typeof (data as any).type === 'string'
  ) {
    return validateSWEComponent(data);
  }

  // Otherwise, assume it's a simple value (number, string, boolean)
  return { valid: true };
}

