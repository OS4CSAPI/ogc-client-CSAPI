/**
 * Block component types for SWE Common
 *
 * Block components represent collections of homogeneous data:
 * - DataArray: 1D array of identical components
 * - Matrix: 2D array of identical components
 * - DataStream: Streaming sequence of data blocks
 *
 * @see https://docs.ogc.org/is/24-014/24-014.html Section 9.4
 */

import type {
  AbstractDataComponent,
  ElementCount,
  EncodedValues,
  SoftNamedProperty,
} from '../base-types.js';
import type { Encoding } from './encodings.js';
import type { SimpleComponent } from './simple-components.js';
import type { RangeComponent } from './range-components.js';
import type { AggregateComponent } from './aggregate-components.js';

/**
 * Any data component that can be used as an array element
 */
export type ArrayElementComponent =
  | SimpleComponent
  | RangeComponent
  | AggregateComponent
  | DataArrayComponent
  | MatrixComponent;

/**
 * Element type definition for arrays
 */
export interface ElementType extends SoftNamedProperty {
  /**
   * External reference (alternative to inline component)
   */
  href?: string;

  /**
   * Inline component definition
   */
  component?: ArrayElementComponent;
}

/**
 * DataArray component representing a 1D array of identical data components
 *
 * Arrays contain a sequence of elements with the same structure,
 * with values encoded in a block according to the encoding specification.
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/DataArray.json
 */
export interface DataArrayComponent extends AbstractDataComponent {
  /**
   * Always 'DataArray' for data array components
   */
  type: 'DataArray';

  /**
   * Number of elements in the array
   */
  elementCount: ElementCount;

  /**
   * Definition of the array element structure
   */
  elementType: ElementType & { component: ArrayElementComponent };

  /**
   * Encoding specification for the array values
   */
  encoding?: Encoding;

  /**
   * Encoded values (optional - can be provided separately)
   */
  values?: EncodedValues;
}

/**
 * Matrix component representing a 2D array of identical data components
 *
 * Matrices are special arrays with row and column dimensions.
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/Matrix.json
 */
export interface MatrixComponent extends AbstractDataComponent {
  /**
   * Always 'Matrix' for matrix components
   */
  type: 'Matrix';

  /**
   * Number of rows
   */
  rowCount?: ElementCount;

  /**
   * Number of columns
   */
  columnCount?: ElementCount;

  /**
   * Total number of elements (rowCount × columnCount)
   */
  elementCount: ElementCount;

  /**
   * Definition of the matrix element structure
   */
  elementType: ElementType & { component: ArrayElementComponent };

  /**
   * Encoding specification for the matrix values
   */
  encoding?: Encoding;

  /**
   * Encoded values (optional - can be provided separately)
   */
  values?: EncodedValues;

  /**
   * Reference frame for the matrix
   */
  referenceFrame?: string;

  /**
   * Local frame identifier
   */
  localFrame?: string;
}

/**
 * DataStream component representing a streaming sequence of data
 *
 * DataStreams are like DataArrays but with unbounded length,
 * designed for continuous streaming data.
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/DataStream.json
 */
export interface DataStreamComponent extends AbstractDataComponent {
  /**
   * Always 'DataStream' for data stream components
   */
  type: 'DataStream';

  /**
   * Definition of the stream element structure
   */
  elementType: ElementType & { component: ArrayElementComponent };

  /**
   * Encoding specification for the stream values
   */
  encoding?: Encoding;

  /**
   * Current values in the stream (optional)
   */
  values?: EncodedValues;
}

/**
 * Union type for all block components
 */
export type BlockComponent =
  | DataArrayComponent
  | MatrixComponent
  | DataStreamComponent;

/**
 * Type guard for DataArray component
 */
export function isDataArrayComponent(
  component: unknown
): component is DataArrayComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'DataArray'
  );
}

/**
 * Type guard for Matrix component
 */
export function isMatrixComponent(
  component: unknown
): component is MatrixComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'Matrix'
  );
}

/**
 * Type guard for DataStream component
 */
export function isDataStreamComponent(
  component: unknown
): component is DataStreamComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'DataStream'
  );
}

/**
 * Type guard for any block component
 */
export function isBlockComponent(
  component: unknown
): component is BlockComponent {
  return (
    isDataArrayComponent(component) ||
    isMatrixComponent(component) ||
    isDataStreamComponent(component)
  );
}
