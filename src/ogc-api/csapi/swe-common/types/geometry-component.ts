/**
 * Geometry component types for SWE Common
 * 
 * Geometry components wrap GeoJSON geometry objects for use in SWE Common structures.
 * 
 * @see https://docs.ogc.org/is/24-014/24-014.html Section 9.5
 * @see https://schemas.opengis.net/sweCommon/3.0/json/Geometry.json
 */

import type { Geometry as GeoJSONGeometry } from 'geojson';
import type { AbstractDataComponent } from '../base-types.js';

/**
 * Geometry component wrapping a GeoJSON geometry
 * 
 * This allows embedding spatial geometries within SWE Common data structures.
 * 
 * @see https://schemas.opengis.net/sweCommon/3.0/json/Geometry.json
 */
export interface GeometryComponent extends AbstractDataComponent {
  /**
   * Always 'Geometry' for geometry components
   */
  type: 'Geometry';
  
  /**
   * Reference frame (CRS) for the geometry
   * Default is WGS84 (EPSG:4326)
   */
  referenceFrame?: string;
  
  /**
   * Local frame identifier
   */
  localFrame?: string;
  
  /**
   * The GeoJSON geometry object
   */
  value?: GeoJSONGeometry;
}

/**
 * Type guard for Geometry component
 */
export function isGeometryComponent(component: unknown): component is GeometryComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'type' in component &&
    component.type === 'Geometry'
  );
}
