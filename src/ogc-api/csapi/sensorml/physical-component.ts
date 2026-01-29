/**
 * SensorML 3.0 Physical Component
 *
 * A physical process that is not subdivided into smaller components.
 * Represents a single physical device (sensor, actuator, etc.) with a known location.
 *
 * Based on OGC SensorML 3.0 Standard (OGC 23-000).
 */

import type { AbstractPhysicalProcess } from './abstract-physical-process';
import type { ProcessMethod } from './base-types';

/**
 * Physical component (atomic physical device)
 *
 * Examples:
 * - A temperature sensor
 * - A GPS receiver
 * - A camera
 * - An actuator
 */
export interface PhysicalComponent extends AbstractPhysicalProcess {
  type: 'PhysicalComponent';
  method?: ProcessMethod;
}

/**
 * Type guard for PhysicalComponent
 */
export function isPhysicalComponent(obj: unknown): obj is PhysicalComponent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'PhysicalComponent'
  );
}
