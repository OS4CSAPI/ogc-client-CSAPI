/**
 * CSAPI Resource Parsers
 *
 * Parsers for all CSAPI resource types.
 */

import type { Feature, FeatureCollection, Geometry } from 'geojson';
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
import type { Deployment, SensorMLProcess, DerivedProperty } from '../sensorml';
import type { Position } from '../sensorml/abstract-physical-process';
import type { DescribedObject } from '../sensorml/base-types';
import {
  validateDeploymentFeature,
  validateProcedureFeature,
  validateSamplingFeature,
  validatePropertyFeature,
  validateDatastreamFeature,
  validateControlStreamFeature,
  type ValidationResult,
} from '../validation';
import {
  parseDataStreamComponent,
  parseDataRecordComponent,
  parseDataChoiceComponent,
  parseDataComponent,
  ParseError,
} from './swe-common-parser.js';

/**
 * Helper: Extract geometry from SensorML Position or location
 */
function extractGeometry(position?: Position | Geometry): Geometry | undefined {
  if (!position) return undefined;

  // Check if it's already a GeoJSON Geometry
  if (
    typeof position === 'object' &&
    'type' in position &&
    (position.type === 'Point' ||
      position.type === 'LineString' ||
      position.type === 'Polygon' ||
      position.type === 'MultiPoint' ||
      position.type === 'MultiLineString' ||
      position.type === 'MultiPolygon')
  ) {
    return position as Geometry;
  }

  // Check if it's a Pose
  if (
    typeof position === 'object' &&
    'position' in position &&
    position.position &&
    typeof position.position === 'object'
  ) {
    const pos = position.position as { lat?: number; lon?: number; h?: number };
    if (pos.lat !== undefined && pos.lon !== undefined) {
      return {
        type: 'Point',
        coordinates: [pos.lon, pos.lat, pos.h !== undefined ? pos.h : 0],
      };
    }
  }

  // For other types (TextComponent, Process, XLink, etc.), return undefined
  return undefined;
}

/**
 * Helper: Convert SensorML DescribedObject properties to GeoJSON properties
 */
function extractCommonProperties(
  sml: DescribedObject
): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  if (sml.id) props.id = sml.id;
  if (sml.uniqueId) props.uniqueId = sml.uniqueId;
  if (sml.label) props.name = sml.label;
  if (sml.description) props.description = sml.description;
  // Handle both string[] (schema-compliant) and Keyword[] (enhanced) formats
  if (sml.keywords) {
    props.keywords =
      Array.isArray(sml.keywords) &&
      sml.keywords.length > 0 &&
      typeof sml.keywords[0] === 'string'
        ? (sml.keywords as string[])
        : (sml.keywords as any[]).map((k) =>
            typeof k === 'object' && k.value ? k.value : k
          );
  }
  if (sml.identifiers) props.identifiers = sml.identifiers;
  if (sml.classifiers) props.classifiers = sml.classifiers;
  if (sml.validTime) props.validTime = sml.validTime;
  if (sml.contacts) props.contacts = sml.contacts;
  if (sml.documents) props.documents = sml.documents;
  if (sml.securityConstraints)
    props.securityConstraints = sml.securityConstraints;
  if (sml.legalConstraints) props.legalConstraints = sml.legalConstraints;

  return props;
}

/**
 * Deployment parser
 */
