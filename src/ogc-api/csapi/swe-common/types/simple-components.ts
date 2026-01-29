/**
 * Simple (scalar) component types for SWE Common
 *
 * Simple components represent single scalar values with specific datatypes.
 * They include Boolean, Text, Category, Count, Quantity, and Time.
 *
 * @see https://docs.ogc.org/is/24-014/24-014.html Section 9.1
 */

import type {
  AbstractSimpleComponent,
  AllowedValues,
  AllowedTokens,
  AllowedTimes,
  DefinitionURI,
  NilValues,
  UnitReference,
} from '../base-types.js';

/**
 * Boolean component for true/false values
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/Boolean.json
 */
export interface BooleanComponent extends AbstractSimpleComponent {
  /**
   * Always 'Boolean' for boolean components
   */
  type: 'Boolean';

  /**
   * Current value
   */
  value?: boolean;
}

/**
 * Text component for string values
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/Text.json
 */
export interface TextComponent extends AbstractSimpleComponent {
  /**
   * Always 'Text' for text components
   */
  type: 'Text';

  /**
   * Constraint on allowed token values
   */
  constraint?: AllowedTokens;

  /**
   * Current value
   */
  value?: string;
}

/**
 * Category component for categorical values
 *
 * Categories are discrete values from a controlled vocabulary,
 * identified by a definition URI and optional code value.
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/Category.json
 */
export interface CategoryComponent extends AbstractSimpleComponent {
  /**
   * Always 'Category' for category components
   */
  type: 'Category';

  /**
   * URI reference to the code space/vocabulary
   */
  codeSpace?: {
    href: string;
  };

  /**
   * Constraint on allowed values
   */
  constraint?: AllowedValues;

  /**
   * Current value (code from vocabulary)
   */
  value?: string;
}

/**
 * Count component for integer values
 *
 * Counts represent discrete integer quantities without units.
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/Count.json
 */
export interface CountComponent extends AbstractSimpleComponent {
  /**
   * Always 'Count' for count components
   */
  type: 'Count';

  /**
   * Constraint on allowed values
   */
  constraint?: AllowedValues;

  /**
   * Current value
   */
  value?: number;
}

/**
 * Quantity component for continuous numeric values with units
 *
 * Quantities represent continuous scalar values expressed with a unit of measure.
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/Quantity.json
 */
export interface QuantityComponent extends AbstractSimpleComponent {
  /**
   * Always 'Quantity' for quantity components
   */
  type: 'Quantity';

  /**
   * Unit of measure (required)
   */
  uom: UnitReference;

  /**
   * Constraint on allowed values
   */
  constraint?: AllowedValues;

  /**
   * Current value
   */
  value?: number | string; // Can be special value like 'NaN', 'INF'
}

/**
 * Time component for temporal values
 *
 * Time components represent instants or durations in time, with various reference systems.
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/Time.json
 */
export interface TimeComponent extends AbstractSimpleComponent {
  /**
   * Always 'Time' for time components
   */
  type: 'Time';

  /**
   * Unit of measure for time (required if not using ISO string)
   */
  uom?: UnitReference;

  /**
   * Constraint on allowed time values
   */
  constraint?: AllowedTimes;

  /**
   * Time reference system
   * Common values: GPS, UTC, TAI, or ISO 8601 reference
   */
  referenceTime?: string;

  /**
   * Local frame for time reference
   */
  localFrame?: string;

  /**
   * Current value
   * Can be ISO 8601 string or numeric value with uom
   */
  value?: string | number;
}

/**
 * Union type for all simple components
 */
export type SimpleComponent =
  | BooleanComponent
  | TextComponent
  | CategoryComponent
  | CountComponent
  | QuantityComponent
  | TimeComponent;

/**
 * Type guard for Boolean component
 */
export function isBooleanComponent(
  component: unknown
): component is BooleanComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'Boolean'
  );
}

/**
 * Type guard for Text component
 */
export function isTextComponent(
  component: unknown
): component is TextComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'Text'
  );
}

/**
 * Type guard for Category component
 */
export function isCategoryComponent(
  component: unknown
): component is CategoryComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'Category'
  );
}

/**
 * Type guard for Count component
 */
export function isCountComponent(
  component: unknown
): component is CountComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'Count'
  );
}

/**
 * Type guard for Quantity component
 */
export function isQuantityComponent(
  component: unknown
): component is QuantityComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'Quantity'
  );
}

/**
 * Type guard for Time component
 */
export function isTimeComponent(
  component: unknown
): component is TimeComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'Time'
  );
}

/**
 * Type guard for any simple component
 */
export function isSimpleComponent(
  component: unknown
): component is SimpleComponent {
  return (
    isBooleanComponent(component) ||
    isTextComponent(component) ||
    isCategoryComponent(component) ||
    isCountComponent(component) ||
    isQuantityComponent(component) ||
    isTimeComponent(component)
  );
}
