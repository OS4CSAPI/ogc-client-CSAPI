/**
 * SensorML 3.0 Derived Property
 *
 * Describes properties derived from base properties (e.g., "hourly average temperature").
 * Based on OGC SensorML 3.0 Standard (OGC 23-000).
 */

/**
 * Derived property definition
 *
 * Used to define observable/controllable properties that are
 * derived from base properties with additional context:
 * - Object type (what is being measured)
 * - Statistic (how it's computed)
 *
 * Example: "Hourly Average CPU Temperature"
 * - baseProperty: http://qudt.org/vocab/quantitykind/Temperature
 * - objectType: http://dbpedia.org/resource/Central_processing_unit
 * - statistic: http://sensorml.com/ont/x-stats/HourlyMean
 */
export interface DerivedProperty {
  id?: string;
  label?: string;
  description?: string;
  baseProperty: string; // URI of base property
  objectType?: string; // URI of object type
  statistic?: string; // URI of statistic type
}

/**
 * Type guard for DerivedProperty
 */
export function isDerivedProperty(obj: unknown): obj is DerivedProperty {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'baseProperty' in obj &&
    typeof obj.baseProperty === 'string'
  );
}
