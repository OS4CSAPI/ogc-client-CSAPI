/**
 * SensorML 3.0 Base Types
 *
 * Core type definitions for SensorML 3.0 JSON encoding.
 * Based on OGC SensorML 3.0 Standard (OGC 23-000).
 *
 * References:
 * - https://schemas.opengis.net/sensorML/3.0/json/
 * - OGC 23-000: SensorML 3.0 Standard
 */

import type { GeoJsonProperties } from 'geojson';
import type { Event } from './event';
export type { Event } from './event';

/**
 * Web link structure used for references between SensorML objects
 */
export interface XLink {
  href: string;
  uid?: string;
  title?: string;
  type?: string;
  rel?: string;
}

/**
 * Path reference to a property within a SensorML document
 */
export interface PathRef {
  ref: string;
}

/**
 * Named property with soft typing (used in component lists)
 */
export interface SoftNamedProperty {
  name: string;
}

/**
 * Identification info
 */
export interface Identifier {
  definition?: string;
  label?: string;
  value: string;
}

/**
 * Classifier info
 */
export interface Classifier {
  definition?: string;
  label?: string;
  value: string;
}

/**
 * Keyword
 */
export interface Keyword {
  label?: string;
  value: string;
}

/**
 * Contact information
 */
export interface Contact {
  role?: string;
  organisationName?: string;
  individualName?: string;
  contactInfo?: {
    website?: string;
    phone?: string;
    address?: {
      deliveryPoint?: string;
      city?: string;
      postalCode?: string;
      administrativeArea?: string;
      country?: string;
    };
    email?: string;
  };
}

/**
 * Document reference
 */
export interface Document {
  description?: string;
  format?: string;
  version?: string;
  date?: string;
  link: XLink;
}

/**
 * Constraint (legal or security)
 */
export interface Constraint {
  description?: string;
  reference?: XLink;
}

/**
 * Temporal validity period
 */
export interface ValidTime {
  beginPosition: string;
  endPosition?: string;
}

/**
 * Base interface for all SensorML described objects
 */
export interface DescribedObject {
  id?: string;
  uniqueId?: string;
  label?: string;
  description?: string;
  /**
   * Language code (e.g., 'en', 'fr') - ISO 639-1 two-letter code
   * From OGC 23-000 JSON Schema
   */
  lang?: string;
  /**
   * Keywords can be simple strings (per JSON schema) or enhanced Keyword objects
   * Schema-compliant: string[]
   * Enhanced: Keyword[] (with label and value)
   */
  keywords?: string[] | Keyword[];
  identifiers?: Identifier[];
  classifiers?: Classifier[];
  validTime?: ValidTime | string[];
  securityConstraints?: Constraint[];
  legalConstraints?: Constraint[];
  contacts?: Contact[];
  documents?: Document[];
  /**
   * History of events that affected this object
   * From OGC 23-000 JSON Schema
   */
  history?: Event[];
  capabilities?: CapabilityList[];
  characteristics?: CharacteristicList[];
}

/**
 * Process method (algorithm description)
 */
export interface ProcessMethod {
  algorithm?: unknown; // Could be various formats
  description?: string;
}

/**
 * Configuration settings
 */
export interface Configuration {
  settings?: Array<{
    ref: string;
    value: unknown;
  }>;
}

/**
 * Mode definition for configurable processes
 */
export interface Mode extends DescribedObject {
  configuration?: Configuration;
}

/**
 * Capability (from Clause 8.2.8)
 * Describes a capability or performance characteristic
 */
export interface Capability {
  name: string;
  value: unknown; // AbstractDataComponent from SWE Common
}

/**
 * CapabilityList (from Clause 8.2.8)
 * List of capabilities for a system or process
 */
export interface CapabilityList {
  capabilities: Capability[];
}

/**
 * Characteristic (from Clause 8.2.7)
 * Describes a physical or functional characteristic
 */
export interface Characteristic {
  name: string;
  value: unknown; // AbstractDataComponent from SWE Common
}

/**
 * CharacteristicList (from Clause 8.2.7)
 * List of characteristics for a system or process
 */
export interface CharacteristicList {
  characteristics: Characteristic[];
}
