/**
 * Tests for GeoJSON Validators
 */
import {
  validateSystemFeature,
  validateSystemFeatureCollection,
  validateDeploymentFeature,
  validateDeploymentFeatureCollection,
  validateProcedureFeature,
  validateProcedureFeatureCollection,
  validateSamplingFeature,
  validateSamplingFeatureCollection,
  validatePropertyFeature,
  validatePropertyFeatureCollection,
  validateDatastreamFeature,
  validateDatastreamFeatureCollection,
  validateControlStreamFeature,
  validateControlStreamFeatureCollection,
  validateCSAPIFeature,
} from './geojson-validator.js';

describe('GeoJSON Validators', () => {
  describe('validateSystemFeature', () => {
    it('should validate valid System feature', () => {
      const feature = {
        type: 'Feature',
        id: 'system-1',
        geometry: null,
        properties: {
          featureType: 'System',
          uid: 'urn:test:system-1',
          name: 'Test System',
        },
      };

      const result = validateSystemFeature(feature);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject missing uid', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'System',
        },
      };

      const result = validateSystemFeature(feature as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      // Note: hasCSAPIProperties check will fail, causing early return
    });

    it('should reject invalid featureType', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Deployment',
          uid: 'urn:test:system-1',
        },
      };

      const result = validateSystemFeature(feature as any);
      expect(result.valid).toBe(false);
    });

    it('should allow optional fields', () => {
      const feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {
          featureType: 'System',
          uid: 'urn:test:system-1',
          name: 'Test System',
          description: 'A test system',
          validTime: {
            start: '2024-01-01T00:00:00Z',
          },
        },
      };

      const result = validateSystemFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should validate geometry types', () => {
      const feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [5.0, 45.0] },
        properties: {
          featureType: 'System',
          uid: 'urn:test:system-1',
        },
      };

      const result = validateSystemFeature(feature);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateSystemFeatureCollection', () => {
    it('should validate valid System collection', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'System',
              uid: 'urn:test:system-1',
            },
          },
        ],
      };

      const result = validateSystemFeatureCollection(collection);
      expect(result.valid).toBe(true);
    });

    it('should validate empty collection', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [],
      };

      const result = validateSystemFeatureCollection(collection);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid features in collection', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'System',
              // Missing uid
            },
          },
        ],
      };

      const result = validateSystemFeatureCollection(collection as any);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateDeploymentFeature', () => {
    it('should validate valid Deployment feature', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Deployment',
          uid: 'urn:test:deployment-1',
          system: 'urn:test:system-1',
        },
      };

      const result = validateDeploymentFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should reject missing system', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Deployment',
          uid: 'urn:test:deployment-1',
        },
      };

      const result = validateDeploymentFeature(feature as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateProcedureFeature', () => {
    it('should validate valid Procedure feature', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Procedure',
          uid: 'urn:test:procedure-1',
        },
      };

      const result = validateProcedureFeature(feature);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateSamplingFeature', () => {
    it('should validate valid SamplingFeature', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'SamplingFeature',
          uid: 'urn:test:sf-1',
        },
      };

      const result = validateSamplingFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should allow sampledFeature field', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'SamplingFeature',
          uid: 'urn:test:sf-1',
          sampledFeature: 'urn:test:feature-1',
        },
      };

      const result = validateSamplingFeature(feature);
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePropertyFeature', () => {
    it('should validate valid Property feature', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Property',
          uid: 'urn:test:property-1',
          definition: 'http://example.org/property',
        },
      };

      const result = validatePropertyFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should reject missing definition', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Property',
          uid: 'urn:test:property-1',
        },
      };

      const result = validatePropertyFeature(feature as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateDatastreamFeature', () => {
    it('should validate valid Datastream feature', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Datastream',
          uid: 'urn:test:ds-1',
          system: 'urn:test:system-1',
          observedProperty: 'http://example.org/temperature',
        },
      };

      const result = validateDatastreamFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should reject missing system', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Datastream',
          uid: 'urn:test:ds-1',
          observedProperty: 'http://example.org/temperature',
        },
      };

      const result = validateDatastreamFeature(feature as any);
      expect(result.valid).toBe(false);
    });

    it('should reject missing observedProperty', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Datastream',
          uid: 'urn:test:ds-1',
          system: 'urn:test:system-1',
        },
      };

      const result = validateDatastreamFeature(feature as any);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateControlStreamFeature', () => {
    it('should validate valid ControlStream feature', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'ControlStream',
          uid: 'urn:test:cs-1',
          system: 'urn:test:system-1',
          controlledProperty: 'http://example.org/valve',
        },
      };

      const result = validateControlStreamFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should reject missing system', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'ControlStream',
          uid: 'urn:test:cs-1',
          controlledProperty: 'http://example.org/valve',
        },
      };

      const result = validateControlStreamFeature(feature as any);
      expect(result.valid).toBe(false);
    });

    it('should reject missing controlledProperty', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'ControlStream',
          uid: 'urn:test:cs-1',
          system: 'urn:test:system-1',
        },
      };

      const result = validateControlStreamFeature(feature as any);
      expect(result.valid).toBe(false);
    });
  });

  describe('Error messages', () => {
    it('should provide helpful error messages', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'WrongType',  // Invalid feature type
          uid: 'urn:test:system',
        },
      };

      const result = validateSystemFeature(feature);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(typeof result.errors[0]).toBe('string');
    });

    it('should include validation path', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'System',
        },
      };

      const result = validateSystemFeature(feature as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    // Edge cases for coverage
    it('should reject non-Feature objects', () => {
      const result1 = validateSystemFeature(null);
      expect(result1.valid).toBe(false);

      const result2 = validateSystemFeature({});
      expect(result2.valid).toBe(false);

      const result3 = validateSystemFeature({ type: 'Point' });
      expect(result3.valid).toBe(false);
    });

    it('should reject missing properties object', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
      };

      const result = validateSystemFeature(feature as any);
      expect(result.valid).toBe(false);
    });

    it('should reject null/invalid properties', () => {
      const result1 = validateSystemFeature({ type: 'Feature', geometry: null, properties: null } as any);
      expect(result1.valid).toBe(false);
      expect(result1.errors[0]).toContain('CSAPI properties');

      const result2 = validateSystemFeature({ type: 'Feature', geometry: null, properties: 'invalid' } as any);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0]).toContain('CSAPI properties');
    });

    it('should reject non-FeatureCollection in collection validator', () => {
      const result1 = validateSystemFeatureCollection(null);
      expect(result1.valid).toBe(false);

      const result2 = validateSystemFeatureCollection({});
      expect(result2.valid).toBe(false);

      const result3 = validateSystemFeatureCollection({ type: 'Feature' });
      expect(result3.valid).toBe(false);
    });

    it('should validate feature collections with mixed valid/invalid features', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: { featureType: 'System', uid: 'valid-1' },
          },
          {
            type: 'Feature',
            geometry: null,
            properties: { featureType: 'Deployment' }, // wrong type, missing uid
          },
          {
            type: 'Feature',
            geometry: null,
            properties: { featureType: 'System', uid: 'valid-2' },
          },
        ],
      };

      const result = validateSystemFeatureCollection(collection as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    // Test all resource type validators with edge cases
    it('should reject invalid Deployment features', () => {
      const result1 = validateDeploymentFeature(null);
      expect(result1.valid).toBe(false);

      const result2 = validateDeploymentFeature({ type: 'Point' });
      expect(result2.valid).toBe(false);
    });

    it('should reject invalid Procedure features', () => {
      const result1 = validateProcedureFeature(null);
      expect(result1.valid).toBe(false);

      const result2 = validateProcedureFeature({});
      expect(result2.valid).toBe(false);
    });

    it('should reject invalid SamplingFeature features', () => {
      const result1 = validateSamplingFeature(null);
      expect(result1.valid).toBe(false);

      const result2 = validateSamplingFeature({ type: 'FeatureCollection' });
      expect(result2.valid).toBe(false);
    });

    it('should reject invalid Property features', () => {
      const result1 = validatePropertyFeature(null);
      expect(result1.valid).toBe(false);

      const result2 = validatePropertyFeature({ properties: null } as any);
      expect(result2.valid).toBe(false);
    });

    it('should reject invalid Datastream features', () => {
      const result1 = validateDatastreamFeature(null);
      expect(result1.valid).toBe(false);

      const result2 = validateDatastreamFeature({ type: 'Feature', properties: 'invalid' } as any);
      expect(result2.valid).toBe(false);
    });

    it('should reject invalid ControlStream features', () => {
      const result1 = validateControlStreamFeature(null);
      expect(result1.valid).toBe(false);

      const result2 = validateControlStreamFeature({ type: 'Feature', geometry: null } as any);
      expect(result2.valid).toBe(false);
    });
  });

  describe('validateDeploymentFeatureCollection', () => {
    it('should validate valid Deployment collection', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'deployment-1',
            geometry: null,
            properties: {
              featureType: 'Deployment',
              uid: 'urn:test:deployment-1',
              system: { href: 'http://example.com/systems/1' },
            },
          },
        ],
      };

      const result = validateDeploymentFeatureCollection(collection);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid Deployment collection', () => {
      const collection = {
        type: 'Feature', // Wrong type
        features: [],
      };

      const result = validateDeploymentFeatureCollection(collection);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Object is not a valid GeoJSON FeatureCollection');
    });

    it('should collect errors from invalid Deployment features', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'Deployment',
              // Missing uid
            },
          },
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'System', // Wrong type
              uid: 'urn:test:2',
            },
          },
        ],
      };

      const result = validateDeploymentFeatureCollection(collection);
      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
      expect(result.errors?.[0]).toContain('Feature at index 0');
    });
  });

  describe('validateProcedureFeatureCollection', () => {
    it('should validate valid Procedure collection', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'Procedure',
              uid: 'urn:test:proc-1',
            },
          },
        ],
      };

      const result = validateProcedureFeatureCollection(collection);
      expect(result.valid).toBe(true);
    });

    it('should reject non-FeatureCollection for Procedures', () => {
      const result = validateProcedureFeatureCollection({type: 'Feature'});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Object is not a valid GeoJSON FeatureCollection');
    });

    it('should collect Procedure feature validation errors', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'Deployment', // Wrong type
              uid: 'urn:test:1',
            },
          },
        ],
      };

      const result = validateProcedureFeatureCollection(collection);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateDatastreamFeatureCollection', () => {
    it('should validate valid Datastream collection', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'Datastream',
              uid: 'urn:test:ds-1',
              system: { href: 'http://example.com/systems/1' },
              observedProperty: {
                href: 'http://example.com/props/temp',
              },
            },
          },
        ],
      };

      const result = validateDatastreamFeatureCollection(collection);
      expect(result.valid).toBe(true);
    });

    it('should reject non-FeatureCollection for Datastreams', () => {
      const result = validateDatastreamFeatureCollection(null);
      expect(result.valid).toBe(false);
    });

    it('should validate each Datastream feature in collection', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'Datastream',
              uid: 'urn:test:1',
              system: { href: 'http://test.com/systems/1' },
              observedProperty: { href: 'http://test.com' },
            },
          },
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'Datastream',
              // Missing uid and system
              observedProperty: { href: 'http://test.com' },
            },
          },
        ],
      };

      const result = validateDatastreamFeatureCollection(collection);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('index 1');
    });
  });

  describe('validateSamplingFeatureCollection', () => {
    it('should validate valid SamplingFeature collection', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {
              featureType: 'SamplingFeature',
              uid: 'urn:test:sf-1',
              sampledFeature: {
                href: 'http://example.com/features/1',
              },
            },
          },
        ],
      };

      const result = validateSamplingFeatureCollection(collection);
      expect(result.valid).toBe(true);
    });

    it('should reject non-FeatureCollection for SamplingFeatures', () => {
      const result = validateSamplingFeatureCollection({ type: 'Feature' });
      expect(result.valid).toBe(false);
    });

    it('should collect SamplingFeature validation errors', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'SamplingFeature',
              // Missing uid and sampledFeature
            },
          },
        ],
      };

      const result = validateSamplingFeatureCollection(collection);
      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('validatePropertyFeatureCollection', () => {
    it('should validate valid Property collection', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'Property',
              uid: 'urn:test:prop-1',
              label: 'Temperature',
              definition: 'http://example.com/defs/temp',
            },
          },
        ],
      };

      const result = validatePropertyFeatureCollection(collection);
      expect(result.valid).toBe(true);
    });

    it('should reject non-FeatureCollection for Properties', () => {
      const result = validatePropertyFeatureCollection(123);
      expect(result.valid).toBe(false);
    });

    it('should validate each Property feature', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'Property',
              uid: 'urn:test:1',
              label: 'Test',
              definition: 'http://example.com/defs/test',
            },
          },
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'ControlStream', // Wrong type for Property collection
              uid: 'urn:test:2',
              system: { href: 'http://test.com/systems/1' },
              controlledProperty: { href: 'http://test.com' },
            },
          },
        ],
      };

      const result = validatePropertyFeatureCollection(collection);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateControlStreamFeatureCollection', () => {
    it('should validate valid ControlStream collection', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'ControlStream',
              uid: 'urn:test:cs-1',
              system: { href: 'http://example.com/systems/1' },
              controlledProperty: {
                href: 'http://example.com/props/valve',
              },
            },
          },
        ],
      };

      const result = validateControlStreamFeatureCollection(collection);
      expect(result.valid).toBe(true);
    });

    it('should reject non-FeatureCollection for ControlStreams', () => {
      const result = validateControlStreamFeatureCollection([]);
      expect(result.valid).toBe(false);
    });

    it('should validate each ControlStream feature', () => {
      const collection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'ControlStream',
              uid: 'urn:test:1',
              system: { href: 'http://test.com/systems/1' },
              controlledProperty: { href: 'http://test.com' },
            },
          },
          {
            type: 'Feature',
            geometry: null,
            properties: {
              featureType: 'ControlStream',
              // Missing uid and system
              controlledProperty: { href: 'http://test.com' },
            },
          },
        ],
      };

      const result = validateControlStreamFeatureCollection(collection);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateCSAPIFeature', () => {
    it('should validate System features', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'System',
          uid: 'urn:test:1',
        },
      };

      const result = validateCSAPIFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should validate Deployment features', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Deployment',
          uid: 'urn:test:1',
          system: { href: 'http://example.com/systems/1' },
        },
      };

      const result = validateCSAPIFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should reject unknown featureType', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'UnknownType',
          uid: 'urn:test:1',
        },
      };

      const result = validateCSAPIFeature(feature);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown or unsupported featureType: UnknownType');
    });

    it('should reject missing featureType', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          uid: 'urn:test:1',
        },
      };

      const result = validateCSAPIFeature(feature);
      expect(result.valid).toBe(false);
    });

    it('should validate Procedure features via validateCSAPIFeature', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Procedure',
          uid: 'urn:test:proc-1',
        },
      };

      const result = validateCSAPIFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should validate SamplingFeature via validateCSAPIFeature', () => {
      const feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {
          featureType: 'SamplingFeature',
          uid: 'urn:test:sf-1',
          sampledFeature: { href: 'http://example.com/features/1' },
        },
      };

      const result = validateCSAPIFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should validate Property via validateCSAPIFeature', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Property',
          uid: 'urn:test:prop-1',
          definition: 'http://example.com/defs/temp',
        },
      };

      const result = validateCSAPIFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should validate Datastream via validateCSAPIFeature', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Datastream',
          uid: 'urn:test:ds-1',
          system: { href: 'http://example.com/systems/1' },
          observedProperty: { href: 'http://example.com/props/temp' },
        },
      };

      const result = validateCSAPIFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should validate ControlStream via validateCSAPIFeature', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'ControlStream',
          uid: 'urn:test:cs-1',
          system: { href: 'http://example.com/systems/1' },
          controlledProperty: { href: 'http://example.com/props/valve' },
        },
      };

      const result = validateCSAPIFeature(feature);
      expect(result.valid).toBe(true);
    });
  });
});

