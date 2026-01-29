/**
 * Text encoding validation utilities
 *
 * Validates TextEncoding configurations and text-encoded data.
 *
 * @module text-validation
 */

import type { TextEncoding } from './types/encodings.js';
import type { DataComponent, DataRecordComponent } from './types/index.js';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Validate text encoding configuration
 *
 * Checks that:
 * - Required fields are present (tokenSeparator, blockSeparator)
 * - Separators are not empty strings
 * - Separators are different from each other
 * - Decimal separator is single character
 * - Decimal separator doesn't conflict with other separators
 *
 * @param encoding - Text encoding configuration
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const encoding: TextEncoding = {
 *   type: 'TextEncoding',
 *   tokenSeparator: ',',
 *   blockSeparator: '\n'
 * };
 * const result = validateTextEncoding(encoding);
 * if (!result.valid) {
 *   console.error('Invalid encoding:', result.errors);
 * }
 * ```
 */
export function validateTextEncoding(
  encoding: TextEncoding
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type check
  if (encoding.type !== 'TextEncoding') {
    errors.push(`Invalid type: expected 'TextEncoding', got '${encoding.type}'`);
  }

  // Token separator is required
  if (!encoding.tokenSeparator) {
    errors.push('tokenSeparator is required');
  } else {
    // Token separator must not be empty string
    if (encoding.tokenSeparator === '') {
      errors.push('tokenSeparator cannot be empty string');
    }
  }

  // Block separator is required
  if (!encoding.blockSeparator) {
    errors.push('blockSeparator is required');
  } else {
    // Block separator must not be empty string
    if (encoding.blockSeparator === '') {
      errors.push('blockSeparator cannot be empty string');
    }
  }

  // Token and block separators should be different
  if (
    encoding.tokenSeparator &&
    encoding.blockSeparator &&
    encoding.tokenSeparator === encoding.blockSeparator
  ) {
    errors.push(
      'tokenSeparator and blockSeparator should be different to avoid ambiguity'
    );
  }

  // Decimal separator validation
  if (encoding.decimalSeparator) {
    // Decimal separator should be single character
    if (encoding.decimalSeparator.length !== 1) {
      errors.push(
        `decimalSeparator must be single character, got '${encoding.decimalSeparator}' (length ${encoding.decimalSeparator.length})`
      );
    }

    // Decimal separator should not be same as token separator
    if (encoding.decimalSeparator === encoding.tokenSeparator) {
      errors.push(
        'decimalSeparator must be different from tokenSeparator'
      );
    }

    // Decimal separator should not be same as block separator
    if (encoding.decimalSeparator === encoding.blockSeparator) {
      errors.push(
        'decimalSeparator must be different from blockSeparator'
      );
    }

    // Warn if using non-standard decimal separator
    if (encoding.decimalSeparator !== '.' && encoding.decimalSeparator !== ',') {
      warnings.push(
        `Non-standard decimal separator '${encoding.decimalSeparator}' (standard is '.' or ',')`
      );
    }
  }

  // Warn about common separator conflicts
  if (encoding.tokenSeparator === '.' || encoding.blockSeparator === '.') {
    warnings.push(
      'Using period (.) as separator may conflict with decimal numbers'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate text data length
 *
 * Checks that the text data has the expected number of blocks/records.
 *
 * @param textData - Text data to validate
 * @param encoding - Text encoding configuration
 * @param expectedCount - Expected number of records/blocks
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const csvData = '22.5,65\n23.1,64\n22.8,63\n';
 * const encoding: TextEncoding = {
 *   type: 'TextEncoding',
 *   tokenSeparator: ',',
 *   blockSeparator: '\n'
 * };
 * const result = validateTextDataLength(csvData, encoding, 3);
 * // result.valid === true (3 records found)
 * ```
 */
export function validateTextDataLength(
  textData: string,
  encoding: TextEncoding,
  expectedCount: number
): ValidationResult {
  const errors: string[] = [];

  // Count blocks
  const blocks = textData
    .split(encoding.blockSeparator)
    .filter((block) => block.trim() !== '');

  const actualCount = blocks.length;

  if (actualCount !== expectedCount) {
    errors.push(
      `Record count mismatch: expected ${expectedCount}, found ${actualCount}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate text data structure
 *
 * Checks that each record has the expected number of tokens (fields).
 *
 * @param textData - Text data to validate
 * @param encoding - Text encoding configuration
 * @param component - Component structure (for DataRecord validation)
 * @returns Validation result with detailed error messages
 *
 * @example
 * ```typescript
 * const csvData = '22.5,65\n23.1,64,1012.80\n'; // Second record has 3 fields
 * const encoding: TextEncoding = {
 *   type: 'TextEncoding',
 *   tokenSeparator: ',',
 *   blockSeparator: '\n'
 * };
 * const component: DataRecordComponent = {
 *   type: 'DataRecord',
 *   definition: '...',
 *   label: '...',
 *   fields: [
 *     { name: 'temp', component: { type: 'Quantity', ... } },
 *     { name: 'humidity', component: { type: 'Quantity', ... } }
 *   ]
 * };
 * const result = validateTextDataStructure(csvData, encoding, component);
 * // result.valid === false (record 2 has 3 tokens, expected 2)
 * ```
 */
export function validateTextDataStructure(
  textData: string,
  encoding: TextEncoding,
  component: DataComponent
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Only validate DataRecord structure
  if (component.type !== 'DataRecord') {
    return { valid: true, errors: [] };
  }

  const dataRecord = component as DataRecordComponent;
  const expectedFieldCount = dataRecord.fields.length;

  // Split by blocks
  const blocks = textData
    .split(encoding.blockSeparator)
    .filter((block) => block.trim() !== '');

  // Check each block
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Split by tokens (simple split, not handling quotes here)
    const tokens = block.split(encoding.tokenSeparator);
    const actualFieldCount = tokens.length;

    if (actualFieldCount !== expectedFieldCount) {
      errors.push(
        `Record ${i + 1}: expected ${expectedFieldCount} fields, found ${actualFieldCount}`
      );
    }

    // Check for empty tokens (might indicate missing values)
    const emptyTokens = tokens.filter((t) => t.trim() === '').length;
    if (emptyTokens > 0) {
      warnings.push(
        `Record ${i + 1}: ${emptyTokens} empty field(s) detected (will be parsed as null)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate separator compatibility
 *
 * Checks if the text data contains any separator characters that might cause issues.
 * Useful for warning users about potential quoting needs.
 *
 * @param textData - Text data to check
 * @param encoding - Text encoding configuration
 * @returns Validation result with warnings about potential conflicts
 */
export function validateSeparatorCompatibility(
  textData: string,
  encoding: TextEncoding
): ValidationResult {
  const warnings: string[] = [];

  // Check if data contains token separator (might need quoting)
  if (textData.includes(encoding.tokenSeparator)) {
    // Check if already quoted
    if (!textData.includes('"')) {
      warnings.push(
        `Data contains token separator '${encoding.tokenSeparator}' but no quotes detected. Values with separators should be quoted.`
      );
    }
  }

  // Check if data contains block separator in unexpected places
  const blocks = textData.split(encoding.blockSeparator);
  if (blocks.some((block) => block.includes(encoding.blockSeparator))) {
    warnings.push(
      `Data may contain embedded block separators. Use quoting to preserve multi-line values.`
    );
  }

  return {
    valid: true,
    errors: [],
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
