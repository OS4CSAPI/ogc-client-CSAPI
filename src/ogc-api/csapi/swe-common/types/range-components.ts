/**
 * Range component types for SWE Common
 *
 * Range components represent intervals or ranges of values, with minimum and maximum bounds.
 * They are used for constraints, value ranges, and interval specifications.
 *
 * @see https://docs.ogc.org/is/24-014/24-014.html Section 9.1
 */

import type {
  AbstractSimpleComponent,
  AllowedValues,
  UnitReference,
} from '../base-types.js';

/**
 * Category range representing an interval of categorical values
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/CategoryRange.json
 */
export interface CategoryRangeComponent extends AbstractSimpleComponent {
  /**
   * Always 'CategoryRange' for category range components
   */
  type: 'CategoryRange';

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
   * Current value as [min, max] pair
   */
  value?: [string, string];
}

/**
 * Count range representing an interval of integer values
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/CountRange.json
 */
export interface CountRangeComponent extends AbstractSimpleComponent {
  /**
   * Always 'CountRange' for count range components
   */
  type: 'CountRange';

  /**
   * Constraint on allowed values
   */
  constraint?: AllowedValues;

  /**
   * Current value as [min, max] pair
   */
  value?: [number, number];
}

/**
 * Quantity range representing an interval of continuous values with units
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/QuantityRange.json
 */
export interface QuantityRangeComponent extends AbstractSimpleComponent {
  /**
   * Always 'QuantityRange' for quantity range components
   */
  type: 'QuantityRange';

  /**
   * Unit of measure (required)
   */
  uom: UnitReference;

  /**
   * Constraint on allowed values
   */
  constraint?: AllowedValues;

  /**
   * Current value as [min, max] pair
   */
  value?: [number, number] | [string, string];
}

/**
 * Time range representing a temporal interval
 *
 * @see https://schemas.opengis.net/sweCommon/3.0/json/TimeRange.json
 */
export interface TimeRangeComponent extends AbstractSimpleComponent {
  /**
   * Always 'TimeRange' for time range components
   */
  type: 'TimeRange';

  /**
   * Unit of measure for time
   */
  uom?: UnitReference;

  /**
   * Constraint on allowed values
   */
  constraint?: AllowedValues;

  /**
   * Time reference system
   */
  referenceTime?: string;

  /**
   * Local frame for time reference
   */
  localFrame?: string;

  /**
   * Current value as [start, end] pair
   * Can be ISO 8601 strings or numeric values with uom
   */
  value?: [string, string] | [number, number];
}

/**
 * Union type for all range components
 */
export type RangeComponent =
  | CategoryRangeComponent
  | CountRangeComponent
  | QuantityRangeComponent
  | TimeRangeComponent;

/**
 * Type guard for CategoryRange component
 */
export function isCategoryRangeComponent(
  component: unknown
): component is CategoryRangeComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'CategoryRange'
  );
}

/**
 * Type guard for CountRange component
 */
export function isCountRangeComponent(
  component: unknown
): component is CountRangeComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'CountRange'
  );
}

/**
 * Type guard for QuantityRange component
 */
export function isQuantityRangeComponent(
  component: unknown
): component is QuantityRangeComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'QuantityRange'
  );
}

/**
 * Type guard for TimeRange component
 */
export function isTimeRangeComponent(
  component: unknown
): component is TimeRangeComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'TimeRange'
  );
}

/**
 * Type guard for any range component
 */
export function isRangeComponent(
  component: unknown
): component is RangeComponent {
  return (
    isCategoryRangeComponent(component) ||
    isCountRangeComponent(component) ||
    isQuantityRangeComponent(component) ||
    isTimeRangeComponent(component)
  );
}
