/**
 * System feature types for CSAPI
 *
 * Systems are the main resource type in CSAPI, representing sensors, platforms,
 * networks, or any physical or virtual entity that can produce observations.
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_systems_2
 */

import type { Geometry } from 'geojson';
import type {
  CSAPIFeature,
  CSAPIFeatureCollection,
  CSAPIFeatureProperties,
  DefinitionURI,
  Link,
  TimeExtent,
  UniqueID,
} from '../base-types.js';

/**
 * System type classification
 */
export type SystemType =
  | 'PhysicalSystem'
  | 'PhysicalComponent'
  | 'AggregateSystem'
  | 'SimpleProcess';

/**
 * Identification information for a system
 */
export interface SystemIdentification {
  /**
   * Manufacturer or organization
   */
  manufacturer?: string;

  /**
   * Model name or number
   */
  model?: string;

  /**
   * Serial number
   */
  serialNumber?: string;

  /**
   * Long name
   */
  longName?: string;

  /**
   * Short name
   */
  shortName?: string;
}

/**
 * Classification of a system
 */
export interface SystemClassification {
  /**
   * Definition URI for the classification
   */
  definition: DefinitionURI;

  /**
   * Label for the classification
   */
  label?: string;

  /**
   * Value or code
   */
  value?: string;
}

/**
 * Characteristics of a system
 */
export interface SystemCharacteristic {
  /**
   * Name of the characteristic
   */
  name: string;

  /**
   * Definition URI
   */
  definition?: DefinitionURI;

  /**
   * Label for display
   */
  label?: string;

  /**
   * Value of the characteristic
   */
  value: string | number | boolean;

  /**
   * Unit of measure
   */
  uom?: string;
}

/**
 * Capability of a system
 */
export interface SystemCapability {
  /**
   * Name of the capability
   */
  name: string;

  /**
   * Definition URI
   */
  definition?: DefinitionURI;

  /**
   * Label for display
   */
  label?: string;

  /**
   * Value of the capability
   */
  value?: string | number | boolean;

  /**
   * Conditions under which capability applies
   */
  condition?: string;
}

/**
 * Contact information
 */
export interface Contact {
  /**
   * Individual name
   */
  individualName?: string;

  /**
   * Organization name
   */
  organizationName?: string;

  /**
   * Position/role
   */
  positionName?: string;

  /**
   * Phone number
   */
  phone?: string;

  /**
   * Email address
   */
  email?: string;

  /**
   * Website URL
   */
  website?: string;

  /**
   * Delivery point (street address)
   */
  deliveryPoint?: string;

  /**
   * City
   */
  city?: string;

  /**
   * Administrative area (state/province)
   */
  administrativeArea?: string;

  /**
   * Postal code
   */
  postalCode?: string;

  /**
   * Country
   */
  country?: string;
}

/**
 * Properties specific to System features
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_system_resource
 */
export interface SystemFeatureProperties extends CSAPIFeatureProperties {
  /**
   * Always 'System' for system features
   */
  featureType: 'System';

  /**
   * System type classification
   */
  systemType?: SystemType;

  /**
   * Definition URI for the system type
   */
  definition?: DefinitionURI;

  /**
   * Identification information
   */
  identification?: SystemIdentification;

  /**
   * System classifications
   */
  classifications?: SystemClassification[];

  /**
   * System characteristics (permanent properties)
   */
  characteristics?: SystemCharacteristic[];

  /**
   * System capabilities (operational capabilities)
   */
  capabilities?: SystemCapability[];

  /**
   * Contact information
   */
  contacts?: Contact[];

  /**
   * ID of parent system (if this is a subsystem)
   */
  parent?: UniqueID;

  /**
   * IDs of subsystems
   */
  members?: UniqueID[];

  /**
   * IDs of associated procedures
   */
  procedures?: UniqueID[];

  /**
   * IDs of associated deployments
   */
  deployments?: UniqueID[];

  /**
   * IDs of associated sampling features
   */
  samplingFeatures?: UniqueID[];

  /**
   * IDs of datastreams produced by this system
   */
  datastreams?: UniqueID[];

  /**
   * IDs of control streams for this system
   */
  controlStreams?: UniqueID[];
}

/**
 * GeoJSON Feature representing a System
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_system_resource
 */
export interface SystemFeature
  extends CSAPIFeature<SystemFeatureProperties, Geometry | null> {
  properties: SystemFeatureProperties;
}

/**
 * GeoJSON FeatureCollection of Systems
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_systems_2
 */
export interface SystemFeatureCollection
  extends CSAPIFeatureCollection<SystemFeature> {
  features: SystemFeature[];
}

/**
 * Type guard to check if a feature is a System feature
 */
export function isSystemFeature(feature: unknown): feature is SystemFeature {
  return (
    typeof feature === 'object' &&
    feature !== null &&
    'type' in feature &&
    feature.type === 'Feature' &&
    'properties' in feature &&
    typeof feature.properties === 'object' &&
    feature.properties !== null &&
    'featureType' in feature.properties &&
    feature.properties.featureType === 'System'
  );
}

/**
 * Type guard to check if a collection is a System feature collection
 */
export function isSystemFeatureCollection(
  collection: unknown
): collection is SystemFeatureCollection {
  return (
    typeof collection === 'object' &&
    collection !== null &&
    'type' in collection &&
    collection.type === 'FeatureCollection' &&
    'features' in collection &&
    Array.isArray((collection as any).features) &&
    ((collection as any).features.length === 0 ||
      isSystemFeature((collection as any).features[0]))
  );
}
