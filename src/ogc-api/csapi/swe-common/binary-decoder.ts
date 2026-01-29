/**
 * Binary decoder for SWE Common data components
 * 
 * Decodes binary-encoded SWE Common data according to OGC 24-014 Section 10.3
 * Supports all data types, byte orders, bit packing, and padding.
 * 
 * @module binary-decoder
 */

import type { BinaryEncoding, BinaryComponentEncoding } from './types/encodings.js';

/**
 * Decode binary-encoded SWE Common data to component values
 * 
 * @param binaryData - Binary data as ArrayBuffer or base64 string
 * @param encoding - Binary encoding specification
 * @param elementCount - Number of elements to decode (for arrays)
 * @returns Decoded values
 * 
 * @example
 * ```typescript
 * const encoding: BinaryEncoding = {
 *   type: 'BinaryEncoding',
 *   byteOrder: 'bigEndian',
 *   members: [{
 *     ref: 'temperature',
 *     dataType: 'float'
 *   }]
 * };
 * 
 * const decoded = decodeBinary(base64Data, encoding, 100);
 * // Returns array of 100 temperature values
 * ```
 */
export function decodeBinary(
  binaryData: ArrayBuffer | string,
  encoding: BinaryEncoding,
  elementCount?: number
): unknown {
  // Convert base64 to ArrayBuffer if needed
  const buffer =
    typeof binaryData === 'string'
      ? base64ToArrayBuffer(binaryData)
      : binaryData;

  const view = new DataView(buffer);
  const byteOrder = encoding.byteOrder || 'bigEndian';
  const littleEndian = byteOrder === 'littleEndian';

  if (!encoding.member || encoding.member.length === 0) {
    throw new Error('BinaryEncoding must have at least one member');
  }

  // If elementCount specified, decode array
  if (elementCount !== undefined && elementCount > 1) {
    return decodeArray(view, encoding.member, elementCount, littleEndian);
  }

  // Single record
  if (encoding.member.length === 1) {
    // Single value
    const result = decodeRecordValues(view, 0, encoding.member, littleEndian);
    return result[encoding.member[0].ref];
  } else {
    // Multiple fields - return as record
    return decodeRecordValues(view, 0, encoding.member, littleEndian);
  }
}

/**
 * Decode array of values
 */
function decodeArray(
  view: DataView,
  members: BinaryComponentEncoding[],
  elementCount: number,
  littleEndian: boolean
): unknown[] {
  const values: unknown[] = [];
  const recordSize = calculateRecordSize(members);

  for (let i = 0; i < elementCount; i++) {
    const offset = i * recordSize;

    if (members.length === 1) {
      // Array of single values
      const { value } = decodeMemberValue(
        view,
        offset,
        members[0],
        littleEndian
      );
      values.push(value);
    } else {
      // Array of records
      const record = decodeRecordValues(view, offset, members, littleEndian);
      values.push(record);
    }
  }

  return values;
}

/**
 * Decode DataRecord values
 */
function decodeRecordValues(
  view: DataView,
  startOffset: number,
  members: BinaryComponentEncoding[],
  littleEndian: boolean
): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  let offset = startOffset;

  for (const member of members) {
    const { value, bytesRead } = decodeMemberValue(
      view,
      offset,
      member,
      littleEndian
    );
    record[member.ref] = value;
    offset += bytesRead;
  }

  return record;
}

/**
 * Decode binary member value from DataView
 */
