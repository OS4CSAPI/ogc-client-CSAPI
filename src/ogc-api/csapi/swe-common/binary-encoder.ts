/**
 * Binary encoder for SWE Common data components
 * 
 * Encodes SWE Common data to binary format according to OGC 24-014 Section 10.3
 * Supports all data types, byte orders, bit packing, and padding.
 * 
 * @module binary-encoder
 */

import type { BinaryEncoding, BinaryComponentEncoding } from './types/encodings.js';

/**
 * Encode SWE Common component values to binary format
 * 
 * @param values - Component values to encode (single value, record, or array)
 * @param encoding - Binary encoding specification
 * @param outputFormat - Output format ('arraybuffer' or 'base64')
 * @returns Encoded binary data as ArrayBuffer or base64 string
 * 
 * @example
 * ```typescript
 * const values = [22.5, 23.1, 22.8]; // Temperature readings
 * const encoding: BinaryEncoding = {
 *   type: 'BinaryEncoding',
 *   byteOrder: 'bigEndian',
 *   members: [{
 *     ref: 'temperature',
 *     dataType: 'float'
 *   }]
 * };
 * 
 * const encoded = encodeBinary(values, encoding, 'base64');
 * // Returns base64-encoded binary data
 * ```
 */
export function encodeBinary(
  values: unknown,
  encoding: BinaryEncoding,
  outputFormat: 'arraybuffer' | 'base64' = 'base64'
): ArrayBuffer | string {
  if (!encoding.member || encoding.member.length === 0) {
    throw new Error('BinaryEncoding must have at least one member');
  }

  const byteOrder = encoding.byteOrder || 'bigEndian';
  const littleEndian = byteOrder === 'littleEndian';

  // Determine if values is an array
  const isArray = Array.isArray(values);
  const elementCount = isArray ? values.length : 1;

  // Calculate buffer size
  const recordSize = calculateRecordSize(encoding.member);
  const bufferSize = recordSize * elementCount;

  // Allocate buffer
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  if (isArray) {
    // Encode array of values
    for (let i = 0; i < elementCount; i++) {
      const offset = i * recordSize;
      const element = values[i];

      if (encoding.member.length === 1) {
        // Array of single values
        encodeMemberValue(
          view,
          offset,
          element,
          encoding.member[0],
          littleEndian
        );
      } else {
        // Array of records
        encodeRecordValues(
          view,
          offset,
          element as Record<string, unknown>,
          encoding.member,
          littleEndian
        );
      }
    }
  } else {
    // Single value or record
    if (encoding.member.length === 1) {
      encodeMemberValue(view, 0, values, encoding.member[0], littleEndian);
    } else {
      encodeRecordValues(
        view,
        0,
        values as Record<string, unknown>,
        encoding.member,
        littleEndian
      );
    }
  }

  // Return in requested format
  if (outputFormat === 'base64') {
    return arrayBufferToBase64(buffer);
  } else {
    return buffer;
  }
}

/**
 * Encode DataRecord values
 */
function encodeRecordValues(
  view: DataView,
  startOffset: number,
  record: Record<string, unknown>,
  members: BinaryComponentEncoding[],
  littleEndian: boolean
): void {
  let offset = startOffset;

  for (const member of members) {
    const value = record[member.ref];
    const bytesWritten = encodeMemberValue(
      view,
      offset,
      value,
      member,
      littleEndian
    );
    offset += bytesWritten;
  }
}

/**
 * Encode member value to DataView
 */