export class DeploymentParser extends CSAPIParser<DeploymentFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): DeploymentFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError(
        'Expected single Feature, got FeatureCollection'
      );
    }
    return data as DeploymentFeature;
  }

  parseSensorML(data: Record<string, unknown>): DeploymentFeature {
    const sml = data as unknown as Deployment;

    // Validate it's a Deployment
    if (sml.type !== 'Deployment') {
      throw new CSAPIParseError(`Expected Deployment, got ${sml.type}`);
    }

    // Extract geometry from location
    const geometry = extractGeometry(sml.location);

    // Build properties from SensorML metadata
    const properties: Record<string, unknown> = {
      ...extractCommonProperties(sml),
      featureType: 'Deployment',
      definition: sml.definition,
    };

    // Add deployment-specific fields
    if (sml.platform) properties.platform = sml.platform;
    if (sml.deployedSystems) properties.deployedSystems = sml.deployedSystems;
    if (sml.links) properties.links = sml.links;

    return {
      type: 'Feature',
      id: sml.id || sml.uniqueId,
      geometry: geometry || null,
      properties,
    } as unknown as DeploymentFeature;
  }

  parseSWE(data: Record<string, unknown>): DeploymentFeature {
    throw new CSAPIParseError(
      'SWE format not applicable for Deployment resources'
    );
  }

  validate(
    data: DeploymentFeature,
    format: string
  ): { valid: boolean; errors?: string[]; warnings?: string[] } {
    if (format !== 'geojson') {
      return { valid: true };
    }

    const result = validateDeploymentFeature(data);
    return {
      valid: result.valid,
      errors: result.errors,
    };
  }
}

/**
 * Procedure parser
 */
export class ProcedureParser extends CSAPIParser<ProcedureFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): ProcedureFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError(
        'Expected single Feature, got FeatureCollection'
      );
    }
    return data as ProcedureFeature;
  }

  parseSensorML(data: Record<string, unknown>): ProcedureFeature {
    const sml = data as unknown as SensorMLProcess;

    // Procedures can be any process type (SimpleProcess, AggregateProcess, etc.)
    // Extract position if it's a physical process
    const geometry =
      'position' in sml ? extractGeometry(sml.position as Position) : undefined;

    // Build properties from SensorML metadata
    const properties: Record<string, unknown> = {
      ...extractCommonProperties(sml),
      featureType: 'Procedure',
      procedureType: sml.type,
    };

    // Add inputs/outputs/parameters
    if ('inputs' in sml && sml.inputs) properties.inputs = sml.inputs;
    if ('outputs' in sml && sml.outputs) properties.outputs = sml.outputs;
    if ('parameters' in sml && sml.parameters)
      properties.parameters = sml.parameters;

    // Add method if present
    if ('method' in sml && sml.method) properties.method = sml.method;

    // Add components for aggregate processes
    if ('components' in sml && sml.components)
      properties.components = sml.components;
    if ('connections' in sml && sml.connections)
      properties.connections = sml.connections;

    return {
      type: 'Feature',
      id: sml.id || sml.uniqueId,
      geometry: geometry || null,
      properties,
    } as unknown as ProcedureFeature;
  }

  parseSWE(data: Record<string, unknown>): ProcedureFeature {
    throw new CSAPIParseError(
      'SWE format not applicable for Procedure resources'
    );
  }

  validate(
    data: ProcedureFeature,
    format: string
  ): { valid: boolean; errors?: string[]; warnings?: string[] } {
    if (format !== 'geojson') {
      return { valid: true };
    }

    const result = validateProcedureFeature(data);
    return {
      valid: result.valid,
      errors: result.errors,
    };
  }
}

/**
 * Sampling Feature parser
 */
export class SamplingFeatureParser extends CSAPIParser<SamplingFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): SamplingFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError(
        'Expected single Feature, got FeatureCollection'
      );
    }
    return data as SamplingFeature;
  }

  parseSensorML(data: Record<string, unknown>): SamplingFeature {
    throw new CSAPIParseError(
      'SensorML format not applicable for Sampling Features'
    );
  }

  parseSWE(data: Record<string, unknown>): SamplingFeature {
    throw new CSAPIParseError(
      'SWE format not applicable for Sampling Features'
    );
  }

  validate(
    data: SamplingFeature,
    format: string
  ): { valid: boolean; errors?: string[]; warnings?: string[] } {
    if (format !== 'geojson') {
      return { valid: true };
    }

    const result = validateSamplingFeature(data);
    return {
      valid: result.valid,
      errors: result.errors,
    };
  }
}