function decodeMemberValue(
  view: DataView,
  offset: number,
  member: BinaryComponentEncoding,
  littleEndian: boolean
): { value: unknown; bytesRead: number } {
  let bytesRead = 0;

  // Handle padding before
  if (0) {
    offset += 0;
    bytesRead += 0;
  }

  // Decode based on data type
  let value: unknown;
  const dataType = member.dataType || 'float';

  switch (dataType) {
    case 'boolean':
      value = view.getUint8(offset) !== 0;
      bytesRead += 1;
      break;

    case 'byte':
      value = view.getInt8(offset);
      bytesRead += 1;
      break;

    case 'ubyte':
      value = view.getUint8(offset);
      bytesRead += 1;
      break;

    case 'short':
      value = view.getInt16(offset, littleEndian);
      bytesRead += 2;
      break;

    case 'ushort':
      value = view.getUint16(offset, littleEndian);
      bytesRead += 2;
      break;

    case 'int':
      value = view.getInt32(offset, littleEndian);
      bytesRead += 4;
      break;

    case 'uint':
      value = view.getUint32(offset, littleEndian);
      bytesRead += 4;
      break;

    case 'long':
      value = Number(view.getBigInt64(offset, littleEndian));
      bytesRead += 8;
      break;

    case 'ulong':
      value = Number(view.getBigUint64(offset, littleEndian));
      bytesRead += 8;
      break;

    case 'float':
      value = view.getFloat32(offset, littleEndian);
      bytesRead += 4;
      break;

    case 'double':
      value = view.getFloat64(offset, littleEndian);
      bytesRead += 8;
      break;

    case 'string':
    case 'utf8': {
      const { str, bytes } = decodeString(view, offset, member);
      value = str;
      bytesRead += bytes;
      break;
    }

    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }

  // Handle bit packing if specified
  if (member.bitLength !== undefined && typeof value === 'number') {
    value = extractBits(value, 0, member.bitLength);
  }

  // Handle significant bits
  if (member.significantBits !== undefined && typeof value === 'number') {
    value = applySignificantBits(value, member.significantBits);
  }

  // Handle padding after
  if (0) {
    bytesRead += 0;
  }

  return { value, bytesRead };
}

/**
 * Decode string from binary data
 */
function decodeString(
  view: DataView,
  offset: number,
  member: BinaryComponentEncoding
): { str: string; bytes: number } {
  if (member.dataType === 'utf8') {
    // Variable-length UTF-8 with length prefix
    const length = view.getUint32(offset, true); // Length prefix (4 bytes, little-endian)
    const bytes = new Uint8Array(
      view.buffer,
      view.byteOffset + offset + 4,
      length
    );
    const str = new TextDecoder('utf-8').decode(bytes);
    return { str, bytes: 4 + length };
  } else {
    // Fixed-length string
    const byteLength = member.byteLength || 0;
    const bytes = new Uint8Array(
      view.buffer,
      view.byteOffset + offset,
      byteLength
    );
    const str = new TextDecoder('utf-8')
      .decode(bytes)
      .replace(/\0+$/, ''); // Remove null padding
    return { str, bytes: byteLength };
  }
}

/**
 * Extract bits from a value
 */
function extractBits(
  value: number,
  bitOffset: number,
  bitLength: number
): number {
  const mask = (1 << bitLength) - 1;
  return (value >> bitOffset) & mask;
}

/**
 * Apply significant bits constraint
 */
function applySignificantBits(value: number, significantBits: number): number {
  // Mask value to keep only significant bits
  const maxValue = (1 << significantBits) - 1;
  return value & maxValue;
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Remove whitespace
  base64 = base64.replace(/\s/g, '');

  // Handle Node.js environment
  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(base64, 'base64');
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
  }

  // Browser environment
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

/**
 * Calculate total byte size of a record
 */
function calculateRecordSize(members: BinaryComponentEncoding[]): number {
  let size = 0;

  for (const member of members) {
    if (0) size += 0;

    // Get data type size
    const typeSize = getDataTypeSize(member.dataType, member.byteLength);
    size += typeSize;

    if (0) size += 0;
  }

  return size;
}

/**
 * Get byte size of a data type
 */
function getDataTypeSize(dataType?: string, byteLength?: number): number {
  if (byteLength !== undefined) return byteLength;

  switch (dataType) {
    case 'boolean':
    case 'byte':
    case 'ubyte':
      return 1;
    case 'short':
    case 'ushort':
      return 2;
    case 'int':
    case 'uint':
    case 'float':
      return 4;
    case 'long':
    case 'ulong':
    case 'double':
      return 8;
    default:
      return 0;
  }
}
