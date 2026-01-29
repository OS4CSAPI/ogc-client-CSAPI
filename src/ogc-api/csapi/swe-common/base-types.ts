/**
 * Base types and interfaces for SWE Common Data Model
 *
 * @see https://docs.ogc.org/is/24-014/24-014.html (SWE Common Data Model 3.0)
 * @see https://schemas.opengis.net/sweCommon/3.0/json/
 */

/**
 * URI reference to an external definition
 */
export type DefinitionURI = string;

/**
 * Soft-named property pattern used in SWE Common
 * Properties MUST have a name attribute
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/basicTypes.json#/$defs/SoftNamedProperty
 * @required name - Required by JSON Schema
 */
export interface SoftNamedProperty {
  /**
   * Name for the property (REQUIRED)
   *
   * Must match pattern: ^[A-Za-z][A-Za-z0-9_\-]*$
   */
  name: string;
}

/**
 * Association attribute group for referencing external components
 */
export interface AssociationAttributeGroup {
  /**
   * Reference to an external component
   */
  href?: string;

  /**
   * Type of the reference
   */
  type?: string;

  /**
   * Role of the reference
   */
  role?: string;

  /**
   * Arc role
   */
  arcrole?: string;

  /**
   * Title for the reference
   */
  title?: string;
}

/**
 * Base interface for all SWE identifiable objects
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/AbstractSweIdentifiable.json
 */
export interface AbstractSweIdentifiable {
  /**
   * Unique identifier for this component (optional)
   */
  id?: string;

  /**
   * Optional extensions
   */
  extension?: unknown;
}

/**
 * Base interface for all SWE data components
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/AbstractDataComponent.json
 * @required definition - Required by JSON Schema
 * @required label - Required by JSON Schema
 */
export interface AbstractDataComponent extends AbstractSweIdentifiable {
  /**
   * Component type discriminator
   */
  type: string;

  /**
   * URI pointing to a detailed description or definition (REQUIRED)
   */
  definition: DefinitionURI;

  /**
   * Human-readable label (REQUIRED)
   */
  label: string;

  /**
   * Detailed description
   */
  description?: string;

  /**
   * Flag indicating if component can be updated
   */
  updatable?: boolean;

  /**
   * Flag indicating if component value is optional
   */
  optional?: boolean;
}

/**
 * Base interface for simple scalar components
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/AbstractSimpleComponent.json
 */
export interface AbstractSimpleComponent extends AbstractDataComponent {
  /**
   * Quality information
   */
  quality?: unknown;

  /**
   * Nil values definition (placeholder values)
   */
  nilValues?: NilValues;

  /**
   * Reference frame
   */
  referenceFrame?: string;

  /**
   * Axis ID (for components with direction)
   */
  axisID?: string;
}

/**
 * Unit of measure reference
 * Must specify either 'code' or 'href', or both
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/basicTypes.json#/$defs/UnitReference
 */
export interface UnitReference {
  /**
   * Unit code (e.g., 'm', 'kg', 'degC')
   */
  code?: string;

  /**
   * Reference to unit definition
   */
  href?: string;

  /**
   * Symbol for the unit (e.g., 'm', 'kg')
   */
  symbol?: string;

  /**
   * Human-readable label for the unit
   */
  label?: string;
}

/**
 * Allowed values constraint
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/basicTypes.json#/$defs/AllowedValues
 * @note Property names changed from singular to plural to match JSON Schema
 */
export interface AllowedValues {
  /**
   * List of explicitly allowed values (renamed from 'value' to match JSON Schema)
   */
  values?: (number | string)[];

  /**
   * List of allowed intervals [min, max] (renamed from 'interval' to match JSON Schema)
   */
  intervals?: Array<[number, number]>;

  /**
   * Significant figures constraint
   */
  significantFigures?: number;
}

/**
 * Allowed tokens constraint for text components
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/basicTypes.json#/$defs/AllowedTokens
 */
export interface AllowedTokens {
  /**
   * List of explicitly allowed token values
   */
  values?: string[];

  /**
   * Regular expression pattern that values must match
   */
  pattern?: string;
}

/**
 * Allowed times constraint for time components
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/basicTypes.json#/$defs/AllowedTimes
 */
export interface AllowedTimes {
  /**
   * List of explicitly allowed time values (ISO 8601 format)
   */
  values?: string[];

  /**
   * List of allowed time intervals [start, end] (ISO 8601 format)
   */
  intervals?: Array<[string, string]>;

  /**
   * Significant figures for time representation
   */
  significantFigures?: number;
}

/**
 * Nil value definition for numeric components
 */
export interface NilValue {
  /**
   * Reason for nil value (e.g., 'missing', 'inapplicable', 'unknown')
   */
  reason: string;

  /**
   * The special value representing nil
   */
  value: number | string;
}

/**
 * Collection of nil values
 */
export interface NilValues {
  /**
   * Array of nil value definitions
   */
  nilValue: NilValue[];
}

/**
 * Element count specification for arrays
 */
export interface ElementCount {
  /**
   * Count component defining array size
   */
  count?: Count;

  /**
   * Explicit size value
   */
  value?: number;
}

/**
 * Encoded values container
 */
export type EncodedValues = string;

/**
 * Forward declaration for Count (defined in simple-components.ts)
 */
export interface Count extends AbstractSimpleComponent {
  type: 'Count';
  constraint?: AllowedValues;
  value?: number;
}
