/**
 * CSAPI Response Parser
 * 
 * Unified parser for all CSAPI response formats (GeoJSON, SensorML, SWE Common).
 * Automatically detects format and parses to appropriate typed objects.
 */

import type { FeatureCollection, Feature, Point, Geometry } from 'geojson';
import type { 
  SystemFeature, 
  DeploymentFeature, 
  ProcedureFeature,
  SamplingFeature,
  PropertyFeature,
  DatastreamFeature,
  ControlStreamFeature,
} from '../geojson';
import type { SensorMLProcess, Deployment, DerivedProperty } from '../sensorml';
import type { AbstractDataComponent } from '../swe-common';
import { detectFormat, type FormatDetectionResult } from '../formats';
import type { Position } from '../sensorml/abstract-physical-process';
import type { DescribedObject } from '../sensorml/base-types';
import {
  validateSystemFeature,
  type ValidationResult,
} from '../validation';

/**
 * Helper: Extract geometry from SensorML Position
 */
function extractGeometry(position?: Position): Geometry | undefined {
  if (!position) return undefined;

  // Check if it's a GeoJSON Point
  if (
    typeof position === 'object' &&
    'type' in position &&
    position.type === 'Point'
  ) {
    return position as Point;
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
        coordinates: [
          pos.lon,
          pos.lat,
          pos.h !== undefined ? pos.h : 0,
        ],
      } as Point;
    }
  }

  // For other types (TextComponent, Process, XLink, etc.), return undefined
  // These would need additional resolution steps
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
  if (sml.keywords) props.keywords = sml.keywords.map(k => k.value);
  if (sml.identifiers) props.identifiers = sml.identifiers;
  if (sml.classifiers) props.classifiers = sml.classifiers;
  if (sml.validTime) props.validTime = sml.validTime;
  if (sml.contacts) props.contacts = sml.contacts;
  if (sml.documents) props.documents = sml.documents;
  if (sml.securityConstraints) props.securityConstraints = sml.securityConstraints;
  if (sml.legalConstraints) props.legalConstraints = sml.legalConstraints;

  return props;
}

/**
 * Parse result with metadata
 */
export interface ParseResult<T> {
  data: T;
  format: FormatDetectionResult;
  errors?: string[];
  warnings?: string[];
}

/**
 * Parse error
 */
export class CSAPIParseError extends Error {
  constructor(
    message: string,
    public readonly format?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'CSAPIParseError';
  }
}

/**
 * Parser options
 */
export interface ParserOptions {
  /**
   * Validate parsed data (requires validators to be initialized)
   */
  validate?: boolean;
  
  /**
   * Strict mode - throw on validation errors
   */
  strict?: boolean;
  
  /**
   * Override content type detection
   */
  contentType?: string;
}

/**
 * Base parser class
 */
export abstract class CSAPIParser<T> {
  /**
   * Parse response with automatic format detection
   */
  parse(
    data: unknown,
    options: ParserOptions = {}
  ): ParseResult<T> {
    const format = detectFormat(options.contentType || null, data);
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Parse based on detected format
      let parsed: T;
      switch (format.format) {
        case 'geojson':
          parsed = this.parseGeoJSON(data as any);
          break;
        case 'sensorml':
          parsed = this.parseSensorML(data as any);
          break;
        case 'swe':
          parsed = this.parseSWE(data as any);
          break;
        default:
          parsed = this.parseJSON(data as any);
      }

      // Validate if requested
      if (options.validate) {
        const validationResult = this.validate(parsed, format.format);
        if (!validationResult.valid) {
          errors.push(...(validationResult.errors || []));
          if (options.strict) {
            throw new CSAPIParseError(
              `Validation failed: ${errors.join(', ')}`,
              format.format
            );
          }
        }
        warnings.push(...(validationResult.warnings || []));
      }

      return {
        data: parsed,
        format,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      if (error instanceof CSAPIParseError) {
        throw error;
      }
      throw new CSAPIParseError(
        `Failed to parse ${format.format} data: ${error}`,
        format.format,
        error
      );
    }
  }

