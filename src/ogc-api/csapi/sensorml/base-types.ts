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
  keywords?: Keyword[];
  identifiers?: Identifier[];
  classifiers?: Classifier[];
  validTime?: ValidTime | string[];
  securityConstraints?: Constraint[];
  legalConstraints?: Constraint[];
  contacts?: Contact[];
  documents?: Document[];
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
