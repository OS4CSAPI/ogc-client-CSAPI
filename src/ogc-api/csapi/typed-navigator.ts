/**
 * Typed Navigator for CSAPI with automatic response parsing
 *
 * Extends CSAPINavigator with typed fetch methods that automatically
 * parse responses using the appropriate parser for each resource type.
 *
 * @module csapi/typed-navigator
 */

import CSAPINavigator from './navigator.js';
import {
  SystemParser,
  SystemCollectionParser,
  DeploymentParser,
  ProcedureParser,
  SamplingFeatureParser,
  PropertyParser,
  DatastreamParser,
  ControlStreamParser,
  CollectionParser,
  type ParseResult,
  type ParserOptions,
} from './parsers/index.js';
import type {
  SystemFeature,
  DeploymentFeature,
  ProcedureFeature,
  SamplingFeature,
  PropertyFeature,
  DatastreamFeature,
  ControlStreamFeature,
} from './geojson/index.js';
import type {
  SystemsQueryOptions,
  DeploymentsQueryOptions,
  ProceduresQueryOptions,
  SamplingFeaturesQueryOptions,
  PropertiesQueryOptions,
  DatastreamsQueryOptions,
  ControlStreamsQueryOptions,
  HistoryQueryOptions,
} from './model.js';

/**
 * Options for typed fetch operations
 */
export interface TypedFetchOptions extends ParserOptions {
  /**
   * Custom fetch function (defaults to global fetch)
   */
  fetch?: typeof fetch;

  /**
   * Custom headers to add to request
   */
  headers?: Record<string, string>;

  /**
   * Accept header override (auto-detected from supportedFormats if not specified)
   */
  accept?: string;
}

/**
 * Navigator with typed fetch methods that automatically parse responses
 */
export class TypedCSAPINavigator extends CSAPINavigator {
  private systemParser = new SystemParser();
  private systemCollectionParser = new SystemCollectionParser();
  private deploymentParser = new DeploymentParser();
  private deploymentCollectionParser = new CollectionParser(
    this.deploymentParser
  );
  private procedureParser = new ProcedureParser();
  private procedureCollectionParser = new CollectionParser(
    this.procedureParser
  );
  private samplingFeatureParser = new SamplingFeatureParser();
  private samplingFeatureCollectionParser = new CollectionParser(
    this.samplingFeatureParser
  );
  private propertyParser = new PropertyParser();
  private propertyCollectionParser = new CollectionParser(this.propertyParser);
  private datastreamParser = new DatastreamParser();
  private datastreamCollectionParser = new CollectionParser(
    this.datastreamParser
  );
  private controlStreamParser = new ControlStreamParser();
  private controlStreamCollectionParser = new CollectionParser(
    this.controlStreamParser
  );

