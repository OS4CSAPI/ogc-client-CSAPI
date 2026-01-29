import type { Link } from '../base-types.js';

/**
 * System Event resource (NOT a GeoJSON Feature)
 *
 * System events represent significant occurrences in a system's lifecycle,
 * such as state changes, configuration updates, alerts, or notifications.
 *
 * @see https://docs.ogc.org/is/23-002/23-002.html#_system_events
 */

/**
 * System event type enumeration
 */
export type SystemEventType =
  | 'online'
  | 'offline'
  | 'configurationChange'
  | 'calibration'
  | 'maintenance'
  | 'alert'
  | 'warning'
  | 'error'
  | 'other';

/**
 * System Event resource
 *
 * Represents a significant occurrence in a system's lifecycle.
 * System events are non-spatial resources (not GeoJSON features).
 */
export interface SystemEvent {
  /** Unique identifier for the system event */
  id: string;

  /** Resource type indicator */
  type: 'SystemEvent';

  /** Link to the system that generated this event */
  system: Link;

  /** Type of system event */
  eventType: SystemEventType | string;

  /** Time when the event occurred (ISO 8601 timestamp) */
  eventTime: string;

  /** Human-readable description of the event */
  description?: string;

  /** Additional event-specific properties */
  properties?: Record<string, any>;

  /** Related links (e.g., self, system, collection) */
  links?: Link[];
}

/**
 * System Event Collection
 *
 * Collection of system event resources with pagination links.
 */
export interface SystemEventCollection {
  /** Collection type indicator */
  type: 'SystemEventCollection';

  /** Array of system events */
  systemEvents: SystemEvent[];

  /** Related links (e.g., self, next, prev) */
  links?: Link[];

  /** Optional count of total matching events (if known) */
  count?: number;

  /** Timestamp when collection was generated */
  timeStamp?: string;
}
