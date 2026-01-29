/**
 * SensorML 3.0 Deployment
 *
 * Describes the deployment of one or more systems for a particular purpose.
 * Based on OGC SensorML 3.0 Standard (OGC 23-000).
 */

import type { Geometry } from 'geojson';
import type {
  DescribedObject,
  XLink,
  ValidTime,
  Configuration,
} from './base-types';

/**
 * Deployed system with optional configuration
 */
export interface DeployedSystem {
  system: XLink;
  configuration?: Configuration;
}

/**
 * Deployment information
 *
 * Describes how systems are deployed, typically with:
 * - Temporal extent (when)
 * - Spatial extent (where)
 * - Platform information
 * - Configuration details
 */
export interface Deployment extends DescribedObject {
  type: 'Deployment';
  definition?: string;
  validTime?: ValidTime | string[];
  location?: Geometry;
  platform?: XLink;
  deployedSystems?: DeployedSystem[];
  // Link relations
  links?: XLink[];
}

/**
 * Type guard for Deployment
 */
export function isDeployment(obj: unknown): obj is Deployment {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'Deployment'
  );
}
