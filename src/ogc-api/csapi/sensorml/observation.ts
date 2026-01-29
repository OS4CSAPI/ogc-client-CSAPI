/**
 * SensorML 3.0 Observation Type
 *
 * Observations represent the result of a measurement or observation event.
 * Based on OGC SensorML 3.0 Standard (OGC 23-000) Clause 8.2.6.
 *
 * @module sensorml/observation
 */

import type { DescribedObject } from './base-types';

/**
 * Observation interface
 *
 * Represents an observation or measurement result.
 * Follows O&M (Observations & Measurements) model.
 */
export interface Observation extends DescribedObject {
  type: 'Observation';

  /**
   * Phenomenon time - when the observation was made
   */
  phenomenonTime: string;

  /**
   * Result time - when the result was produced
   */
  resultTime?: string;

  /**
   * Procedure used to make the observation (reference to a process)
   */
  procedure: string;

  /**
   * Observed property (what was measured)
   */
  observedProperty: string;

  /**
   * Feature of interest (what was observed)
   */
  featureOfInterest: string;

  /**
   * The observation result
   */
  result: unknown;
}

/**
 * Type guard for Observation
 */
export function isObservation(obj: unknown): obj is Observation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'Observation'
  );
}