  /**
   * Get all systems with automatic parsing
   */
  async getSystems(
    options: SystemsQueryOptions & TypedFetchOptions = {}
  ): Promise<ParseResult<SystemFeature[]>> {
    const url = this.getSystemsUrl(options);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.systemCollectionParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get a single system by ID with automatic parsing
   */
  async getSystem(
    systemId: string,
    options: TypedFetchOptions = {}
  ): Promise<ParseResult<SystemFeature>> {
    const url = this.getSystemUrl(systemId);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.systemParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get all deployments with automatic parsing
   */
  async getDeployments(
    options: DeploymentsQueryOptions & TypedFetchOptions = {}
  ): Promise<ParseResult<DeploymentFeature[]>> {
    const url = this.getDeploymentsUrl(options);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.deploymentCollectionParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get a single deployment by ID with automatic parsing
   */
  async getDeployment(
    deploymentId: string,
    options: TypedFetchOptions = {}
  ): Promise<ParseResult<DeploymentFeature>> {
    const url = this.getDeploymentUrl(deploymentId);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.deploymentParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get all procedures with automatic parsing
   */
  async getProcedures(
    options: ProceduresQueryOptions & TypedFetchOptions = {}
  ): Promise<ParseResult<ProcedureFeature[]>> {
    const url = this.getProceduresUrl(options);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.procedureCollectionParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get a single procedure by ID with automatic parsing
   */
  async getProcedure(
    procedureId: string,
    options: TypedFetchOptions = {}
  ): Promise<ParseResult<ProcedureFeature>> {
    const url = this.getProcedureUrl(procedureId);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.procedureParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get all sampling features with automatic parsing
   */
  async getSamplingFeatures(
    options: SamplingFeaturesQueryOptions & TypedFetchOptions = {}
  ): Promise<ParseResult<SamplingFeature[]>> {
    const url = this.getSamplingFeaturesUrl(options);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.samplingFeatureCollectionParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get a single sampling feature by ID with automatic parsing
   */
  async getSamplingFeature(
    featureId: string,
    options: TypedFetchOptions = {}
  ): Promise<ParseResult<SamplingFeature>> {
    const url = this.getSamplingFeatureUrl(featureId);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.samplingFeatureParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get all properties with automatic parsing
   */
  async getProperties(
    options: PropertiesQueryOptions & TypedFetchOptions = {}
  ): Promise<ParseResult<PropertyFeature[]>> {
    const url = this.getPropertiesUrl(options);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.propertyCollectionParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get a single property by ID with automatic parsing
   */
  async getProperty(
    propertyId: string,
    options: TypedFetchOptions = {}
  ): Promise<ParseResult<PropertyFeature>> {
    const url = this.getPropertyUrl(propertyId);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.propertyParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get all datastreams with automatic parsing
   */
  async getDatastreams(
    options: DatastreamsQueryOptions & TypedFetchOptions = {}
  ): Promise<ParseResult<DatastreamFeature[]>> {
    const url = this.getDatastreamsUrl(options);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.datastreamCollectionParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get a single datastream by ID with automatic parsing
   */
  async getDatastream(
    datastreamId: string,
    options: TypedFetchOptions = {}
  ): Promise<ParseResult<DatastreamFeature>> {
    const url = this.getDatastreamUrl(datastreamId);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.datastreamParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get all control streams with automatic parsing
   */
  async getControlStreams(
    options: ControlStreamsQueryOptions & TypedFetchOptions = {}
  ): Promise<ParseResult<ControlStreamFeature[]>> {
    const url = this.getControlStreamsUrl(options);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.controlStreamCollectionParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Get a single control stream by ID with automatic parsing
   */
  async getControlStream(
    controlStreamId: string,
    options: TypedFetchOptions = {}
  ): Promise<ParseResult<ControlStreamFeature>> {
    const url = this.getControlStreamUrl(controlStreamId);
    const response = await this._fetch(url, options);
    const data = await response.json();

    return this.controlStreamParser.parse(data, {
      validate: options.validate,
      strict: options.strict,
      contentType: response.headers.get('content-type') || undefined,
    });
  }

  /**
   * Internal fetch helper with proper headers
   */
  private async _fetch(
    url: string,
    options: TypedFetchOptions = {}
  ): Promise<Response> {
    const fetchFn = options.fetch || fetch;
    const headers: Record<string, string> = {
      ...options.headers,
    };

    // Set Accept header based on supported formats
    if (options.accept) {
      headers['Accept'] = options.accept;
    } else if (this.supportedFormats.size > 0) {
      // Prefer GeoJSON, then SensorML, then SWE
      if (this.supportedFormats.has('application/geo+json')) {
        headers['Accept'] = 'application/geo+json';
      } else if (this.supportedFormats.has('application/sml+json')) {
        headers['Accept'] = 'application/sml+json';
      } else if (this.supportedFormats.has('application/swe+json')) {
        headers['Accept'] = 'application/swe+json';
      } else {
        headers['Accept'] = 'application/json';
      }
    } else {
      headers['Accept'] = 'application/json';
    }

    const response = await fetchFn(url, { headers });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} (${url})`
      );
    }

    return response;
  }
}