/**
 * Property parser
 */
export class PropertyParser extends CSAPIParser<PropertyFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): PropertyFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError(
        'Expected single Feature, got FeatureCollection'
      );
    }
    return data as PropertyFeature;
  }

  parseSensorML(data: Record<string, unknown>): PropertyFeature {
    const sml = data as unknown as DerivedProperty;

    // Build properties from SensorML metadata
    const properties: Record<string, unknown> = {
      ...extractCommonProperties(sml),
      featureType: 'Property',
    };

    // Add property-specific fields
    if (sml.baseProperty) properties.baseProperty = sml.baseProperty;
    if (sml.statistic) properties.statistic = sml.statistic;

    return {
      type: 'Feature',
      id: (sml as DescribedObject).id || (sml as DescribedObject).uniqueId,
      geometry: null,
      properties,
    } as unknown as PropertyFeature;
  }

  parseSWE(data: Record<string, unknown>): PropertyFeature {
    throw new CSAPIParseError(
      'SWE format not applicable for Property resources'
    );
  }

  validate(
    data: PropertyFeature,
    format: string
  ): { valid: boolean; errors?: string[]; warnings?: string[] } {
    if (format !== 'geojson') {
      return { valid: true };
    }

    const result = validatePropertyFeature(data);
    return {
      valid: result.valid,
      errors: result.errors,
    };
  }
}

/**
 * Datastream parser
 */
export class DatastreamParser extends CSAPIParser<DatastreamFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): DatastreamFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError(
        'Expected single Feature, got FeatureCollection'
      );
    }
    return data as DatastreamFeature;
  }

  parseSensorML(data: Record<string, unknown>): DatastreamFeature {
    throw new CSAPIParseError('Datastreams not defined in SensorML format');
  }

  /**
   * Parse Datastream from SWE Common format.
   *
   * Extracts schema information from SWE DataStream or DataRecord components
   * and converts to GeoJSON Feature format with schema as properties.
   *
   * @param data - SWE Common component (DataStream, DataRecord, etc.)
   * @returns GeoJSON Feature with schema information in properties
   * @throws CSAPIParseError if SWE component is invalid or cannot be parsed
   */
  parseSWE(data: Record<string, unknown>): DatastreamFeature {
    try {
      // Parse SWE DataStream or DataRecord component
      let parsedComponent: any;

      if (data.type === 'DataStream') {
        parsedComponent = parseDataStreamComponent(data);
      } else if (data.type === 'DataRecord') {
        // Some servers may return DataRecord directly as schema
        parsedComponent = parseDataRecordComponent(data);
      } else {
        // Try generic component parser
        parsedComponent = parseDataComponent(data);
      }

      // Extract schema information
      const properties: Record<string, unknown> = {
        featureType: 'Datastream',
        definition: parsedComponent.definition,
        name: parsedComponent.label,
        description: parsedComponent.description,
        schema: this.extractSchema(parsedComponent),
      };

      // Add encoding information if present
      if ('encoding' in parsedComponent && parsedComponent.encoding) {
        properties.encoding = parsedComponent.encoding;
      }

      // Add elementCount if present (for DataStream)
      if (
        'elementCount' in parsedComponent &&
        parsedComponent.elementCount !== undefined
      ) {
        properties.elementCount = parsedComponent.elementCount;
      }

      // Build GeoJSON Feature
      return {
        type: 'Feature',
        id: (parsedComponent as any).id || (parsedComponent as any).uniqueId,
        geometry: null, // Datastreams don't have geometry
        properties,
      } as unknown as DatastreamFeature;
    } catch (error) {
      if (error instanceof Error) {
        throw new CSAPIParseError(
          `Failed to parse SWE Datastream schema: ${error.message}`,
          'swe',
          error
        );
      }
      throw error;
    }
  }

  /**
   * Extract schema structure from SWE component
   * Handles DataStream (with elementType) and DataRecord (with fields)
   */
  private extractSchema(component: any): Record<string, unknown> {
    const schema: Record<string, unknown> = {
      type: component.type,
      definition: component.definition,
      label: component.label,
    };

    // For DataStream, extract elementType schema
    if (component.type === 'DataStream' && component.elementType) {
      // elementType has a "component" wrapper, extract the actual component
      const actualComponent =
        component.elementType.component || component.elementType;
      schema.elementType = this.extractSchema(actualComponent);
    }

    // For DataRecord, extract field schemas
    if (component.type === 'DataRecord' && component.fields) {
      schema.fields = component.fields.map((field: any) => ({
        name: field.name,
        definition: field.component?.definition,
        label: field.component?.label,
        type: field.component?.type,
        uom: field.component?.uom,
        constraint: field.component?.constraint,
      }));
    }

    // For DataArray, extract elementType
    if (component.type === 'DataArray') {
      schema.elementCount = component.elementCount;
      if (component.elementType) {
        // elementType has a "component" wrapper, extract the actual component
        const actualComponent =
          component.elementType.component || component.elementType;
        schema.elementType = this.extractSchema(actualComponent);
      }
    }

    // For Vector, extract coordinates
    if (component.type === 'Vector' && component.coordinates) {
      schema.referenceFrame = component.referenceFrame;
      schema.coordinates = component.coordinates.map((coord: any) => ({
        name: coord.name,
        component: {
          type: coord.component?.type,
          definition: coord.component?.definition,
          label: coord.component?.label,
          uom: coord.component?.uom,
        },
      }));
    }

    // Add UoM for quantity-based components
    if ('uom' in component && component.uom) {
      schema.uom = component.uom;
    }

    // Add constraint information
    if ('constraint' in component && component.constraint) {
      schema.constraint = component.constraint;
    }

    return schema;
  }

  validate(
    data: DatastreamFeature,
    format: string
  ): { valid: boolean; errors?: string[]; warnings?: string[] } {
    if (format !== 'geojson') {
      return { valid: true };
    }

    const result = validateDatastreamFeature(data);
    return {
      valid: result.valid,
      errors: result.errors,
    };
  }
}

