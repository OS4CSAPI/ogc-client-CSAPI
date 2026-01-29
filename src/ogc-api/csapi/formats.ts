/**
 * CSAPI Format Detection and Constants
 *
 * Handles detection and management of different response formats
 * used by OGC API Connected Systems.
 */

/**
 * Media types used by CSAPI
 */
export const CSAPI_MEDIA_TYPES = {
  GEOJSON: 'application/geo+json',
  SENSORML_JSON: 'application/sml+json',
  SWE_JSON: 'application/swe+json',
  JSON: 'application/json',
} as const;

/**
 * Supported format types
 */
export type CSAPIFormat = 'geojson' | 'sensorml' | 'swe' | 'json';

/**
 * Result of format detection
 */
export interface FormatDetectionResult {
  format: CSAPIFormat;
  mediaType: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Detect format from Content-Type header
 */
export function detectFormatFromContentType(
  contentType: string | null
): FormatDetectionResult | null {
  if (!contentType) {
    return null;
  }

  // Normalize: extract just the media type, ignore parameters
  const mediaType = contentType.split(';')[0].trim().toLowerCase();

  if (mediaType === CSAPI_MEDIA_TYPES.GEOJSON) {
    return { format: 'geojson', mediaType, confidence: 'high' };
  }

  if (mediaType === CSAPI_MEDIA_TYPES.SENSORML_JSON) {
    return { format: 'sensorml', mediaType, confidence: 'high' };
  }

  if (mediaType === CSAPI_MEDIA_TYPES.SWE_JSON) {
    return { format: 'swe', mediaType, confidence: 'high' };
  }

  if (mediaType === CSAPI_MEDIA_TYPES.JSON) {
    // Generic JSON - will need content inspection
    return { format: 'json', mediaType, confidence: 'low' };
  }

  return null;
}

/**
 * Detect format from response body structure
 *
 * This is used as a fallback when Content-Type header is missing or ambiguous.
 */
export function detectFormatFromBody(body: unknown): FormatDetectionResult {
  if (!body || typeof body !== 'object') {
    return { format: 'json', mediaType: 'application/json', confidence: 'low' };
  }

  const obj = body as Record<string, unknown>;

  // GeoJSON detection
  if (obj.type === 'Feature' || obj.type === 'FeatureCollection') {
    return {
      format: 'geojson',
      mediaType: CSAPI_MEDIA_TYPES.GEOJSON,
      confidence: 'high',
    };
  }

  // SensorML detection - look for type field with SensorML values
  if (typeof obj.type === 'string') {
    const type = obj.type;
    if (
      type === 'PhysicalSystem' ||
      type === 'PhysicalComponent' ||
      type === 'SimpleProcess' ||
      type === 'AggregateProcess' ||
      type === 'Deployment'
    ) {
      return {
        format: 'sensorml',
        mediaType: CSAPI_MEDIA_TYPES.SENSORML_JSON,
        confidence: 'high',
      };
    }
  }

  // SWE Common detection - look for type field with SWE values
  if (typeof obj.type === 'string') {
    const type = obj.type;
    if (
      type === 'Boolean' ||
      type === 'Text' ||
      type === 'Category' ||
      type === 'Count' ||
      type === 'Quantity' ||
      type === 'Time' ||
      type === 'DataRecord' ||
      type === 'Vector' ||
      type === 'DataChoice' ||
      type === 'DataArray' ||
      type === 'Matrix' ||
      type === 'DataStream'
    ) {
      return {
        format: 'swe',
        mediaType: CSAPI_MEDIA_TYPES.SWE_JSON,
        confidence: 'medium',
      };
    }
  }

  // Default to generic JSON
  return { format: 'json', mediaType: 'application/json', confidence: 'low' };
}

/**
 * Detect format from both Content-Type header and body
 *
 * Prefers Content-Type header when available and unambiguous,
 * falls back to body inspection when needed.
 */
export function detectFormat(
  contentType: string | null,
  body: unknown
): FormatDetectionResult {
  const headerResult = detectFormatFromContentType(contentType);

  // If we have high confidence from header, use it
  if (headerResult && headerResult.confidence === 'high') {
    return headerResult;
  }

  // Otherwise inspect the body
  const bodyResult = detectFormatFromBody(body);

  // If body gives us high confidence, use it
  if (bodyResult.confidence === 'high') {
    return bodyResult;
  }

  // Use header result if available, otherwise use body result
  return headerResult || bodyResult;
}
