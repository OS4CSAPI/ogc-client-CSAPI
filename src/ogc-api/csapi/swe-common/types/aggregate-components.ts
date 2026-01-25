/**
 * Aggregate component types for SWE Common
 * 
 * Aggregate components group multiple data components together:
 * - DataRecord: Ordered collection of named fields (like a struct/record)
 * - Vector: Special case of DataRecord representing a mathematical vector
 * - DataChoice: Selection from multiple alternative data components
 * 
 * @see https://docs.ogc.org/is/24-014/24-014.html Section 9.2
 */

import type {
  AbstractDataComponent,
  AssociationAttributeGroup,
  SoftNamedProperty,
} from '../base-types.js';
import type { SimpleComponent } from './simple-components.js';
import type { RangeComponent } from './range-components.js';

/**
 * Forward declarations for recursive types
 * Note: Full DataComponent type is defined in the main index
 */
export type DataComponent = SimpleComponent | RangeComponent | AggregateComponent | any;

/**
 * Field definition for DataRecord
 * A field can be a simple component, range, or nested aggregate/block component
 */
export interface DataRecordField extends SoftNamedProperty {
  /**
   * External reference (alternative to inline component)
   */
  href?: string;
  
  /**
   * Inline component definition
   */
  component?: DataComponent;
}

/**
 * DataRecord component representing a structured record with named fields
 * 
 * Similar to a struct or object in programming languages, a DataRecord
 * groups multiple data components with names.
 * 
 * @see https://schemas.opengis.net/sweCommon/3.0/json/DataRecord.json
 */
export interface DataRecordComponent extends AbstractDataComponent {
  /**
   * Always 'DataRecord' for data record components
   */
  type: 'DataRecord';
  
  /**
   * List of fields in the record
   */
  fields: Array<DataRecordField & { component: DataComponent }>;
}

/**
 * Coordinate definition for Vector
 */
export interface VectorCoordinate extends SoftNamedProperty {
  /**
   * External reference (alternative to inline component)
   */
  href?: string;
  
  /**
   * Inline quantity component for this coordinate
   */
  component?: SimpleComponent;
}

/**
 * Vector component representing a mathematical vector
 * 
 * Vectors are special DataRecords representing n-dimensional quantities
 * with a specific reference frame and coordinate system.
 * 
 * @see https://schemas.opengis.net/sweCommon/3.0/json/Vector.json
 */
export interface VectorComponent extends AbstractDataComponent {
  /**
   * Always 'Vector' for vector components
   */
  type: 'Vector';
  
  /**
   * Reference frame for the vector (e.g., WGS84, local frame)
   */
  referenceFrame?: string;
  
  /**
   * Local frame identifier
   */
  localFrame?: string;
  
  /**
   * Vector coordinates (typically Quantity components)
   */
  coordinates: Array<VectorCoordinate & { component: SimpleComponent }>;
}

/**
 * Choice item definition for DataChoice
 */
export interface DataChoiceItem extends SoftNamedProperty {
  /**
   * External reference (alternative to inline component)
   */
  href?: string;
  
  /**
   * Inline component definition
   */
  component?: DataComponent;
}

/**
 * DataChoice component representing a selection from alternatives
 * 
 * DataChoice allows specifying multiple possible data components,
 * with one selected at runtime based on conditions.
 * 
 * @see https://schemas.opengis.net/sweCommon/3.0/json/DataChoice.json
 */
export interface DataChoiceComponent extends AbstractDataComponent {
  /**
   * Always 'DataChoice' for data choice components
   */
  type: 'DataChoice';
  
  /**
   * Name of the field that determines which choice is active
   */
  choiceValue?: string;
  
  /**
   * List of possible choices
   */
  items: Array<DataChoiceItem & { component: DataComponent }>;
}

/**
 * Union type for all aggregate components
 */
export type AggregateComponent =
  | DataRecordComponent
  | VectorComponent
  | DataChoiceComponent;

/**
 * Type guard for DataRecord component
 */
export function isDataRecordComponent(
  component: unknown
): component is DataRecordComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'DataRecord'
  );
}

/**
 * Type guard for Vector component
 */
export function isVectorComponent(component: unknown): component is VectorComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'Vector'
  );
}

/**
 * Type guard for DataChoice component
 */
export function isDataChoiceComponent(
  component: unknown
): component is DataChoiceComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'DataChoice'
  );
}

/**
 * Type guard for any aggregate component
 */
export function isAggregateComponent(
  component: unknown
): component is AggregateComponent {
  return (
    isDataRecordComponent(component) ||
    isVectorComponent(component) ||
    isDataChoiceComponent(component)
  );
}
