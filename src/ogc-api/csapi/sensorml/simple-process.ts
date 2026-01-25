/**
 * SensorML 3.0 Simple Process
 * 
 * A process that is not subdivided into components.
 * Based on OGC SensorML 3.0 Standard (OGC 23-000).
 */

import type { AbstractProcess } from './abstract-process';
import type { ProcessMethod } from './base-types';

/**
 * Simple process (non-physical, no sub-components)
 */
export interface SimpleProcess extends AbstractProcess {
  type: 'SimpleProcess';
  method?: ProcessMethod;
}

/**
 * Type guard for SimpleProcess
 */
export function isSimpleProcess(obj: unknown): obj is SimpleProcess {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'SimpleProcess'
  );
}
