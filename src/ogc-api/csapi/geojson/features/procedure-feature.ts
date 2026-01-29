/**
 * Procedure feature types for CSAPI
 *
 * Procedures describe how observations are made or how control actions are performed.
 * They can include sensor descriptions, processing algorithms, or control protocols.
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedures_2
 */

import type { Geometry } from 'geojson';
import type {
  CSAPIFeature,
  CSAPIFeatureCollection,
  CSAPIFeatureProperties,
  DefinitionURI,
  UniqueID,
} from '../base-types.js';

/**
 * Type of procedure
 */
export type ProcedureType =
  | 'PhysicalProcess'
  | 'SimulationProcess'
  | 'AggregateProcess';

/**
 * Properties specific to Procedure features
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedure_resource
 */
export interface ProcedureFeatureProperties extends CSAPIFeatureProperties {
  /**
   * Always 'Procedure' for procedure features
   */
  featureType: 'Procedure';

  /**
   * Procedure type classification
   */
  procedureType?: ProcedureType;

  /**
   * Definition URI for the procedure
   */
  definition?: DefinitionURI;

  /**
   * IDs of systems that implement this procedure
   */
  implementedBy?: UniqueID[];

  /**
   * IDs of datastreams that use this procedure
   */
  datastreams?: UniqueID[];

  /**
   * IDs of control streams that use this procedure
   */
  controlStreams?: UniqueID[];

  /**
   * Input definitions (from SensorML)
   */
  inputs?: unknown;

  /**
   * Output definitions (from SensorML)
   */
  outputs?: unknown;

  /**
   * Parameter definitions (from SensorML)
   */
  parameters?: unknown;

  /**
   * Method description (from SensorML)
   */
  method?: unknown;

  /**
   * Component list (from SensorML)
   */
  components?: unknown[];

  /**
   * Connection definitions (from SensorML)
   */
  connections?: unknown[];
}

/**
 * GeoJSON Feature representing a Procedure
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedure_resource
 */
export interface ProcedureFeature
  extends CSAPIFeature<ProcedureFeatureProperties, Geometry | null> {
  properties: ProcedureFeatureProperties;
}

/**
 * GeoJSON FeatureCollection of Procedures
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedures_2
 */
export interface ProcedureFeatureCollection
  extends CSAPIFeatureCollection<ProcedureFeature> {
  features: ProcedureFeature[];
}

/**
 * Type guard to check if a feature is a Procedure feature
 */
export function isProcedureFeature(
  feature: unknown
): feature is ProcedureFeature {
  return (
    typeof feature === 'object' &&
    feature !== null &&
    'type' in feature &&
    feature.type === 'Feature' &&
    'properties' in feature &&
    typeof feature.properties === 'object' &&
    feature.properties !== null &&
    'featureType' in feature.properties &&
    feature.properties.featureType === 'Procedure'
  );
}

/**
 * Type guard to check if a collection is a Procedure feature collection
 */
export function isProcedureFeatureCollection(
  collection: unknown
): collection is ProcedureFeatureCollection {
  return (
    typeof collection === 'object' &&
    collection !== null &&
    'type' in collection &&
    collection.type === 'FeatureCollection' &&
    'features' in collection &&
    Array.isArray((collection as any).features) &&
    ((collection as any).features.length === 0 ||
      isProcedureFeature((collection as any).features[0]))
  );
}
