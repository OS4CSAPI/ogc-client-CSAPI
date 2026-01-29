/**
 * Sampling Feature types for CSAPI
 *
 * Sampling Features represent the features of interest that are being observed,
 * such as measurement stations, sampling points, or areas of interest.
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_features_2
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
 * Type of sampling feature
 */
export type SamplingFeatureType =
  | 'SamplingPoint'
  | 'SamplingCurve'
  | 'SamplingSurface'
  | 'SamplingSolid'
  | 'SamplingSpecimen';

/**
 * Properties specific to Sampling Feature features
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_feature_resource
 */
export interface SamplingFeatureProperties extends CSAPIFeatureProperties {
  /**
   * Always 'SamplingFeature' for sampling feature features
   */
  featureType: 'SamplingFeature';

  /**
   * Sampling feature type classification
   */
  samplingFeatureType?: SamplingFeatureType;

  /**
   * Definition URI for the feature type
   */
  definition?: DefinitionURI;

  /**
   * ID of the feature of interest being sampled
   */
  sampledFeature?: UniqueID;

  /**
   * IDs of systems observing this feature
   */
  samplingBy?: UniqueID[];

  /**
   * IDs of datastreams associated with this feature
   */
  datastreams?: UniqueID[];
}

/**
 * GeoJSON Feature representing a Sampling Feature
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_feature_resource
 */
export interface SamplingFeature
  extends CSAPIFeature<SamplingFeatureProperties, Geometry | null> {
  properties: SamplingFeatureProperties;
}

/**
 * GeoJSON FeatureCollection of Sampling Features
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_features_2
 */
export interface SamplingFeatureCollection
  extends CSAPIFeatureCollection<SamplingFeature> {
  features: SamplingFeature[];
}

/**
 * Type guard to check if a feature is a Sampling Feature
 */
export function isSamplingFeature(
  feature: unknown
): feature is SamplingFeature {
  return (
    typeof feature === 'object' &&
    feature !== null &&
    'type' in feature &&
    feature.type === 'Feature' &&
    'properties' in feature &&
    typeof feature.properties === 'object' &&
    feature.properties !== null &&
    'featureType' in feature.properties &&
    feature.properties.featureType === 'SamplingFeature'
  );
}

/**
 * Type guard to check if a collection is a Sampling Feature collection
 */
export function isSamplingFeatureCollection(
  collection: unknown
): collection is SamplingFeatureCollection {
  return (
    typeof collection === 'object' &&
    collection !== null &&
    'type' in collection &&
    collection.type === 'FeatureCollection' &&
    'features' in collection &&
    Array.isArray((collection as any).features) &&
    ((collection as any).features.length === 0 ||
      isSamplingFeature((collection as any).features[0]))
  );
}
