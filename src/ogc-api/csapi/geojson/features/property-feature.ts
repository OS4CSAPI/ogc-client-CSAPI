/**
 * Property feature types for CSAPI
 * 
 * Properties represent observable or controllable properties of systems,
 * such as temperature, pressure, speed, or any other measurable/controllable characteristic.
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_properties_2
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
 * Properties specific to Property features
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_property_resource
 */
export interface PropertyFeatureProperties extends CSAPIFeatureProperties {
  /**
   * Always 'Property' for property features
   */
  featureType: 'Property';
  
  /**
   * Definition URI for the property (e.g., from ontology)
   */
  definition: DefinitionURI;
  
  /**
   * Label for display
   */
  label?: string;
  
  /**
   * IDs of datastreams observing this property
   */
  observedBy?: UniqueID[];
  
  /**
   * IDs of control streams controlling this property
   */
  controlledBy?: UniqueID[];
}

/**
 * GeoJSON Feature representing a Property
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_property_resource
 */
export interface PropertyFeature
  extends CSAPIFeature<PropertyFeatureProperties, Geometry | null> {
  properties: PropertyFeatureProperties;
}

/**
 * GeoJSON FeatureCollection of Properties
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_properties_2
 */
export interface PropertyFeatureCollection
  extends CSAPIFeatureCollection<PropertyFeature> {
  features: PropertyFeature[];
}

/**
 * Type guard to check if a feature is a Property feature
 */
export function isPropertyFeature(feature: unknown): feature is PropertyFeature {
  return (
    typeof feature === 'object' &&
    feature !== null &&
    'type' in feature &&
    feature.type === 'Feature' &&
    'properties' in feature &&
    typeof feature.properties === 'object' &&
    feature.properties !== null &&
    'featureType' in feature.properties &&
    feature.properties.featureType === 'Property'
  );
}

/**
 * Type guard to check if a collection is a Property feature collection
 */
export function isPropertyFeatureCollection(
  collection: unknown
): collection is PropertyFeatureCollection {
  return (
    typeof collection === 'object' &&
    collection !== null &&
    'type' in collection &&
    collection.type === 'FeatureCollection' &&
    'features' in collection &&
    Array.isArray((collection as any).features) &&
    ((collection as any).features.length === 0 ||
      isPropertyFeature((collection as any).features[0]))
  );
}
