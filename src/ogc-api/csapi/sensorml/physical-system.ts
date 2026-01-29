/**
 * SensorML 3.0 Physical System
 *
 * A physical process composed of multiple physical and/or non-physical components.
 * Represents a complex system (e.g., weather station, UAV, robot) with sub-components.
 *
 * Based on OGC SensorML 3.0 Standard (OGC 23-000).
 */

import type { AbstractPhysicalProcess } from './abstract-physical-process';
import type { ComponentProperty, Connection } from './aggregate-process';

/**
 * Physical system (composite physical device with components)
 *
 * Examples:
 * - Weather station with multiple sensors
 * - UAV with IMU, GPS, camera
 * - Robot with multiple actuators and sensors
 * - Sensor network
 */
export interface PhysicalSystem extends AbstractPhysicalProcess {
  type: 'PhysicalSystem';
  components?: ComponentProperty[];
  connections?: Connection[];
}

/**
 * Type guard for PhysicalSystem
 */
export function isPhysicalSystem(obj: unknown): obj is PhysicalSystem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'PhysicalSystem'
  );
}
