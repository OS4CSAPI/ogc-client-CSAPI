/**
 * Text encoding encoder for SWE Common data components
 *
 * Encodes component values to text-encoded data (CSV-like formats) according to
 * the OGC SWE Common 3.0 TextEncoding specification.
 *
 * @see https://docs.ogc.org/is/24-014/24-014.html Section 10.2
 * @module text-encoder
 */

import type { TextEncoding } from './types/encodings.js';
import type {
  DataComponent,
  DataArrayComponent,
  DataRecordComponent,
  DataStreamComponent,
} from './types/index.js';

/**
 * Encode SWE Common component values to text format
 *
 * @param values - Component values to encode (single value, record, or array)
 * @param encoding - Text encoding specification
 * @param component - Component structure
 * @returns Encoded text data as string (CSV-like format)
 *
 * @example
 * ```typescript
 * const values = [
 *   { temp: 22.5, humidity: 65, pressure: 1013.25 },
 *   { temp: 23.1, humidity: 64, pressure: 1012.80 }
 * ];
 * const encoding: TextEncoding = {
 *   type: 'TextEncoding',
 *   tokenSeparator: ',',
 *   blockSeparator: '\n'
 * };
 * const csv = encodeText(values, encoding, dataRecordComponent);
 * // Returns: "22.5,65,1013.25\n23.1,64,1012.80"
 * ```
 */
export function encodeText(
  values: unknown,
  encoding: TextEncoding,
  component: DataComponent
): string {
  // Encode based on component type
  let encoded: string;

  if (
    component.type === 'DataArray' ||
    component.type === 'DataStream'
  ) {
    encoded = encodeArray(
      values as unknown[],
      encoding,
      component as DataArrayComponent | DataStreamComponent
    );
  } else if (component.type === 'DataRecord') {
    encoded = encodeRecord(
      values as Record<string, unknown>,
      encoding,
      component as DataRecordComponent
    );
  } else {
    encoded = encodeSimple(values, encoding, component);
  }

  // Post-process: substitute decimal separator if needed
  if (encoding.decimalSeparator && encoding.decimalSeparator !== '.') {
    encoded = substituteDecimalSeparator(encoded, encoding.decimalSeparator);
  }

  return encoded;
}

/**
 * Encode array of values (DataArray or DataStream)
 */
function encodeArray(
  values: unknown[],
  encoding: TextEncoding,
  component: DataArrayComponent | DataStreamComponent
): string {
  const blocks: string[] = [];

  const elementComponent =
    'elementType' in component
      ? component.elementType.component
      : component;

  for (const value of values) {
    const block = encodeElement(value, encoding, elementComponent);
    blocks.push(block);
  }

  return blocks.join(encoding.blockSeparator);
}

/**
 * Encode DataRecord values
 */
function encodeRecord(
  values: Record<string, unknown>,
  encoding: TextEncoding,
  component: DataRecordComponent
): string {
  const tokens: string[] = [];

  for (const field of component.fields) {
    const value = values[field.name];
    const token = formatToken(value, field.component, encoding.tokenSeparator);
    tokens.push(token);
  }

  return tokens.join(encoding.tokenSeparator);
}

/**
 * Encode simple component value
 */
function encodeSimple(
  value: unknown,
  encoding: TextEncoding,
  component: DataComponent
): string {
  return formatToken(value, component, encoding.tokenSeparator);
}

/**
 * Encode element (for DataArray elements)
 */
function encodeElement(
  value: unknown,
  encoding: TextEncoding,
  component: DataComponent
): string {
  if (component.type === 'DataRecord') {
    return encodeRecord(
      value as Record<string, unknown>,
      encoding,
      component as DataRecordComponent
    );
  } else {
    return formatToken(value, component, encoding.tokenSeparator);
  }
}

/**
 * Format value as token (with quoting if needed)
 */
function formatToken(
  value: unknown,
  component: DataComponent,
  tokenSeparator: string
): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string based on component type
  let str: string;

  switch (component.type) {
    case 'Boolean':
      str = value ? 'true' : 'false';
      break;

    case 'Count':
    case 'Quantity':
      str = String(value);
      break;

    case 'Time':
      // ISO 8601 or numeric timestamp
      str = typeof value === 'number' ? String(value) : (value as string);
      break;

    case 'Category':
    case 'Text':
      str = String(value);
      break;

    case 'QuantityRange':
    case 'TimeRange':
    case 'CountRange':
    case 'CategoryRange': {
      // Encode ranges as space-separated values
      if (Array.isArray(value) && value.length === 2) {
        str = `${value[0]} ${value[1]}`;
      } else {
        str = String(value);
      }
      break;
    }

    default:
      str = String(value);
  }

  // Quote if necessary (contains separator, quotes, newlines, or carriage returns)
  if (needsQuoting(str, tokenSeparator)) {
    return quoteString(str);
  }

  return str;
}

/**
 * Check if string needs quoting (CSV RFC 4180)
 *
 * Strings need quoting if they contain:
 * - Token separator
 * - Double quotes
 * - Newlines
 * - Carriage returns
 */
function needsQuoting(str: string, tokenSeparator: string): boolean {
  return (
    str.includes(tokenSeparator) ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  );
}

/**
 * Quote string (CSV RFC 4180 style)
 *
 * - Wrap in double quotes
 * - Escape internal quotes: " → ""
 */
function quoteString(str: string): string {
  // Escape quotes: " → ""
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Substitute decimal separator (reverse of decoder)
 *
 * Replaces standard period with custom decimal separator (e.g., comma for European format).
 *
 * Important: This is a simple replacement that affects all periods in the text.
 * In production, you might need more sophisticated logic to only replace periods
 * in numeric contexts.
 */
function substituteDecimalSeparator(
  text: string,
  decimalSeparator: string
): string {
  // Replace . with custom decimal separator
  // Note: This will replace ALL periods, including those in quoted strings or dates
  // For production, consider more sophisticated parsing
  return text.replace(/\./g, decimalSeparator);
}
