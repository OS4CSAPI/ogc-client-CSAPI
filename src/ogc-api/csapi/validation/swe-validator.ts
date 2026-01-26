/**
 * SWE Common validation
 * 
 * Basic validation for SWE Common data components using type guards.
 * Includes deep constraint validation for AllowedValues, patterns, and intervals.
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
  CountComponent,
  TextComponent,
  CategoryComponent,
  TimeComponent,
} from '../swe-common/index.js';
import type {
  QuantityRangeComponent,
  CountRangeComponent,
  TimeRangeComponent,
} from '../swe-common/types/range-components.js';
import {
  validateQuantityConstraint,
  validateCountConstraint,
  validateTextConstraint,
  validateCategoryConstraint,
  validateTimeConstraint,
  validateRangeConstraint,
} from './constraint-validator.js';

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
 * 
 * @param data - The component to validate
 * @param validateConstraints - Whether to perform deep constraint validation (default: true)
 */
export function validateQuantity(data: unknown, validateConstraints = true): ValidationResult {
  const errors: ValidationError[] = [];

  if (!hasDataComponentProperties(data)) {
    errors.push({ message: 'Missing required DataComponent properties' });
    return { valid: false, errors };
  }

  const component = data as any;

  if (component.type !== 'Quantity') {
    errors.push({ message: `Expected type 'Quantity', got '${component.type}'` });
  }

  if (!component.uom) {
    errors.push({ message: 'Missing required property: uom' });
  }

  // Perform deep constraint validation if value is present
  if (validateConstraints && component.value !== undefined && component.value !== null && errors.length === 0) {
    const constraintResult = validateQuantityConstraint(component as QuantityComponent, component.value);
    if (!constraintResult.valid && constraintResult.errors) {
      errors.push(...constraintResult.errors);
    }
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
    errors.push({ message: `Expected type 'DataArray', got '${component.type}'` });
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
 * Validate CountComponent
 * 
 * @param data - The component to validate
 * @param validateConstraints - Whether to perform deep constraint validation (default: true)
 */
export function validateCount(data: unknown, validateConstraints = true): ValidationResult {
  const errors: ValidationError[] = [];

  if (!hasDataComponentProperties(data)) {
    errors.push({ message: 'Missing required DataComponent properties' });
    return { valid: false, errors };
  }

  const component = data as any;

  if (component.type !== 'Count') {
    errors.push({ message: `Expected type 'Count', got '${component.type}'` });
  }

  // Perform deep constraint validation if value is present
  if (validateConstraints && component.value !== undefined && component.value !== null && errors.length === 0) {
    const constraintResult = validateCountConstraint(component as CountComponent, component.value);
    if (!constraintResult.valid && constraintResult.errors) {
      errors.push(...constraintResult.errors);
    }
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate TextComponent
 * 
 * @param data - The component to validate
 * @param validateConstraints - Whether to perform deep constraint validation (default: true)
 */
export function validateText(data: unknown, validateConstraints = true): ValidationResult {
  const errors: ValidationError[] = [];

  if (!hasDataComponentProperties(data)) {
    errors.push({ message: 'Missing required DataComponent properties' });
    return { valid: false, errors };
  }

  const component = data as any;

  if (component.type !== 'Text') {
    errors.push({ message: `Expected type 'Text', got '${component.type}'` });
  }

  // Perform deep constraint validation if value is present
  if (validateConstraints && component.value !== undefined && component.value !== null && errors.length === 0) {
    const constraintResult = validateTextConstraint(component as TextComponent, component.value);
    if (!constraintResult.valid && constraintResult.errors) {
      errors.push(...constraintResult.errors);
    }
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate CategoryComponent
 * 
 * @param data - The component to validate
 * @param validateConstraints - Whether to perform deep constraint validation (default: true)
 */
export function validateCategory(data: unknown, validateConstraints = true): ValidationResult {
  const errors: ValidationError[] = [];

  if (!hasDataComponentProperties(data)) {
    errors.push({ message: 'Missing required DataComponent properties' });
    return { valid: false, errors };
  }

  const component = data as any;

  if (component.type !== 'Category') {
    errors.push({ message: `Expected type 'Category', got '${component.type}'` });
  }

  // Perform deep constraint validation if value is present
  if (validateConstraints && component.value !== undefined && component.value !== null && errors.length === 0) {
    const constraintResult = validateCategoryConstraint(component as CategoryComponent, component.value);
    if (!constraintResult.valid && constraintResult.errors) {
      errors.push(...constraintResult.errors);
    }
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate TimeComponent
 * 
 * @param data - The component to validate
 * @param validateConstraints - Whether to perform deep constraint validation (default: true)
 */
export function validateTime(data: unknown, validateConstraints = true): ValidationResult {
  const errors: ValidationError[] = [];

  if (!hasDataComponentProperties(data)) {
    errors.push({ message: 'Missing required DataComponent properties' });
    return { valid: false, errors };
  }

  const component = data as any;

  if (component.type !== 'Time') {
    errors.push({ message: `Expected type 'Time', got '${component.type}'` });
  }

  if (!component.uom) {
    errors.push({ message: 'Missing required property: uom' });
  }

  // Perform deep constraint validation if value is present
  if (validateConstraints && component.value !== undefined && component.value !== null && errors.length === 0) {
    const constraintResult = validateTimeConstraint(component as TimeComponent, component.value);
    if (!constraintResult.valid && constraintResult.errors) {
      errors.push(...constraintResult.errors);
    }
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Validate Range Component (QuantityRange, CountRange, TimeRange, CategoryRange)
 * 
 * @param data - The component to validate
 * @param validateConstraints - Whether to perform deep constraint validation (default: true)
 */
export function validateRangeComponent(data: unknown, validateConstraints = true): ValidationResult {
  const errors: ValidationError[] = [];

  if (!hasDataComponentProperties(data)) {
    errors.push({ message: 'Missing required DataComponent properties' });
    return { valid: false, errors };
  }

  const component = data as any;

  const validRangeTypes = ['QuantityRange', 'CountRange', 'TimeRange', 'CategoryRange'];
  if (!validRangeTypes.includes(component.type)) {
    errors.push({ message: `Expected range type, got '${component.type}'` });
  }

  // Quantity and Time ranges require UOM
  if ((component.type === 'QuantityRange' || component.type === 'TimeRange') && !component.uom) {
    errors.push({ message: 'Missing required property: uom' });
  }

  // Perform deep constraint validation if value is present
  if (validateConstraints && component.value !== undefined && component.value !== null && errors.length === 0) {
    if (component.type === 'QuantityRange' || component.type === 'CountRange' || component.type === 'TimeRange') {
      const constraintResult = validateRangeConstraint(
        component as QuantityRangeComponent | CountRangeComponent | TimeRangeComponent,
        component.value
      );
      if (!constraintResult.valid && constraintResult.errors) {
        errors.push(...constraintResult.errors);
      }
    }
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Generic SWE Common component validator based on type
 * 
 * @param data - The component to validate
 * @param validateConstraints - Whether to perform deep constraint validation (default: true)
 */
export function validateSWEComponent(data: unknown, validateConstraints = true): ValidationResult {
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
      errors: [{ message: `Unknown or unsupported component type: ${type}` }],
    };
  }

  // Type-specific validation with constraint checking
  switch (type) {
    case 'Quantity':
      return validateQuantity(data, validateConstraints);
    case 'Count':
      return validateCount(data, validateConstraints);
    case 'Text':
      return validateText(data, validateConstraints);
    case 'Category':
      return validateCategory(data, validateConstraints);
    case 'Time':
      return validateTime(data, validateConstraints);
    case 'QuantityRange':
    case 'CountRange':
    case 'TimeRange':
    case 'CategoryRange':
      return validateRangeComponent(data, validateConstraints);
    case 'DataRecord':
      return validateDataRecord(data);
    case 'DataArray':
      return validateDataArray(data);
    default:
      // Basic validation passed for other types
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

