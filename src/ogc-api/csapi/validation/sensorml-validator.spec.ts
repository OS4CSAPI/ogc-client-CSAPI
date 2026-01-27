/**
 * Tests for SensorML Validator
 */

import {
  validateSensorMLProcess,
  validateDeployment,
  validateDerivedProperty,
} from './sensorml-validator.js';
import type { PhysicalSystem, PhysicalComponent, Deployment, DerivedProperty } from '../sensorml/index.js';

describe('SensorML Validator', () => {
  describe('validateSensorMLProcess', () => {
    it('should validate valid PhysicalSystem', async () => {
      const system: PhysicalSystem = {
        type: 'PhysicalSystem',
        id: 'system-1',
        uniqueId: 'urn:test:system-1',
        label: 'Test System',
        description: 'A test system',
        position: {
          type: 'Point',
          coordinates: [5.0, 45.0],
        },
        components: [],
      };

      const result = await validateSensorMLProcess(system);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate valid PhysicalComponent', async () => {
      const component: PhysicalComponent = {
        type: 'PhysicalComponent',
        id: 'sensor-1',
        uniqueId: 'urn:test:sensor-1',
        label: 'Temperature Sensor',
      };

      const result = await validateSensorMLProcess(component);
      expect(result.valid).toBe(true);
    });

    it('should detect missing type', async () => {
      const invalid: any = {
        id: 'test',
      };

      const result = await validateSensorMLProcess(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required property: type');
    });

    it('should warn about missing identification', async () => {
      const system: PhysicalSystem = {
        type: 'PhysicalSystem',
      };

      const result = await validateSensorMLProcess(system);
      expect(result.warnings).toContain('Object should have uniqueId or id for identification');
      expect(result.warnings).toContain('Object should have label or description for clarity');
    });

    it('should detect invalid components array', async () => {
      const invalid: any = {
        type: 'PhysicalSystem',
        uniqueId: 'urn:test:sys',
        components: 'not-an-array',
      };

      const result = await validateSensorMLProcess(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('components must be an array');
    });

    it('should detect invalid inputs array', async () => {
      const invalid: any = {
        type: 'SimpleProcess',
        uniqueId: 'urn:test:proc',
        inputs: 'not-an-array',
      };

      const result = await validateSensorMLProcess(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('inputs must be an array');
    });
  });

  describe('validateDeployment', () => {
    it('should validate valid Deployment', async () => {
      const deployment: Deployment = {
        type: 'Deployment',
        uniqueId: 'urn:test:deployment-1',
        label: 'Test Deployment',
        validTime: {
          beginPosition: '2025-01-01T00:00:00Z',
          endPosition: '2025-12-31T23:59:59Z',
        },
        location: {
          type: 'Point',
          coordinates: [5.0, 45.0],
        },
        deployedSystems: [
          {
            system: 'urn:test:system-1',
          },
        ],
      };

      const result = await validateDeployment(deployment);
      expect(result.valid).toBe(true);
    });

    it('should detect wrong type', async () => {
      const invalid: any = {
        type: 'PhysicalSystem',
        uniqueId: 'urn:test:deployment',
      };

      const result = await validateDeployment(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Expected type 'Deployment', got 'PhysicalSystem'");
    });

    it('should warn about missing validTime and location', async () => {
      const deployment: Deployment = {
        type: 'Deployment',
        uniqueId: 'urn:test:deployment-1',
      };

      const result = await validateDeployment(deployment);
      expect(result.warnings).toContain('Deployment should have validTime or location');
    });

    it('should warn about empty deployed systems', async () => {
      const deployment: Deployment = {
        type: 'Deployment',
        uniqueId: 'urn:test:deployment-1',
        validTime: {
          beginPosition: '2025-01-01T00:00:00Z',
        },
        deployedSystems: [],
      };

      const result = await validateDeployment(deployment);
      expect(result.warnings).toContain('Deployment has no deployed systems');
    });
  });

  describe('validateDerivedProperty', () => {
    it('should validate valid DerivedProperty', async () => {
      const property: DerivedProperty = {
        id: 'prop-1',
        label: 'Average Temperature',
        baseProperty: 'urn:ogc:def:property:temperature',
        statistic: 'mean',
      };

      const result = await validateDerivedProperty(property);
      expect(result.valid).toBe(true);
    });

    it('should detect missing baseProperty', async () => {
      const invalid: any = {
        id: 'prop-1',
        label: 'Average Temperature',
      };

      const result = await validateDerivedProperty(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required property: baseProperty');
    });

    it('should warn about invalid URI format', async () => {
      const property: DerivedProperty = {
        id: 'prop-1',
        baseProperty: 'not-a-valid-uri',
      };

      const result = await validateDerivedProperty(property);
      expect(result.warnings).toContain('baseProperty should be a valid URI');
    });
  });
});
