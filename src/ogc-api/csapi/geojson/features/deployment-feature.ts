/**
 * Deployment feature types for CSAPI
 * 
 * Deployments represent the act of deploying a system to a location for a specific
 * time period to perform observations or control actions.
 * 
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployments_2
 */

import type { Geometry } from 'geojson';
import type {
  CSAPIFeature,
  CSAPIFeatureCollection,
  CSAPIFeatureProperties,
  TimeExtent,
  UniqueID,
} from '../base-types.js';

/**
 * Platform information for a deployment
 */
export interface DeploymentPlatform {
  /**
   * ID of the platform system
   */
  uid: UniqueID;
  
  /**
   * Name of the platform
   */
  name?: string;
  
  /**
   * Type of platform (e.g., 'buoy', 'satellite', 'building')
   */
  type?: string;
}

/**
 * Properties specific to Deployment features
 * 
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployment_resource
 */
export interface DeploymentFeatureProperties extends CSAPIFeatureProperties {
  /**
   * Always 'Deployment' for deployment features
   */
  featureType: 'Deployment';
  
  /**
   * ID of the deployed system
   */
  system: UniqueID;
  
  /**
   * Platform where system is deployed (optional)
   */
  platform?: DeploymentPlatform;
  
  /**
   * Time period of deployment
   */
  deployedTime?: TimeExtent;
  
  /**
   * IDs of datastreams active during this deployment
   */
  datastreams?: UniqueID[];
  
  /**
   * IDs of control streams active during this deployment
   */
  controlStreams?: UniqueID[];
}

/**
 * GeoJSON Feature representing a Deployment
 * 
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployment_resource
 */
export interface DeploymentFeature
  extends CSAPIFeature<DeploymentFeatureProperties, Geometry | null> {
  properties: DeploymentFeatureProperties;
}

/**
 * GeoJSON FeatureCollection of Deployments
 * 
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployments_2
 */
export interface DeploymentFeatureCollection
  extends CSAPIFeatureCollection<DeploymentFeature> {
  features: DeploymentFeature[];
}

/**
 * Type guard to check if a feature is a Deployment feature
 */
export function isDeploymentFeature(feature: unknown): feature is DeploymentFeature {
  return (
    typeof feature === 'object' &&
    feature !== null &&
    'type' in feature &&
    feature.type === 'Feature' &&
    'properties' in feature &&
    typeof feature.properties === 'object' &&
    feature.properties !== null &&
    'featureType' in feature.properties &&
    feature.properties.featureType === 'Deployment'
  );
}

/**
 * Type guard to check if a collection is a Deployment feature collection
 */
export function isDeploymentFeatureCollection(
  collection: unknown
): collection is DeploymentFeatureCollection {
  return (
    typeof collection === 'object' &&
    collection !== null &&
    'type' in collection &&
    collection.type === 'FeatureCollection' &&
    'features' in collection &&
    Array.isArray((collection as any).features) &&
    ((collection as any).features.length === 0 ||
      isDeploymentFeature((collection as any).features[0]))
  );
}
