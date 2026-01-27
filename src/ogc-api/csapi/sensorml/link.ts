/**
 * SensorML 3.0 Link Type
 * 
 * Links connect outputs of one process/component to inputs of another.
 * Based on OGC SensorML 3.0 Standard (OGC 23-000) Clause 8.8.
 * 
 * @module sensorml/link
 */

/**
 * Link interface
 * 
 * Represents a connection between process outputs and inputs.
 * Used in AggregateProcess and PhysicalSystem to define data flow.
 */
export interface Link {
  /**
   * Path to the source output
   * Format: "componentName/outputName" or just "outputName"
   */
  source: string;
  
  /**
   * Path to the destination input
   * Format: "componentName/inputName" or just "inputName"
   */
  destination: string;
}

/**
 * Type guard for Link
 */
export function isLink(obj: unknown): obj is Link {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'source' in obj &&
    'destination' in obj &&
    typeof obj.source === 'string' &&
    typeof obj.destination === 'string'
  );
}
