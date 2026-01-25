/**
 * Request Body Builders for CSAPI
 * 
 * Helpers to construct valid request bodies for POST/PUT/PATCH operations.
 * Includes validation to ensure bodies conform to CSAPI requirements.
 * 
 * @module csapi/request-builders
 */

import type { Feature, Point } from 'geojson';
import type {
  SystemFeature,
  SystemFeatureProperties,
  DeploymentFeature,
  DeploymentFeatureProperties,
  ProcedureFeature,
  ProcedureFeatureProperties,
  SamplingFeature,
  SamplingFeatureProperties,
  PropertyFeature,
  PropertyFeatureProperties,
  DatastreamFeature,
  DatastreamFeatureProperties,
  ControlStreamFeature,
  ControlStreamFeatureProperties,
} from './geojson/index.js';
import type {
  PhysicalSystem,
  PhysicalComponent,
} from './sensorml/index.js';
import type { Deployment } from './sensorml/deployment.js';
import type { SimpleProcess, AggregateProcess } from './sensorml/index.js';
import type { DerivedProperty } from './sensorml/derived-property.js';
import {
  validateSystemFeature,
  validateDeploymentFeature,
  validateProcedureFeature,
  validateSamplingFeature,
  validatePropertyFeature,
  validateDatastreamFeature,
  validateControlStreamFeature,
  type ValidationResult,
} from './validation/index.js';

/**
 * Options for request body builders
 */
export interface RequestBuilderOptions {
  /**
   * Validate the constructed body before returning
   * @default true
   */
  validate?: boolean;

  /**
   * Throw error if validation fails
   * @default false
   */
  strict?: boolean;

  /**
   * Format for the request body
   * @default 'geojson'
   */
  format?: 'geojson' | 'sensorml' | 'swe';
}

/**
 * Result of building a request body
 */
export interface RequestBodyResult<T> {
  body: T;
  contentType: string;
  validation?: ValidationResult;
}

/**
 * Build a System request body (GeoJSON format)
 */
export function buildSystemBody(
  properties: Omit<Partial<SystemFeatureProperties>, 'featureType' | 'uid'> & {
    featureType?: 'System';
    uid: string;
  },
  geometry?: Point | null,
  options: RequestBuilderOptions = {}
): RequestBodyResult<SystemFeature> {
  const { validate = true, strict = false, format = 'geojson' } = options;

  const feature: SystemFeature = {
    type: 'Feature',
    geometry: geometry || null,
    properties: {
      featureType: 'System',
      uid: properties.uid,
      ...properties,
    } as SystemFeatureProperties,
  };

  const result: RequestBodyResult<SystemFeature> = {
    body: feature,
    contentType: 'application/geo+json',
  };

  if (validate) {
    result.validation = validateSystemFeature(feature);
    if (!result.validation.valid && strict) {
      throw new Error(
        `System validation failed: ${result.validation.errors?.join(', ')}`
      );
    }
  }

  return result;
}

/**
 * Build a System request body in SensorML format
 */
export function buildSystemBodySensorML(
  system: PhysicalSystem | PhysicalComponent,
  options: RequestBuilderOptions = {}
): RequestBodyResult<PhysicalSystem | PhysicalComponent> {
  return {
    body: system,
    contentType: 'application/sml+json',
  };
}

/**
 * Build a Deployment request body (GeoJSON format)
 */
export function buildDeploymentBody(
  properties: Omit<Partial<DeploymentFeatureProperties>, 'featureType' | 'uid' | 'system'> & {
    featureType?: 'Deployment';
    uid: string;
    system: string;
  },
  geometry?: Point | null,
  options: RequestBuilderOptions = {}
): RequestBodyResult<DeploymentFeature> {
  const { validate = true, strict = false } = options;

  const feature: DeploymentFeature = {
    type: 'Feature',
    geometry: geometry || null,
    properties: {
      featureType: 'Deployment',
      uid: properties.uid,
      system: properties.system,
      ...properties,
    } as DeploymentFeatureProperties,
  };

  const result: RequestBodyResult<DeploymentFeature> = {
    body: feature,
    contentType: 'application/geo+json',
  };

  if (validate) {
    result.validation = validateDeploymentFeature(feature);
    if (!result.validation.valid && strict) {
      throw new Error(
        `Deployment validation failed: ${result.validation.errors?.join(', ')}`
      );
    }
  }

  return result;
}

/**
 * Build a Deployment request body in SensorML format
 */
export function buildDeploymentBodySensorML(
  deployment: Deployment,
  options: RequestBuilderOptions = {}
): RequestBodyResult<Deployment> {
  return {
    body: deployment,
    contentType: 'application/sml+json',
  };
}

/**
 * Build a Procedure request body (GeoJSON format)
 */
export function buildProcedureBody(
  properties: Omit<Partial<ProcedureFeatureProperties>, 'featureType' | 'uid'> & {
    featureType?: 'Procedure';
    uid: string;
  },
  geometry?: Point | null,
  options: RequestBuilderOptions = {}
): RequestBodyResult<ProcedureFeature> {
  const { validate = true, strict = false } = options;

  const feature: ProcedureFeature = {
    type: 'Feature',
    geometry: geometry || null,
    properties: {
      featureType: 'Procedure',
      uid: properties.uid,
      ...properties,
    } as ProcedureFeatureProperties,
  };

  const result: RequestBodyResult<ProcedureFeature> = {
    body: feature,
    contentType: 'application/geo+json',
  };

  if (validate) {
    result.validation = validateProcedureFeature(feature);
    if (!result.validation.valid && strict) {
      throw new Error(
        `Procedure validation failed: ${result.validation.errors?.join(', ')}`
      );
    }
  }

  return result;
}

/**
 * Build a Procedure request body in SensorML format
 */
