/**
 * SensorML 3.0 Physical Process Types
 * 
 * Base types for physical processes (components and systems).
 * Based on OGC SensorML 3.0 Standard (OGC 23-000).
 */

import type { Point } from 'geojson';
import type { AbstractProcess } from './abstract-process';
import type { XLink } from './base-types';
import type { TextComponent } from '../swe-common/types/simple-components';
import type { VectorComponent, DataRecordComponent } from '../swe-common/types/aggregate-components';
import type { DataArrayComponent } from '../swe-common/types/block-components';

/**
 * Spatial reference frame
 */
export interface SpatialFrame {
  label?: string;
  description?: string;
  origin: string;
  axes: Array<{
    name: string;
    description: string;
  }>;
}

/**
 * Temporal reference frame
 */
export interface TemporalFrame {
  label?: string;
  description?: string;
  origin: string;
}

/**
 * 3D Pose (based on GeoPose Basic-YPR or Basic-Quaternion)
 * Simplified representation - full implementation would require GeoPose types
 */
export interface Pose {
  position: {
    lat?: number;
    lon?: number;
    h?: number;
    x?: number;
    y?: number;
    z?: number;
  };
  orientation: {
    yaw?: number;
    pitch?: number;
    roll?: number;
    // Or quaternion
    x?: number;
    y?: number;
    z?: number;
    w?: number;
  };
}

/**
 * Position can be specified in multiple ways
 */
export type Position =
  | TextComponent // Textual description
  | Point // GeoJSON point
  | Pose // 3D pose
  | AbstractProcess // Process that computes position
  | XLink // Link to datastream
  | VectorComponent // @deprecated: Location vector
  | DataRecordComponent // @deprecated: Position data record
  | DataArrayComponent; // @deprecated: Trajectory

/**
 * Abstract physical process base interface
 * Physical processes have spatial/temporal location information
 */
export interface AbstractPhysicalProcess extends AbstractProcess {
  attachedTo?: XLink;
  localReferenceFrames?: SpatialFrame[];
  localTimeFrames?: TemporalFrame[];
  position?: Position;
  timePosition?: unknown; // Time position definition
}
