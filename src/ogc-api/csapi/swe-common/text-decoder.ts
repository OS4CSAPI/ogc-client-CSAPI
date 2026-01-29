/**
 * Text encoding decoder for SWE Common data components
 *
 * Decodes text-encoded data (CSV-like formats) to component values according to
 * the OGC SWE Common 3.0 TextEncoding specification.
 *
 * @see https://docs.ogc.org/is/24-014/24-014.html Section 10.2
 * @module text-decoder
 */

import type { TextEncoding } from './types/encodings.js';
import type {
  DataComponent,
  DataArrayComponent,
  DataRecordComponent,
  DataStreamComponent,
} from './types/index.js';

/**
 * Decode text-encoded SWE Common data to component values
 *
 * @param textData - Text data as string (CSV-like format)
 * @param encoding - Text encoding specification
 * @param component - Component structure describing the data
 * @param elementCount - For arrays: number of elements to decode
 * @returns Decoded values (single value, record, or array)
 *
 * @example
 * ```typescript
 * const csvData = '22.5,65,1013.25\n23.1,64,1012.80\n';
 * const encoding: TextEncoding = {
 *   type: 'TextEncoding',
 *   tokenSeparator: ',',
 *   blockSeparator: '\n'
 * };
 * const values = decodeText(csvData, encoding, dataArrayComponent);
 * // Returns: [[22.5, 65, 1013.25], [23.1, 64, 1012.80]]
 * ```
 */
export function decodeText(
  textData: string,
  encoding: TextEncoding,
  component: DataComponent,
  elementCount?: number
): unknown {
  // Preprocess text data
  let processedData = textData;

  // Handle whitespace collapse
  if (encoding.collapseWhiteSpaces) {
    processedData = collapseWhitespace(
      processedData,
      encoding.tokenSeparator,
      encoding.blockSeparator
    );
  }

  // Handle decimal separator substitution (must be done on whole text before splitting)
  if (encoding.decimalSeparator && encoding.decimalSeparator !== '.') {
    processedData = substituteDecimalSeparator(
      processedData,
      encoding.decimalSeparator,
      encoding.tokenSeparator,
      encoding.blockSeparator
    );
  }

  // Decode based on component type
  if (
    component.type === 'DataArray' ||
    component.type === 'DataStream'
  ) {
    return decodeArray(
      processedData,
      encoding,
      component as DataArrayComponent | DataStreamComponent,
      elementCount
    );
  } else if (component.type === 'DataRecord') {
    return decodeRecord(
      processedData,
      encoding,
      component as DataRecordComponent
    );
  } else {
    return decodeSimple(processedData, component);
  }
}

/**
 * Decode array of values (DataArray or DataStream)
 */
function decodeArray(
  textData: string,
  encoding: TextEncoding,
  component: DataArrayComponent | DataStreamComponent,
  elementCount?: number
): unknown[] {
  const values: unknown[] = [];

  // Split by block separator
  const blocks = splitByBlockSeparator(textData, encoding.blockSeparator);

  // Use elementCount if provided, otherwise process all blocks
  const count = elementCount || blocks.length;

  for (let i = 0; i < count && i < blocks.length; i++) {
    const block = blocks[i];

    // Skip empty blocks
    if (block.trim() === '') continue;

    // Parse each block as a record or simple value
    const elementComponent =
      'elementType' in component
        ? component.elementType.component
        : component;

    const elementValue = decodeElement(block, encoding, elementComponent);
    values.push(elementValue);
  }

  return values;
}

/**
 * Decode DataRecord values
 */
function decodeRecord(
  textData: string,
  encoding: TextEncoding,
  component: DataRecordComponent
): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  // Split by token separator (respecting quotes)
  const tokens = splitByTokenSeparator(textData, encoding.tokenSeparator);

  // Match tokens to fields
  if (tokens.length !== component.fields.length) {
    throw new Error(
      `Token count mismatch: expected ${component.fields.length} fields, got ${tokens.length} tokens`
    );
  }

  for (let i = 0; i < component.fields.length; i++) {
    const field = component.fields[i];
    const token = tokens[i];

    // Parse token based on field component type
    const value = parseToken(token, field.component);
    record[field.name] = value;
  }

  return record;
}

/**
 * Decode simple component value
 */
function decodeSimple(textData: string, component: DataComponent): unknown {
  return parseToken(textData.trim(), component);
}

/**
 * Decode element (for DataArray elements)
 */
function decodeElement(
  text: string,
  encoding: TextEncoding,
  component: DataComponent
): unknown {
  if (component.type === 'DataRecord') {
    return decodeRecord(text, encoding, component as DataRecordComponent);
  } else {
    return parseToken(text, component);
  }
}

