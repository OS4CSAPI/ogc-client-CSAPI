/**
 * Encoding types for SWE Common
 *
 * Encodings specify how data values are serialized:
 * - JSONEncoding: Native JSON representation
 * - TextEncoding: Delimited text (CSV-like)
 * - BinaryEncoding: Efficient binary representation
 * - XMLEncoding: XML representation
 *
 * @see https://docs.ogc.org/is/24-014/24-014.html Section 10
 * @see https://schemas.opengis.net/sweCommon/3.0/json/encodings.json
 */

/**
 * Binary data types for encoding
 */
export type BinaryDataType =
  | 'boolean'
  | 'byte'
  | 'ubyte'
  | 'short'
  | 'ushort'
  | 'int'
  | 'uint'
  | 'long'
  | 'ulong'
  | 'float'
  | 'double'
  | 'string'
  | 'utf8';

/**
 * Byte order for binary encoding
 */
export type ByteOrder = 'bigEndian' | 'littleEndian';

/**
 * Binary component encoding specification
 */
export interface BinaryComponentEncoding {
  /**
   * Reference to the component being encoded
   */
  ref: string;

  /**
   * Data type for encoding
   */
  dataType: BinaryDataType;

  /**
   * Byte length (for fixed-size types)
   */
  byteLength?: number;

  /**
   * Significant bits (for packed data)
   */
  significantBits?: number;

  /**
   * Bit length (for bit-packed data)
   */
  bitLength?: number;

  /**
   * Byte order
   */
  byteOrder?: ByteOrder;

  /**
   * Encryption method
   */
  encryption?: string;
}

/**
 * Binary block encoding specification
 */
export interface BinaryBlockEncoding {
  /**
   * Compression method
   */
  compression?: string;

  /**
   * Encryption method
   */
  encryption?: string;

  /**
   * Byte order
   */
  byteOrder?: ByteOrder;

  /**
   * Byte length of the block
   */
  byteLength?: number;

  /**
   * Byte encoding (e.g., 'base64', 'hex')
   */
  byteEncoding?: string;

  /**
   * Member encodings
   */
  member?: BinaryComponentEncoding[];
}

/**
 * Binary encoding for efficient data representation
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/encodings.json
 */
export interface BinaryEncoding {
  /**
   * Always 'BinaryEncoding'
   */
  type: 'BinaryEncoding';

  /**
   * Byte order for the entire encoding
   */
  byteOrder?: ByteOrder;

  /**
   * Byte encoding method
   */
  byteEncoding?: string;

  /**
   * Member component encodings
   */
  member: BinaryComponentEncoding[];
}

/**
 * Text encoding for delimited text data (CSV-like)
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/encodings.json
 */
export interface TextEncoding {
  /**
   * Always 'TextEncoding'
   */
  type: 'TextEncoding';

  /**
   * Collapse white space
   */
  collapseWhiteSpaces?: boolean;

  /**
   * Decimal separator (default '.')
   */
  decimalSeparator?: string;

  /**
   * Token separator (separates values within a record)
   */
  tokenSeparator: string;

  /**
   * Block separator (separates records/blocks)
   */
  blockSeparator: string;
}

/**
 * XML encoding for XML representation
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/encodings.json
 */
export interface XMLEncoding {
  /**
   * Always 'XMLEncoding'
   */
  type: 'XMLEncoding';
}

/**
 * JSON encoding for native JSON representation
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/encodings.json
 */
export interface JSONEncoding {
  /**
   * Always 'JSONEncoding'
   */
  type: 'JSONEncoding';
}

/**
 * Union type for all encoding types
 */
export type Encoding =
  | BinaryEncoding
  | TextEncoding
  | XMLEncoding
  | JSONEncoding;

/**
 * Type guard for BinaryEncoding
 */
export function isBinaryEncoding(
  encoding: unknown
): encoding is BinaryEncoding {
  return (
    typeof encoding === 'object' &&
    encoding !== null &&
    'type' in encoding &&
    encoding.type === 'BinaryEncoding'
  );
}

/**
 * Type guard for TextEncoding
 */
export function isTextEncoding(encoding: unknown): encoding is TextEncoding {
  return (
    typeof encoding === 'object' &&
    encoding !== null &&
    'type' in encoding &&
    encoding.type === 'TextEncoding'
  );
}

/**
 * Type guard for XMLEncoding
 */
export function isXMLEncoding(encoding: unknown): encoding is XMLEncoding {
  return (
    typeof encoding === 'object' &&
    encoding !== null &&
    'type' in encoding &&
    encoding.type === 'XMLEncoding'
  );
}

/**
 * Type guard for JSONEncoding
 */
export function isJSONEncoding(encoding: unknown): encoding is JSONEncoding {
  return (
    typeof encoding === 'object' &&
    encoding !== null &&
    'type' in encoding &&
    encoding.type === 'JSONEncoding'
  );
}

/**
 * Type guard for any encoding type
 */
export function isEncoding(encoding: unknown): encoding is Encoding {
  return (
    isBinaryEncoding(encoding) ||
    isTextEncoding(encoding) ||
    isXMLEncoding(encoding) ||
    isJSONEncoding(encoding)
  );
}