  /**
   * Parse GeoJSON format
   */
  abstract parseGeoJSON(data: Feature | FeatureCollection): T;

  /**
   * Parse SensorML format
   */
  abstract parseSensorML(data: Record<string, unknown>): T;

  /**
   * Parse SWE Common format
   */
  abstract parseSWE(data: Record<string, unknown>): T;

  /**
   * Parse generic JSON (fallback)
   */
  parseJSON(data: Record<string, unknown>): T {
    // Default: try each format until one works
    try {
      return this.parseGeoJSON(data as any);
    } catch {
      try {
        return this.parseSensorML(data);
      } catch {
        try {
          return this.parseSWE(data);
        } catch {
          throw new CSAPIParseError('Unable to parse data in any known format');
        }
      }
    }
  }

  /**
   * Validate parsed data
   * Override in subclasses to provide format-specific validation
   */
  validate(
    data: T,
    format: string
  ): { valid: boolean; errors?: string[]; warnings?: string[] } {
    // Default: no validation
    return { valid: true };
  }
}

/**
 * Parser for System resources
 */
export class SystemParser extends CSAPIParser<SystemFeature> {
  parseGeoJSON(data: Feature | FeatureCollection): SystemFeature {
    if (data.type === 'FeatureCollection') {
      throw new CSAPIParseError('Expected single Feature, got FeatureCollection');
    }
    return data as SystemFeature;
  }

  parseSensorML(data: Record<string, unknown>): SystemFeature {
    const sml = data as unknown as SensorMLProcess;

    // Validate it's a physical system/component
    if (
      sml.type !== 'PhysicalSystem' &&
      sml.type !== 'PhysicalComponent'
    ) {
      throw new CSAPIParseError(
        `Expected PhysicalSystem or PhysicalComponent, got ${sml.type}`
      );
    }

    // Extract geometry from position
    const geometry = 'position' in sml ? extractGeometry(sml.position as Position) : undefined;

    // Build properties from SensorML metadata
    const properties: Record<string, unknown> = {
      ...extractCommonProperties(sml),
      featureType: 'system',
      systemType: sml.type === 'PhysicalSystem' ? 'platform' : 'sensor',
    };

    // Add inputs/outputs/parameters if present
    if ('inputs' in sml && sml.inputs) properties.inputs = sml.inputs;
    if ('outputs' in sml && sml.outputs) properties.outputs = sml.outputs;
    if ('parameters' in sml && sml.parameters) properties.parameters = sml.parameters;

    // Add components for systems
    if (sml.type === 'PhysicalSystem' && 'components' in sml && sml.components) {
      properties.components = sml.components;
    }

    return {
      type: 'Feature',
      id: sml.id || sml.uniqueId,
      geometry: geometry || null,
      properties,
    } as unknown as SystemFeature;
  }

  parseSWE(data: Record<string, unknown>): SystemFeature {
    throw new CSAPIParseError('SWE format not applicable for System resources');
  }

  validate(
    data: SystemFeature,
    format: string
  ): { valid: boolean; errors?: string[]; warnings?: string[] } {
    // Only validate GeoJSON format
    if (format !== 'geojson') {
      return { valid: true };
    }

    const result = validateSystemFeature(data);
    return {
      valid: result.valid,
      errors: result.errors,
    };
  }
}

/**
 * Parser for System collections
 */
export class SystemCollectionParser extends CSAPIParser<SystemFeature[]> {
  parseGeoJSON(data: Feature | FeatureCollection): SystemFeature[] {
    if (data.type === 'Feature') {
      return [data as SystemFeature];
    }
    return (data as FeatureCollection).features as SystemFeature[];
  }

  parseSensorML(data: Record<string, unknown>): SystemFeature[] {
    // TODO: Implement SensorML collection parsing
    throw new CSAPIParseError('SensorML collection parsing not yet implemented');
  }

  parseSWE(data: Record<string, unknown>): SystemFeature[] {
    throw new CSAPIParseError('SWE format not applicable for System resources');
  }
}

// Export parser instances for convenience
export const systemParser = new SystemParser();
export const systemCollectionParser = new SystemCollectionParser();
