/**
 * SWE Common Data Model Types
 *
 * TypeScript type definitions for OGC SWE Common Data Model 3.0
 *
 * SWE Common provides a framework for describing sensor data and its structure.
 * It includes:
 * - Simple components (Boolean, Text, Category, Count, Quantity, Time)
 * - Range components (CategoryRange, CountRange, QuantityRange, TimeRange)
 * - Aggregate components (DataRecord, Vector, DataChoice)
 * - Block components (DataArray, Matrix, DataStream)
 * - Geometry components (wrapping GeoJSON geometries)
 * - Encodings (JSON, Text, Binary, XML)
 *
 * @see https://docs.ogc.org/is/24-014/24-014.html
 * @see https://schemas.opengis.net/sweCommon/3.0/json/
 *
 * @module csapi/swe-common
 */

// Base types
export * from './base-types.js';

// Component types
export * from './types/index.js';

// Binary encoding support
export { decodeBinary } from './binary-decoder.js';
export { encodeBinary } from './binary-encoder.js';

// Re-export union types for convenience
export type {
  SimpleComponent,
  RangeComponent,
  AggregateComponent,
  BlockComponent,
} from './types/index.js';

import type { SimpleComponent } from './types/simple-components.js';
import type { RangeComponent } from './types/range-components.js';
import type { AggregateComponent } from './types/aggregate-components.js';
import type { BlockComponent } from './types/block-components.js';
import type { GeometryComponent } from './types/geometry-component.js';

/**
 * Union type for any SWE Common data component
 */
export type AnyDataComponent =
  | SimpleComponent
  | RangeComponent
  | AggregateComponent
  | BlockComponent
  | GeometryComponent;

/**
 * Type guard to check if object is any SWE Common component
 */
export function isDataComponent(obj: unknown): obj is AnyDataComponent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    typeof obj.type === 'string'
  );
}
