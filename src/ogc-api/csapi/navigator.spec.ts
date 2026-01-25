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

  describe('Deployments Resource', () => {
    beforeEach(() => {
      // Add deployments link to collection
      mockCollection.links.push({
        rel: 'http://www.opengis.net/def/rel/ogc/1.0/deployments',
        href: 'http://example.com/csapi/deployments',
        type: 'application/json',
      });
      navigator = new CSAPINavigator(mockCollection);
    });

    describe('getDeploymentsUrl', () => {
      it('builds basic deployments URL', () => {
        const url = navigator.getDeploymentsUrl();
        expect(url).toBe('http://example.com/csapi/deployments');
      });

      it('builds URL with limit parameter', () => {
        const url = navigator.getDeploymentsUrl({ limit: 10 });
        expect(url).toContain('limit=10');
      });

      it('builds URL with bbox parameter', () => {
        const url = navigator.getDeploymentsUrl({
          bbox: [-180, -90, 180, 90],
        });
        expect(url).toContain('bbox=-180%2C-90%2C180%2C90');
      });

      it('builds URL with datetime parameter', () => {
        const url = navigator.getDeploymentsUrl({
          datetime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('datetime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds URL with q (text search) parameter', () => {
        const url = navigator.getDeploymentsUrl({ q: 'coastal' });
        expect(url).toContain('q=coastal');
      });

      it('builds URL with system parameter', () => {
        const url = navigator.getDeploymentsUrl({ system: 'sensor-456' });
        expect(url).toContain('system=sensor-456');
      });

      it('builds URL with multiple parameters', () => {
        const url = navigator.getDeploymentsUrl({
          limit: 5,
          q: 'atlantic',
          system: 'buoy-789',
        });
        expect(url).toContain('limit=5');
        expect(url).toContain('q=atlantic');
        expect(url).toContain('system=buoy-789');
      });
    });

    describe('getDeploymentUrl', () => {
      it('builds URL for specific deployment', () => {
        const url = navigator.getDeploymentUrl('deployment-456');
        expect(url).toBe('http://example.com/csapi/deployments/deployment-456');
      });

      it('encodes deployment ID in URL', () => {
        const url = navigator.getDeploymentUrl('deploy/123');
        expect(url).toBe(
          'http://example.com/csapi/deployments/deploy%2F123'
        );
      });

      it('includes format parameter when specified', () => {
        const url = navigator.getDeploymentUrl('deployment-456', 'sml');
        expect(url).toContain('f=sml');
      });
    });

    describe('createDeploymentUrl', () => {
      it('builds URL for creating deployment', () => {
        const url = navigator.createDeploymentUrl();
        expect(url).toBe('http://example.com/csapi/deployments');
      });
    });

    describe('updateDeploymentUrl', () => {
      it('builds URL for updating deployment', () => {
        const url = navigator.updateDeploymentUrl('deployment-456');
        expect(url).toBe('http://example.com/csapi/deployments/deployment-456');
      });

      it('encodes deployment ID', () => {
        const url = navigator.updateDeploymentUrl('deploy/special');
        expect(url).toBe(
          'http://example.com/csapi/deployments/deploy%2Fspecial'
        );
      });
    });

    describe('patchDeploymentUrl', () => {
      it('builds URL for patching deployment', () => {
        const url = navigator.patchDeploymentUrl('deployment-456');
        expect(url).toBe('http://example.com/csapi/deployments/deployment-456');
      });

      it('encodes deployment ID', () => {
        const url = navigator.patchDeploymentUrl('deploy/test');
        expect(url).toBe('http://example.com/csapi/deployments/deploy%2Ftest');
      });
    });

    describe('deleteDeploymentUrl', () => {
      it('builds URL for deleting deployment', () => {
        const url = navigator.deleteDeploymentUrl('deployment-456');
        expect(url).toBe('http://example.com/csapi/deployments/deployment-456');
      });

      it('encodes deployment ID', () => {
        const url = navigator.deleteDeploymentUrl('deploy/old');
        expect(url).toBe('http://example.com/csapi/deployments/deploy%2Fold');
      });
    });

    describe('getDeploymentHistoryUrl', () => {
      it('builds basic deployment history URL', () => {
        const url = navigator.getDeploymentHistoryUrl('deployment-456');
        expect(url).toBe(
          'http://example.com/csapi/deployments/deployment-456/history'
        );
      });

      it('builds history URL with validTime parameter', () => {
        const url = navigator.getDeploymentHistoryUrl('deployment-456', {
          validTime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('validTime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds history URL with limit', () => {
        const url = navigator.getDeploymentHistoryUrl('deployment-456', {
          limit: 5,
        });
        expect(url).toContain('limit=5');
      });
    });
  });

  describe('Sampling Features Resource', () => {
    beforeEach(() => {
      // Add samplingFeatures link to collection
      mockCollection.links.push({
        rel: 'http://www.opengis.net/def/rel/ogc/1.0/samplingFeatures',
        href: 'http://example.com/csapi/samplingFeatures',
        type: 'application/json',
      });
      navigator = new CSAPINavigator(mockCollection);
    });

    describe('getSamplingFeaturesUrl', () => {
      it('builds basic sampling features URL', () => {
        const url = navigator.getSamplingFeaturesUrl();
        expect(url).toBe('http://example.com/csapi/samplingFeatures');
      });

      it('builds URL with limit parameter', () => {
        const url = navigator.getSamplingFeaturesUrl({ limit: 10 });
        expect(url).toContain('limit=10');
      });

      it('builds URL with bbox parameter', () => {
        const url = navigator.getSamplingFeaturesUrl({
          bbox: [-180, -90, 180, 90],
        });
        expect(url).toContain('bbox=-180%2C-90%2C180%2C90');
      });

      it('builds URL with datetime parameter', () => {
        const url = navigator.getSamplingFeaturesUrl({
          datetime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('datetime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds URL with q (text search) parameter', () => {
        const url = navigator.getSamplingFeaturesUrl({ q: 'station' });
        expect(url).toContain('q=station');
      });

      it('builds URL with multiple parameters', () => {
        const url = navigator.getSamplingFeaturesUrl({
          limit: 5,
          q: 'river',
          bbox: [-10, 40, 10, 50],
        });
        expect(url).toContain('limit=5');
        expect(url).toContain('q=river');
        expect(url).toContain('bbox=-10%2C40%2C10%2C50');
      });
    });

    describe('getSamplingFeatureUrl', () => {
      it('builds URL for specific sampling feature', () => {
        const url = navigator.getSamplingFeatureUrl('station-123');
        expect(url).toBe('http://example.com/csapi/samplingFeatures/station-123');
      });

      it('encodes sampling feature ID in URL', () => {
        const url = navigator.getSamplingFeatureUrl('station/456');
        expect(url).toBe(
          'http://example.com/csapi/samplingFeatures/station%2F456'
        );
      });

      it('includes format parameter when specified', () => {
        const url = navigator.getSamplingFeatureUrl('station-123', 'geojson');
        expect(url).toContain('f=geojson');
      });
    });

    describe('createSamplingFeatureUrl', () => {
      it('builds URL for creating sampling feature', () => {
        const url = navigator.createSamplingFeatureUrl();
        expect(url).toBe('http://example.com/csapi/samplingFeatures');
      });
    });

    describe('updateSamplingFeatureUrl', () => {
      it('builds URL for updating sampling feature', () => {
        const url = navigator.updateSamplingFeatureUrl('station-123');
        expect(url).toBe('http://example.com/csapi/samplingFeatures/station-123');
      });

      it('encodes sampling feature ID', () => {
        const url = navigator.updateSamplingFeatureUrl('station/special');
        expect(url).toBe(
          'http://example.com/csapi/samplingFeatures/station%2Fspecial'
        );
      });
    });

    describe('patchSamplingFeatureUrl', () => {
      it('builds URL for patching sampling feature', () => {
        const url = navigator.patchSamplingFeatureUrl('station-123');
        expect(url).toBe('http://example.com/csapi/samplingFeatures/station-123');
      });

      it('encodes sampling feature ID', () => {
        const url = navigator.patchSamplingFeatureUrl('station/test');
        expect(url).toBe('http://example.com/csapi/samplingFeatures/station%2Ftest');
      });
    });

    describe('deleteSamplingFeatureUrl', () => {
      it('builds URL for deleting sampling feature', () => {
        const url = navigator.deleteSamplingFeatureUrl('station-123');
        expect(url).toBe('http://example.com/csapi/samplingFeatures/station-123');
      });

      it('encodes sampling feature ID', () => {
        const url = navigator.deleteSamplingFeatureUrl('station/old');
        expect(url).toBe('http://example.com/csapi/samplingFeatures/station%2Fold');
      });
    });

    describe('getSamplingFeatureHistoryUrl', () => {
      it('builds basic sampling feature history URL', () => {
        const url = navigator.getSamplingFeatureHistoryUrl('station-123');
        expect(url).toBe(
          'http://example.com/csapi/samplingFeatures/station-123/history'
        );
      });

      it('builds history URL with validTime parameter', () => {
        const url = navigator.getSamplingFeatureHistoryUrl('station-123', {
          validTime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('validTime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds history URL with limit', () => {
        const url = navigator.getSamplingFeatureHistoryUrl('station-123', {
          limit: 5,
        });
        expect(url).toContain('limit=5');
      });
    });
  });

  describe('Datastreams Resource', () => {
    beforeEach(() => {
      // Add datastreams link to collection
      mockCollection.links.push({
        rel: 'http://www.opengis.net/def/rel/ogc/1.0/datastreams',
        href: 'http://example.com/csapi/datastreams',
        type: 'application/json',
      });
      navigator = new CSAPINavigator(mockCollection);
    });

    describe('getDatastreamsUrl', () => {
      it('builds basic datastreams URL', () => {
        const url = navigator.getDatastreamsUrl();
        expect(url).toBe('http://example.com/csapi/datastreams');
      });

      it('builds URL with limit parameter', () => {
        const url = navigator.getDatastreamsUrl({ limit: 10 });
        expect(url).toContain('limit=10');
      });

      it('builds URL with bbox parameter', () => {
        const url = navigator.getDatastreamsUrl({
          bbox: [-180, -90, 180, 90],
        });
        expect(url).toContain('bbox=-180%2C-90%2C180%2C90');
      });

      it('builds URL with datetime parameter', () => {
        const url = navigator.getDatastreamsUrl({
          datetime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('datetime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds URL with observedProperty parameter', () => {
        const url = navigator.getDatastreamsUrl({
          observedProperty: 'temperature',
        });
        expect(url).toContain('observedProperty=temperature');
      });

      it('builds URL with phenomenonTime parameter', () => {
        const url = navigator.getDatastreamsUrl({
          phenomenonTime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('phenomenonTime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds URL with multiple parameters', () => {
        const url = navigator.getDatastreamsUrl({
          limit: 5,
          observedProperty: 'pressure',
          bbox: [-10, 40, 10, 50],
        });
        expect(url).toContain('limit=5');
        expect(url).toContain('observedProperty=pressure');
        expect(url).toContain('bbox=-10%2C40%2C10%2C50');
      });
    });

    describe('getDatastreamUrl', () => {
      it('builds URL for specific datastream', () => {
        const url = navigator.getDatastreamUrl('stream-123');
        expect(url).toBe('http://example.com/csapi/datastreams/stream-123');
      });

      it('encodes datastream ID in URL', () => {
        const url = navigator.getDatastreamUrl('stream/456');
        expect(url).toBe(
          'http://example.com/csapi/datastreams/stream%2F456'
        );
      });

      it('includes format parameter when specified', () => {
        const url = navigator.getDatastreamUrl('stream-123', 'json');
        expect(url).toContain('f=json');
      });
    });

    describe('createDatastreamUrl', () => {
      it('builds URL for creating datastream', () => {
        const url = navigator.createDatastreamUrl();
        expect(url).toBe('http://example.com/csapi/datastreams');
      });
    });

    describe('updateDatastreamUrl', () => {
      it('builds URL for updating datastream', () => {
        const url = navigator.updateDatastreamUrl('stream-123');
        expect(url).toBe('http://example.com/csapi/datastreams/stream-123');
      });

      it('encodes datastream ID', () => {
        const url = navigator.updateDatastreamUrl('stream/special');
        expect(url).toBe(
          'http://example.com/csapi/datastreams/stream%2Fspecial'
        );
      });
    });

    describe('patchDatastreamUrl', () => {
      it('builds URL for patching datastream', () => {
        const url = navigator.patchDatastreamUrl('stream-123');
        expect(url).toBe('http://example.com/csapi/datastreams/stream-123');
      });

      it('encodes datastream ID', () => {
        const url = navigator.patchDatastreamUrl('stream/test');
        expect(url).toBe('http://example.com/csapi/datastreams/stream%2Ftest');
      });
    });

    describe('deleteDatastreamUrl', () => {
      it('builds URL for deleting datastream', () => {
        const url = navigator.deleteDatastreamUrl('stream-123');
        expect(url).toBe('http://example.com/csapi/datastreams/stream-123');
      });

      it('encodes datastream ID', () => {
        const url = navigator.deleteDatastreamUrl('stream/old');
        expect(url).toBe('http://example.com/csapi/datastreams/stream%2Fold');
      });
    });

    describe('getDatastreamHistoryUrl', () => {
      it('builds basic datastream history URL', () => {
        const url = navigator.getDatastreamHistoryUrl('stream-123');
        expect(url).toBe(
          'http://example.com/csapi/datastreams/stream-123/history'
        );
      });

      it('builds history URL with validTime parameter', () => {
        const url = navigator.getDatastreamHistoryUrl('stream-123', {
          validTime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('validTime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds history URL with limit', () => {
        const url = navigator.getDatastreamHistoryUrl('stream-123', {
          limit: 5,
        });
        expect(url).toContain('limit=5');
      });
    });

    describe('getDatastreamObservationsUrl', () => {
      it('builds basic datastream observations URL', () => {
        const url = navigator.getDatastreamObservationsUrl('stream-123');
        expect(url).toBe(
          'http://example.com/csapi/datastreams/stream-123/observations'
        );
      });

      it('builds URL with limit parameter', () => {
        const url = navigator.getDatastreamObservationsUrl('stream-123', {
          limit: 10,
        });
        expect(url).toContain('limit=10');
      });

      it('builds URL with bbox parameter', () => {
        const url = navigator.getDatastreamObservationsUrl('stream-123', {
          bbox: [-180, -90, 180, 90],
        });
        expect(url).toContain('bbox=-180%2C-90%2C180%2C90');
      });

      it('builds URL with datetime parameter', () => {
        const url = navigator.getDatastreamObservationsUrl('stream-123', {
          datetime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('datetime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds URL with phenomenonTime parameter', () => {
        const url = navigator.getDatastreamObservationsUrl('stream-123', {
          phenomenonTime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('phenomenonTime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds URL with resultTime parameter', () => {
        const url = navigator.getDatastreamObservationsUrl('stream-123', {
          resultTime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('resultTime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds URL with observedProperty parameter', () => {
        const url = navigator.getDatastreamObservationsUrl('stream-123', {
          observedProperty: 'temperature',
        });
        expect(url).toContain('observedProperty=temperature');
      });

      it('builds URL with multiple parameters', () => {
        const url = navigator.getDatastreamObservationsUrl('stream-123', {
          limit: 5,
          observedProperty: 'humidity',
          phenomenonTime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('limit=5');
        expect(url).toContain('observedProperty=humidity');
        expect(url).toContain('phenomenonTime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });
    });
  });

  describe('Observations Resource', () => {
    beforeEach(() => {
      // Add observations link to collection
      mockCollection.links.push({
        rel: 'http://www.opengis.net/def/rel/ogc/1.0/observations',
        href: 'http://example.com/csapi/observations',
        type: 'application/json',
      });
      navigator = new CSAPINavigator(mockCollection);
    });

    describe('getObservationsUrl', () => {
      it('builds basic observations URL', () => {
        const url = navigator.getObservationsUrl();
        expect(url).toBe('http://example.com/csapi/observations');
      });

      it('builds URL with limit parameter', () => {
        const url = navigator.getObservationsUrl({ limit: 100 });
        expect(url).toContain('limit=100');
      });

      it('builds URL with bbox parameter', () => {
        const url = navigator.getObservationsUrl({
          bbox: [-180, -90, 180, 90],
        });
        expect(url).toContain('bbox=-180%2C-90%2C180%2C90');
      });

      it('builds URL with datetime parameter', () => {
        const url = navigator.getObservationsUrl({
          datetime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('datetime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds URL with phenomenonTime parameter', () => {
        const url = navigator.getObservationsUrl({
          phenomenonTime: {
            start: new Date('2024-01-01'),
            end: new Date('2024-12-31'),
          },
        });
        expect(url).toContain(
          'phenomenonTime=2024-01-01T00%3A00%3A00.000Z%2F2024-12-31T00%3A00%3A00.000Z'
        );
      });

      it('builds URL with resultTime parameter', () => {
        const url = navigator.getObservationsUrl({
          resultTime: { start: new Date('2024-01-01') },
        });
        expect(url).toContain('resultTime=2024-01-01T00%3A00%3A00.000Z%2F..');
      });

      it('builds URL with observedProperty parameter', () => {
        const url = navigator.getObservationsUrl({
          observedProperty: 'temperature',
        });
        expect(url).toContain('observedProperty=temperature');
      });

      it('builds URL with multiple parameters', () => {
        const url = navigator.getObservationsUrl({
          limit: 50,
          observedProperty: 'salinity',
          phenomenonTime: { start: new Date('2024-01-01') },
          bbox: [-10, 40, 10, 50],
        });
        expect(url).toContain('limit=50');
        expect(url).toContain('observedProperty=salinity');
        expect(url).toContain('phenomenonTime=2024-01-01T00%3A00%3A00.000Z%2F..');
        expect(url).toContain('bbox=-10%2C40%2C10%2C50');
      });
    });

    describe('getObservationUrl', () => {
      it('builds URL for specific observation', () => {
        const url = navigator.getObservationUrl('obs-123');
        expect(url).toBe('http://example.com/csapi/observations/obs-123');
      });

      it('encodes observation ID in URL', () => {
        const url = navigator.getObservationUrl('obs/456');
        expect(url).toBe(
          'http://example.com/csapi/observations/obs%2F456'
        );
      });

      it('includes format parameter when specified', () => {
        const url = navigator.getObservationUrl('obs-123', 'om-json');
        expect(url).toContain('f=om-json');
      });
    });

    describe('createObservationsUrl', () => {
      it('builds URL for creating observations', () => {
        const url = navigator.createObservationsUrl();
        expect(url).toBe('http://example.com/csapi/observations');
      });
    });

    describe('deleteObservationUrl', () => {
      it('builds URL for deleting observation', () => {
        const url = navigator.deleteObservationUrl('obs-123');
        expect(url).toBe('http://example.com/csapi/observations/obs-123');
      });

      it('encodes observation ID', () => {
        const url = navigator.deleteObservationUrl('obs/old');
        expect(url).toBe('http://example.com/csapi/observations/obs%2Fold');
      });
    });
  });
});
