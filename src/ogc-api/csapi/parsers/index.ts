/**
 * CSAPI Parsers
 * 
 * Parsers for all CSAPI formats and resource types.
 * 
 * Usage:
 * ```typescript
 * import { systemParser } from '@/ogc-api/csapi/parsers';
 * 
 * const result = systemParser.parse(responseData, {
 *   contentType: 'application/geo+json',
 *   validate: true
 * });
 * 
 * console.log(result.data); // Typed SystemFeature
 * console.log(result.format); // Format detection result
 * ```
 * 
 * @module parsers
 */

// Base parser infrastructure
export {
  CSAPIParser,
  CSAPIParseError,
  SystemParser,
  SystemCollectionParser,
  systemParser,
  systemCollectionParser,
  type ParseResult,
  type ParserOptions,
} from './base';

// Resource-specific parsers
export {
  DeploymentParser,
  ProcedureParser,
  SamplingFeatureParser,
  PropertyParser,
  DatastreamParser,
  ControlStreamParser,
  ObservationParser,
  CommandParser,
  CollectionParser,
  deploymentParser,
  procedureParser,
  samplingFeatureParser,
  propertyParser,
  datastreamParser,
  controlStreamParser,
  observationParser,
  commandParser,
  deploymentCollectionParser,
  procedureCollectionParser,
  samplingFeatureCollectionParser,
  propertyCollectionParser,
  datastreamCollectionParser,
  controlStreamCollectionParser,
} from './resources';
