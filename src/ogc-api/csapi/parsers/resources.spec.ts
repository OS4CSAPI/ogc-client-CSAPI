/**
 * Tests for Resource Parsers
 */
import {
  DeploymentParser,
  ProcedureParser,
  SamplingFeatureParser,
  PropertyParser,
  DatastreamParser,
  ControlStreamParser,
} from './resources.js';

describe('Resource Parsers', () => {
  describe('DeploymentParser', () => {
    const parser = new DeploymentParser();

    it('should parse valid GeoJSON Deployment Feature', () => {
      const feature = {
        type: 'Feature',
        id: 'deployment-1',
        geometry: null,
        properties: {
          featureType: 'Deployment',
          uid: 'urn:test:deployment-1',
          system: { href: 'http://example.com/systems/1' },
        },
      };

      const result = parser.parse(feature);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('deployment-1');
    });

    it('should parse SensorML Deployment', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'deployment-sml-1',
        definition: 'http://www.w3.org/ns/ssn/Deployment',
        deployedSystems: [{ href: 'http://example.com/systems/1' }],
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data).toBeDefined();
      expect(result.data.properties.featureType).toBe('Deployment');
    });

    it('should parse SensorML Deployment with location', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'deployment-loc-1',
        definition: 'http://www.w3.org/ns/ssn/Deployment',
        deployedSystems: [{ href: 'http://example.com/systems/1' }],
        location: {
          type: 'Point',
          coordinates: [10.5, 45.2],
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry).toBeDefined();
      expect(result.data.geometry?.type).toBe('Point');
    });

    it('should parse SensorML Deployment with platform and links', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'deployment-full-1',
        deployedSystems: [{ href: 'http://example.com/systems/1' }],
        platform: { href: 'http://example.com/platforms/1' },
        links: [{ href: 'http://example.com/docs', rel: 'documentation' }],
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.properties.platform).toBeDefined();
      expect(result.data.properties.links).toBeDefined();
    });

    it('should validate in strict mode', () => {
      const invalid = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Deployment',
          // Missing uid and system
        },
      };

      expect(() => parser.parse(invalid, { validate: true, strict: true })).toThrow();
    });

    it('should throw on SWE format (not supported)', () => {
      expect(() => parser.parse({}, { contentType: 'application/swe+json' })).toThrow('SWE format not applicable');
    });
  });

  describe('ProcedureParser', () => {
    const parser = new ProcedureParser();

    it('should parse valid GeoJSON Procedure Feature', () => {
      const feature = {
        type: 'Feature',
        id: 'procedure-1',
        geometry: null,
        properties: {
          featureType: 'Procedure',
          uid: 'urn:test:procedure-1',
        },
      };

      const result = parser.parse(feature);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('procedure-1');
    });

    it('should parse SensorML Procedure (SimpleProcess)', () => {
      const sensorml = {
        type: 'SimpleProcess',
        id: 'proc-sml-1',
        definition: 'http://example.com/process/1',
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data).toBeDefined();
      expect(result.data.properties.featureType).toBe('Procedure');
    });

    it('should parse SensorML Procedure with inputs/outputs/parameters', () => {
      const sensorml = {
        type: 'SimpleProcess',
        id: 'proc-full-1',
        inputs: [{ name: 'input1', type: 'Quantity' }],
        outputs: [{ name: 'output1', type: 'Quantity' }],
        parameters: [{ name: 'param1', type: 'Text' }],
        method: { href: 'http://example.com/method' },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.properties.inputs).toBeDefined();
      expect(result.data.properties.outputs).toBeDefined();
      expect(result.data.properties.parameters).toBeDefined();
      expect(result.data.properties.method).toBeDefined();
    });

    it('should parse SensorML AggregateProcess with components', () => {
      const sensorml = {
        type: 'AggregateProcess',
        id: 'proc-agg-1',
        components: [{ name: 'comp1', href: 'http://example.com/proc1' }],
        connections: [{ source: 'comp1.out', dest: 'comp2.in' }],
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.properties.components).toBeDefined();
      expect(result.data.properties.connections).toBeDefined();
    });

    it('should parse SensorML Procedure with position', () => {
      const sensorml = {
        type: 'SimpleProcess',
        id: 'proc-pos-1',
        position: {
          type: 'Point',
          coordinates: [5.0, 50.0],
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry).toBeDefined();
      expect(result.data.geometry?.type).toBe('Point');
    });

    it('should throw on SWE format (not supported)', () => {
      expect(() => parser.parse({}, { contentType: 'application/swe+json' })).toThrow('SWE format not applicable');
    });
  });

  describe('SamplingFeatureParser', () => {
    const parser = new SamplingFeatureParser();

    it('should parse valid GeoJSON SamplingFeature', () => {
      const feature = {
        type: 'Feature',
        id: 'sf-1',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {
          featureType: 'SamplingFeature',
          uid: 'urn:test:sf-1',
          sampledFeature: { href: 'http://example.com/features/1' },
        },
      };

      const result = parser.parse(feature);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('sf-1');
    });

    it('should throw on SensorML format (not supported)', () => {
      const sensorml = {
        type: 'SamplingFeature',
        id: 'sf-sml-1',
      };

      expect(() => parser.parse(sensorml, { contentType: 'application/sml+json' })).toThrow('SensorML format not applicable');
    });

    it('should throw on SWE format (not supported)', () => {
      expect(() => parser.parse({}, { contentType: 'application/swe+json' })).toThrow('SWE format not applicable');
    });
  });

  describe('PropertyParser', () => {
    const parser = new PropertyParser();

    it('should parse valid GeoJSON Property Feature', () => {
      const feature = {
        type: 'Feature',
        id: 'prop-1',
        geometry: null,
        properties: {
          featureType: 'Property',
          uid: 'urn:test:prop-1',
          definition: 'http://example.com/defs/temp',
          label: 'Temperature',
        },
      };

      const result = parser.parse(feature);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('prop-1');
    });

    it('should parse SensorML DerivedProperty', () => {
      const sensorml = {
        type: 'DerivedProperty',
        id: 'prop-sml-1',
        definition: 'http://example.com/property/1',
        label: 'Computed Temperature',
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data).toBeDefined();
      expect(result.data.properties.featureType).toBe('Property');
    });

    it('should parse SensorML Property with baseProperty and statistic', () => {
      const sensorml = {
        type: 'DerivedProperty',
        id: 'prop-derived-1',
        definition: 'http://example.com/property/1',
        label: 'Mean Temperature',
        baseProperty: { href: 'http://example.com/props/temp' },
        statistic: 'mean',
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.properties.baseProperty).toBeDefined();
      expect(result.data.properties.statistic).toBe('mean');
    });

    it('should throw on SWE format (not supported)', () => {
      expect(() => parser.parse({}, { contentType: 'application/swe+json' })).toThrow('SWE format not applicable');
    });
  });

  describe('DatastreamParser', () => {
    const parser = new DatastreamParser();

    it('should parse valid GeoJSON Datastream Feature', () => {
      const feature = {
        type: 'Feature',
        id: 'ds-1',
        geometry: null,
        properties: {
          featureType: 'Datastream',
          uid: 'urn:test:ds-1',
          system: { href: 'http://example.com/systems/1' },
          observedProperty: { href: 'http://example.com/props/temp' },
        },
      };

      const result = parser.parse(feature);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('ds-1');
    });

    it('should throw on SensorML format (not supported)', () => {
      const sensorml = {
        type: 'Datastream',
        id: 'ds-sml-1',
      };

      expect(() => parser.parse(sensorml, { contentType: 'application/sml+json' })).toThrow('Datastreams not defined in SensorML format');
    });

    it('should throw on SWE format (not supported)', () => {
      expect(() => parser.parse({}, { contentType: 'application/swe+json' })).toThrow('SWE format not applicable');
    });
  });

  describe('ControlStreamParser', () => {
    const parser = new ControlStreamParser();

    it('should parse valid GeoJSON ControlStream Feature', () => {
      const feature = {
        type: 'Feature',
        id: 'cs-1',
        geometry: null,
        properties: {
          featureType: 'ControlStream',
          uid: 'urn:test:cs-1',
          system: { href: 'http://example.com/systems/1' },
          controlledProperty: { href: 'http://example.com/props/valve' },
        },
      };

      const result = parser.parse(feature);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('cs-1');
    });

    it('should throw on SensorML format (not supported)', () => {
      const sensorml = {
        type: 'ControlStream',
        id: 'cs-sml-1',
      };

      expect(() => parser.parse(sensorml, { contentType: 'application/sml+json' })).toThrow('ControlStreams not defined in SensorML format');
    });

    it('should throw on SWE format (not supported)', () => {
      expect(() => parser.parse({}, { contentType: 'application/swe+json' })).toThrow('SWE format not applicable');
    });
  });

  describe('SensorML parsing with properties extraction', () => {
    const parser = new DeploymentParser();

    it('should extract properties from SensorML DescribedObject', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'deployment-1',
        definition: 'http://www.w3.org/ns/ssn/Deployment',
        label: 'Test Deployment',
        description: 'A test deployment',
        deployedSystems: [{ href: 'http://example.com/systems/1' }],
        validTime: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-12-31T23:59:59Z',
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.properties.name).toBe('Test Deployment');
      expect(result.data.properties.description).toBe('A test deployment');
      expect(result.data.properties.validTime).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should throw CSAPIParseError on invalid data', () => {
      const parser = new DeploymentParser();
      
      expect(() => parser.parseGeoJSON({ type: 'FeatureCollection', features: [] } as any)).toThrow();
    });

    it('should handle validation errors', () => {
      const parser = new DatastreamParser();
      const invalid = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Datastream',
          uid: 'test',
          // Missing system and observedProperty
        },
      };

      const result = parser.parse(invalid, { validate: true });
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should throw on FeatureCollection for all parsers', () => {
      const featureCollection = {
        type: 'FeatureCollection',
        features: [],
      };

      const parsers = [
        new ProcedureParser(),
        new SamplingFeatureParser(),
        new PropertyParser(),
        new DatastreamParser(),
        new ControlStreamParser(),
      ];

      parsers.forEach(parser => {
        expect(() => parser.parseGeoJSON(featureCollection as any)).toThrow('Expected single Feature');
      });
    });
  });
});
