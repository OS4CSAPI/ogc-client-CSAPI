/**
 * Tests for CSAPI Request Builders
 */
import {
  buildSystemBody,
  buildSystemBodySensorML,
  buildDeploymentBody,
  buildDeploymentBodySensorML,
  buildProcedureBody,
  buildProcedureBodySensorML,
  buildSamplingFeatureBody,
  buildPropertyBody,
  buildDatastreamBody,
  buildControlStreamBody,
  buildFeatureBody,
} from './request-builders.js';
import { validateSystemFeature } from './validation/index.js';

describe('Request Builders', () => {
  describe('buildSystemBody', () => {
    it('should build valid System request body', () => {
      const result = buildSystemBody({
        uid: 'urn:test:system-1',
        name: 'Test System',
        description: 'A test system',
      });

      expect(result.body.type).toBe('Feature');
      expect(result.body.properties.featureType).toBe('System');
      expect(result.body.properties.uid).toBe('urn:test:system-1');
      expect(result.body.properties.name).toBe('Test System');
      expect(result.contentType).toBe('application/geo+json');
    });

    it('should include geometry when provided', () => {
      const result = buildSystemBody(
        {
          uid: 'urn:test:system-1',
          name: 'Test System',
        },
        { type: 'Point', coordinates: [5.0, 45.0] }
      );

      expect(result.body.geometry).toEqual({
        type: 'Point',
        coordinates: [5.0, 45.0],
      });
    });

    it('should validate by default', () => {
      const result = buildSystemBody({
        uid: 'urn:test:system-1',
        name: 'Test System',
      });

      expect(result.validation).toBeDefined();
      expect(result.validation?.valid).toBe(true);
    });

    it('should skip validation when disabled', () => {
      const result = buildSystemBody(
        {
          uid: 'urn:test:system-1',
          name: 'Test System',
        },
        null,
        { validate: false }
      );

      expect(result.validation).toBeUndefined();
    });

    it('should throw in strict mode on validation failure', () => {
      expect(() =>
        buildSystemBody(
          {
            uid: 'urn:test:system',
            featureType: 'InvalidType',  // Invalid: wrong feature type
          } as any,
          null,
          { validate: true, strict: true }
        )
      ).toThrow();
    });
  });

  describe('buildSystemBodySensorML', () => {
    it('should build SensorML request body', () => {
      const system = {
        type: 'PhysicalSystem' as const,
        id: 'system-1',
        uniqueId: 'urn:test:system-1',
        label: 'Test System',
        components: [],
      };

      const result = buildSystemBodySensorML(system);

      expect(result.body).toEqual(system);
      expect(result.contentType).toBe('application/sml+json');
    });
  });

  describe('buildDeploymentBody', () => {
    it('should build valid Deployment request body', () => {
      const result = buildDeploymentBody({
        uid: 'urn:test:deployment-1',
        system: 'urn:test:system-1',
        name: 'Test Deployment',
      });

      expect(result.body.type).toBe('Feature');
      expect(result.body.properties.featureType).toBe('Deployment');
      expect(result.body.properties.uid).toBe('urn:test:deployment-1');
      expect(result.body.properties.system).toBe('urn:test:system-1');
      expect(result.contentType).toBe('application/geo+json');
    });

    it('should validate required system field', () => {
      const result = buildDeploymentBody({
        uid: 'urn:test:deployment-1',
        system: 'urn:test:system-1',
      });

      expect(result.validation?.valid).toBe(true);
    });
  });

  describe('buildProcedureBody', () => {
    it('should build valid Procedure request body', () => {
      const result = buildProcedureBody({
        uid: 'urn:test:procedure-1',
        name: 'Test Procedure',
        description: 'A test procedure',
      });

      expect(result.body.type).toBe('Feature');
      expect(result.body.properties.featureType).toBe('Procedure');
      expect(result.body.properties.uid).toBe('urn:test:procedure-1');
      expect(result.contentType).toBe('application/geo+json');
    });
  });

  describe('buildSamplingFeatureBody', () => {
    it('should build valid SamplingFeature request body', () => {
      const result = buildSamplingFeatureBody({
        uid: 'urn:test:sf-1',
        name: 'Test Sampling Feature',
        sampledFeature: 'urn:test:feature-1',
      });

      expect(result.body.type).toBe('Feature');
      expect(result.body.properties.featureType).toBe('SamplingFeature');
      expect(result.body.properties.uid).toBe('urn:test:sf-1');
      expect(result.contentType).toBe('application/geo+json');
    });
  });

  describe('buildPropertyBody', () => {
    it('should build valid Property request body', () => {
      const result = buildPropertyBody({
        uid: 'urn:test:property-1',
        definition: 'http://example.org/property',
        name: 'Test Property',
      });

      expect(result.body.type).toBe('Feature');
      expect(result.body.properties.featureType).toBe('Property');
      expect(result.body.properties.uid).toBe('urn:test:property-1');
      expect(result.body.properties.definition).toBe('http://example.org/property');
      expect(result.body.geometry).toBeNull();
      expect(result.contentType).toBe('application/geo+json');
    });

    it('should validate required definition field', () => {
      const result = buildPropertyBody({
        uid: 'urn:test:property-1',
        definition: 'http://example.org/property',
      });

      expect(result.validation?.valid).toBe(true);
    });
  });

  describe('buildDatastreamBody', () => {
    it('should build valid Datastream request body', () => {
      const result = buildDatastreamBody({
        uid: 'urn:test:ds-1',
        system: 'urn:test:system-1',
        observedProperty: 'http://example.org/temperature',
        name: 'Temperature Datastream',
      });

      expect(result.body.type).toBe('Feature');
      expect(result.body.properties.featureType).toBe('Datastream');
      expect(result.body.properties.uid).toBe('urn:test:ds-1');
      expect(result.body.properties.system).toBe('urn:test:system-1');
      expect(result.body.properties.observedProperty).toBe('http://example.org/temperature');
      expect(result.contentType).toBe('application/geo+json');
    });

    it('should validate required fields', () => {
      const result = buildDatastreamBody({
        uid: 'urn:test:ds-1',
        system: 'urn:test:system-1',
        observedProperty: 'http://example.org/temperature',
      });

      expect(result.validation?.valid).toBe(true);
    });
  });

  describe('buildControlStreamBody', () => {
    it('should build valid ControlStream request body', () => {
      const result = buildControlStreamBody({
        uid: 'urn:test:cs-1',
        system: 'urn:test:system-1',
        controlledProperty: 'http://example.org/valve-position',
        name: 'Valve Control Stream',
      });

      expect(result.body.type).toBe('Feature');
      expect(result.body.properties.featureType).toBe('ControlStream');
      expect(result.body.properties.uid).toBe('urn:test:cs-1');
      expect(result.body.properties.system).toBe('urn:test:system-1');
      expect(result.body.properties.controlledProperty).toBe('http://example.org/valve-position');
      expect(result.contentType).toBe('application/geo+json');
    });

    it('should validate required fields', () => {
      const result = buildControlStreamBody({
        uid: 'urn:test:cs-1',
        system: 'urn:test:system-1',
        controlledProperty: 'http://example.org/valve-position',
      });

      expect(result.validation?.valid).toBe(true);
    });
  });

  describe('buildFeatureBody', () => {
    it('should build and validate generic feature', () => {
      const feature = {
        type: 'Feature' as const,
        id: 'system-1',
        geometry: null,
        properties: {
          featureType: 'System' as const,
          uid: 'urn:test:system-1',
          name: 'Test System',
        },
      };

      const result = buildFeatureBody(feature, validateSystemFeature);

      expect(result.body).toEqual(feature);
      expect(result.validation?.valid).toBe(true);
      expect(result.contentType).toBe('application/geo+json');
    });

    it('should skip validation when disabled', () => {
      const feature = {
        type: 'Feature' as const,
        id: 'system-1',
        geometry: null,
        properties: {
          featureType: 'System' as const,
          uid: 'urn:test:system-1',
        },
      };

      const result = buildFeatureBody(
        feature,
        validateSystemFeature,
        { validate: false }
      );

      expect(result.validation).toBeUndefined();
    });

    it('should throw in strict mode on validation failure', () => {
      const invalidFeature = {
        type: 'Feature' as const,
        geometry: null,
        properties: {
          // Missing required fields
        },
      };

      expect(() =>
        buildFeatureBody(
          invalidFeature as any,
          validateSystemFeature,
          { validate: true, strict: true }
        )
      ).toThrow();
    });
  });

  describe('RequestBuilderOptions', () => {
    it('should respect validate option', () => {
      const result = buildSystemBody(
        {
          uid: 'urn:test:system-1',
        },
        null,
        { validate: false }
      );

      expect(result.validation).toBeUndefined();
    });

    it('should respect strict option in non-strict mode', () => {
      const result = buildSystemBody(
        {
          uid: 'urn:test:system',
          featureType: 'InvalidType',  // Invalid: wrong feature type
        } as any,
        null,
        { validate: true, strict: false }
      );

      expect(result.validation?.valid).toBe(false);
      // Should not throw
    });

    it('should respect strict option in strict mode', () => {
      expect(() =>
        buildSystemBody(
          {
            uid: 'urn:test:system',
            featureType: 'InvalidType',  // Invalid: wrong feature type
          } as any,
          null,
          { validate: true, strict: true }
        )
      ).toThrow();
    });
  });

  describe('Additional resource builders', () => {
    describe('buildDeploymentBody', () => {
      it('should build GeoJSON Deployment with validation in strict mode', () => {
        expect(() =>
          buildDeploymentBody(
            { uid: 'test', featureType: 'InvalidType' } as any,
            null,
            { validate: true, strict: true }
          )
        ).toThrow();
      });

      it('should build SensorML Deployment', () => {
        const deployment = {
          type: 'Deployment',
          uniqueId: 'urn:test:deployment',
        };
        const result = buildDeploymentBodySensorML(deployment as any);
        expect(result.contentType).toBe('application/sml+json');
        expect(result.body).toEqual(deployment);
      });
    });

    describe('buildProcedureBody', () => {
      it('should build GeoJSON Procedure with validation in strict mode', () => {
        expect(() =>
          buildProcedureBody(
            { uid: 'test', featureType: 'InvalidType' } as any,
            null,
            { validate: true, strict: true }
          )
        ).toThrow();
      });

      it('should build SensorML Procedure', () => {
        const procedure = {
          type: 'SimpleProcess',
          uniqueId: 'urn:test:procedure',
        };
        const result = buildProcedureBodySensorML(procedure as any);
        expect(result.contentType).toBe('application/sml+json');
        expect(result.body).toEqual(procedure);
      });
    });

    describe('buildSamplingFeatureBody', () => {
      it('should build GeoJSON SamplingFeature with validation in strict mode', () => {
        expect(() =>
          buildSamplingFeatureBody(
            { uid: 'test', featureType: 'InvalidType' } as any,
            null,
            { validate: true, strict: true }
          )
        ).toThrow();
      });
    });

    describe('buildPropertyBody', () => {
      it('should build GeoJSON Property with validation in strict mode', () => {
        expect(() =>
          buildPropertyBody(
            { uid: 'test', featureType: 'InvalidType' } as any,
            
            { validate: true, strict: true }
          )
        ).toThrow();
      });
    });

    describe('buildDatastreamBody', () => {
      it('should build GeoJSON Datastream with validation in strict mode', () => {
        expect(() =>
          buildDatastreamBody(
            { uid: 'test', featureType: 'InvalidType' } as any,
            null,
            { validate: true, strict: true }
          )
        ).toThrow();
      });
    });

    describe('buildControlStreamBody', () => {
      it('should build GeoJSON ControlStream with validation in strict mode', () => {
        expect(() =>
          buildControlStreamBody(
            { uid: 'test', featureType: 'InvalidType' } as any,
            null,
            { validate: true, strict: true }
          )
        ).toThrow();
      });
    });
  });
});