/**
 * ControlStream parser
 */
export class ControlStreamParser extends CSAPIParser<ControlStreamFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): ControlStreamFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError(
        'Expected single Feature, got FeatureCollection'
      );
    }
    return data as ControlStreamFeature;
  }

  parseSensorML(data: Record<string, unknown>): ControlStreamFeature {
    throw new CSAPIParseError('ControlStreams not defined in SensorML format');
  }

  /**
   * Parse ControlStream from SWE Common format.
   *
   * Extracts command schema information from SWE DataRecord or DataChoice components
   * and converts to GeoJSON Feature format with schema as properties.
   *
   * Supported SWE types:
   * - DataRecord (command parameter fields)
   * - DataChoice (alternative command modes)
   * - DataArray (repeating commands)
   * - Any other SWE component (treated as single parameter)
   *
   * @param data - SWE Common component (DataRecord, DataChoice, etc.)
   * @returns GeoJSON Feature with command schema information in properties
   * @throws CSAPIParseError if SWE component is invalid or cannot be parsed
   */
  parseSWE(data: Record<string, unknown>): ControlStreamFeature {
    try {
      // Parse SWE DataRecord, DataChoice, or other component describing command schema
      let parsedComponent: any;

      if (data.type === 'DataRecord') {
        // Most common: DataRecord with command parameter fields
        parsedComponent = parseDataRecordComponent(data);
      } else if (data.type === 'DataChoice') {
        // Alternative command modes
        parsedComponent = parseDataChoiceComponent(data);
      } else {
        // Try generic component parser (could be DataArray, Vector, etc.)
        parsedComponent = parseDataComponent(data);
      }

      // Extract command schema information
      const properties: Record<string, unknown> = {
        featureType: 'ControlStream',
        definition: parsedComponent.definition,
        name: parsedComponent.label,
        description: parsedComponent.description,
        commandSchemaObject: this.extractCommandSchema(parsedComponent),
      };

      // Build GeoJSON Feature
      return {
        type: 'Feature',
        id: (parsedComponent as any).id || (parsedComponent as any).uniqueId,
        geometry: null, // ControlStreams don't have geometry
        properties,
      } as unknown as ControlStreamFeature;
    } catch (error) {
      if (error instanceof Error) {
        throw new CSAPIParseError(
          `Failed to parse SWE ControlStream schema: ${error.message}`,
          'swe',
          error
        );
      }
      throw error;
    }
  }

  /**
   * Extract command schema structure from SWE component
   * Handles DataRecord (parameters), DataChoice (alternative modes), and other components
   */
  private extractCommandSchema(component: any): Record<string, unknown> {
    const schema: Record<string, unknown> = {
      type: component.type,
      definition: component.definition,
      label: component.label,
    };

    // For DataRecord, extract parameter fields
    if (component.type === 'DataRecord' && component.fields) {
      schema.parameters = component.fields.map((field: any) => ({
        name: field.name,
        definition: field.component?.definition,
        label: field.component?.label,
        type: field.component?.type,
        uom: field.component?.uom,
        constraint: field.component?.constraint,
        description: field.component?.description,
      }));
    }

    // For DataChoice, extract alternative command modes
    if (component.type === 'DataChoice' && component.items) {
      schema.modes = component.items.map((item: any) => ({
        name: item.name,
        definition: item.component?.definition,
        label: item.component?.label,
        type: item.component?.type,
        // Recursively extract parameters if mode has DataRecord
        parameters:
          item.component?.type === 'DataRecord' && item.component?.fields
            ? item.component.fields.map((field: any) => ({
                name: field.name,
                definition: field.component?.definition,
                label: field.component?.label,
                type: field.component?.type,
                uom: field.component?.uom,
                constraint: field.component?.constraint,
              }))
            : undefined,
      }));
    }

    // For DataArray, extract element type (repeating command)
    if (component.type === 'DataArray') {
      schema.elementCount = component.elementCount;
      if (component.elementType) {
        schema.elementType = this.extractCommandSchema(component.elementType);
      }
    }

    // Add constraint information for validation
    if ('constraint' in component && component.constraint) {
      schema.constraint = component.constraint;
    }

    // Add UoM for quantity-based parameters
    if ('uom' in component && component.uom) {
      schema.uom = component.uom;
    }

    return schema;
  }

  validate(
    data: ControlStreamFeature,
    format: string
  ): { valid: boolean; errors?: string[]; warnings?: string[] } {
    if (format !== 'geojson') {
      return { valid: true };
    }

    const result = validateControlStreamFeature(data);
    return {
      valid: result.valid,
      errors: result.errors,
    };
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
    return (data as FeatureCollection).features.map((feature) =>
      this.itemParser.parseGeoJSON(feature)
    );
  }

  parseSensorML(data: Record<string, unknown>): T[] {
    if (Array.isArray(data)) {
      return data.map((item) => this.itemParser.parseSensorML(item));
    }
    return [this.itemParser.parseSensorML(data)];
  }

  parseSWE(data: Record<string, unknown>): T[] {
    if (Array.isArray(data)) {
      return data.map((item) => this.itemParser.parseSWE(item));
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
export const deploymentCollectionParser = new CollectionParser(
  deploymentParser
);
export const procedureCollectionParser = new CollectionParser(procedureParser);
export const samplingFeatureCollectionParser = new CollectionParser(
  samplingFeatureParser
);
export const propertyCollectionParser = new CollectionParser(propertyParser);
export const datastreamCollectionParser = new CollectionParser(
  datastreamParser
);
export const controlStreamCollectionParser = new CollectionParser(
  controlStreamParser
);
