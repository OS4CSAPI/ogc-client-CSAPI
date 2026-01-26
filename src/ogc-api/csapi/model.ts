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

  /** Filter by system ID(s) */
  id?: string | string[];

  /** Spatial filter: WKT geometry */
  geom?: string;

  /** Filter by feature of interest ID(s) */
  foi?: string | string[];

  /** Filter by parent system ID */
  parent?: string;

  /** Include subsystems recursively */
  recursive?: boolean;

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
  /** Maximum number of datastreams to return */
  limit?: number;

  /** Spatial filter: bounding box [west, south, east, north] */
  bbox?: BoundingBox;

  /** Temporal filter: datetime range */
  datetime?: DateTimeParameter;

  /** Filter by datastream ID(s) */
  id?: string | string[];

  /** Filter by observed property */
  observedProperty?: string;

  /** Temporal filter: phenomenon time range */
  phenomenonTime?: DateTimeParameter;
}

/**
 * Query options for Observations
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_observations_2
 */
export interface ObservationsQueryOptions {
  /** Maximum number of observations to return */
  limit?: number;

  /** Spatial filter: bounding box [west, south, east, north] */
  bbox?: BoundingBox;

  /** Temporal filter: datetime range */
  datetime?: DateTimeParameter;

  /** Filter by observation ID(s) */
  id?: string | string[];

  /** Temporal filter: phenomenon time range */
  phenomenonTime?: DateTimeParameter;

  /** Temporal filter: result time range */
  resultTime?: DateTimeParameter;

  /** Filter by observed property */
  observedProperty?: string;
}

/**
 * Query options for Control Streams
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_streams_2
 */
export interface ControlStreamsQueryOptions {
  /** Maximum number of control streams to return */
  limit?: number;

  /** Temporal filter: datetime range */
  datetime?: DateTimeParameter;

  /** Filter by control stream ID(s) */
  id?: string | string[];

  /** Filter by controlled property */
  controlledProperty?: string;

  /** Temporal filter: issue time range */
  issueTime?: DateTimeParameter;

  /** Temporal filter: execution time range */
  executionTime?: DateTimeParameter;
}

/**
 * Query options for Commands (sub-resource of Control Streams)
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_commands_2
 */
export interface CommandsQueryOptions {
  /** Maximum number of commands to return */
  limit?: number;

  /** Filter by command ID(s) */
  id?: string | string[];

  /** Temporal filter: issue time range */
  issueTime?: DateTimeParameter;

  /** Temporal filter: execution time range */
  executionTime?: DateTimeParameter;

  /** Filter by command status */
  status?: string;
}

/**
 * Query options for Sampling Features
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_features_2
 */
export interface SamplingFeaturesQueryOptions {
  /** Maximum number of sampling features to return */
  limit?: number;

  /** Spatial filter: bounding box [west, south, east, north] */
  bbox?: BoundingBox;

  /** Temporal filter: datetime range */
  datetime?: DateTimeParameter;

  /** Full-text search query */
  q?: string;

  /** Filter by sampling feature ID(s) */
  id?: string | string[];

  /** Spatial filter: WKT geometry */
  geom?: string;

  /** Filter by feature of interest ID(s) */
  foi?: string | string[];

  /** Filter by observed property */
  observedProperty?: string;

  /** Filter by controlled property */
  controlledProperty?: string;
}

/**
 * Query options for Properties
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_properties
 */
export interface PropertiesQueryOptions {
  /** Maximum number of properties to return */
  limit?: number;

  /** Full-text search query */
  q?: string;

  /** Filter by property ID(s) */
  id?: string | string[];

  /** Filter by base property ID(s) */
  baseProperty?: string | string[];

  /** Filter by object type(s) */
  objectType?: string | string[];
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

  /** Filter by procedure ID(s) */
  id?: string | string[];

  /** Temporal filter: datetime range */
  datetime?: DateTimeParameter;

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

  /** Filter by deployment ID(s) */
  id?: string | string[];

  /** Spatial filter: WKT geometry */
  geom?: string;

  /** Filter by feature of interest ID(s) */
  foi?: string | string[];

  /** Filter by parent deployment ID(s) */
  parent?: string | string[];

  /** Filter by parent system ID */
  system?: string;

  /** Filter by observed property */
  observedProperty?: string;

  /** Filter by controlled property */
  controlledProperty?: string;
}
