/**
 * Base types for CSAPI GeoJSON features
 *
 * CSAPI uses GeoJSON (RFC 7946) as one of its primary formats for resource representation.
 * All resources except Observations and Commands are represented as GeoJSON features.
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html (Part 1: Feature Resources)
 * @see https://tools.ietf.org/html/rfc7946 (GeoJSON Specification)
 */

import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';

/**
 * ISO 8601 datetime string
 */
export type ISODateTime = string;

/**
 * Time extent with start and end times
 * Used for validTime, phenomenonTime, resultTime, etc.
 */
export interface TimeExtent {
  /**
   * Start of time period (ISO 8601)
   */
  start?: ISODateTime;

  /**
   * End of time period (ISO 8601)
   */
  end?: ISODateTime;
}

/**
 * URI reference to an external definition or concept
 */
export type DefinitionURI = string;

/**
 * Unique identifier for a resource
 * Can be a URI, UUID, or other unique string
 */
export type UniqueID = string;

/**
 * Link object following RFC 8288 (Web Linking)
 */
export interface Link {
  /**
   * Link relation type
   */
  rel: string;

  /**
   * Target URI
   */
  href: string;

  /**
   * MIME type of the linked resource
   */
  type?: string;

  /**
   * Human-readable title
   */
  title?: string;

  /**
   * Language of the linked resource (RFC 5646)
   */
  hreflang?: string;
}

/**
 * Common properties shared by all CSAPI feature types
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_common_properties
 */
export interface CSAPIFeatureProperties {
  /**
   * Resource type discriminator
   * Examples: 'System', 'Deployment', 'Procedure', 'SamplingFeature', etc.
   */
  featureType: string;

  /**
   * Unique identifier for this resource
   * Required by CSAPI specification
   */
  uid: UniqueID;

  /**
   * Human-readable name
   */
  name?: string;

  /**
   * Detailed description
   */
  description?: string;

  /**
   * Time period during which this resource is/was valid
   */
  validTime?: TimeExtent;

  /**
   * Links to related resources (self, alternate, collection, etc.)
   */
  links?: Link[];
}

/**
 * Base type for all CSAPI GeoJSON features
 *
 * @template P - Properties type extending CSAPIFeatureProperties
 * @template G - Geometry type (defaults to any GeoJSON geometry)
 */
export interface CSAPIFeature<
  P extends CSAPIFeatureProperties = CSAPIFeatureProperties,
  G extends Geometry | null = Geometry | null
> extends Feature<G, P> {
  /**
   * Always 'Feature' for GeoJSON features
   */
  type: 'Feature';

  /**
   * Feature ID (may differ from properties.uid)
   */
  id?: string | number;

  /**
   * Geometry (can be null for features without location)
   */
  geometry: G;

  /**
   * CSAPI-specific properties
   */
  properties: P;
}

/**
 * Base type for CSAPI GeoJSON feature collections
 *
 * @template F - Feature type extending CSAPIFeature
 */
export interface CSAPIFeatureCollection<F extends CSAPIFeature = CSAPIFeature>
  extends FeatureCollection<F['geometry'], F['properties']> {
  /**
   * Always 'FeatureCollection'
   */
  type: 'FeatureCollection';

  /**
   * Array of features
   */
  features: F[];

  /**
   * Optional links for pagination and related resources
   */
  links?: Link[];

  /**
   * Number of features returned (may be less than total)
   */
  numberReturned?: number;

  /**
   * Total number of features available (if known)
   */
  numberMatched?: number;

  /**
   * Timestamp when collection was generated
   */
  timeStamp?: ISODateTime;
}

/**
 * Type guard to check if object is a CSAPI feature
 */
export function isCSAPIFeature(obj: unknown): obj is CSAPIFeature {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'Feature' &&
    'properties' in obj &&
    typeof obj.properties === 'object' &&
    obj.properties !== null &&
    'featureType' in obj.properties &&
    'uid' in obj.properties
  );
}

/**
 * Type guard to check if object is a CSAPI feature collection
 */
export function isCSAPIFeatureCollection(
  obj: unknown
): obj is CSAPIFeatureCollection {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    obj.type === 'FeatureCollection' &&
    'features' in obj &&
    Array.isArray((obj as any).features)
  );
}
