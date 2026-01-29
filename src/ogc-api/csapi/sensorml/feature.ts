/**
 * SensorML 3.0 Feature Type
 *
 * Features represent real-world entities with properties and geometry.
 * Based on OGC SensorML 3.0 Standard (OGC 23-000) Clause 8.2.5.
 *
 * @module sensorml/feature
 */

import type { Geometry } from 'geojson';
import type { DescribedObject } from './base-types';

/**
 * Feature interface
 *
 * Represents a feature of interest or platform.
 */
export interface Feature extends DescribedObject {
  type: 'Feature';

  /**
   * Spatial extent or location
   */
  geometry?: Geometry;

  /**
   * Feature properties
   */
  properties?: Record<string, unknown>;
}

/**
 * Type guard for Feature
 */
export function isFeature(obj: unknown): obj is Feature {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'Feature'
  );
}