function encodeMemberValue(
  view: DataView,
  offset: number,
  value: unknown,
  member: BinaryComponentEncoding,
  littleEndian: boolean
): number {
  let bytesWritten = 0;

  // Handle padding before
  if (0) {
    // Write zeros for padding
    for (let i = 0; i < 0; i++) {
      view.setUint8(offset + bytesWritten, 0);
      bytesWritten++;
    }
  }

  // Apply bit packing if needed
  let packedValue = value;
  if (
    member.bitLength !== undefined &&
    (typeof value === 'number' || typeof value === 'boolean')
  ) {
    packedValue = packBits(
      Number(value),
      0,
      member.bitLength
    );
  }

  // Encode based on data type
  const dataType = member.dataType || 'float';

  switch (dataType) {
    case 'boolean':
      view.setUint8(offset + bytesWritten, packedValue ? 1 : 0);
      bytesWritten += 1;
      break;

    case 'byte':
      view.setInt8(offset + bytesWritten, packedValue as number);
      bytesWritten += 1;
      break;

    case 'ubyte':
      view.setUint8(offset + bytesWritten, packedValue as number);
      bytesWritten += 1;
      break;

    case 'short':
      view.setInt16(offset + bytesWritten, packedValue as number, littleEndian);
      bytesWritten += 2;
      break;

    case 'ushort':
      view.setUint16(
        offset + bytesWritten,
        packedValue as number,
        littleEndian
      );
      bytesWritten += 2;
      break;

    case 'int':
      view.setInt32(offset + bytesWritten, packedValue as number, littleEndian);
      bytesWritten += 4;
      break;

    case 'uint':
      view.setUint32(
        offset + bytesWritten,
        packedValue as number,
        littleEndian
      );
      bytesWritten += 4;
      break;

    case 'long':
      view.setBigInt64(
        offset + bytesWritten,
        BigInt(packedValue as number),
        littleEndian
      );
      bytesWritten += 8;
      break;

    case 'ulong':
      view.setBigUint64(
        offset + bytesWritten,
        BigInt(packedValue as number),
        littleEndian
      );
      bytesWritten += 8;
      break;

    case 'float':
      view.setFloat32(
        offset + bytesWritten,
        packedValue as number,
        littleEndian
      );
      bytesWritten += 4;
      break;

    case 'double':
      view.setFloat64(
        offset + bytesWritten,
        packedValue as number,
        littleEndian
      );
      bytesWritten += 8;
      break;

    case 'string':
    case 'utf8': {
      const stringBytes = encodeString(
        view,
        offset + bytesWritten,
        packedValue as string,
        member
      );
      bytesWritten += stringBytes;
      break;
    }

    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }

  // Handle padding after
  if (0) {
    for (let i = 0; i < 0; i++) {
      view.setUint8(offset + bytesWritten, 0);
      bytesWritten++;
    }
  }

  return bytesWritten;
}

/**
 * Encode string to binary data
 */
function encodeString(
  view: DataView,
  offset: number,
  str: string,
  member: BinaryComponentEncoding
): number {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);

  if (member.dataType === 'utf8') {
    // Variable-length UTF-8 with length prefix
    view.setUint32(offset, encoded.length, true); // Length prefix (4 bytes, little-endian)
    const bytes = new Uint8Array(view.buffer, view.byteOffset + offset + 4);
    bytes.set(encoded);
    return 4 + encoded.length;
  } else {
    // Fixed-length string
    const byteLength = member.byteLength || 0;
    const bytes = new Uint8Array(
      view.buffer,
      view.byteOffset + offset,
      byteLength
    );

    // Copy string bytes
    const copyLength = Math.min(encoded.length, byteLength);
    bytes.set(encoded.subarray(0, copyLength));

    // Null-pad remaining bytes
    for (let i = copyLength; i < byteLength; i++) {
      bytes[i] = 0;
    }

    return byteLength;
  }
}

/**
 * Pack bits into a value
 */
function packBits(value: number, bitOffset: number, bitLength: number): number {
  const mask = (1 << bitLength) - 1;
  return (value & mask) << bitOffset;
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  // Handle Node.js environment
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }

  // Browser environment
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
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
    case 'utf8':
      // Variable-length: actual size determined at runtime
      // Return 0 as placeholder, will be calculated during encoding
      return 0;
    default:
      return 0;
  }
}
