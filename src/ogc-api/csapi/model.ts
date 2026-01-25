import { BoundingBox, DateTimeParameter } from '../../shared/models.js';

/**
 * Resource types available in OGC API - Connected Systems
 */
export type CSAPIResourceType =
  | 'systems'
  | 'procedures'
  | 'deployments'
  | 'samplingFeatures'
  | 'properties'
  | 'datastreams'
  | 'observations'
  | 'commands'
  | 'controlStreams';

/**
 * Query options for Systems collection endpoint
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_systems_2
 */
export interface SystemsQueryOptions {
  /** Maximum number of systems to return */
  limit?: number;

  /** Spatial filter: bounding box [west, south, east, north] */
  bbox?: BoundingBox;

  /** Temporal filter: datetime range */
  datetime?: DateTimeParameter;

  /** Full-text search query */
  q?: string;

  /** Filter by parent system ID */
  parent?: string;

  /** Filter by procedure ID */
  procedure?: string;

  /** Filter by observed property */
  observedProperty?: string;

  /** Filter by controlled property */
  controlledProperty?: string;

  /** Filter by system kind/type */
  systemKind?: string;
}

/**
 * Query options for resource history endpoints
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#req_system-history
 */
export interface HistoryQueryOptions {
  /** Temporal filter for valid time */
  validTime?: DateTimeParameter;

  /** Maximum number of history entries */
  limit?: number;
}

/**
 * Query options for Datastreams
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastreams_2
 */
export interface DatastreamsQueryOptions {
  limit?: number;
  bbox?: BoundingBox;
  datetime?: DateTimeParameter;
  observedProperty?: string;
  phenomenonTime?: DateTimeParameter;
}

/**
 * Query options for Observations
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_observations_2
 */
export interface ObservationsQueryOptions {
  limit?: number;
  bbox?: BoundingBox;
  datetime?: DateTimeParameter;
  phenomenonTime?: DateTimeParameter;
  resultTime?: DateTimeParameter;
  observedProperty?: string;
}

/**
 * Query options for Control Streams
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_streams_2
 */
export interface ControlStreamsQueryOptions {
  limit?: number;
  datetime?: DateTimeParameter;
  controlledProperty?: string;
  issueTime?: DateTimeParameter;
  executionTime?: DateTimeParameter;
}

/**
 * Query options for Sampling Features
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_features_2
 */
export interface SamplingFeaturesQueryOptions {
  limit?: number;
  bbox?: BoundingBox;
  datetime?: DateTimeParameter;
  q?: string;
}

/**
 * Query options for Procedures collection endpoint
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedures_2
 */
export interface ProceduresQueryOptions {
  /** Maximum number of procedures to return */
  limit?: number;

  /** Full-text search query */
  q?: string;

  /** Filter by observed property */
  observedProperty?: string;

  /** Filter by controlled property */
  controlledProperty?: string;
}

/**
 * Query options for Deployments collection endpoint
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployments_2
 */
export interface DeploymentsQueryOptions {
  /** Maximum number of deployments to return */
  limit?: number;

  /** Spatial filter: bounding box [west, south, east, north] */
  bbox?: BoundingBox;

  /** Temporal filter: datetime range */
  datetime?: DateTimeParameter;

  /** Full-text search query */
  q?: string;

  /** Filter by parent system ID */
  system?: string;
}
