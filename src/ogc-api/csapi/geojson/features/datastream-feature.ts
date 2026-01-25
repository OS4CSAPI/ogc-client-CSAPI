/**
 * Datastream feature types for CSAPI
 * 
 * Datastreams represent a series of observations of a specific property
 * by a specific system over time. They define what is being observed,
 * how it's being observed, and provide metadata about the observation series.
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastreams_2
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
 * Schema reference for datastream results
 */
export interface DatastreamSchema {
  /**
   * Observation format (e.g., 'application/om+json', 'application/swe+json')
   */
  obsFormat?: string;
  
  /**
   * Link to result schema
   */
  resultSchema?: string;
  
  /**
   * Inline result schema (SWE Common structure)
   */
  resultSchemaObject?: unknown;
  
  /**
   * Link to encoding specification
   */
  resultEncoding?: string;
  
  /**
   * Inline encoding specification
   */
  resultEncodingObject?: unknown;
}

/**
 * Properties specific to Datastream features
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastream_resource
 */
export interface DatastreamFeatureProperties extends CSAPIFeatureProperties {
  /**
   * Always 'Datastream' for datastream features
   */
  featureType: 'Datastream';
  
  /**
   * ID of the system producing observations
   */
  system: UniqueID;
  
  /**
   * ID of the deployment (if observations are from a specific deployment)
   */
  deployment?: UniqueID;
  
  /**
   * ID of the procedure used to make observations
   */
  procedure?: UniqueID;
  
  /**
   * ID of the observed property
   */
  observedProperty: UniqueID;
  
  /**
   * Definition URI for the observed property
   */
  observedPropertyDefinition?: DefinitionURI;
  
  /**
   * ID of the sampling feature being observed
   */
  samplingFeature?: UniqueID;
  
  /**
   * Time extent of all observations in this datastream
   */
  phenomenonTime?: TimeExtent;
  
  /**
   * Time extent of when observations were recorded
   */
  resultTime?: TimeExtent;
  
  /**
   * Schema and encoding information for observations
   */
  schema?: DatastreamSchema;
  
  /**
   * Number of observations in this datastream
   */
  observationCount?: number;
}

/**
 * GeoJSON Feature representing a Datastream
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastream_resource
 */
export interface DatastreamFeature
  extends CSAPIFeature<DatastreamFeatureProperties, Geometry | null> {
  properties: DatastreamFeatureProperties;
}

/**
 * GeoJSON FeatureCollection of Datastreams
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastreams_2
 */
export interface DatastreamFeatureCollection
  extends CSAPIFeatureCollection<DatastreamFeature> {
  features: DatastreamFeature[];
}

/**
 * Type guard to check if a feature is a Datastream feature
 */
export function isDatastreamFeature(feature: unknown): feature is DatastreamFeature {
  return (
    typeof feature === 'object' &&
    feature !== null &&
    'type' in feature &&
    feature.type === 'Feature' &&
    'properties' in feature &&
    typeof feature.properties === 'object' &&
    feature.properties !== null &&
    'featureType' in feature.properties &&
    feature.properties.featureType === 'Datastream'
  );
}

/**
 * Type guard to check if a collection is a Datastream feature collection
 */
export function isDatastreamFeatureCollection(
  collection: unknown
): collection is DatastreamFeatureCollection {
  return (
    typeof collection === 'object' &&
    collection !== null &&
    'type' in collection &&
    collection.type === 'FeatureCollection' &&
    'features' in collection &&
    Array.isArray((collection as any).features) &&
    ((collection as any).features.length === 0 ||
      isDatastreamFeature((collection as any).features[0]))
  );
}
