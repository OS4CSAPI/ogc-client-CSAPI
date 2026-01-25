import CSAPINavigator from './navigator.js';
import { OgcApiCollectionInfo } from '../model.js';

describe('CSAPINavigator - Systems Resource', () => {
  let navigator: CSAPINavigator;
  let mockCollection: OgcApiCollectionInfo;

  beforeEach(() => {
    mockCollection = {
      id: 'sensors',
      title: 'Sensor Systems Collection',
      links: [
        {
          rel: 'self',
          href: 'http://example.com/csapi/collections/sensors',
          type: 'application/json',
        },
        {
          rel: 'http://www.opengis.net/def/rel/ogc/1.0/systems',
          href: 'http://example.com/csapi/systems',
          type: 'application/json',
        },
        {
          rel: 'http://www.opengis.net/def/rel/ogc/1.0/datastreams',
          href: 'http://example.com/csapi/datastreams',
          type: 'application/json',
        },
        {
          rel: 'http://www.opengis.net/def/rel/ogc/1.0/samplingFeatures',
          href: 'http://example.com/csapi/samplingFeatures',
          type: 'application/json',
        },
        {
          rel: 'http://www.opengis.net/def/rel/ogc/1.0/controlStreams',
          href: 'http://example.com/csapi/controlStreams',
          type: 'application/json',
        },
      ],
      itemFormats: ['application/sml+json', 'application/json'],
      crs: ['http://www.opengis.net/def/crs/OGC/1.3/CRS84'],
    } as OgcApiCollectionInfo;

    navigator = new CSAPINavigator(mockCollection);
  });

  describe('constructor', () => {
    it('extracts available resources from collection links', () => {
      expect(navigator.availableResources.has('systems')).toBe(true);
      expect(navigator.availableResources.has('datastreams')).toBe(true);
      expect(navigator.availableResources.has('samplingFeatures')).toBe(true);
      expect(navigator.availableResources.has('controlStreams')).toBe(true);
    });

    it('extracts supported formats', () => {
      expect(navigator.supportedFormats.has('application/json')).toBe(true);
      expect(navigator.supportedFormats.has('application/sml+json')).toBe(true);
    });

    it('throws error if collection has no self link', () => {
      const badCollection = {
        ...mockCollection,
        links: [],
      } as OgcApiCollectionInfo;

      expect(() => new CSAPINavigator(badCollection)).toThrow(
        'Collection does not have a self link'
      );
    });
  });

  describe('getSystemsUrl', () => {
    it('builds basic systems URL', () => {
      const url = navigator.getSystemsUrl();
      expect(url).toBe('http://example.com/csapi/systems');
    });

    it('builds URL with limit parameter', () => {
      const url = navigator.getSystemsUrl({ limit: 10 });
      expect(url).toBe('http://example.com/csapi/systems?limit=10');
    });

    it('builds URL with bbox filter', () => {
      const url = navigator.getSystemsUrl({
        bbox: [-180, -90, 180, 90],
      });
      expect(url).toBe('http://example.com/csapi/systems?bbox=-180%2C-90%2C180%2C90');
    });

    it('builds URL with datetime filter (single date)', () => {
      const url = navigator.getSystemsUrl({
        datetime: new Date('2024-01-01T00:00:00Z'),
      });
      expect(url).toBe(
        'http://example.com/csapi/systems?datetime=2024-01-01T00%3A00%3A00.000Z'
      );
    });

    it('builds URL with datetime filter (date range)', () => {
      const url = navigator.getSystemsUrl({
        datetime: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-12-31T23:59:59Z'),
        },
      });
      expect(url).toContain('datetime=2024-01-01T00%3A00%3A00.000Z');
      expect(url).toContain('2024-12-31T23%3A59%3A59.000Z');
    });

    it('builds URL with datetime filter (open start)', () => {
      const url = navigator.getSystemsUrl({
        datetime: {
          end: new Date('2024-12-31T23:59:59Z'),
        },
      });
      expect(url).toContain('datetime=..%2F2024-12-31T23%3A59%3A59.000Z');
    });

    it('builds URL with datetime filter (open end)', () => {
      const url = navigator.getSystemsUrl({
        datetime: {
          start: new Date('2024-01-01T00:00:00Z'),
        },
      });
      expect(url).toContain('datetime=2024-01-01T00%3A00%3A00.000Z%2F..');
    });

    it('builds URL with text search query', () => {
      const url = navigator.getSystemsUrl({
        q: 'weather station',
      });
      expect(url).toBe('http://example.com/csapi/systems?q=weather+station');
    });

    it('builds URL with parent filter', () => {
      const url = navigator.getSystemsUrl({
        parent: 'network-001',
      });
      expect(url).toBe('http://example.com/csapi/systems?parent=network-001');
    });

    it('builds URL with procedure filter', () => {
      const url = navigator.getSystemsUrl({
        procedure: 'temp-measurement',
      });
      expect(url).toBe('http://example.com/csapi/systems?procedure=temp-measurement');
    });

    it('builds URL with observedProperty filter', () => {
      const url = navigator.getSystemsUrl({
        observedProperty: 'temperature',
      });
      expect(url).toBe(
        'http://example.com/csapi/systems?observedProperty=temperature'
      );
    });

    it('builds URL with controlledProperty filter', () => {
      const url = navigator.getSystemsUrl({
        controlledProperty: 'heater-power',
      });
      expect(url).toBe(
        'http://example.com/csapi/systems?controlledProperty=heater-power'
      );
    });

    it('builds URL with systemKind filter', () => {
      const url = navigator.getSystemsUrl({
        systemKind: 'PhysicalSystem',
      });
      expect(url).toBe('http://example.com/csapi/systems?systemKind=PhysicalSystem');
    });

    it('builds URL with multiple filters', () => {
      const url = navigator.getSystemsUrl({
        limit: 10,
        q: 'weather station',
        parent: 'network-001',
        observedProperty: 'temperature',
      });
      expect(url).toContain('limit=10');
      expect(url).toContain('q=weather+station');
      expect(url).toContain('parent=network-001');
      expect(url).toContain('observedProperty=temperature');
    });

    it('throws error if systems not available', () => {
      const minimalCollection = {
        ...mockCollection,
        links: [mockCollection.links[0]], // only self link
      } as OgcApiCollectionInfo;
      const nav = new CSAPINavigator(minimalCollection);
      expect(() => nav.getSystemsUrl()).toThrow(
        'Collection does not support systems resource'
      );
    });
  });

  describe('getSystemUrl', () => {
    it('builds single system URL', () => {
      const url = navigator.getSystemUrl('sensor-123');
      expect(url).toBe('http://example.com/csapi/systems/sensor-123');
    });

    it('builds URL with format parameter', () => {
      const url = navigator.getSystemUrl('sensor-123', 'application/sml+json');
      expect(url).toBe(
        'http://example.com/csapi/systems/sensor-123?f=application%2Fsml%2Bjson'
      );
    });

    it('properly encodes system IDs with special characters', () => {
      const url = navigator.getSystemUrl('sensor/with/slashes');
      expect(url).toContain('sensor%2Fwith%2Fslashes');
    });

    it('properly encodes system IDs with spaces', () => {
      const url = navigator.getSystemUrl('sensor 123');
      expect(url).toContain('sensor%20123');
    });
  });

  describe('CRUD URLs', () => {
    it('builds create URL', () => {
      const url = navigator.createSystemUrl();
      expect(url).toBe('http://example.com/csapi/systems');
    });

    it('builds update URL', () => {
      const url = navigator.updateSystemUrl('sensor-123');
      expect(url).toBe('http://example.com/csapi/systems/sensor-123');
    });

    it('builds patch URL', () => {
      const url = navigator.patchSystemUrl('sensor-123');
      expect(url).toBe('http://example.com/csapi/systems/sensor-123');
    });

    it('builds delete URL', () => {
      const url = navigator.deleteSystemUrl('sensor-123');
      expect(url).toBe('http://example.com/csapi/systems/sensor-123');
    });

    it('encodes system IDs in all CRUD URLs', () => {
      const systemId = 'sensor/special#id';
      expect(navigator.updateSystemUrl(systemId)).toContain('sensor%2Fspecial%23id');
      expect(navigator.patchSystemUrl(systemId)).toContain('sensor%2Fspecial%23id');
      expect(navigator.deleteSystemUrl(systemId)).toContain('sensor%2Fspecial%23id');
    });
  });

  describe('getSystemHistoryUrl', () => {
    it('builds history URL', () => {
      const url = navigator.getSystemHistoryUrl('sensor-123');
      expect(url).toBe('http://example.com/csapi/systems/sensor-123/history');
    });

    it('builds history URL with validTime filter', () => {
      const url = navigator.getSystemHistoryUrl('sensor-123', {
        validTime: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
      });
      expect(url).toContain('validTime=');
      expect(url).toContain('2024-01-01');
      expect(url).toContain('2024-12-31');
    });

    it('builds history URL with limit', () => {
      const url = navigator.getSystemHistoryUrl('sensor-123', {
        limit: 5,
      });
      expect(url).toContain('limit=5');
    });
  });

  describe('sub-resource URLs', () => {
    it('builds subsystems URL', () => {
      const url = navigator.getSubsystemsUrl('parent-123');
      expect(url).toBe('http://example.com/csapi/systems/parent-123/subsystems');
    });

    it('builds subsystems URL with filters', () => {
      const url = navigator.getSubsystemsUrl('parent-123', {
        limit: 10,
        q: 'sensor',
      });
      expect(url).toContain('limit=10');
      expect(url).toContain('q=sensor');
    });

    it('builds system sampling features URL', () => {
      const url = navigator.getSystemSamplingFeaturesUrl('sensor-123');
      expect(url).toBe(
        'http://example.com/csapi/systems/sensor-123/samplingFeatures'
      );
    });

    it('builds system datastreams URL', () => {
      const url = navigator.getSystemDatastreamsUrl('sensor-123');
      expect(url).toBe('http://example.com/csapi/systems/sensor-123/datastreams');
    });

    it('builds system control streams URL', () => {
      const url = navigator.getSystemControlStreamsUrl('sensor-123');
      expect(url).toBe('http://example.com/csapi/systems/sensor-123/controlStreams');
    });

    it('throws error for sub-resources if not available', () => {
      const minimalCollection = {
        ...mockCollection,
        links: [mockCollection.links[0], mockCollection.links[1]], // self + systems only
      } as OgcApiCollectionInfo;
      const nav = new CSAPINavigator(minimalCollection);

      expect(() => nav.getSystemDatastreamsUrl('sensor-123')).toThrow(
        'Collection does not support datastreams resource'
      );
    });
  });

  describe('Procedures Resource', () => {
    beforeEach(() => {
      // Add procedures link to collection
      mockCollection.links.push({
        rel: 'http://www.opengis.net/def/rel/ogc/1.0/procedures',
        href: 'http://example.com/csapi/procedures',
        type: 'application/json',
      });
      navigator = new CSAPINavigator(mockCollection);
    });

    describe('getProceduresUrl', () => {
      it('builds basic procedures URL', () => {
        const url = navigator.getProceduresUrl();
        expect(url).toBe('http://example.com/csapi/procedures');
      });

      it('builds URL with limit parameter', () => {
        const url = navigator.getProceduresUrl({ limit: 10 });
        expect(url).toBe('http://example.com/csapi/procedures?limit=10');
      });

      it('builds URL with text search query', () => {
        const url = navigator.getProceduresUrl({
          q: 'temperature measurement',
        });
        expect(url).toBe('http://example.com/csapi/procedures?q=temperature+measurement');
      });

      it('builds URL with observedProperty filter', () => {
        const url = navigator.getProceduresUrl({
          observedProperty: 'temperature',
        });
        expect(url).toBe(
          'http://example.com/csapi/procedures?observedProperty=temperature'
        );
      });

      it('builds URL with controlledProperty filter', () => {
        const url = navigator.getProceduresUrl({
          controlledProperty: 'heater-power',
        });
        expect(url).toBe(
          'http://example.com/csapi/procedures?controlledProperty=heater-power'
        );
      });

      it('builds URL with multiple filters', () => {
        const url = navigator.getProceduresUrl({
          limit: 20,
          q: 'sensor',
          observedProperty: 'temperature',
        });
        expect(url).toContain('limit=20');
        expect(url).toContain('q=sensor');
        expect(url).toContain('observedProperty=temperature');
      });

      it('throws error if procedures not available', () => {
        const minimalCollection = {
          ...mockCollection,
          links: [mockCollection.links[0]], // only self link
        } as OgcApiCollectionInfo;
        const nav = new CSAPINavigator(minimalCollection);
        expect(() => nav.getProceduresUrl()).toThrow(
          'Collection does not support procedures resource'
        );
      });
    });

    describe('getProcedureUrl', () => {
      it('builds single procedure URL', () => {
        const url = navigator.getProcedureUrl('procedure-123');
        expect(url).toBe('http://example.com/csapi/procedures/procedure-123');
      });

      it('builds URL with format parameter', () => {
        const url = navigator.getProcedureUrl('procedure-123', 'application/sml+json');
        expect(url).toBe(
          'http://example.com/csapi/procedures/procedure-123?f=application%2Fsml%2Bjson'
        );
      });

      it('properly encodes procedure IDs', () => {
        const url = navigator.getProcedureUrl('procedure/with/slashes');
        expect(url).toContain('procedure%2Fwith%2Fslashes');
      });
    });

    describe('CRUD URLs', () => {
      it('builds create URL', () => {
        const url = navigator.createProcedureUrl();
        expect(url).toBe('http://example.com/csapi/procedures');
      });

      it('builds update URL', () => {
        const url = navigator.updateProcedureUrl('procedure-123');
        expect(url).toBe('http://example.com/csapi/procedures/procedure-123');
      });

      it('builds patch URL', () => {
        const url = navigator.patchProcedureUrl('procedure-123');
        expect(url).toBe('http://example.com/csapi/procedures/procedure-123');
      });

      it('builds delete URL', () => {
        const url = navigator.deleteProcedureUrl('procedure-123');
        expect(url).toBe('http://example.com/csapi/procedures/procedure-123');
      });
    });

    describe('getProcedureHistoryUrl', () => {
      it('builds history URL', () => {
        const url = navigator.getProcedureHistoryUrl('procedure-123');
        expect(url).toBe('http://example.com/csapi/procedures/procedure-123/history');
      });

      it('builds history URL with validTime filter', () => {
        const url = navigator.getProcedureHistoryUrl('procedure-123', {
          validTime: {
            start: new Date('2024-01-01'),
            end: new Date('2024-12-31'),
          },
        });
        expect(url).toContain('validTime=');
        expect(url).toContain('2024-01-01');
        expect(url).toContain('2024-12-31');
      });

      it('builds history URL with limit', () => {
        const url = navigator.getProcedureHistoryUrl('procedure-123', {
          limit: 5,
        });
        expect(url).toContain('limit=5');
      });
    });
  });
});
