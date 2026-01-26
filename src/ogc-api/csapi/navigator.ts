import { BoundingBox, DateTimeParameter } from '../../shared/models.js';
import { OgcApiCollectionInfo } from '../model.js';
import {
  CSAPIResourceType,
  CommandsQueryOptions,
  ControlStreamsQueryOptions,
  DatastreamsQueryOptions,
  DeploymentsQueryOptions,
  HistoryQueryOptions,
  ObservationsQueryOptions,
  ProceduresQueryOptions,
  PropertiesQueryOptions,
  SamplingFeaturesQueryOptions,
  SystemEventsQueryOptions,
  SystemsQueryOptions,
} from './model.js';

/**
 * Navigator for OGC API - Connected Systems resources.
 * Provides URL construction for CRUD operations on Systems, Deployments,
 * Procedures, Sampling Features, Properties, Datastreams, Observations,
 * Commands, and Control Streams.
 *
 * @see https://docs.ogc.org/is/23-001r2/23-001r2.html (Part 1)
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html (Part 2)
 */
export default class CSAPINavigator {
  private collection: OgcApiCollectionInfo;
  private baseUrl: string;

  // Capabilities extracted from collection metadata
  public supportedFormats: Set<string>;
  public supportedCrs: string[];
  public availableResources: Set<CSAPIResourceType>;

  constructor(collection: OgcApiCollectionInfo) {
    this.collection = collection;
    this.baseUrl = this._extractBaseUrl(collection);
    this.supportedFormats = this._extractFormats(collection);
    this.supportedCrs = (collection.crs as string[]) || [];
    this.availableResources = this._extractAvailableResources(collection);
  }

  // ========================================
  // SYSTEMS RESOURCE (Part 1: Section 8.3)
  // ========================================

  /**
   * Build URL to get all systems in the collection.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_systems_2
   *
   * @param options Query parameters for filtering/pagination
   * @returns URL string for GET request
   */
  getSystemsUrl(options: SystemsQueryOptions = {}): string {
    this._checkResourceAvailable('systems');
    const url = new URL(`${this.baseUrl}/systems`);

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.bbox !== undefined) {
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.q !== undefined) {
      url.searchParams.set('q', options.q);
    }
    if (options.id !== undefined) {
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    }
    if (options.geom !== undefined) {
      url.searchParams.set('geom', options.geom);
    }
    if (options.foi !== undefined) {
      url.searchParams.set(
        'foi',
        Array.isArray(options.foi) ? options.foi.join(',') : options.foi
      );
    }
    if (options.parent !== undefined) {
      url.searchParams.set('parent', options.parent);
    }
    if (options.recursive !== undefined) {
      url.searchParams.set('recursive', options.recursive.toString());
    }
    if (options.procedure !== undefined) {
      url.searchParams.set('procedure', options.procedure);
    }
    if (options.observedProperty !== undefined) {
      url.searchParams.set('observedProperty', options.observedProperty);
    }
    if (options.controlledProperty !== undefined) {
      url.searchParams.set('controlledProperty', options.controlledProperty);
    }
    if (options.systemKind !== undefined) {
      url.searchParams.set('systemKind', options.systemKind);
    }

