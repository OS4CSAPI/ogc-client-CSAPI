/**
 * Constraint validation for SWE Common components
 * 
 * This module provides deep validation of SWE Common constraints including:
 * - AllowedValues intervals and discrete values
 * - AllowedTimes intervals and discrete times
 * - AllowedTokens patterns and token lists
 * - Significant figures validation
 * 
 * @see https://docs.ogc.org/is/24-014/24-014.html Section 8
 */

import type {
  QuantityComponent,
  CountComponent,
  TextComponent,
  CategoryComponent,
  TimeComponent,
} from '../swe-common/types/simple-components.js';
import type {
  QuantityRangeComponent,
  CountRangeComponent,
  TimeRangeComponent,
} from '../swe-common/types/range-components.js';
import type { ValidationResult, ValidationError } from './swe-validator.js';

/**
 * Helper to count significant figures in a number
 */
function getSignificantFigures(value: number): number {
  if (value === 0) return 1;
  if (!isFinite(value)) return Infinity;
  
  // Convert to string and remove leading zeros and decimal point
  const str = Math.abs(value).toString();
  const normalized = str.replace(/^0+\.?0*/, '').replace('.', '');
  
  return normalized.length;
}

/**
 * Validate a numeric value against AllowedValues constraint
 */
export function validateQuantityConstraint(
  component: QuantityComponent | QuantityRangeComponent,
  value: number
): ValidationResult {
  if (!component.constraint) {
    return { valid: true };
  }

  const errors: ValidationError[] = [];
  const { intervals, values: allowedValues, significantFigures } = component.constraint;

  // Check interval constraints
  if (intervals && intervals.length > 0) {
    const inAnyInterval = intervals.some(([min, max]) => 
      value >= min && value <= max
    );
    
    if (!inAnyInterval) {
      errors.push({
        path: 'value',
        message: `Value ${value} is outside allowed intervals: ${JSON.stringify(intervals)}`,
      });
    }
  }

  // Check discrete allowed values
  if (allowedValues && allowedValues.length > 0) {
    const numericValues = allowedValues.map(v => typeof v === 'number' ? v : parseFloat(v as string));
    if (!numericValues.includes(value)) {
      errors.push({
        path: 'value',
        message: `Value ${value} is not in allowed values list`,
      });
    }
  }

  // Check significant figures constraint
  if (significantFigures !== undefined && significantFigures > 0) {
    const actualSigFigs = getSignificantFigures(value);
    if (actualSigFigs > significantFigures) {
      errors.push({
        path: 'value',
        message: `Value ${value} has ${actualSigFigs} significant figures, maximum allowed is ${significantFigures}`,
      });
    }
  }

  return errors.length > 0 
    ? { valid: false, errors } 
    : { valid: true };
}

/**
 * Validate an integer value against AllowedValues constraint
 */
export function validateCountConstraint(
  component: CountComponent | CountRangeComponent,
  value: number
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check that value is an integer (always validate this)
  if (!Number.isInteger(value)) {
    errors.push({
      path: 'value',
      message: `Count value ${value} must be an integer`,
    });
    return { valid: false, errors };
  }

  if (!component.constraint) {
    return { valid: true };
  }

  const { intervals, values: allowedValues } = component.constraint;

  // Check interval constraints
  if (intervals && intervals.length > 0) {
    const inAnyInterval = intervals.some(([min, max]) => 
      value >= min && value <= max
    );
    
    if (!inAnyInterval) {
      errors.push({
        path: 'value',
        message: `Value ${value} is outside allowed intervals: ${JSON.stringify(intervals)}`,
      });
    }
  }

  // Check discrete allowed values
  if (allowedValues && allowedValues.length > 0) {
    const numericValues = allowedValues.map(v => typeof v === 'number' ? v : parseInt(v as string, 10));
    if (!numericValues.includes(value)) {
      errors.push({
        path: 'value',
        message: `Value ${value} is not in allowed values list`,
      });
    }
  }

  return errors.length > 0 
    ? { valid: false, errors } 
    : { valid: true };
}

/**
 * Validate a text value against constraint (pattern or allowed tokens)
 */
export function validateTextConstraint(
  component: TextComponent,
  value: string
): ValidationResult {
  if (!component.constraint) {
    return { valid: true };
  }

  const errors: ValidationError[] = [];
  const { values: allowedTokens, pattern } = component.constraint;

  // Check allowed tokens
  if (allowedTokens && Array.isArray(allowedTokens) && allowedTokens.length > 0) {
    if (!allowedTokens.includes(value)) {
      errors.push({
        path: 'value',
        message: `Text value '${value}' is not in allowed tokens: ${allowedTokens.join(', ')}`,
      });
    }
  }

  // Check pattern constraint
  if (pattern && typeof pattern === 'string') {
    try {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        errors.push({
          path: 'value',
          message: `Text value '${value}' does not match required pattern: ${pattern}`,
        });
      }
    } catch (e) {
      errors.push({
        path: 'constraint.pattern',
        message: `Invalid regex pattern: ${pattern}`,
      });
    }
  }

  return errors.length > 0 
    ? { valid: false, errors } 
    : { valid: true };
}

/**
 * Validate a category value against constraint (allowed tokens)
 */
