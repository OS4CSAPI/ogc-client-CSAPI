/**
 * CSAPI Resource Parsers
 * 
 * Parsers for all CSAPI resource types.
 */

import type { Feature, FeatureCollection } from 'geojson';
import {
  CSAPIParser,
  CSAPIParseError,
  type ParseResult,
  type ParserOptions,
} from './base';
import type {
  SystemFeature,
  DeploymentFeature,
  ProcedureFeature,
  SamplingFeature,
  PropertyFeature,
  DatastreamFeature,
  ControlStreamFeature,
} from '../geojson';

/**
 * Deployment parser
 */
export class DeploymentParser extends CSAPIParser<DeploymentFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): DeploymentFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError('Expected single Feature, got FeatureCollection');
    }
    return data as DeploymentFeature;
  }

  parseSensorML(data: Record<string, unknown>): DeploymentFeature {
    throw new CSAPIParseError('SensorML to GeoJSON conversion not yet implemented');
  }

  parseSWE(data: Record<string, unknown>): DeploymentFeature {
    throw new CSAPIParseError('SWE format not applicable for Deployment resources');
  }
}

/**
 * Procedure parser
 */
export class ProcedureParser extends CSAPIParser<ProcedureFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): ProcedureFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError('Expected single Feature, got FeatureCollection');
    }
    return data as ProcedureFeature;
  }

  parseSensorML(data: Record<string, unknown>): ProcedureFeature {
    throw new CSAPIParseError('SensorML to GeoJSON conversion not yet implemented');
  }

  parseSWE(data: Record<string, unknown>): ProcedureFeature {
    throw new CSAPIParseError('SWE format not applicable for Procedure resources');
  }
}

/**
 * Sampling Feature parser
 */
export class SamplingFeatureParser extends CSAPIParser<SamplingFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): SamplingFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError('Expected single Feature, got FeatureCollection');
    }
    return data as SamplingFeature;
  }

  parseSensorML(data: Record<string, unknown>): SamplingFeature {
    throw new CSAPIParseError('SensorML format not applicable for Sampling Features');
  }

  parseSWE(data: Record<string, unknown>): SamplingFeature {
    throw new CSAPIParseError('SWE format not applicable for Sampling Features');
  }
}

/**
 * Property parser
 */
export class PropertyParser extends CSAPIParser<PropertyFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): PropertyFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError('Expected single Feature, got FeatureCollection');
    }
    return data as PropertyFeature;
  }

  parseSensorML(data: Record<string, unknown>): PropertyFeature {
    throw new CSAPIParseError('SensorML to GeoJSON conversion not yet implemented');
  }

  parseSWE(data: Record<string, unknown>): PropertyFeature {
    throw new CSAPIParseError('SWE format not applicable for Property resources');
  }
}

/**
 * Datastream parser
 */
export class DatastreamParser extends CSAPIParser<DatastreamFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): DatastreamFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError('Expected single Feature, got FeatureCollection');
    }
    return data as DatastreamFeature;
  }

  parseSensorML(data: Record<string, unknown>): DatastreamFeature {
    throw new CSAPIParseError('Datastreams not defined in SensorML format');
  }

  parseSWE(data: Record<string, unknown>): DatastreamFeature {
    throw new CSAPIParseError('SWE format not applicable for Datastream resources');
  }
}

/**
 * ControlStream parser
 */
export class ControlStreamParser extends CSAPIParser<ControlStreamFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): ControlStreamFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError('Expected single Feature, got FeatureCollection');
    }
    return data as ControlStreamFeature;
  }

  parseSensorML(data: Record<string, unknown>): ControlStreamFeature {
    throw new CSAPIParseError('ControlStreams not defined in SensorML format');
  }

  parseSWE(data: Record<string, unknown>): ControlStreamFeature {
    throw new CSAPIParseError('SWE format not applicable for ControlStream resources');
  }
}

/**
 * Observation parser (non-feature)
 * TODO: Define proper Observation type in Part 2
 */
export class ObservationParser extends CSAPIParser<Record<string, unknown>> {
  parseGeoJSON(data: Feature | FeatureCollection): Record<string, unknown> {
    // Observations are not GeoJSON features
    throw new CSAPIParseError('Observations are not GeoJSON features');
  }

  parseSensorML(data: Record<string, unknown>): Record<string, unknown> {
    throw new CSAPIParseError('Observations not defined in SensorML format');
  }

  parseSWE(data: Record<string, unknown>): Record<string, unknown> {
    // SWE format is used for observation values
    return data;
  }

  parseJSON(data: Record<string, unknown>): Record<string, unknown> {
    // Observations are typically JSON
    return data;
  }
}

/**
 * Command parser (non-feature)
 * TODO: Define proper Command type in Part 2
 */
export class CommandParser extends CSAPIParser<Record<string, unknown>> {
  parseGeoJSON(data: Feature | FeatureCollection): Record<string, unknown> {
    // Commands are not GeoJSON features
    throw new CSAPIParseError('Commands are not GeoJSON features');
  }

  parseSensorML(data: Record<string, unknown>): Record<string, unknown> {
    throw new CSAPIParseError('Commands not defined in SensorML format');
  }

  parseSWE(data: Record<string, unknown>): Record<string, unknown> {
    // SWE format is used for command parameters
    return data;
  }

  parseJSON(data: Record<string, unknown>): Record<string, unknown> {
    // Commands are typically JSON
    return data;
  }
}

/**
 * Generic collection parser
 */
export class CollectionParser<T> extends CSAPIParser<T[]> {
  constructor(private itemParser: CSAPIParser<T>) {
    super();
  }

  parseGeoJSON(data: Feature | FeatureCollection): T[] {
    if (data.type === 'Feature') {
      return [this.itemParser.parseGeoJSON(data)];
    }
    return (data as FeatureCollection).features.map(feature =>
      this.itemParser.parseGeoJSON(feature)
    );
  }

  parseSensorML(data: Record<string, unknown>): T[] {
    if (Array.isArray(data)) {
      return data.map(item => this.itemParser.parseSensorML(item));
    }
    return [this.itemParser.parseSensorML(data)];
  }

  parseSWE(data: Record<string, unknown>): T[] {
    if (Array.isArray(data)) {
      return data.map(item => this.itemParser.parseSWE(item));
    }
    return [this.itemParser.parseSWE(data)];
  }
}

// Export parser instances
export const deploymentParser = new DeploymentParser();
export const procedureParser = new ProcedureParser();
export const samplingFeatureParser = new SamplingFeatureParser();
export const propertyParser = new PropertyParser();
export const datastreamParser = new DatastreamParser();
export const controlStreamParser = new ControlStreamParser();
export const observationParser = new ObservationParser();
export const commandParser = new CommandParser();

// Collection parsers
export const deploymentCollectionParser = new CollectionParser(deploymentParser);
export const procedureCollectionParser = new CollectionParser(procedureParser);
export const samplingFeatureCollectionParser = new CollectionParser(samplingFeatureParser);
export const propertyCollectionParser = new CollectionParser(propertyParser);
export const datastreamCollectionParser = new CollectionParser(datastreamParser);
export const controlStreamCollectionParser = new CollectionParser(controlStreamParser);
