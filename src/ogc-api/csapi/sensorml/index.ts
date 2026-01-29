/**
 * SensorML 3.0 Types
 *
 * Complete type definitions for SensorML 3.0 JSON encoding.
 *
 * SensorML provides models for describing all types of sensors, actuators,
 * and processes. This implementation follows OGC SensorML 3.0 (OGC 23-000).
 *
 * Key concepts:
 * - **Processes**: Can be simple or aggregate, physical or non-physical
 * - **Physical Components**: Single devices with known location
 * - **Physical Systems**: Complex systems composed of multiple components
 * - **Deployments**: How systems are deployed in space and time
 * - **Derived Properties**: Properties derived from base properties with context
 *
 * @module sensorml
 */

// Base types
export * from './base-types';

// Process types
export * from './abstract-process';
export * from './simple-process';
export * from './aggregate-process';
export * from './abstract-physical-process';
export * from './physical-component';
export * from './physical-system';

// Deployment
export * from './deployment';

// Derived property
export * from './derived-property';

// Event
export * from './event';

// Link
export * from './link';

// Feature
export * from './feature';

// Observation
export * from './observation';

// Union types for convenience
import type { SimpleProcess } from './simple-process';
import type { AggregateProcess } from './aggregate-process';
import type { PhysicalComponent } from './physical-component';
import type { PhysicalSystem } from './physical-system';

/**
 * Any SensorML process type
 */
export type SensorMLProcess =
  | SimpleProcess
  | AggregateProcess
  | PhysicalComponent
  | PhysicalSystem;

/**
 * Any physical process (component or system)
 */
export type PhysicalProcess = PhysicalComponent | PhysicalSystem;

/**
 * Any non-physical process (simple or aggregate)
 */
export type NonPhysicalProcess = SimpleProcess | AggregateProcess;
