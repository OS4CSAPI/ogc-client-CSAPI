/**
 * Observation types for CSAPI
 * 
 * Observations are NOT GeoJSON features. They represent individual measurements
 * or observations made by a system, following the O&M (Observations & Measurements)
 * standard. Observations use SWE Common data structures for results.
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_observations_2
 */

import type {
  DefinitionURI,
  ISODateTime,
  Link,
  TimeExtent,
  UniqueID,
} from '../base-types.js';

/**
 * Individual Observation (NOT a GeoJSON feature)
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_observation_resource
 */
export interface Observation {
  /**
   * Unique identifier for this observation
   */
  id?: UniqueID;
  
  /**
   * Type identifier (often 'Observation' or specific subtype)
   */
  type?: string;
  
  /**
   * ID of the datastream this observation belongs to
   */
  datastream: UniqueID;
  
  /**
   * Time when the observation was made (phenomenon time)
   */
  phenomenonTime: ISODateTime | TimeExtent;
  
  /**
   * Time when the result was generated/recorded
   */
  resultTime?: ISODateTime;
  
  /**
   * Time period during which result is valid
   */
  validTime?: TimeExtent;
  
  /**
   * Parameters that influenced the observation
   */
  parameters?: Record<string, unknown>;
  
  /**
   * The actual observation result
   * Structure depends on datastream schema (SWE Common types)
   */
  result: unknown;
  
  /**
   * Quality assessment of the observation
   */
  resultQuality?: unknown;
  
  /**
   * Links to related resources
   */
  links?: Link[];
}

/**
 * Collection of Observations (NOT a GeoJSON FeatureCollection)
 * 
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_observations_2
 */
export interface ObservationCollection {
  /**
   * Type identifier
   */
  type?: string;
  
  /**
   * Array of observations
   */
  observations: Observation[];
  
  /**
   * Links for pagination and related resources
   */
  links?: Link[];
  
  /**
   * Number of observations returned
   */
  numberReturned?: number;
  
  /**
   * Total number of observations available
   */
  numberMatched?: number;
  
  /**
   * Timestamp when collection was generated
   */
  timeStamp?: ISODateTime;
}

/**
 * Type guard to check if object is an Observation
 */
export function isObservation(obj: unknown): obj is Observation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'datastream' in obj &&
    'phenomenonTime' in obj &&
    'result' in obj
  );
}

/**
 * Type guard to check if object is an Observation Collection
 */
export function isObservationCollection(obj: unknown): obj is ObservationCollection {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'observations' in obj &&
    Array.isArray((obj as any).observations)
  );
}
