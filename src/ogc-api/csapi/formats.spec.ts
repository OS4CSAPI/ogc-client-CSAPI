/**
 * Tests for CSAPI Format Detection
 */

import {
  detectFormat,
  detectFormatFromContentType,
  detectFormatFromBody,
  CSAPI_MEDIA_TYPES,
} from './formats.js';

describe('Format Detection', () => {
  describe('detectFormatFromContentType', () => {
    it('should detect GeoJSON from content type', () => {
      const result = detectFormatFromContentType('application/geo+json');
      expect(result).toBeDefined();
      expect(result?.format).toBe('geojson');
      expect(result?.confidence).toBe('high');
    });

    it('should detect SensorML from content type', () => {
      const result = detectFormatFromContentType('application/sml+json');
      expect(result).toBeDefined();
      expect(result?.format).toBe('sensorml');
      expect(result?.confidence).toBe('high');
    });

    it('should detect SWE from content type', () => {
      const result = detectFormatFromContentType('application/swe+json');
      expect(result).toBeDefined();
      expect(result?.format).toBe('swe');
      expect(result?.confidence).toBe('high');
    });

    it('should detect generic JSON with low confidence', () => {
      const result = detectFormatFromContentType('application/json');
      expect(result).toBeDefined();
      expect(result?.format).toBe('json');
      expect(result?.confidence).toBe('low');
    });

    it('should handle content type with parameters', () => {
      const result = detectFormatFromContentType(
        'application/geo+json; charset=utf-8'
      );
      expect(result?.format).toBe('geojson');
    });

    it('should return null for null content type', () => {
      const result = detectFormatFromContentType(null);
      expect(result).toBeNull();
    });

    it('should return null for unknown content type', () => {
      const result = detectFormatFromContentType('text/html');
      expect(result).toBeNull();
    });
  });

  describe('detectFormatFromBody', () => {
    describe('GeoJSON detection', () => {
      it('should detect GeoJSON Feature', () => {
        const data = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'system',
            uid: 'urn:test:system-1',
          },
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('geojson');
        expect(result.confidence).toBe('high');
      });

      it('should detect GeoJSON FeatureCollection', () => {
        const data = {
          type: 'FeatureCollection',
          features: [],
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('geojson');
        expect(result.confidence).toBe('high');
      });
    });

    describe('SensorML detection', () => {
      it('should detect PhysicalSystem', () => {
        const data = {
          type: 'PhysicalSystem',
          uniqueId: 'urn:test:system-1',
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('sensorml');
        expect(result.confidence).toBe('high');
      });

      it('should detect PhysicalComponent', () => {
        const data = {
          type: 'PhysicalComponent',
          uniqueId: 'urn:test:component-1',
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('sensorml');
        expect(result.confidence).toBe('high');
      });

      it('should detect SimpleProcess', () => {
        const data = {
          type: 'SimpleProcess',
          uniqueId: 'urn:test:process-1',
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('sensorml');
        expect(result.confidence).toBe('high');
      });

      it('should detect AggregateProcess', () => {
        const data = {
          type: 'AggregateProcess',
          uniqueId: 'urn:test:aggregate-1',
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('sensorml');
        expect(result.confidence).toBe('high');
      });
    });

    describe('SWE Common detection', () => {
      it('should detect DataRecord', () => {
        const data = {
          type: 'DataRecord',
          fields: [],
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('swe');
        expect(result.confidence).toBe('medium');
      });

      it('should detect DataArray', () => {
        const data = {
          type: 'DataArray',
          elementType: { type: 'Quantity' },
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('swe');
        expect(result.confidence).toBe('medium');
      });

      it('should detect Vector', () => {
        const data = {
          type: 'Vector',
          coordinates: [],
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('swe');
        expect(result.confidence).toBe('medium');
      });

      it('should detect Category', () => {
        const data = {
          type: 'Category',
          codeSpace: 'http://example.org/codes',
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('swe');
        expect(result.confidence).toBe('medium');
      });

      it('should detect Quantity', () => {
        const data = {
          type: 'Quantity',
          uom: { code: 'm' },
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('swe');
        expect(result.confidence).toBe('medium');
      });

      it('should detect Text', () => {
        const data = {
          type: 'Text',
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('swe');
        expect(result.confidence).toBe('medium');
      });
    });

    describe('Unknown format', () => {
      it('should return json for empty object', () => {
        const result = detectFormatFromBody({});
        expect(result.format).toBe('json');
        expect(result.confidence).toBe('low');
      });

      it('should return json for null', () => {
        const result = detectFormatFromBody(null as any);
        expect(result.format).toBe('json');
        expect(result.confidence).toBe('low');
      });

      it('should return json for undefined', () => {
        const result = detectFormatFromBody(undefined as any);
        expect(result.format).toBe('json');
        expect(result.confidence).toBe('low');
      });

      it('should return json for unrecognized type', () => {
        const data = {
          type: 'SomethingElse',
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('json');
        expect(result.confidence).toBe('low');
      });

      it('should return json for objects without type field', () => {
        const data = {
          someField: 'value',
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('json');
        expect(result.confidence).toBe('low');
      });
    });

    describe('Edge cases', () => {
      it('should handle objects with type as non-string', () => {
        const data = {
          type: 123,
        };

        const result = detectFormatFromBody(data as any);
        expect(result.format).toBe('json');
        expect(result.confidence).toBe('low');
      });

      it('should handle arrays', () => {
        const data = [{ type: 'Feature' }];

        const result = detectFormatFromBody(data as any);
        expect(result.format).toBe('json');
        expect(result.confidence).toBe('low');
      });

      it('should handle primitive values', () => {
        expect(detectFormatFromBody('string' as any).format).toBe('json');
        expect(detectFormatFromBody(123 as any).format).toBe('json');
        expect(detectFormatFromBody(true as any).format).toBe('json');
      });

      it('should be case-sensitive', () => {
        const data = {
          type: 'feature', // lowercase
        };

        const result = detectFormatFromBody(data);
        expect(result.format).toBe('json');
        expect(result.confidence).toBe('low');
      });
    });
  });

  describe('detectFormat (combined)', () => {
    it('should prefer high-confidence header result', () => {
      const result = detectFormat('application/geo+json', {
        type: 'SomethingElse',
      });
      expect(result.format).toBe('geojson');
      expect(result.confidence).toBe('high');
    });

    it('should use body result when header has low confidence', () => {
      const body = {
        type: 'Feature',
        geometry: null,
        properties: {},
      };

      const result = detectFormat('application/json', body);
      expect(result.format).toBe('geojson');
      expect(result.confidence).toBe('high');
    });

    it('should use body result when header is null', () => {
      const body = {
        type: 'PhysicalSystem',
        uniqueId: 'urn:test:system-1',
      };

      const result = detectFormat(null, body);
      expect(result.format).toBe('sensorml');
      expect(result.confidence).toBe('high');
    });

    it('should fallback to generic json when both are inconclusive', () => {
      const result = detectFormat(null, {});
      expect(result.format).toBe('json');
      expect(result.confidence).toBe('low');
    });
  });

  describe('MIME type constants', () => {
    it('should have correct MIME types defined', () => {
      expect(CSAPI_MEDIA_TYPES.GEOJSON).toBe('application/geo+json');
      expect(CSAPI_MEDIA_TYPES.SENSORML_JSON).toBe('application/sml+json');
      expect(CSAPI_MEDIA_TYPES.SWE_JSON).toBe('application/swe+json');
      expect(CSAPI_MEDIA_TYPES.JSON).toBe('application/json');
    });
  });
});
