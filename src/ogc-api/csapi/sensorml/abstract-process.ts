/**
 * SensorML 3.0 Abstract Process Types
 * 
 * Base process types that all SensorML processes inherit from.
 * Based on OGC SensorML 3.0 Standard (OGC 23-000).
 */

import type { DescribedObject, XLink, Configuration, Mode } from './base-types';
import type { AbstractDataComponent } from '../swe-common/base-types';

/**
 * Input definition
 */
export interface Input {
  name: string;
  definition?: string;
  label?: string;
  component: AbstractDataComponent;
}

/**
 * Output definition
 */
export interface Output {
  name: string;
  definition?: string;
  label?: string;
  component: AbstractDataComponent;
}

/**
 * Parameter definition
 */
export interface Parameter {
  name: string;
  definition?: string;
  label?: string;
  component: AbstractDataComponent;
}

/**
 * Feature of interest
 */
export interface FeatureOfInterest {
  href: string;
  type?: string;
  title?: string;
}

/**
 * Base abstract process interface
 * All SensorML processes (Simple, Aggregate, Physical) extend this
 */
export interface AbstractProcess extends DescribedObject {
  definition?: string;
  typeOf?: XLink;
  configuration?: Configuration;
  featuresOfInterest?: FeatureOfInterest[];
  inputs?: Input[];
  outputs?: Output[];
  parameters?: Parameter[];
  modes?: Mode[];
  // Link references
  links?: XLink[];
}
