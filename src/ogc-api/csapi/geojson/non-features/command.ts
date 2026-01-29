/**
 * Command types for CSAPI
 *
 * Commands are NOT GeoJSON features. They represent individual control commands
 * sent to systems to modify their state or behavior. Commands use SWE Common
 * data structures for parameters.
 *
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_commands_2
 */

import type { ISODateTime, Link, TimeExtent, UniqueID } from '../base-types.js';

/**
 * Command status
 */
export type CommandStatus =
  | 'pending'
  | 'accepted'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Individual Command (NOT a GeoJSON feature)
 *
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_command_resource
 */
export interface Command {
  /**
   * Unique identifier for this command
   */
  id?: UniqueID;

  /**
   * Type identifier (often 'Command' or specific subtype)
   */
  type?: string;

  /**
   * ID of the control stream this command belongs to
   */
  controlStream: UniqueID;

  /**
   * Time when the command was issued
   */
  issueTime: ISODateTime;

  /**
   * Time when the command should be executed
   */
  executionTime?: ISODateTime | TimeExtent;

  /**
   * Status of command execution
   */
  status?: CommandStatus;

  /**
   * Parameters for the command
   * Structure depends on control stream schema (SWE Common types)
   */
  parameters: unknown;

  /**
   * Result of command execution (if completed)
   */
  result?: unknown;

  /**
   * Error message (if failed)
   */
  error?: string;

  /**
   * Links to related resources
   */
  links?: Link[];
}

/**
 * Collection of Commands (NOT a GeoJSON FeatureCollection)
 *
 * @see https://docs.ogc.org/is/23-002r1/23-002r1.html#_commands_2
 */
export interface CommandCollection {
  /**
   * Type identifier
   */
  type?: string;

  /**
   * Array of commands
   */
  commands: Command[];

  /**
   * Links for pagination and related resources
   */
  links?: Link[];

  /**
   * Number of commands returned
   */
  numberReturned?: number;

  /**
   * Total number of commands available
   */
  numberMatched?: number;

  /**
   * Timestamp when collection was generated
   */
  timeStamp?: ISODateTime;
}

/**
 * Type guard to check if object is a Command
 */
export function isCommand(obj: unknown): obj is Command {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'controlStream' in obj &&
    'issueTime' in obj &&
    'parameters' in obj
  );
}

/**
 * Type guard to check if object is a Command Collection
 */
export function isCommandCollection(obj: unknown): obj is CommandCollection {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'commands' in obj &&
    Array.isArray((obj as any).commands)
  );
}
