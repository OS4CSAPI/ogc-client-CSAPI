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
  ObservationParser,
  CommandParser,
  CollectionParser,
  deploymentCollectionParser,
  procedureCollectionParser,
  observationParser,
  commandParser,
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

  describe('extractGeometry helper comprehensive tests', () => {
    const parser = new DeploymentParser();

    it('should return undefined for null/undefined position', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-1',
        deployedSystems: [],
        location: undefined,
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry).toBeNull();
    });

    it('should handle GeoJSON Point geometry', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-point',
        deployedSystems: [],
        location: {
          type: 'Point',
          coordinates: [10.5, 45.2, 100],
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry?.type).toBe('Point');
      expect(result.data.geometry?.coordinates).toEqual([10.5, 45.2, 100]);
    });

    it('should handle GeoJSON LineString geometry', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-line',
        deployedSystems: [],
        location: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1], [2, 2]],
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry?.type).toBe('LineString');
    });

    it('should handle GeoJSON Polygon geometry', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-polygon',
        deployedSystems: [],
        location: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry?.type).toBe('Polygon');
    });

    it('should handle GeoJSON MultiPoint geometry', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-multipoint',
        deployedSystems: [],
        location: {
          type: 'MultiPoint',
          coordinates: [[0, 0], [1, 1]],
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry?.type).toBe('MultiPoint');
    });

    it('should handle GeoJSON MultiLineString geometry', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-multiline',
        deployedSystems: [],
        location: {
          type: 'MultiLineString',
          coordinates: [[[0, 0], [1, 1]], [[2, 2], [3, 3]]],
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry?.type).toBe('MultiLineString');
    });

    it('should handle GeoJSON MultiPolygon geometry', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-multipoly',
        deployedSystems: [],
        location: {
          type: 'MultiPolygon',
          coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]],
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry?.type).toBe('MultiPolygon');
    });

    it('should convert Pose with position to Point', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-pose',
        deployedSystems: [],
        location: {
          position: {
            lat: 45.5,
            lon: 10.2,
            h: 150,
          },
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry?.type).toBe('Point');
      expect(result.data.geometry?.coordinates).toEqual([10.2, 45.5, 150]);
    });

    it('should convert Pose without height to Point with 0 elevation', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-pose-no-h',
        deployedSystems: [],
        location: {
          position: {
            lat: 45.5,
            lon: 10.2,
          },
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry?.type).toBe('Point');
      expect(result.data.geometry?.coordinates).toEqual([10.2, 45.5, 0]);
    });

    it('should return undefined for Pose missing lat or lon', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-pose-incomplete',
        deployedSystems: [],
        location: {
          position: {
            lat: 45.5,
            // lon missing
          },
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry).toBeNull();
    });

    it('should return undefined for non-geometry objects', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-text',
        deployedSystems: [],
        location: {
          type: 'TextComponent',
          value: 'Some location description',
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.geometry).toBeNull();
    });
  });

  describe('extractCommonProperties comprehensive tests', () => {
    const parser = new DeploymentParser();

    it('should extract all SensorML DescribedObject properties', () => {
      const sensorml = {
        type: 'Deployment',
        id: 'dep-full',
        uniqueId: 'urn:test:deployment-full',
        label: 'Full Deployment',
        description: 'A deployment with all properties',
        keywords: [{ value: 'test' }, { value: 'deployment' }],
        identifiers: [{ label: 'serial', value: '12345' }],
        classifiers: [{ label: 'type', value: 'permanent' }],
        validTime: { begin: '2020-01-01', end: '2025-12-31' },
        contacts: [{ role: 'owner', href: 'http://example.com/contact' }],
        documents: [{ href: 'http://example.com/docs' }],
        securityConstraints: [{ classification: 'public' }],
        legalConstraints: [{ license: 'MIT' }],
        deployedSystems: [],
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      const props = result.data.properties;

      expect(props.id).toBe('dep-full');
      expect(props.uniqueId).toBe('urn:test:deployment-full');
      expect(props.name).toBe('Full Deployment');
      expect(props.description).toBe('A deployment with all properties');
      expect(props.keywords).toEqual(['test', 'deployment']);
      expect(props.identifiers).toBeDefined();
      expect(props.classifiers).toBeDefined();
      expect(props.validTime).toBeDefined();
      expect(props.contacts).toBeDefined();
      expect(props.documents).toBeDefined();
      expect(props.securityConstraints).toBeDefined();
      expect(props.legalConstraints).toBeDefined();
    });
  });

  describe('SensorML validation edge cases', () => {
    it('should throw if Deployment SensorML has wrong type', () => {
      const parser = new DeploymentParser();
      const wrongType = {
        type: 'PhysicalSystem', // Wrong type
        id: 'wrong-1',
      };

      expect(() => parser.parse(wrongType, { contentType: 'application/sml+json' })).toThrow(
        'Expected Deployment'
      );
    });

    it('should parse Procedure SensorML with any process type', () => {
      const parser = new ProcedureParser();
      const deployment = {
        type: 'Deployment', // Not a process type, but parser is flexible
        id: 'deploy-1',
        uniqueId: 'urn:test:deploy-1',
      };

      // ProcedureParser accepts any type and uses it as procedureType
      const result = parser.parse(deployment, { contentType: 'application/sml+json' });
      expect(result.data.properties.procedureType).toBe('Deployment');
    });
  });

  describe('SensorML Procedure with all properties', () => {
    const parser = new ProcedureParser();

    it('should parse Procedure with inputs, outputs, and parameters', () => {
      const sensorml = {
        type: 'SimpleProcess',
        id: 'proc-full',
        uniqueId: 'urn:test:procedure-full',
        inputs: [{ name: 'temperature', href: 'http://example.com/temp' }],
        outputs: [{ name: 'calibrated_temp', href: 'http://example.com/cal_temp' }],
        parameters: [{ name: 'calibration_factor', value: 1.5 }],
        position: {
          position: {
            lat: 45.0,
            lon: 10.0,
            h: 100,
          },
        },
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.properties.inputs).toBeDefined();
      expect(result.data.properties.outputs).toBeDefined();
      expect(result.data.properties.parameters).toBeDefined();
      expect(result.data.geometry?.type).toBe('Point');
    });

    it('should parse AggregateProcess with components', () => {
      const sensorml = {
        type: 'AggregateProcess',
        id: 'proc-agg',
        components: [
          { href: 'http://example.com/process1' },
          { href: 'http://example.com/process2' },
        ],
        connections: [{ source: 'proc1', destination: 'proc2' }],
      };

      const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
      expect(result.data.properties.components).toBeDefined();
      expect(result.data.properties.connections).toBeDefined();
    });
  });

  describe('ObservationParser comprehensive tests', () => {
    const parser = new ObservationParser();

    it('should throw on GeoJSON format', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {},
      };

      expect(() => parser.parse(feature, { contentType: 'application/geo+json' })).toThrow(
        'Observations are not GeoJSON features'
      );
    });

    it('should throw on SensorML format', () => {
      const sensorml = {
        type: 'Observation',
        id: 'obs-1',
      };

      expect(() => parser.parse(sensorml, { contentType: 'application/sml+json' })).toThrow(
        'Observations not defined in SensorML format'
      );
    });

    it('should parse SWE format observations', () => {
      const sweData = {
        phenomenonTime: '2024-01-01T00:00:00Z',
        resultTime: '2024-01-01T00:00:10Z',
        result: {
          type: 'DataRecord',
          fields: [
            { name: 'temperature', type: 'Quantity', value: 23.5 },
            { name: 'humidity', type: 'Quantity', value: 65.2 },
          ],
        },
      };

      const result = parser.parse(sweData, { contentType: 'application/swe+json' });
      expect(result.data).toEqual(sweData);
      expect(result.data.result).toBeDefined();
    });

    it('should parse JSON format observations', () => {
      const jsonData = {
        id: 'obs-1',
        timestamp: '2024-01-01T00:00:00Z',
        value: 23.5,
        unit: 'degC',
      };

      const result = parser.parse(jsonData, { contentType: 'application/json' });
      expect(result.data).toEqual(jsonData);
      expect(result.data.value).toBe(23.5);
    });

    it('should use parseJSON when no contentType specified', () => {
      const data = { value: 42 };
      const result = parser.parse(data);
      expect(result.data).toEqual(data);
    });

    it('should handle complex SWE observation structures', () => {
      const complexSWE = {
        phenomenonTime: '2024-01-01T00:00:00Z',
        result: {
          type: 'DataArray',
          elementCount: 3,
          values: [
            [1, 10.5, 45.2],
            [2, 11.2, 46.1],
            [3, 10.8, 45.9],
          ],
        },
      };

      const result = parser.parse(complexSWE, { contentType: 'application/swe+json' });
      expect(result.data.result.type).toBe('DataArray');
      expect(result.data.result.elementCount).toBe(3);
    });
  });

  describe('CommandParser comprehensive tests', () => {
    const parser = new CommandParser();

    it('should throw on GeoJSON format', () => {
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: {},
      };

      expect(() => parser.parse(feature, { contentType: 'application/geo+json' })).toThrow(
        'Commands are not GeoJSON features'
      );
    });

    it('should throw on SensorML format', () => {
      const sensorml = {
        type: 'Command',
        id: 'cmd-1',
      };

      expect(() => parser.parse(sensorml, { contentType: 'application/sml+json' })).toThrow(
        'Commands not defined in SensorML format'
      );
    });

    it('should parse SWE format commands', () => {
      const sweCommand = {
        issueTime: '2024-01-01T00:00:00Z',
        parameters: {
          type: 'DataRecord',
          fields: [
            { name: 'targetTemperature', type: 'Quantity', value: 25.0 },
            { name: 'duration', type: 'Quantity', value: 3600 },
          ],
        },
      };

      const result = parser.parse(sweCommand, { contentType: 'application/swe+json' });
      expect(result.data).toEqual(sweCommand);
      expect(result.data.parameters).toBeDefined();
    });

    it('should parse JSON format commands', () => {
      const jsonCommand = {
        id: 'cmd-1',
        action: 'setPower',
        value: 'ON',
        timestamp: '2024-01-01T00:00:00Z',
      };

      const result = parser.parse(jsonCommand, { contentType: 'application/json' });
      expect(result.data).toEqual(jsonCommand);
      expect(result.data.action).toBe('setPower');
    });

    it('should use parseJSON when no contentType specified', () => {
      const data = { command: 'start' };
      const result = parser.parse(data);
      expect(result.data).toEqual(data);
    });

    it('should handle complex SWE command structures', () => {
      const complexCommand = {
        issueTime: '2024-01-01T00:00:00Z',
        parameters: {
          type: 'DataRecord',
          fields: [
            { name: 'mode', type: 'Category', value: 'automatic' },
            { name: 'enabled', type: 'Boolean', value: true },
            { name: 'threshold', type: 'Quantity', value: 100.0, uom: 'degC' },
          ],
        },
      };

      const result = parser.parse(complexCommand, { contentType: 'application/swe+json' });
      expect(result.data.parameters.type).toBe('DataRecord');
      expect(result.data.parameters.fields.length).toBe(3);
    });
  });

  describe('CollectionParser comprehensive tests', () => {
    describe('GeoJSON collections', () => {
      it('should parse single Feature as array', () => {
        const parser = new CollectionParser(new DeploymentParser());
        const feature = {
          type: 'Feature',
          id: 'dep-1',
          geometry: null,
          properties: {
            featureType: 'Deployment',
            uid: 'urn:test:dep-1',
            system: { href: 'http://example.com/systems/1' },
          },
        };

        const result = parser.parse(feature, { contentType: 'application/geo+json' });
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(1);
        expect(result.data[0].id).toBe('dep-1');
      });

      it('should parse FeatureCollection as array', () => {
        const parser = new CollectionParser(new DeploymentParser());
        const featureCollection = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              id: 'dep-1',
              geometry: null,
              properties: {
                featureType: 'Deployment',
                uid: 'urn:test:dep-1',
                system: { href: 'http://example.com/systems/1' },
              },
            },
            {
              type: 'Feature',
              id: 'dep-2',
              geometry: null,
              properties: {
                featureType: 'Deployment',
                uid: 'urn:test:dep-2',
                system: { href: 'http://example.com/systems/2' },
              },
            },
          ],
        };

        const result = parser.parse(featureCollection, { contentType: 'application/geo+json' });
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(2);
        expect(result.data[0].id).toBe('dep-1');
        expect(result.data[1].id).toBe('dep-2');
      });

      it('should parse empty FeatureCollection', () => {
        const parser = new CollectionParser(new DeploymentParser());
        const featureCollection = {
          type: 'FeatureCollection',
          features: [],
        };

        const result = parser.parse(featureCollection, { contentType: 'application/geo+json' });
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(0);
      });
    });

    describe('SensorML collections', () => {
      it('should parse array of SensorML objects', () => {
        const parser = new CollectionParser(new ProcedureParser());
        const sensormlArray = [
          {
            type: 'SimpleProcess',
            id: 'proc-1',
            uniqueId: 'urn:test:proc-1',
          },
          {
            type: 'SimpleProcess',
            id: 'proc-2',
            uniqueId: 'urn:test:proc-2',
          },
        ];

        const result = parser.parse(sensormlArray, { contentType: 'application/sml+json' });
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(2);
        expect(result.data[0].id).toBe('proc-1');
        expect(result.data[1].id).toBe('proc-2');
      });

      it('should parse single SensorML object as array', () => {
        const parser = new CollectionParser(new ProcedureParser());
        const sensorml = {
          type: 'SimpleProcess',
          id: 'proc-1',
          uniqueId: 'urn:test:proc-1',
        };

        const result = parser.parse(sensorml, { contentType: 'application/sml+json' });
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(1);
        expect(result.data[0].id).toBe('proc-1');
      });

      it('should parse empty SensorML array', () => {
        const parser = new CollectionParser(new ProcedureParser());
        const result = parser.parse([], { contentType: 'application/sml+json' });
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(0);
      });
    });

    describe('SWE collections', () => {
      it('should parse array of SWE objects', () => {
        const parser = new CollectionParser(new ObservationParser());
        const sweArray = [
          { phenomenonTime: '2024-01-01T00:00:00Z', result: 23.5 },
          { phenomenonTime: '2024-01-01T00:01:00Z', result: 24.0 },
          { phenomenonTime: '2024-01-01T00:02:00Z', result: 24.5 },
        ];

        const result = parser.parse(sweArray, { contentType: 'application/swe+json' });
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(3);
        expect(result.data[0].result).toBe(23.5);
        expect(result.data[2].result).toBe(24.5);
      });

      it('should parse single SWE object as array', () => {
        const parser = new CollectionParser(new ObservationParser());
        const sweData = { phenomenonTime: '2024-01-01T00:00:00Z', result: 23.5 };

        const result = parser.parse(sweData, { contentType: 'application/swe+json' });
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBe(1);
        expect(result.data[0].result).toBe(23.5);
      });
    });

    describe('Exported collection parser instances', () => {
      it('should use deploymentCollectionParser', () => {
        const featureCollection = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              id: 'dep-1',
              geometry: null,
              properties: {
                featureType: 'Deployment',
                uid: 'urn:test:dep-1',
                system: { href: 'http://example.com/systems/1' },
              },
            },
          ],
        };

        const result = deploymentCollectionParser.parse(featureCollection, {
          contentType: 'application/geo+json',
        });
        expect(result.data.length).toBe(1);
      });

      it('should use procedureCollectionParser', () => {
        const sensormlArray = [
          {
            type: 'SimpleProcess',
            id: 'proc-1',
            uniqueId: 'urn:test:proc-1',
          },
        ];

        const result = procedureCollectionParser.parse(sensormlArray, {
          contentType: 'application/sml+json',
        });
        expect(result.data.length).toBe(1);
      });
    });
  });

  describe('Exported parser instances', () => {
    it('should use observationParser instance', () => {
      const data = { result: 42 };
      const result = observationParser.parse(data);
      expect(result.data.result).toBe(42);
    });

    it('should use commandParser instance', () => {
      const data = { action: 'test' };
      const result = commandParser.parse(data);
      expect(result.data.action).toBe('test');
    });
  });

  describe('Validation for non-GeoJSON formats', () => {
    it('should skip validation for SensorML format in DeploymentParser', () => {
      const parser = new DeploymentParser();
      const sensorml = {
        type: 'Deployment',
        id: 'dep-1',
        deployedSystems: [],
      };

      const result = parser.parse(sensorml, { 
        contentType: 'application/sml+json',
        validate: true 
      });
      expect(result.warnings).toBeUndefined();
      expect(result.errors).toBeUndefined();
    });

    it('should skip validation for SensorML format in ProcedureParser', () => {
      const parser = new ProcedureParser();
      const sensorml = {
        type: 'SimpleProcess',
        id: 'proc-1',
      };

      const result = parser.parse(sensorml, { 
        contentType: 'application/sml+json',
        validate: true 
      });
      expect(result.warnings).toBeUndefined();
      expect(result.errors).toBeUndefined();
    });

    it('should skip validation for non-GeoJSON in SamplingFeatureParser', () => {
      const parser = new SamplingFeatureParser();
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: { featureType: 'SamplingFeature' },
      };

      const result = parser.parse(feature, { 
        contentType: 'application/json',
        validate: true 
      });
      expect(result.warnings).toBeUndefined();
    });

    it('should skip validation for non-GeoJSON in PropertyParser', () => {
      const parser = new PropertyParser();
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: { featureType: 'Property' },
      };

      const result = parser.parse(feature, { 
        contentType: 'application/json',
        validate: true 
      });
      expect(result.warnings).toBeUndefined();
    });

    it('should skip validation for non-GeoJSON in DatastreamParser', () => {
      const parser = new DatastreamParser();
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: { featureType: 'Datastream' },
      };

      const result = parser.parse(feature, { 
        contentType: 'application/json',
        validate: true 
      });
      expect(result.warnings).toBeUndefined();
    });

    it('should skip validation for non-GeoJSON in ControlStreamParser', () => {
      const parser = new ControlStreamParser();
      const feature = {
        type: 'Feature',
        geometry: null,
        properties: { featureType: 'ControlStream' },
      };

      const result = parser.parse(feature, { 
        contentType: 'application/json',
        validate: true 
      });
      expect(result.warnings).toBeUndefined();
    });
  });

  describe('GeoJSON validation with errors', () => {
    it('should return validation errors for invalid ProcedureFeature', () => {
      const parser = new ProcedureParser();
      const invalid = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Procedure',
          // Missing uid, definition
        },
      };

      const result = parser.parse(invalid, { 
        contentType: 'application/geo+json',
        validate: true 
      });
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should return validation errors for invalid SamplingFeature', () => {
      const parser = new SamplingFeatureParser();
      const invalid = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'SamplingFeature',
          // Missing uid, sampledFeature
        },
      };

      const result = parser.parse(invalid, { 
        contentType: 'application/geo+json',
        validate: true 
      });
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should return validation errors for invalid PropertyFeature', () => {
      const parser = new PropertyParser();
      const invalid = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'Property',
          // Missing uid, definition
        },
      };

      const result = parser.parse(invalid, { 
        contentType: 'application/geo+json',
        validate: true 
      });
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should return validation errors for invalid ControlStreamFeature', () => {
      const parser = new ControlStreamParser();
      const invalid = {
        type: 'Feature',
        geometry: null,
        properties: {
          featureType: 'ControlStream',
          // Missing uid, system, controlledProperty
        },
      };

      const result = parser.parse(invalid, { 
        contentType: 'application/geo+json',
        validate: true 
      });
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});