export function buildProcedureBodySensorML(
  procedure: SimpleProcess | AggregateProcess | PhysicalSystem | PhysicalComponent,
  options: RequestBuilderOptions = {}
): RequestBodyResult<SimpleProcess | AggregateProcess | PhysicalSystem | PhysicalComponent> {
  return {
    body: procedure,
    contentType: 'application/sml+json',
  };
}

/**
 * Build a SamplingFeature request body
 */
export function buildSamplingFeatureBody(
  properties: Omit<Partial<SamplingFeatureProperties>, 'featureType' | 'uid'> & {
    featureType?: 'SamplingFeature';
    uid: string;
  },
  geometry?: Point | null,
  options: RequestBuilderOptions = {}
): RequestBodyResult<SamplingFeature> {
  const { validate = true, strict = false } = options;

  const feature: SamplingFeature = {
    type: 'Feature',
    geometry: geometry || null,
    properties: {
      featureType: 'SamplingFeature',
      uid: properties.uid,
      ...properties,
    } as SamplingFeatureProperties,
  };

  const result: RequestBodyResult<SamplingFeature> = {
    body: feature,
    contentType: 'application/geo+json',
  };

  if (validate) {
    result.validation = validateSamplingFeature(feature);
    if (!result.validation.valid && strict) {
      throw new Error(
        `SamplingFeature validation failed: ${result.validation.errors?.join(', ')}`
      );
    }
  }

  return result;
}

/**
 * Build a Property request body
 */
export function buildPropertyBody(
  properties: Omit<Partial<PropertyFeatureProperties>, 'featureType' | 'uid' | 'definition'> & {
    featureType?: 'Property';
    uid: string;
    definition: string;
  },
  options: RequestBuilderOptions = {}
): RequestBodyResult<PropertyFeature> {
  const { validate = true, strict = false } = options;

  const feature: PropertyFeature = {
    type: 'Feature',
    geometry: null,
    properties: {
      featureType: 'Property',
      uid: properties.uid,
      definition: properties.definition,
      ...properties,
    } as PropertyFeatureProperties,
  };

  const result: RequestBodyResult<PropertyFeature> = {
    body: feature,
    contentType: 'application/geo+json',
  };

  if (validate) {
    result.validation = validatePropertyFeature(feature);
    if (!result.validation.valid && strict) {
      throw new Error(
        `Property validation failed: ${result.validation.errors?.join(', ')}`
      );
    }
  }

  return result;
}

/**
 * Build a Property request body in SensorML format
 */
export function buildPropertyBodySensorML(
  property: DerivedProperty,
  options: RequestBuilderOptions = {}
): RequestBodyResult<DerivedProperty> {
  return {
    body: property,
    contentType: 'application/sml+json',
  };
}

/**
 * Build a Datastream request body
 */
export function buildDatastreamBody(
  properties: Omit<Partial<DatastreamFeatureProperties>, 'featureType' | 'uid' | 'system' | 'observedProperty'> & {
    featureType?: 'Datastream';
    uid: string;
    system: string;
    observedProperty: string;
  },
  geometry?: Point | null,
  options: RequestBuilderOptions = {}
): RequestBodyResult<DatastreamFeature> {
  const { validate = true, strict = false } = options;

  const feature: DatastreamFeature = {
    type: 'Feature',
    geometry: geometry || null,
    properties: {
      featureType: 'Datastream',
      uid: properties.uid,
      system: properties.system,
      observedProperty: properties.observedProperty,
      ...properties,
    } as DatastreamFeatureProperties,
  };

  const result: RequestBodyResult<DatastreamFeature> = {
    body: feature,
    contentType: 'application/geo+json',
  };

  if (validate) {
    result.validation = validateDatastreamFeature(feature);
    if (!result.validation.valid && strict) {
      throw new Error(
        `Datastream validation failed: ${result.validation.errors?.join(', ')}`
      );
    }
  }

  return result;
}

/**
 * Build a ControlStream request body
 */
export function buildControlStreamBody(
  properties: Omit<Partial<ControlStreamFeatureProperties>, 'featureType' | 'uid' | 'system' | 'controlledProperty'> & {
    featureType?: 'ControlStream';
    uid: string;
    system: string;
    controlledProperty: string;
  },
  geometry?: Point | null,
  options: RequestBuilderOptions = {}
): RequestBodyResult<ControlStreamFeature> {
  const { validate = true, strict = false } = options;

  const feature: ControlStreamFeature = {
    type: 'Feature',
    geometry: geometry || null,
    properties: {
      featureType: 'ControlStream',
      uid: properties.uid,
      system: properties.system,
      controlledProperty: properties.controlledProperty,
      ...properties,
    } as ControlStreamFeatureProperties,
  };

  const result: RequestBodyResult<ControlStreamFeature> = {
    body: feature,
    contentType: 'application/geo+json',
  };

  if (validate) {
    result.validation = validateControlStreamFeature(feature);
    if (!result.validation.valid && strict) {
      throw new Error(
        `ControlStream validation failed: ${result.validation.errors?.join(', ')}`
      );
    }
  }

  return result;
}

/**
 * Generic builder that validates any CSAPI feature
 */
export function buildFeatureBody<T extends Feature>(
  feature: T,
  validator: (data: unknown) => ValidationResult,
  options: RequestBuilderOptions = {}
): RequestBodyResult<T> {
  const { validate = true, strict = false } = options;

  const result: RequestBodyResult<T> = {
    body: feature,
    contentType: 'application/geo+json',
  };

  if (validate) {
    result.validation = validator(feature);
    if (!result.validation.valid && strict) {
      throw new Error(
        `Feature validation failed: ${result.validation.errors?.join(', ')}`
      );
    }
  }

  return result;
}