/**
 * Split text by block separator (handles empty blocks)
 */
function splitByBlockSeparator(text: string, separator: string): string[] {
  // Handle case where separator doesn't exist (single block)
  if (!text.includes(separator)) {
    return text ? [text] : [];
  }

  // Split and filter out empty strings
  return text
    .split(separator)
    .filter((block) => block.trim() !== '');
}

/**
 * Split text by token separator (respects CSV quoting RFC 4180)
 *
 * Handles:
 * - Quoted strings containing separators
 * - Escaped quotes ("" → ")
 * - Multi-line strings inside quotes
 */
function splitByTokenSeparator(text: string, separator: string): string[] {
  const tokens: string[] = [];
  let currentToken = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Handle quotes
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        // Escaped quote: "" → "
        currentToken += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    // Handle separator
    if (
      !inQuotes &&
      text.substring(i, i + separator.length) === separator
    ) {
      tokens.push(currentToken);
      currentToken = '';
      i += separator.length;
      continue;
    }

    // Regular character
    currentToken += char;
    i++;
  }

  // Add last token
  tokens.push(currentToken);

  return tokens;
}

/**
 * Parse token to appropriate type based on component
 */
function parseToken(token: string, component: DataComponent): unknown {
  // Remove quotes if present
  token = token.trim();
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1).replace(/""/g, '"'); // Unescape quotes
  }

  // Handle empty tokens (null values)
  if (
    token === '' ||
    token.toLowerCase() === 'null' ||
    token.toLowerCase() === 'nil'
  ) {
    return null;
  }

  // Parse based on component type
  switch (component.type) {
    case 'Boolean':
      return (
        token.toLowerCase() === 'true' ||
        token === '1' ||
        token.toLowerCase() === 't' ||
        token.toLowerCase() === 'yes'
      );

    case 'Count':
      return parseInt(token, 10);

    case 'Quantity':
      return parseFloat(token);

    case 'Time': {
      // Try ISO 8601 first, then numeric timestamp
      if (token.includes('T') || token.includes('-') || token.includes(':')) {
        return token; // ISO 8601 string
      } else {
        const num = parseFloat(token);
        return isNaN(num) ? token : num; // Unix timestamp or ISO string
      }
    }

    case 'Category':
    case 'Text':
      return token;

    case 'QuantityRange':
    case 'TimeRange':
    case 'CountRange':
    case 'CategoryRange': {
      // Ranges might be represented as two space-separated values
      const parts = token.split(/\s+/);
      if (parts.length === 2) {
        if (component.type === 'QuantityRange') {
          return [parseFloat(parts[0]), parseFloat(parts[1])];
        } else if (component.type === 'CountRange') {
          return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
        } else {
          return parts;
        }
      }
      return token;
    }

    case 'DataRecord':
      throw new Error(
        'Nested DataRecord in text encoding requires recursive parsing - use decodeRecord() instead'
      );

    default:
      return token; // Default to string
  }
}

/**
 * Collapse consecutive whitespace characters
 *
 * When collapseWhiteSpaces is true:
 * - Multiple spaces/tabs/whitespace → single space
 * - Preserves structure (doesn't affect separators)
 */
function collapseWhitespace(
  text: string,
  tokenSeparator: string,
  blockSeparator: string
): string {
  // If token separator is whitespace, collapse all whitespace to single separator
  if (tokenSeparator.trim() === '') {
    // Don't collapse block separators
    return text
      .split(blockSeparator)
      .map((block) => block.replace(/\s+/g, tokenSeparator))
      .join(blockSeparator);
  }

  // Otherwise, collapse whitespace to single space (but preserve other separators)
  return text.replace(/[ \t]+/g, ' ');
}

/**
 * Substitute decimal separator
 *
 * Replaces custom decimal separator (e.g., comma in European format) with
 * standard period for parsing.
 *
 * Important: This is a simple replacement. In production, you might need
 * more sophisticated logic to avoid replacing separators inside quoted strings.
 */
function substituteDecimalSeparator(
  text: string,
  decimalSeparator: string,
  tokenSeparator: string,
  blockSeparator: string
): string {
  // Only substitute if decimal separator is different from token/block separators
  if (
    decimalSeparator === tokenSeparator ||
    decimalSeparator === blockSeparator
  ) {
    throw new Error(
      'Decimal separator must be different from token and block separators'
    );
  }

  // Simple global replacement
  // Note: This might replace decimal separators inside quoted strings too.
  // For production, consider more sophisticated parsing.
  const regex = new RegExp(
    decimalSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'g'
  );
  return text.replace(regex, '.');
}
