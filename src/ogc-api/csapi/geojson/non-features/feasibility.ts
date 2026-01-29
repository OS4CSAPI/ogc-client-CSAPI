import type { Link } from '../base-types.js';

/**
 * Feasibility resource (NOT a GeoJSON Feature)
 *
 * Feasibility requests allow clients to check whether a system can execute
 * a specific command or task before actually issuing it. This is useful for
 * validating command parameters, checking resource availability, and
 * determining scheduling constraints.
 *
 * @see https://docs.ogc.org/is/23-002/23-002.html#_feasibility
 */

/**
 * Feasibility request status
 */
export type FeasibilityStatus = 'pending' | 'completed' | 'failed';

/**
 * Feasibility result enumeration
 */
export type FeasibilityResult = 'feasible' | 'not-feasible' | 'unknown';

/**
 * Feasibility Request
 *
 * A request to check if a system can execute a specific task or command.
 */
export interface FeasibilityRequest {
  /** Unique identifier for the feasibility request */
  id?: string;

  /** Resource type indicator */
  type: 'FeasibilityRequest';

  /** Link to the system being queried */
  system: Link;

  /** Link to the control stream (if checking command feasibility) */
  controlStream?: Link;

  /** Proposed task/command parameters to validate */
  parameters?: Record<string, any>;

  /** Requested execution time window */
  requestedTime?: {
    /** Start of requested time window (ISO 8601) */
    start: string;
    /** End of requested time window (ISO 8601) */
    end: string;
  };

  /** Time when feasibility request was submitted (ISO 8601 timestamp) */
  requestTime?: string;

  /** Current status of the feasibility check */
  status?: FeasibilityStatus;

  /** Related links (e.g., self, system, result) */
  links?: Link[];
}

/**
 * Feasibility Response
 *
 * The result of a feasibility check, indicating whether the system
 * can execute the requested task.
 */
export interface FeasibilityResponse {
  /** Unique identifier for the feasibility response */
  id: string;

  /** Resource type indicator */
  type: 'FeasibilityResponse';

  /** Link to the original feasibility request */
  request: Link;

  /** Link to the system that was queried */
  system: Link;

  /** Whether the requested task is feasible */
  result: FeasibilityResult;

  /** Human-readable explanation of the feasibility result */
  reason?: string;

  /** Alternative time windows when task would be feasible */
  alternativeTimeWindows?: Array<{
    start: string;
    end: string;
  }>;

  /** Estimated cost or resource requirements (if feasible) */
  estimatedCost?: Record<string, any>;

  /** Time when feasibility check was completed (ISO 8601 timestamp) */
  completionTime?: string;

  /** Related links (e.g., self, request, system) */
  links?: Link[];
}