export function validateCategoryConstraint(
  component: CategoryComponent,
  value: string
): ValidationResult {
  if (!component.constraint) {
    return { valid: true };
  }

  const errors: ValidationError[] = [];
  const { values: allowedTokens } = component.constraint;

  // Check allowed tokens
  if (allowedTokens && Array.isArray(allowedTokens) && allowedTokens.length > 0) {
    if (!allowedTokens.includes(value)) {
      errors.push({
        path: 'value',
        message: `Category value '${value}' is not in allowed tokens: ${allowedTokens.join(', ')}`,
      });
    }
  }

  return errors.length > 0 
    ? { valid: false, errors } 
    : { valid: true };
}

/**
 * Validate a time value against constraint (intervals or allowed times)
 */
export function validateTimeConstraint(
  component: TimeComponent | TimeRangeComponent,
  value: string | number
): ValidationResult {
  if (!component.constraint) {
    return { valid: true };
  }

  const errors: ValidationError[] = [];
  const { intervals, values: allowedValues, significantFigures } = component.constraint;

  // Convert value to comparable format (timestamp)
  let timestamp: number;
  if (typeof value === 'number') {
    timestamp = value;
  } else {
    try {
      timestamp = new Date(value).getTime();
      if (isNaN(timestamp)) {
        errors.push({
          path: 'value',
          message: `Invalid time value: ${value}`,
        });
        return { valid: false, errors };
      }
    } catch (e) {
      errors.push({
        path: 'value',
        message: `Invalid time value: ${value}`,
      });
      return { valid: false, errors };
    }
  }

  // Check interval constraints
  if (intervals && intervals.length > 0) {
    const inAnyInterval = intervals.some(([min, max]) => {
      const minTimestamp = typeof min === 'number' ? min : new Date(min).getTime();
      const maxTimestamp = typeof max === 'number' ? max : new Date(max).getTime();
      return timestamp >= minTimestamp && timestamp <= maxTimestamp;
    });
    
    if (!inAnyInterval) {
      errors.push({
        path: 'value',
        message: `Time value ${value} is outside allowed intervals: ${JSON.stringify(interval)}`,
      });
    }
  }

  // Check discrete allowed values
  if (allowedValues && allowedValues.length > 0) {
    const allowedTimestamps = allowedValues.map(v => 
      typeof v === 'number' ? v : new Date(v as string).getTime()
    );
    if (!allowedTimestamps.includes(timestamp)) {
      errors.push({
        path: 'value',
        message: `Time value ${value} is not in allowed values: ${allowedValues.join(', ')}`,
      });
    }
  }

  return errors.length > 0 
    ? { valid: false, errors } 
    : { valid: true };
}

/**
 * Validate a range value (min/max pair) against constraints
 */
export function validateRangeConstraint(
  component: QuantityRangeComponent | CountRangeComponent | TimeRangeComponent,
  value: [any, any]
): ValidationResult {
  if (!value || !Array.isArray(value) || value.length !== 2) {
    return {
      valid: false,
      errors: [{
        path: 'value',
        message: 'Range value must be a [min, max] array',
      }],
    };
  }

  const [min, max] = value;
  const errors: ValidationError[] = [];

  // Validate each endpoint against the component's constraint
  if (component.type === 'QuantityRange') {
    const minResult = validateQuantityConstraint(component as QuantityRangeComponent, min);
    const maxResult = validateQuantityConstraint(component as QuantityRangeComponent, max);
    
    if (!minResult.valid && minResult.errors) {
      errors.push(...minResult.errors.map(e => ({
        ...e,
        path: `value[0]`,
        message: `Min ${e.message}`,
      })));
    }
    
    if (!maxResult.valid && maxResult.errors) {
      errors.push(...maxResult.errors.map(e => ({
        ...e,
        path: `value[1]`,
        message: `Max ${e.message}`,
      })));
    }
  } else if (component.type === 'CountRange') {
    const minResult = validateCountConstraint(component as CountRangeComponent, min);
    const maxResult = validateCountConstraint(component as CountRangeComponent, max);
    
    if (!minResult.valid && minResult.errors) {
      errors.push(...minResult.errors.map(e => ({
        ...e,
        path: `value[0]`,
        message: `Min ${e.message}`,
      })));
    }
    
    if (!maxResult.valid && maxResult.errors) {
      errors.push(...maxResult.errors.map(e => ({
        ...e,
        path: `value[1]`,
        message: `Max ${e.message}`,
      })));
    }
  } else if (component.type === 'TimeRange') {
    const minResult = validateTimeConstraint(component as TimeRangeComponent, min);
    const maxResult = validateTimeConstraint(component as TimeRangeComponent, max);
    
    if (!minResult.valid && minResult.errors) {
      errors.push(...minResult.errors.map(e => ({
        ...e,
        path: `value[0]`,
        message: `Min ${e.message}`,
      })));
    }
    
    if (!maxResult.valid && maxResult.errors) {
      errors.push(...maxResult.errors.map(e => ({
        ...e,
        path: `value[1]`,
        message: `Max ${e.message}`,
      })));
    }
  }

  // Check that min <= max
  if (typeof min === 'number' && typeof max === 'number' && min > max) {
    errors.push({
      path: 'value',
      message: `Range minimum (${min}) must be less than or equal to maximum (${max})`,
    });
  }

  return errors.length > 0 
    ? { valid: false, errors } 
    : { valid: true };
}