    return url.toString();
  }

  /**
   * Build URL to get a specific system by ID.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_system_resource
   *
   * @param systemId Unique identifier of the system
   * @param format Optional format (defaults to JSON)
   * @returns URL string for GET request
   */
  getSystemUrl(systemId: string, format?: string): string {
    this._checkResourceAvailable('systems');
    return this._buildResourceUrl('systems', systemId, format);
  }

  /**
   * Build URL to create a new system.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_systems_3
   *
   * @returns URL string for POST request (body contains system description)
   */
  createSystemUrl(): string {
    this._checkResourceAvailable('systems');
    return `${this.baseUrl}/systems`;
  }

  /**
   * Build URL to fully update a system (replace).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_system_resource_2
   *
   * @param systemId Unique identifier of the system
   * @returns URL string for PUT request (body contains full system description)
   */
  updateSystemUrl(systemId: string): string {
    this._checkResourceAvailable('systems');
    return `${this.baseUrl}/systems/${encodeURIComponent(systemId)}`;
  }

  /**
   * Build URL to partially update a system (modify specific fields).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_system_resource_2
   *
   * @param systemId Unique identifier of the system
   * @returns URL string for PATCH request (body contains partial updates)
   */
  patchSystemUrl(systemId: string): string {
    this._checkResourceAvailable('systems');
    return `${this.baseUrl}/systems/${encodeURIComponent(systemId)}`;
  }

  /**
   * Build URL to delete a system.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_system_resource_3
   *
   * @param systemId Unique identifier of the system
   * @param cascade If true, cascade delete to related resources (Part 2: Section 10.5)
   * @returns URL string for DELETE request
   */
  deleteSystemUrl(systemId: string, cascade?: boolean): string {
    this._checkResourceAvailable('systems');
    const url = new URL(
      `${this.baseUrl}/systems/${encodeURIComponent(systemId)}`
    );
    if (cascade !== undefined) {
      url.searchParams.set('cascade', cascade.toString());
    }
    return url.toString();
  }

  /**
   * Build URL to get the history of a system (all versions).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#req_system-history
   *
   * @param systemId Unique identifier of the system
   * @param options Query parameters for filtering history
   * @returns URL string for GET request
   */
  getSystemHistoryUrl(
    systemId: string,
    options: HistoryQueryOptions = {}
  ): string {
    this._checkResourceAvailable('systems');
    const url = new URL(
      `${this.baseUrl}/systems/${encodeURIComponent(systemId)}/history`
    );

    if (options.validTime !== undefined) {
      url.searchParams.set(
        'validTime',
        this._serializeDatetime(options.validTime)
      );
    }
    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }

    return url.toString();
  }

  // ========================================
  // SUB-RESOURCES OF SYSTEMS
  // ========================================

  /**
   * Build URL to get all subsystems of a parent system.
   *
   * @param parentSystemId ID of the parent system
   * @param options Query parameters
   * @returns URL string for GET request
   */
  getSubsystemsUrl(
    parentSystemId: string,
    options: SystemsQueryOptions = {}
  ): string {
    this._checkResourceAvailable('systems');
    const url = new URL(
      `${this.baseUrl}/systems/${encodeURIComponent(parentSystemId)}/subsystems`
    );
    return this._applySystemsQuery(url, options).toString();
  }

  /**
   * Build URL to get all sampling features associated with a system.
   *
   * @param systemId ID of the system
   * @param options Query parameters
   * @returns URL string for GET request
   */
  getSystemSamplingFeaturesUrl(
    systemId: string,
    options: SamplingFeaturesQueryOptions = {}
  ): string {
    this._checkResourceAvailable('systems');
    this._checkResourceAvailable('samplingFeatures');
    const url = new URL(
      `${this.baseUrl}/systems/${encodeURIComponent(systemId)}/samplingFeatures`
    );
    return this._applySamplingFeaturesQuery(url, options).toString();
  }

  /**
   * Build URL to get all datastreams of a system.
   *
   * @param systemId ID of the system
   * @param options Query parameters
   * @returns URL string for GET request
   */
  getSystemDatastreamsUrl(
    systemId: string,
    options: DatastreamsQueryOptions = {}
  ): string {
    this._checkResourceAvailable('systems');
    this._checkResourceAvailable('datastreams');
    const url = new URL(
      `${this.baseUrl}/systems/${encodeURIComponent(systemId)}/datastreams`
    );
    return this._applyDatastreamsQuery(url, options).toString();
  }

  /**
   * Build URL to get all control streams of a system.
   *
   * @param systemId ID of the system
   * @param options Query parameters
   * @returns URL string for GET request
   */
  getSystemControlStreamsUrl(
    systemId: string,
    options: ControlStreamsQueryOptions = {}
  ): string {
    this._checkResourceAvailable('systems');
    this._checkResourceAvailable('controlStreams');
    const url = new URL(
      `${this.baseUrl}/systems/${encodeURIComponent(systemId)}/controlStreams`
    );
    return this._applyControlStreamsQuery(url, options).toString();
  }

  /**
   * Build URL to get all deployments associated with a system.
   *
   * @param systemId ID of the system
   * @param options Query parameters
   * @returns URL string for GET request
   */
  getSystemDeploymentsUrl(
    systemId: string,
    options: DeploymentsQueryOptions = {}
  ): string {
    this._checkResourceAvailable('systems');
    this._checkResourceAvailable('deployments');
    const url = new URL(
      `${this.baseUrl}/systems/${encodeURIComponent(systemId)}/deployments`
    );
    return this._applyDeploymentsQuery(url, options).toString();
  }

  /**
   * Build URL to get all procedures associated with a system.
   *
   * @param systemId ID of the system
   * @param options Query parameters
   * @returns URL string for GET request
   */
  getSystemProceduresUrl(
    systemId: string,
    options: ProceduresQueryOptions = {}
  ): string {
    this._checkResourceAvailable('systems');
    this._checkResourceAvailable('procedures');
    const url = new URL(
      `${this.baseUrl}/systems/${encodeURIComponent(systemId)}/procedures`
    );
    return this._applyProceduresQuery(url, options).toString();
  }

  // ========================================
  // PROCEDURES RESOURCE (Part 1: Section 8.4)
  // ========================================

  /**
   * Build URL to get all procedures in the collection.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedures_2
   *
   * @param options Query parameters for filtering/pagination
   * @returns URL string for GET request
   */
  getProceduresUrl(options: ProceduresQueryOptions = {}): string {
    this._checkResourceAvailable('procedures');
    const url = new URL(`${this.baseUrl}/procedures`);

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.q !== undefined) {
      url.searchParams.set('q', options.q);
    }
    if (options.id !== undefined) {
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.observedProperty !== undefined) {
      url.searchParams.set('observedProperty', options.observedProperty);
    }
    if (options.controlledProperty !== undefined) {
      url.searchParams.set('controlledProperty', options.controlledProperty);
    }

    return url.toString();
  }

  /**
   * Build URL to get a specific procedure by ID.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedure_resource
   *
   * @param procedureId Unique identifier of the procedure
   * @param format Optional format (defaults to JSON)
   * @returns URL string for GET request
   */
  getProcedureUrl(procedureId: string, format?: string): string {
    this._checkResourceAvailable('procedures');
    return this._buildResourceUrl('procedures', procedureId, format);
  }

  /**
   * Build URL to create a new procedure.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedures_3
   *
   * @returns URL string for POST request (body contains procedure description)
   */
  createProcedureUrl(): string {
    this._checkResourceAvailable('procedures');
    return `${this.baseUrl}/procedures`;
  }

  /**
   * Build URL to fully update a procedure (replace).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedure_resource_2
   *
   * @param procedureId Unique identifier of the procedure
   * @returns URL string for PUT request (body contains full procedure description)
   */
  updateProcedureUrl(procedureId: string): string {
    this._checkResourceAvailable('procedures');
    return `${this.baseUrl}/procedures/${encodeURIComponent(procedureId)}`;
  }

  /**
   * Build URL to partially update a procedure (modify specific fields).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedure_resource_2
   *
   * @param procedureId Unique identifier of the procedure
   * @returns URL string for PATCH request (body contains partial updates)
   */
  patchProcedureUrl(procedureId: string): string {
    this._checkResourceAvailable('procedures');
    return `${this.baseUrl}/procedures/${encodeURIComponent(procedureId)}`;
  }

  /**
   * Build URL to delete a procedure.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_procedure_resource_3
   *
   * @param procedureId Unique identifier of the procedure
   * @param cascade If true, cascade delete to related resources (Part 2: Section 10.5)
   * @returns URL string for DELETE request
   */
  deleteProcedureUrl(procedureId: string, cascade?: boolean): string {
    this._checkResourceAvailable('procedures');
    const url = new URL(
      `${this.baseUrl}/procedures/${encodeURIComponent(procedureId)}`
    );
    if (cascade !== undefined) {
      url.searchParams.set('cascade', cascade.toString());
    }
    return url.toString();
  }

  /**
   * Build URL to get the history of a procedure (all versions).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#req_procedure-history
   *
   * @param procedureId Unique identifier of the procedure
   * @param options Query parameters for filtering history
   * @returns URL string for GET request
   */
  getProcedureHistoryUrl(
    procedureId: string,
    options: HistoryQueryOptions = {}
  ): string {
    this._checkResourceAvailable('procedures');
    const url = new URL(
      `${this.baseUrl}/procedures/${encodeURIComponent(procedureId)}/history`
    );

    if (options.validTime !== undefined) {
      url.searchParams.set(
        'validTime',
        this._serializeDatetime(options.validTime)
      );
    }
    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }

    return url.toString();
  }

  // ========================================
  // DEPLOYMENTS RESOURCE (Part 1: Section 8.5)
  // ========================================

  /**
   * Build URL to get all deployments in the collection.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployments_2
   *
   * @param options Query parameters for filtering/pagination
   * @returns URL string for GET request
   */
  getDeploymentsUrl(options: DeploymentsQueryOptions = {}): string {
    this._checkResourceAvailable('deployments');
    const url = new URL(`${this.baseUrl}/deployments`);

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.bbox !== undefined) {
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.q !== undefined) {
      url.searchParams.set('q', options.q);
    }
    if (options.id !== undefined) {
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    }
    if (options.geom !== undefined) {
      url.searchParams.set('geom', options.geom);
    }
    if (options.foi !== undefined) {
      url.searchParams.set(
        'foi',
        Array.isArray(options.foi) ? options.foi.join(',') : options.foi
      );
    }
    if (options.parent !== undefined) {
      url.searchParams.set(
        'parent',
        Array.isArray(options.parent) ? options.parent.join(',') : options.parent
      );
    }
    if (options.system !== undefined) {
      url.searchParams.set('system', options.system);
    }
    if (options.observedProperty !== undefined) {
      url.searchParams.set('observedProperty', options.observedProperty);
    }
    if (options.controlledProperty !== undefined) {
      url.searchParams.set('controlledProperty', options.controlledProperty);
    }

    return url.toString();
  }

  /**
   * Build URL to get a specific deployment by ID.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployment_resource
   *
   * @param deploymentId Unique identifier of the deployment
   * @param format Optional format (defaults to JSON)
   * @returns URL string for GET request
   */
  getDeploymentUrl(deploymentId: string, format?: string): string {
    this._checkResourceAvailable('deployments');
    return this._buildResourceUrl('deployments', deploymentId, format);
  }

  /**
   * Build URL to create a new deployment.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployments_3
   *
   * @returns URL string for POST request (body contains deployment description)
   */
  createDeploymentUrl(): string {
    this._checkResourceAvailable('deployments');
    return `${this.baseUrl}/deployments`;
  }

  /**
   * Build URL to fully update a deployment (replace).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployment_resource_2
   *
   * @param deploymentId Unique identifier of the deployment
   * @returns URL string for PUT request (body contains full deployment description)
   */
  updateDeploymentUrl(deploymentId: string): string {
    this._checkResourceAvailable('deployments');
    return `${this.baseUrl}/deployments/${encodeURIComponent(deploymentId)}`;
  }

  /**
   * Build URL to partially update a deployment (modify specific fields).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployment_resource_2
   *
   * @param deploymentId Unique identifier of the deployment
   * @returns URL string for PATCH request (body contains partial updates)
   */
  patchDeploymentUrl(deploymentId: string): string {
    this._checkResourceAvailable('deployments');
    return `${this.baseUrl}/deployments/${encodeURIComponent(deploymentId)}`;
  }

  /**
   * Build URL to delete a deployment.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_deployment_resource_3
   *
   * @param deploymentId Unique identifier of the deployment
   * @param cascade If true, cascade delete to related resources (Part 2: Section 10.5)
   * @returns URL string for DELETE request
   */
  deleteDeploymentUrl(deploymentId: string, cascade?: boolean): string {
    this._checkResourceAvailable('deployments');
    const url = new URL(
      `${this.baseUrl}/deployments/${encodeURIComponent(deploymentId)}`
    );
    if (cascade !== undefined) {
      url.searchParams.set('cascade', cascade.toString());
    }
    return url.toString();
  }

  /**
   * Build URL to get the history of a deployment (all versions).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#req_deployment-history
   *
   * @param deploymentId Unique identifier of the deployment
   * @param options Query parameters for filtering history
   * @returns URL string for GET request
   */
  getDeploymentHistoryUrl(
    deploymentId: string,
    options: HistoryQueryOptions = {}
  ): string {
    this._checkResourceAvailable('deployments');
    const url = new URL(
      `${this.baseUrl}/deployments/${encodeURIComponent(deploymentId)}/history`
    );

    if (options.validTime !== undefined) {
      url.searchParams.set(
        'validTime',
        this._serializeDatetime(options.validTime)
      );
    }
    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }

    return url.toString();
  }

  // ========================================
  // SUB-RESOURCES OF DEPLOYMENTS
  // ========================================

  /**
   * Build URL to get all subdeployments of a parent deployment.
   * @see OpenAPI spec: /deployments/{deploymentId}/subdeployments
   *
   * @param parentDeploymentId ID of the parent deployment
   * @param options Query parameters
   * @returns URL string for GET request
   */
  getSubdeploymentsUrl(
    parentDeploymentId: string,
    options: DeploymentsQueryOptions = {}
  ): string {
    this._checkResourceAvailable('deployments');
    const url = new URL(
      `${this.baseUrl}/deployments/${encodeURIComponent(parentDeploymentId)}/subdeployments`
    );

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.bbox !== undefined) {
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.q !== undefined) {
      url.searchParams.set('q', options.q);
    }
    if (options.system !== undefined) {
      url.searchParams.set('system', options.system);
    }

    return url.toString();
  }

  /**
   * Build URL to create a new subdeployment under a parent deployment.
   * @see OpenAPI spec: POST /deployments/{deploymentId}/subdeployments
   *
   * @param parentDeploymentId ID of the parent deployment
   * @returns URL string for POST request (body contains subdeployment description)
   */
  createSubdeploymentUrl(parentDeploymentId: string): string {
    this._checkResourceAvailable('deployments');
    return `${this.baseUrl}/deployments/${encodeURIComponent(parentDeploymentId)}/subdeployments`;
  }

  // ========================================
  // SAMPLING FEATURES RESOURCE (Part 1: Section 8.6)
  // ========================================

  /**
   * Build URL to get all sampling features in the collection.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_features_2
   *
   * @param options Query parameters for filtering/pagination
   * @returns URL string for GET request
   */
  getSamplingFeaturesUrl(options: SamplingFeaturesQueryOptions = {}): string {
    this._checkResourceAvailable('samplingFeatures');
    const url = new URL(`${this.baseUrl}/samplingFeatures`);

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.bbox !== undefined) {
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.q !== undefined) {
      url.searchParams.set('q', options.q);
    }
    if (options.id !== undefined) {
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    }
    if (options.geom !== undefined) {
      url.searchParams.set('geom', options.geom);
    }
    if (options.foi !== undefined) {
      url.searchParams.set(
        'foi',
        Array.isArray(options.foi) ? options.foi.join(',') : options.foi
      );
    }
    if (options.observedProperty !== undefined) {
      url.searchParams.set('observedProperty', options.observedProperty);
    }
    if (options.controlledProperty !== undefined) {
      url.searchParams.set('controlledProperty', options.controlledProperty);
    }

    return url.toString();
  }

  /**
   * Build URL to get a specific sampling feature by ID.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_feature_resource
   *
   * @param samplingFeatureId Unique identifier of the sampling feature
   * @param format Optional format (defaults to JSON)
   * @returns URL string for GET request
   */
  getSamplingFeatureUrl(samplingFeatureId: string, format?: string): string {
    this._checkResourceAvailable('samplingFeatures');
    return this._buildResourceUrl('samplingFeatures', samplingFeatureId, format);
  }

  /**
   * Build URL to create a new sampling feature.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_features_3
   *
   * @returns URL string for POST request (body contains sampling feature description)
   */
  createSamplingFeatureUrl(): string {
    this._checkResourceAvailable('samplingFeatures');
    return `${this.baseUrl}/samplingFeatures`;
  }

  /**
   * Build URL to fully update a sampling feature (replace).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_feature_resource_2
   *
   * @param samplingFeatureId Unique identifier of the sampling feature
   * @returns URL string for PUT request (body contains full sampling feature description)
   */
  updateSamplingFeatureUrl(samplingFeatureId: string): string {
    this._checkResourceAvailable('samplingFeatures');
    return `${this.baseUrl}/samplingFeatures/${encodeURIComponent(samplingFeatureId)}`;
  }

  /**
   * Build URL to partially update a sampling feature (modify specific fields).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_feature_resource_2
   *
   * @param samplingFeatureId Unique identifier of the sampling feature
   * @returns URL string for PATCH request (body contains partial updates)
   */
  patchSamplingFeatureUrl(samplingFeatureId: string): string {
    this._checkResourceAvailable('samplingFeatures');
    return `${this.baseUrl}/samplingFeatures/${encodeURIComponent(samplingFeatureId)}`;
  }

  /**
   * Build URL to delete a sampling feature.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_sampling_feature_resource_3
   *
   * @param samplingFeatureId Unique identifier of the sampling feature
   * @param cascade If true, cascade delete to related resources (Part 2: Section 10.5)
   * @returns URL string for DELETE request
   */
  deleteSamplingFeatureUrl(samplingFeatureId: string, cascade?: boolean): string {
    this._checkResourceAvailable('samplingFeatures');
    const url = new URL(
      `${this.baseUrl}/samplingFeatures/${encodeURIComponent(samplingFeatureId)}`
    );
    if (cascade !== undefined) {
      url.searchParams.set('cascade', cascade.toString());
    }
    return url.toString();
  }

  /**
   * Build URL to get the history of a sampling feature (all versions).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#req_samplingfeature-history
   *
   * @param samplingFeatureId Unique identifier of the sampling feature
   * @param options Query parameters for filtering history
   * @returns URL string for GET request
   */
  getSamplingFeatureHistoryUrl(
    samplingFeatureId: string,
    options: HistoryQueryOptions = {}
  ): string {
    this._checkResourceAvailable('samplingFeatures');
    const url = new URL(
      `${this.baseUrl}/samplingFeatures/${encodeURIComponent(samplingFeatureId)}/history`
    );

    if (options.validTime !== undefined) {
      url.searchParams.set(
        'validTime',
        this._serializeDatetime(options.validTime)
      );
    }
    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }

    return url.toString();
  }

  // ========================================
  // DATASTREAMS RESOURCE (Part 2: Section 8.2)
  // ========================================

  /**
   * Build URL to get all datastreams in the collection.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastreams_2
   *
   * @param options Query parameters for filtering/pagination
   * @returns URL string for GET request
   */
  getDatastreamsUrl(options: DatastreamsQueryOptions = {}): string {
    this._checkResourceAvailable('datastreams');
    const url = new URL(`${this.baseUrl}/datastreams`);

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.bbox !== undefined) {
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.id !== undefined) {
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    }
    if (options.observedProperty !== undefined) {
      url.searchParams.set('observedProperty', options.observedProperty);
    }
    if (options.phenomenonTime !== undefined) {
      url.searchParams.set('phenomenonTime', this._serializeDatetime(options.phenomenonTime));
    }

    return url.toString();
  }

  /**
   * Build URL to get a specific datastream by ID.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastream_resource
   *
   * @param datastreamId Unique identifier of the datastream
   * @param format Optional format (defaults to JSON)
   * @returns URL string for GET request
   */
  getDatastreamUrl(datastreamId: string, format?: string): string {
    this._checkResourceAvailable('datastreams');
    return this._buildResourceUrl('datastreams', datastreamId, format);
  }

  /**
   * Build URL to create a new datastream.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastreams_3
   *
   * @returns URL string for POST request (body contains datastream description)
   */
  createDatastreamUrl(): string {
    this._checkResourceAvailable('datastreams');
    return `${this.baseUrl}/datastreams`;
  }

  /**
   * Build URL to fully update a datastream (replace).
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastream_resource_2
   *
   * @param datastreamId Unique identifier of the datastream
   * @returns URL string for PUT request (body contains full datastream description)
   */
  updateDatastreamUrl(datastreamId: string): string {
    this._checkResourceAvailable('datastreams');
    return `${this.baseUrl}/datastreams/${encodeURIComponent(datastreamId)}`;
  }

  /**
   * Build URL to partially update a datastream (modify specific fields).
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastream_resource_2
   *
   * @param datastreamId Unique identifier of the datastream
   * @returns URL string for PATCH request (body contains partial updates)
   */
  patchDatastreamUrl(datastreamId: string): string {
    this._checkResourceAvailable('datastreams');
    return `${this.baseUrl}/datastreams/${encodeURIComponent(datastreamId)}`;
  }

  /**
   * Build URL to delete a datastream.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_datastream_resource_3
   *
   * @param datastreamId Unique identifier of the datastream
   * @param cascade If true, cascade delete to related resources (Part 2: Section 10.5)
   * @returns URL string for DELETE request
   */
  deleteDatastreamUrl(datastreamId: string, cascade?: boolean): string {
    this._checkResourceAvailable('datastreams');
    const url = new URL(
      `${this.baseUrl}/datastreams/${encodeURIComponent(datastreamId)}`
    );
    if (cascade !== undefined) {
      url.searchParams.set('cascade', cascade.toString());
    }
    return url.toString();
  }

  /**
   * Build URL to get the history of a datastream (all versions).
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#req_datastream-history
   *
   * @param datastreamId Unique identifier of the datastream
   * @param options Query parameters for filtering history
   * @returns URL string for GET request
   */
  getDatastreamHistoryUrl(
    datastreamId: string,
    options: HistoryQueryOptions = {}
  ): string {
    this._checkResourceAvailable('datastreams');
    const url = new URL(
      `${this.baseUrl}/datastreams/${encodeURIComponent(datastreamId)}/history`
    );

    if (options.validTime !== undefined) {
      url.searchParams.set(
        'validTime',
        this._serializeDatetime(options.validTime)
      );
    }
    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }

    return url.toString();
  }

  /**
   * Build URL to get the schema of a datastream (observation schema).
   * @see https://docs.ogc.org/is/23-002/23-002.html#_datastream_schema
   *
   * @param datastreamId Unique identifier of the datastream
   * @returns URL string for GET request
   */
  getDatastreamSchemaUrl(datastreamId: string): string {
    this._checkResourceAvailable('datastreams');
    return `${this.baseUrl}/datastreams/${encodeURIComponent(datastreamId)}/schema`;
  }

  /**
   * Build URL to get observations for a specific datastream.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_observations_3
   *
   * @param datastreamId Unique identifier of the datastream
   * @param options Query parameters for filtering observations
   * @returns URL string for GET request
   */
  getDatastreamObservationsUrl(
    datastreamId: string,
    options: ObservationsQueryOptions = {}
  ): string {
    this._checkResourceAvailable('datastreams');
    const url = new URL(
      `${this.baseUrl}/datastreams/${encodeURIComponent(datastreamId)}/observations`
    );

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.bbox !== undefined) {
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.phenomenonTime !== undefined) {
      url.searchParams.set('phenomenonTime', this._serializeDatetime(options.phenomenonTime));
    }
    if (options.resultTime !== undefined) {
      url.searchParams.set('resultTime', this._serializeDatetime(options.resultTime));
    }
    if (options.observedProperty !== undefined) {
      url.searchParams.set('observedProperty', options.observedProperty);
    }
    if (options.foi !== undefined) {
      url.searchParams.set(
        'foi',
        Array.isArray(options.foi) ? options.foi.join(',') : options.foi
      );
    }
    if (options.sender !== undefined) {
      url.searchParams.set('sender', options.sender);
    }
    if (options.geom !== undefined) {
      url.searchParams.set('geom', options.geom);
    }

    return url.toString();
  }

  // ========================================
  // OBSERVATIONS RESOURCE (Part 2: Section 8.3)
  // ========================================

  /**
   * Build URL to get all observations in the collection.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_observations_2
   *
   * @param options Query parameters for filtering/pagination
   * @returns URL string for GET request
   */
  getObservationsUrl(options: ObservationsQueryOptions = {}): string {
    this._checkResourceAvailable('observations');
    const url = new URL(`${this.baseUrl}/observations`);

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.bbox !== undefined) {
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.id !== undefined) {
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    }
    if (options.phenomenonTime !== undefined) {
      url.searchParams.set('phenomenonTime', this._serializeDatetime(options.phenomenonTime));
    }
    if (options.resultTime !== undefined) {
      url.searchParams.set('resultTime', this._serializeDatetime(options.resultTime));
    }
    if (options.observedProperty !== undefined) {
      url.searchParams.set('observedProperty', options.observedProperty);
    }
    if (options.foi !== undefined) {
      url.searchParams.set(
        'foi',
        Array.isArray(options.foi) ? options.foi.join(',') : options.foi
      );
    }
    if (options.sender !== undefined) {
      url.searchParams.set('sender', options.sender);
    }
    if (options.geom !== undefined) {
      url.searchParams.set('geom', options.geom);
    }

    return url.toString();
  }

  /**
   * Build URL to get a specific observation by ID.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_observation_resource
   *
   * @param observationId Unique identifier of the observation
   * @param format Optional format (defaults to JSON)
   * @returns URL string for GET request
   */
  getObservationUrl(observationId: string, format?: string): string {
    this._checkResourceAvailable('observations');
    return this._buildResourceUrl('observations', observationId, format);
  }

  /**
   * Build URL to create new observations (batch insert).
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_observations_3
   *
   * @returns URL string for POST request (body contains observation data)
   */
  createObservationsUrl(): string {
    this._checkResourceAvailable('observations');
    return `${this.baseUrl}/observations`;
  }

  /**
   * Build URL to delete an observation.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_observation_resource_2
   *
   * @param observationId Unique identifier of the observation
   * @param cascade If true, cascade delete to related resources (Part 2: Section 10.5)
   * @returns URL string for DELETE request
   */
  deleteObservationUrl(observationId: string, cascade?: boolean): string {
    this._checkResourceAvailable('observations');
    const url = new URL(
      `${this.baseUrl}/observations/${encodeURIComponent(observationId)}`
    );
    if (cascade !== undefined) {
      url.searchParams.set('cascade', cascade.toString());
    }
    return url.toString();
  }

  // ========================================
  // CONTROL STREAMS RESOURCE (Part 2: Section 8.4)
  // ========================================

  /**
   * Build URL to get all control streams in the collection.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_streams_2
   *
   * @param options Query parameters for filtering/pagination
   * @returns URL string for GET request
   */
  getControlStreamsUrl(options: ControlStreamsQueryOptions = {}): string {
    this._checkResourceAvailable('controlStreams');
    const url = new URL(`${this.baseUrl}/controlStreams`);

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.id !== undefined) {
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    }
    if (options.controlledProperty !== undefined) {
      url.searchParams.set('controlledProperty', options.controlledProperty);
    }
    if (options.issueTime !== undefined) {
      url.searchParams.set('issueTime', this._serializeDatetime(options.issueTime));
    }
    if (options.executionTime !== undefined) {
      url.searchParams.set('executionTime', this._serializeDatetime(options.executionTime));
    }

    return url.toString();
  }

  /**
   * Build URL to get a specific control stream by ID.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_stream_resource
   *
   * @param controlStreamId Unique identifier of the control stream
   * @param format Optional format (defaults to JSON)
   * @returns URL string for GET request
   */
  getControlStreamUrl(controlStreamId: string, format?: string): string {
    this._checkResourceAvailable('controlStreams');
    return this._buildResourceUrl('controlStreams', controlStreamId, format);
  }

  /**
   * Build URL to create a new control stream.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_streams_3
   *
   * @returns URL string for POST request (body contains control stream description)
   */
  createControlStreamUrl(): string {
    this._checkResourceAvailable('controlStreams');
    return `${this.baseUrl}/controlStreams`;
  }

  /**
   * Build URL to fully update a control stream (replace).
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_stream_resource_2
   *
   * @param controlStreamId Unique identifier of the control stream
   * @returns URL string for PUT request (body contains full control stream description)
   */
  updateControlStreamUrl(controlStreamId: string): string {
    this._checkResourceAvailable('controlStreams');
    return `${this.baseUrl}/controlStreams/${encodeURIComponent(controlStreamId)}`;
  }

  /**
   * Build URL to partially update a control stream (modify specific fields).
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_stream_resource_2
   *
   * @param controlStreamId Unique identifier of the control stream
   * @returns URL string for PATCH request (body contains partial updates)
   */
  patchControlStreamUrl(controlStreamId: string): string {
    this._checkResourceAvailable('controlStreams');
    return `${this.baseUrl}/controlStreams/${encodeURIComponent(controlStreamId)}`;
  }

  /**
   * Build URL to delete a control stream.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_control_stream_resource_3
   *
   * @param controlStreamId Unique identifier of the control stream
   * @param cascade If true, cascade delete to related resources (Part 2: Section 10.5)
   * @returns URL string for DELETE request
   */
  deleteControlStreamUrl(controlStreamId: string, cascade?: boolean): string {
    this._checkResourceAvailable('controlStreams');
    const url = new URL(
      `${this.baseUrl}/controlStreams/${encodeURIComponent(controlStreamId)}`
    );
    if (cascade !== undefined) {
      url.searchParams.set('cascade', cascade.toString());
    }
    return url.toString();
  }

  /**
   * Build URL to get the history of a control stream (all versions).
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#req_controlstream-history
   *
   * @param controlStreamId Unique identifier of the control stream
   * @param options Query parameters for filtering history
   * @returns URL string for GET request
   */
  getControlStreamHistoryUrl(
    controlStreamId: string,
    options: HistoryQueryOptions = {}
  ): string {
    this._checkResourceAvailable('controlStreams');
    const url = new URL(
      `${this.baseUrl}/controlStreams/${encodeURIComponent(controlStreamId)}/history`
    );

    if (options.validTime !== undefined) {
      url.searchParams.set(
        'validTime',
        this._serializeDatetime(options.validTime)
      );
    }
    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }

    return url.toString();
  }

  /**
   * Build URL to get the schema of a control stream (command schema).
   * @see https://docs.ogc.org/is/23-002/23-002.html#_control_stream_schema
   *
   * @param controlStreamId Unique identifier of the control stream
   * @returns URL string for GET request
   */
  getControlStreamSchemaUrl(controlStreamId: string): string {
    this._checkResourceAvailable('controlStreams');
    return `${this.baseUrl}/controlStreams/${encodeURIComponent(controlStreamId)}/schema`;
  }

  /**
   * Build URL to get commands for a specific control stream.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_commands_2
   *
   * @param controlStreamId Unique identifier of the control stream
   * @param options Query parameters for filtering commands
   * @returns URL string for GET request
   */
  getControlStreamCommandsUrl(
    controlStreamId: string,
    options: CommandsQueryOptions = {}
  ): string {
    this._checkResourceAvailable('controlStreams');
    const url = new URL(
      `${this.baseUrl}/controlStreams/${encodeURIComponent(controlStreamId)}/commands`
    );

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.id !== undefined) {
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    }
    if (options.issueTime !== undefined) {
      url.searchParams.set('issueTime', this._serializeDatetime(options.issueTime));
    }
    if (options.executionTime !== undefined) {
      url.searchParams.set('executionTime', this._serializeDatetime(options.executionTime));
    }
    if (options.status !== undefined) {
      url.searchParams.set('status', options.status);
    }

    return url.toString();
  }

  /**
   * Build URL to issue a command to a control stream.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_commands_3
   *
   * @param controlStreamId Unique identifier of the control stream
   * @returns URL string for POST request (body contains command data)
   */
  issueCommandUrl(controlStreamId: string): string {
    this._checkResourceAvailable('controlStreams');
    return `${this.baseUrl}/controlStreams/${encodeURIComponent(controlStreamId)}/commands`;
  }

  /**
   * Build URL to get a specific command by ID.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_command_resource
   *
   * @param controlStreamId Unique identifier of the control stream
   * @param commandId Unique identifier of the command
   * @param format Optional format (defaults to JSON)
   * @returns URL string for GET request
   */
  getCommandUrl(
    controlStreamId: string,
    commandId: string,
    format?: string
  ): string {
    this._checkResourceAvailable('controlStreams');
    let url = `${this.baseUrl}/controlStreams/${encodeURIComponent(controlStreamId)}/commands/${encodeURIComponent(commandId)}`;
    if (format) {
      url += `?f=${encodeURIComponent(format)}`;
    }
    return url;
  }

  /**
   * Build URL to update the status of a command.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_command_resource_2
   *
   * @param controlStreamId Unique identifier of the control stream
   * @param commandId Unique identifier of the command
   * @returns URL string for PATCH request (body contains status update)
   */
  updateCommandStatusUrl(
    controlStreamId: string,
    commandId: string
  ): string {
    this._checkResourceAvailable('controlStreams');
    return `${this.baseUrl}/controlStreams/${encodeURIComponent(controlStreamId)}/commands/${encodeURIComponent(commandId)}`;
  }

  /**
   * Build URL to cancel a command.
   * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_command_resource_3
   *
   * @param controlStreamId Unique identifier of the control stream
   * @param commandId Unique identifier of the command
   * @returns URL string for DELETE request
   */
  cancelCommandUrl(
    controlStreamId: string,
    commandId: string
  ): string {
    this._checkResourceAvailable('controlStreams');
    return `${this.baseUrl}/controlStreams/${encodeURIComponent(controlStreamId)}/commands/${encodeURIComponent(commandId)}`;
  }

  // ========================================
  // PROPERTIES RESOURCE (Part 1: Section 8.7)
  // ========================================

  /**
   * Build URL to get all properties in the collection.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_properties
   *
   * @param options Query parameters for filtering/pagination
   * @returns URL string for GET request
   */
  getPropertiesUrl(options: PropertiesQueryOptions = {}): string {
    this._checkResourceAvailable('properties');
    const url = new URL(`${this.baseUrl}/properties`);

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.q !== undefined) {
      url.searchParams.set('q', options.q);
    }
    if (options.id !== undefined) {
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    }
    if (options.baseProperty !== undefined) {
      url.searchParams.set(
        'baseProperty',
        Array.isArray(options.baseProperty)
          ? options.baseProperty.join(',')
          : options.baseProperty
      );
    }
    if (options.objectType !== undefined) {
      url.searchParams.set(
        'objectType',
        Array.isArray(options.objectType)
          ? options.objectType.join(',')
          : options.objectType
      );
    }

    return url.toString();
  }

  /**
   * Build URL to get a specific property by ID.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_property_resource
   *
   * @param propertyId Unique identifier of the property
   * @param format Optional format (defaults to JSON)
   * @returns URL string for GET request
   */
  getPropertyUrl(propertyId: string, format?: string): string {
    this._checkResourceAvailable('properties');
    return this._buildResourceUrl('properties', propertyId, format);
  }

  /**
   * Build URL to create a new property.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_properties_2
   *
   * @returns URL string for POST request (body contains property definition)
   */
  createPropertyUrl(): string {
    this._checkResourceAvailable('properties');
    return `${this.baseUrl}/properties`;
  }

  /**
   * Build URL to fully update a property (replace).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_property_resource_2
   *
   * @param propertyId Unique identifier of the property
   * @returns URL string for PUT request (body contains full property definition)
   */
  updatePropertyUrl(propertyId: string): string {
    this._checkResourceAvailable('properties');
    return `${this.baseUrl}/properties/${encodeURIComponent(propertyId)}`;
  }

  /**
   * Build URL to partially update a property (modify specific fields).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_property_resource_2
   *
   * @param propertyId Unique identifier of the property
   * @returns URL string for PATCH request (body contains partial updates)
   */
  patchPropertyUrl(propertyId: string): string {
    this._checkResourceAvailable('properties');
    return `${this.baseUrl}/properties/${encodeURIComponent(propertyId)}`;
  }

  /**
   * Build URL to delete a property.
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#_property_resource_3
   *
   * @param propertyId Unique identifier of the property
   * @param cascade If true, cascade delete to related resources (Part 2: Section 10.5)
   * @returns URL string for DELETE request
   */
  deletePropertyUrl(propertyId: string, cascade?: boolean): string {
    this._checkResourceAvailable('properties');
    const url = new URL(
      `${this.baseUrl}/properties/${encodeURIComponent(propertyId)}`
    );
    if (cascade !== undefined) {
      url.searchParams.set('cascade', cascade.toString());
    }
    return url.toString();
  }

  /**
   * Build URL to get the history of a property (all versions).
   * @see https://docs.ogc.org/is/23-001r2/23-001r2.html#req_property-history
   *
   * @param propertyId Unique identifier of the property
   * @param options Query parameters for filtering history
   * @returns URL string for GET request
   */
  getPropertyHistoryUrl(
    propertyId: string,
    options: HistoryQueryOptions = {}
  ): string {
    this._checkResourceAvailable('properties');
    const url = new URL(
      `${this.baseUrl}/properties/${encodeURIComponent(propertyId)}/history`
    );

    if (options.validTime !== undefined) {
      url.searchParams.set(
        'validTime',
        this._serializeDatetime(options.validTime)
      );
    }
    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }

    return url.toString();
  }

  // ========================================
  // SYSTEM EVENTS RESOURCE (Part 2: Section 12)
  // ========================================

  /**
   * Build URL to get all system events in the collection.
   * @see https://docs.ogc.org/is/23-002/23-002.html#_system_events_2
   *
   * @param options Query parameters for filtering/pagination
   * @returns URL string for GET request
   */
  getSystemEventsUrl(options: SystemEventsQueryOptions = {}): string {
    this._checkResourceAvailable('systemEvents');
    const url = new URL(`${this.baseUrl}/systemEvents`);

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.id !== undefined) {
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    }
    if (options.eventTime !== undefined) {
      url.searchParams.set('eventTime', this._serializeDatetime(options.eventTime));
    }
    if (options.eventType !== undefined) {
      url.searchParams.set(
        'eventType',
        Array.isArray(options.eventType) ? options.eventType.join(',') : options.eventType
      );
    }
    if (options.system !== undefined) {
      url.searchParams.set('system', options.system);
    }

    return url.toString();
  }

  /**
   * Build URL to get a specific system event by ID.
   * @see https://docs.ogc.org/is/23-002/23-002.html#_system_event_resource
   *
   * @param systemEventId Unique identifier of the system event
   * @param format Optional format (defaults to JSON)
   * @returns URL string for GET request
   */
  getSystemEventUrl(systemEventId: string, format?: string): string {
    this._checkResourceAvailable('systemEvents');
    return this._buildResourceUrl('systemEvents', systemEventId, format);
  }

  /**
   * Build URL to get system events for a specific system.
   * @see https://docs.ogc.org/is/23-002/23-002.html#_system_system_events
   *
   * @param systemId Unique identifier of the system
   * @param options Query parameters for filtering system events
   * @returns URL string for GET request
   */
  getSystemSystemEventsUrl(
    systemId: string,
    options: SystemEventsQueryOptions = {}
  ): string {
    this._checkResourceAvailable('systems');
    const url = new URL(
      `${this.baseUrl}/systems/${encodeURIComponent(systemId)}/systemEvents`
    );

    if (options.limit !== undefined) {
      url.searchParams.set('limit', options.limit.toString());
    }
    if (options.datetime !== undefined) {
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    }
    if (options.eventTime !== undefined) {
      url.searchParams.set('eventTime', this._serializeDatetime(options.eventTime));
    }
    if (options.eventType !== undefined) {
      url.searchParams.set(
        'eventType',
        Array.isArray(options.eventType) ? options.eventType.join(',') : options.eventType
      );
    }

    return url.toString();
  }

  /**
   * Build URL to create a new system event.
   * @see https://docs.ogc.org/is/23-002/23-002.html#_create_system_event
   *
   * @returns URL string for POST request (body contains system event data)
   */
  createSystemEventUrl(): string {
    this._checkResourceAvailable('systemEvents');
    return `${this.baseUrl}/systemEvents`;
  }

  // ========================================
  // FEASIBILITY RESOURCE (Part 2: Section 11)
  // ========================================

  /**
   * Build URL to request a feasibility analysis for a system.
   * @see https://docs.ogc.org/is/23-002/23-002.html#_feasibility
   *
   * @param systemId Unique identifier of the system
   * @returns URL string for POST request (body contains feasibility request)
   */
  requestFeasibilityUrl(systemId: string): string {
    this._checkResourceAvailable('systems');
    return `${this.baseUrl}/systems/${encodeURIComponent(systemId)}/feasibility`;
  }

  /**
   * Build URL to get a feasibility result.
   * @see https://docs.ogc.org/is/23-002/23-002.html#_feasibility_result
   *
   * @param systemId Unique identifier of the system
   * @param requestId Unique identifier of the feasibility request
   * @returns URL string for GET request
   */
  getFeasibilityResultUrl(systemId: string, requestId: string): string {
    this._checkResourceAvailable('systems');
    return `${this.baseUrl}/systems/${encodeURIComponent(systemId)}/feasibility/${encodeURIComponent(requestId)}`;
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  private _extractBaseUrl(collection: OgcApiCollectionInfo): string {
    // Extract base URL from self link
    const selfLink = collection.links.find((l) => l.rel === 'self');
    if (!selfLink) {
      throw new Error('Collection does not have a self link');
    }
    // Remove /collections/{id} suffix to get base
    return selfLink.href.replace(/\/collections\/[^/]+$/, '');
  }

  private _extractFormats(collection: OgcApiCollectionInfo): Set<string> {
    const formats = new Set<string>();
    // Look for formats in links and itemFormats
    collection.links
      .filter((l) => l.type)
      .forEach((l) => formats.add(l.type));
    if (collection.itemFormats) {
      collection.itemFormats.forEach((f) => formats.add(f));
    }
    return formats;
  }

  private _extractAvailableResources(
    collection: OgcApiCollectionInfo
  ): Set<CSAPIResourceType> {
    const resources = new Set<CSAPIResourceType>();
    // Check for CSAPI-specific link relations
    collection.links.forEach((link) => {
      const rel = link.rel.toLowerCase();
      if (rel.includes('systems')) resources.add('systems');
      if (rel.includes('procedures')) resources.add('procedures');
      if (rel.includes('deployments')) resources.add('deployments');
      if (rel.includes('samplingfeatures'))
        resources.add('samplingFeatures');
      if (rel.includes('properties')) resources.add('properties');
      if (rel.includes('datastreams')) resources.add('datastreams');
      if (rel.includes('observations')) resources.add('observations');
      if (rel.includes('commands')) resources.add('commands');
      if (rel.includes('controlstreams')) resources.add('controlStreams');
    });

    return resources;
  }

  private _checkResourceAvailable(resource: CSAPIResourceType): void {
    if (!this.availableResources.has(resource)) {
      throw new Error(`Collection does not support ${resource} resource`);
    }
  }

  private _buildResourceUrl(
    resource: string,
    id: string,
    format?: string
  ): string {
    const url = `${this.baseUrl}/${resource}/${encodeURIComponent(id)}`;
    if (format) {
      return `${url}?f=${encodeURIComponent(format)}`;
    }
    return url;
  }

  private _serializeDatetime(param: DateTimeParameter): string {
    // Handle special temporal values
    if (param === 'now' || param === 'latest') {
      return param;
    }
    
    // Use existing DateTimeParameter serialization from shared/models
    if (param instanceof Date) {
      return param.toISOString();
    }
    if ('start' in param && 'end' in param) {
      return `${param.start.toISOString()}/${param.end.toISOString()}`;
    }
    if ('start' in param) {
      return `${param.start.toISOString()}/..`;
    }
    if ('end' in param) {
      return `../${param.end.toISOString()}`;
    }
    throw new Error('Invalid DateTimeParameter');
  }

  private _serializeBbox(bbox: BoundingBox): string {
    return `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;
  }

  private _applySystemsQuery(
    url: URL,
    options: SystemsQueryOptions
  ): URL {
    if (options.limit !== undefined)
      url.searchParams.set('limit', options.limit.toString());
    if (options.bbox !== undefined)
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    if (options.datetime !== undefined)
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    if (options.q !== undefined) url.searchParams.set('q', options.q);
    if (options.parent !== undefined)
      url.searchParams.set('parent', options.parent);
    if (options.procedure !== undefined)
      url.searchParams.set('procedure', options.procedure);
    if (options.observedProperty !== undefined)
      url.searchParams.set('observedProperty', options.observedProperty);
    if (options.controlledProperty !== undefined)
      url.searchParams.set('controlledProperty', options.controlledProperty);
    if (options.systemKind !== undefined)
      url.searchParams.set('systemKind', options.systemKind);
    if (options.select !== undefined)
      url.searchParams.set('select', options.select);
    return url;
  }

  private _applySamplingFeaturesQuery(
    url: URL,
    options: SamplingFeaturesQueryOptions
  ): URL {
    if (options.limit !== undefined)
      url.searchParams.set('limit', options.limit.toString());
    if (options.bbox !== undefined)
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    if (options.datetime !== undefined)
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    if (options.q !== undefined) url.searchParams.set('q', options.q);
    if (options.select !== undefined)
      url.searchParams.set('select', options.select);
    return url;
  }

  private _applyDatastreamsQuery(
    url: URL,
    options: DatastreamsQueryOptions
  ): URL {
    if (options.limit !== undefined)
      url.searchParams.set('limit', options.limit.toString());
    if (options.bbox !== undefined)
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    if (options.datetime !== undefined)
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    if (options.observedProperty !== undefined)
      url.searchParams.set('observedProperty', options.observedProperty);
    if (options.phenomenonTime !== undefined)
      url.searchParams.set(
        'phenomenonTime',
        this._serializeDatetime(options.phenomenonTime)
      );
    if (options.select !== undefined)
      url.searchParams.set('select', options.select);
    return url;
  }

  private _applyControlStreamsQuery(
    url: URL,
    options: ControlStreamsQueryOptions
  ): URL {
    if (options.limit !== undefined)
      url.searchParams.set('limit', options.limit.toString());
    if (options.datetime !== undefined)
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    if (options.controlledProperty !== undefined)
      url.searchParams.set('controlledProperty', options.controlledProperty);
    if (options.issueTime !== undefined)
      url.searchParams.set(
        'issueTime',
        this._serializeDatetime(options.issueTime)
      );
    if (options.executionTime !== undefined)
      url.searchParams.set(
        'executionTime',
        this._serializeDatetime(options.executionTime)
      );
    if (options.select !== undefined)
      url.searchParams.set('select', options.select);
    return url;
  }

  private _applyDeploymentsQuery(
    url: URL,
    options: DeploymentsQueryOptions
  ): URL {
    if (options.limit !== undefined)
      url.searchParams.set('limit', options.limit.toString());
    if (options.bbox !== undefined)
      url.searchParams.set('bbox', this._serializeBbox(options.bbox));
    if (options.datetime !== undefined)
      url.searchParams.set('datetime', this._serializeDatetime(options.datetime));
    if (options.q !== undefined) url.searchParams.set('q', options.q);
    if (options.id !== undefined)
      url.searchParams.set(
        'id',
        Array.isArray(options.id) ? options.id.join(',') : options.id
      );
    if (options.geom !== undefined) url.searchParams.set('geom', options.geom);
    if (options.foi !== undefined)
      url.searchParams.set(
        'foi',
        Array.isArray(options.foi) ? options.foi.join(',') : options.foi
      );
    if (options.parent !== undefined)
      url.searchParams.set(
        'parent',
        Array.isArray(options.parent) ? options.parent.join(',') : options.parent
      );
    if (options.system !== undefined)
      url.searchParams.set('system', options.system);
    if (options.observedProperty !== undefined)
      url.searchParams.set('observedProperty', options.observedProperty);
    if (options.controlledProperty !== undefined)
      url.searchParams.set('controlledProperty', options.controlledProperty);
    if (options.select !== undefined)
      url.searchParams.set('select', options.select);
    return url;
  }

  private _applyProceduresQuery(
    url: URL,
    options: ProceduresQueryOptions
  ): URL {
    if (options.limit !== undefined)
      url.searchParams.set('limit', options.limit.toString());
    if (options.q !== undefined) url.searchParams.set('q', options.q);
    if (options.observedProperty !== undefined)
      url.searchParams.set('observedProperty', options.observedProperty);
    if (options.controlledProperty !== undefined)
      url.searchParams.set('controlledProperty', options.controlledProperty);
    if (options.select !== undefined)
      url.searchParams.set('select', options.select);
    return url;
  }
}
