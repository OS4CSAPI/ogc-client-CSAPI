/**
 * SensorML 3.0 Event Type
 *
 * Events represent occurrences that affect a system or process.
 * Based on OGC SensorML 3.0 Standard (OGC 23-000) Clause 8.7.
 *
 * @module sensorml/event
 */

import type { DescribedObject, Classifier, ValidTime } from './base-types';
import type { DerivedProperty } from './derived-property';

/**
 * Event interface
 *
 * Represents a significant occurrence that affects a system.
 * Examples: calibration, maintenance, failure, deployment, recovery.
 */
export interface Event extends DescribedObject {
  type: 'Event';

  /**
   * Classification of the event type
   * Examples: 'calibration', 'maintenance', 'failure', 'deployment'
   */
  classification?: Classifier[];

  /**
   * Time when the event occurred or period it affected
   */
  time: string | ValidTime;

  /**
   * Properties or characteristics affected by the event
   */
  property?: DerivedProperty[];
}

/**
 * Type guard for Event
 */
export function isEvent(obj: unknown): obj is Event {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'Event'
  );
}
