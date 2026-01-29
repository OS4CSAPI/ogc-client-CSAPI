/**
 * SensorML 3.0 Aggregate Process
 *
 * A process composed of multiple sub-processes with data connections.
 * Based on OGC SensorML 3.0 Standard (OGC 23-000).
 */

import type { AbstractProcess } from './abstract-process';
import type { PathRef, XLink, SoftNamedProperty } from './base-types';

/**
 * A component in the component list
 * Can be any type of process or a link to one
 */
export interface ComponentProperty extends SoftNamedProperty {
  // The component can be inline or a reference
  component: AbstractProcess | XLink;
}

/**
 * Data connection between components
 */
export interface Connection {
  source: PathRef;
  destination: PathRef;
}

/**
 * Aggregate process (non-physical, has sub-components and connections)
 */
export interface AggregateProcess extends AbstractProcess {
  type: 'AggregateProcess';
  components?: ComponentProperty[];
  connections?: Connection[];
}

/**
 * Type guard for AggregateProcess
 */
export function isAggregateProcess(obj: unknown): obj is AggregateProcess {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'AggregateProcess'
  );
}
