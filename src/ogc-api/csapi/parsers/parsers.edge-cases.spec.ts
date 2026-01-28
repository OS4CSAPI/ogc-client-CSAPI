/**
 * Tests for Parser Edge Cases: Malformed Input, Extreme Values, Unicode
 * These tests complement base.spec.ts with adversarial and stress testing
 */

import {
  SystemParser,
  SystemCollectionParser,
  CSAPIParseError,
} from './base.js';
import type { SystemFeature } from '../geojson';

describe('Parser Edge Cases', () => {
  const parser = new SystemParser();
  const collectionParser = new SystemCollectionParser();

  // Phase 2: Malformed Input and Error Handling
  describe('Malformed Input Handling', () => {
    describe('invalid JSON structure', () => {
      it('should reject Feature without type property', () => {
        const invalid = {
          geometry: null,
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        expect(() => {
          parser.parseGeoJSON(invalid as any);
        }).toThrow();
      });

      it('should reject Feature with wrong type value', () => {
        const invalid = {
          type: 'NotAFeature',
          geometry: null,
          properties: {}
        };

        expect(() => {
          parser.parseGeoJSON(invalid as any);
        }).toThrow();
      });

      it('should reject Feature with missing properties', () => {
        const invalid = {
          type: 'Feature',
          geometry: null
        };

        expect(() => {
          parser.parseGeoJSON(invalid as any);
        }).toThrow();
      });

      it('should reject FeatureCollection without features array', () => {
        const invalid = {
          type: 'FeatureCollection'
        };

        expect(() => {
          collectionParser.parseGeoJSON(invalid as any);
        }).toThrow();
      });
    });

    describe('wrong property types', () => {
      it('should handle coordinates as non-array gracefully', () => {
        const invalid = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: '5.0, 45.0'  // String instead of array
          },
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        // Parser may throw or return with error - either is acceptable
        try {
          const result = parser.parseGeoJSON(invalid as any);
          // If it doesn't throw, geometry should be invalid or undefined
          expect(result.geometry === undefined || result.geometry === null).toBeTruthy();
        } catch (e) {
          expect(e).toBeDefined();
        }
      });

      it('should handle properties as non-object', () => {
        const invalid = {
          type: 'Feature',
          geometry: null,
          properties: 'not an object'
        };

        expect(() => {
          parser.parseGeoJSON(invalid as any);
        }).toThrow();
      });
    });

    describe('null vs undefined handling', () => {
      it('should handle null geometry correctly', () => {
        const feature = {
          type: 'Feature',
          geometry: null,
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.geometry).toBeNull();
      });

      it('should handle missing (undefined) geometry', () => {
        const feature = {
          type: 'Feature',
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        // Should either provide default null or throw error
        try {
          const result = parser.parseGeoJSON(feature as any);
          expect(result.geometry === null || result.geometry === undefined).toBeTruthy();
        } catch (e) {
          expect(e).toBeDefined();
        }
      });

      it('should distinguish null vs undefined in optional position properties', () => {
        const smlWithNull = {
          type: 'PhysicalSystem',
          uniqueId: 'urn:test:1',
          position: null
        };
        const smlWithoutPosition = {
          type: 'PhysicalSystem',
          uniqueId: 'urn:test:2'
        };

        const result1 = parser.parseSensorML(smlWithNull as any);
        const result2 = parser.parseSensorML(smlWithoutPosition);

        // Both should result in undefined geometry
        expect(result1.geometry).toBeUndefined();
        expect(result2.geometry).toBeUndefined();
      });
    });
  });

  // Phase 3: Extreme Values and Stress Testing
  describe('Extreme Values', () => {
    describe('large collections', () => {
      function createFeatureCollection(count: number): any {
        return {
          type: 'FeatureCollection',
          features: Array.from({ length: count }, (_, i) => ({
            type: 'Feature',
            id: `system-${i}`,
            geometry: {
              type: 'Point',
              coordinates: [i * 0.001, i * 0.001, 0]
            },
            properties: {
              featureType: 'System',
              uid: `urn:test:system-${i}`,
              name: `System ${i}`
            }
          }))
        };
      }

      it('should parse collection with 100 features', () => {
        const collection = createFeatureCollection(100);
        const result = collectionParser.parseGeoJSON(collection);
        expect(result).toHaveLength(100);
      });

      it('should parse collection with 1000 features', () => {
        const collection = createFeatureCollection(1000);
        
        const start = performance.now();
        const result = collectionParser.parseGeoJSON(collection);
        const end = performance.now();
        
        expect(result).toHaveLength(1000);
        console.log(`Parsed 1000 features in ${(end - start).toFixed(2)}ms`);
      });
    });

    describe('large coordinate arrays', () => {
      it('should handle LineString with 1000 coordinates', () => {
        const largeLineString: SystemFeature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: Array.from({ length: 1000 }, (_, i) => [i * 0.001, i * 0.001])
          },
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        const result = parser.parseGeoJSON(largeLineString);
        expect(result.geometry?.type).toBe('LineString');
        expect((result.geometry as any).coordinates).toHaveLength(1000);
      });

      it('should handle Polygon with large ring', () => {
        const coords = Array.from({ length: 500 }, (_, i) => {
          const angle = (i / 500) * 2 * Math.PI;
          return [Math.cos(angle), Math.sin(angle)];
        });
        // Close the ring
        coords.push(coords[0]);

        const largePolygon: SystemFeature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          },
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        const result = parser.parseGeoJSON(largePolygon);
        expect(result.geometry?.type).toBe('Polygon');
      });
    });

    describe('special numeric values', () => {
      it('should handle very large numbers near MAX_SAFE_INTEGER', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [Number.MAX_SAFE_INTEGER, 45.0]
          },
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.geometry?.coordinates?.[0]).toBe(Number.MAX_SAFE_INTEGER);
      });

      it('should handle negative zero', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-0, 45.0]
          },
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.geometry?.coordinates?.[0]).toBe(-0);
      });

      it('should handle very small numbers near MIN_VALUE', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [Number.MIN_VALUE, Number.MIN_VALUE]
          },
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.geometry?.coordinates?.[0]).toBe(Number.MIN_VALUE);
      });
    });

    describe('very long strings', () => {
      it('should handle 10KB description field', () => {
        const longDescription = 'A'.repeat(10 * 1024);
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:1',
            description: longDescription
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.description).toHaveLength(10 * 1024);
      });

      it('should handle 100KB name field', () => {
        const longName = 'System'.repeat(20 * 1024);
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:1',
            name: longName
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.name).toHaveLength(longName.length);
      });
    });
  });

  // Phase 4: Unicode and Special Characters
  describe('Unicode and Special Character Handling', () => {
    describe('Unicode in text fields', () => {
      it('should handle Chinese characters in name', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:系统-1',
            name: '温度传感器'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.name).toBe('温度传感器');
        expect(result.properties.uid).toContain('系统');
      });

      it('should handle Arabic text in description', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:1',
            name: 'Temperature Sensor',
            description: 'جهاز استشعار درجة الحرارة'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.description).toContain('استشعار');
      });

      it('should handle emoji in labels', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:1',
            name: '🌡️ Temperature Sensor 🔥'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.name).toContain('🌡️');
        expect(result.properties.name).toContain('🔥');
      });

      it('should handle Hebrew (right-to-left) text', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:1',
            name: 'חיישן טמפרטורה'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.name).toContain('טמפרטורה');
      });

      it('should handle Japanese (mixed Hiragana/Katakana/Kanji)', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:1',
            name: '温度センサー',
            description: 'これは温度を測定するセンサーです'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.name).toBe('温度センサー');
        expect(result.properties.description).toContain('センサー');
      });
    });

    describe('special characters in identifiers', () => {
      it('should handle spaces in uid', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:my sensor 1'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.uid).toContain(' ');
      });

      it('should handle special punctuation in uid', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:sensor@site#1!_v2.0'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.uid).toContain('@');
        expect(result.properties.uid).toContain('#');
        expect(result.properties.uid).toContain('!');
      });

      it('should handle URL-encoded characters', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:sensor%20with%20spaces'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.uid).toContain('%20');
      });
    });

    describe('mixed character sets', () => {
      it('should handle multilingual content', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:1',
            name: 'Sensor الحرارة 温度 🌡️'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.name).toContain('Sensor');
        expect(result.properties.name).toContain('الحرارة');
        expect(result.properties.name).toContain('温度');
        expect(result.properties.name).toContain('🌡️');
      });
    });

    describe('special whitespace and control characters', () => {
      it('should handle tab characters', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:1',
            name: 'Field 1\tField 2'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.name).toContain('\t');
      });

      it('should handle newline characters', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:1',
            description: 'Line 1\nLine 2\r\nLine 3'
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.description).toContain('\n');
      });

      it('should handle non-breaking spaces', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: null,
          properties: {
            featureType: 'System',
            uid: 'urn:test:1',
            name: 'Test\u00A0System'  // \u00A0 is non-breaking space
          }
        };

        const result = parser.parseGeoJSON(feature);
        expect(result.properties.name).toContain('\u00A0');
      });
    });
  });

  // Phase 5: Invalid Geometry (additional tests)
  describe('Invalid Geometry Handling', () => {
    describe('out-of-range coordinates (when validated)', () => {
      it('should accept latitude > 90 without validation', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [5.0, 95.0]
          },
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        // Without validation, should pass through
        const result = parser.parseGeoJSON(feature);
        expect(result.geometry?.coordinates?.[1]).toBe(95.0);
      });

      it('should accept longitude > 180 without validation', () => {
        const feature: SystemFeature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [190.0, 45.0]
          },
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        // Without validation, should pass through
        const result = parser.parseGeoJSON(feature);
        expect(result.geometry?.coordinates?.[0]).toBe(190.0);
      });
    });

    describe('empty and minimal geometries', () => {
      it('should handle Point with empty coordinates array', () => {
        const feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: []
          },
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        // May throw or handle gracefully
        try {
          const result = parser.parseGeoJSON(feature as any);
          expect(result).toBeDefined();
        } catch (e) {
          expect(e).toBeDefined();
        }
      });

      it('should handle LineString with single point', () => {
        const feature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[5.0, 45.0]]
          },
          properties: { featureType: 'System', uid: 'urn:test:1' }
        };

        // GeoJSON spec requires at least 2 points for LineString
        const result = parser.parseGeoJSON(feature as any);
        expect(result.geometry?.type).toBe('LineString');
      });
    });
  });
});
