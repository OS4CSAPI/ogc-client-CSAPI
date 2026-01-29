/**
 * Control Stream feature types for CSAPI
 *
 * Control Streams represent a series of commands sent to control a specific property
 * of a system over time. They define what is being controlled, how it's being controlled,
 * and provide metadata about the command series.
 *
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_streams_2
 */

import type { Geometry } from 'geojson';
import type {
  CSAPIFeature,
  CSAPIFeatureCollection,
  CSAPIFeatureProperties,
  DefinitionURI,
  TimeExtent,
  UniqueID,
} from '../base-types.js';

/**
 * Schema reference for control stream commands
 */
export interface ControlStreamSchema {
  /**
   * Command format (e.g., 'application/swe+json')
   */
  commandFormat?: string;

  /**
   * Link to command schema
   */
  commandSchema?: string;

  /**
   * Inline command schema (SWE Common structure)
   */
  commandSchemaObject?: unknown;

  /**
   * Link to encoding specification
   */
  commandEncoding?: string;

  /**
   * Inline encoding specification
   */
  commandEncodingObject?: unknown;
}

/**
 * Properties specific to Control Stream features
 *
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_stream_resource
 */
export interface ControlStreamFeatureProperties extends CSAPIFeatureProperties {
  /**
   * Always 'ControlStream' for control stream features
   */
  featureType: 'ControlStream';

  /**
   * ID of the system being controlled
   */
  system: UniqueID;

  /**
   * ID of the deployment (if commands are for a specific deployment)
   */
  deployment?: UniqueID;

  /**
   * ID of the procedure used to generate commands
   */
  procedure?: UniqueID;

  /**
   * ID of the controlled property
   */
  controlledProperty: UniqueID;

  /**
   * Definition URI for the controlled property
   */
  controlledPropertyDefinition?: DefinitionURI;

  /**
   * Time extent of when commands are issued
   */
  issueTime?: TimeExtent;

  /**
   * Time extent of when commands are executed
   */
  executionTime?: TimeExtent;

  /**
   * Schema and encoding information for commands
   */
  schema?: ControlStreamSchema;

  /**
   * Number of commands in this control stream
   */
  commandCount?: number;
}

/**
 * GeoJSON Feature representing a Control Stream
 *
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_stream_resource
 */
export interface ControlStreamFeature
  extends CSAPIFeature<ControlStreamFeatureProperties, Geometry | null> {
  properties: ControlStreamFeatureProperties;
}

/**
 * GeoJSON FeatureCollection of Control Streams
 *
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_streams_2
 */
export interface ControlStreamFeatureCollection
  extends CSAPIFeatureCollection<ControlStreamFeature> {
  features: ControlStreamFeature[];
}

/**
 * Type guard to check if a feature is a Control Stream feature
 */
export function isControlStreamFeature(
  feature: unknown
): feature is ControlStreamFeature {
  return (
    typeof feature === 'object' &&
    feature !== null &&
    'type' in feature &&
    feature.type === 'Feature' &&
    'properties' in feature &&
    typeof feature.properties === 'object' &&
    feature.properties !== null &&
    'featureType' in feature.properties &&
    feature.properties.featureType === 'ControlStream'
  );
}

/**
 * Type guard to check if a collection is a Control Stream feature collection
 */
export function isControlStreamFeatureCollection(
  collection: unknown
): collection is ControlStreamFeatureCollection {
  return (
    typeof collection === 'object' &&
    collection !== null &&
    'type' in collection &&
    collection.type === 'FeatureCollection' &&
    'features' in collection &&
    Array.isArray((collection as any).features) &&
    ((collection as any).features.length === 0 ||
      isControlStreamFeature((collection as any).features[0]))
  );
}
