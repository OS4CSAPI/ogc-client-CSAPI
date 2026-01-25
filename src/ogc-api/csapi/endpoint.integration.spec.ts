/**
 * Integration tests for CSAPI functionality in OgcApiEndpoint
 */
import OgcApiEndpoint from '../endpoint.js';
import CSAPINavigator from './navigator.js';

describe('OgcApiEndpoint CSAPI Integration', () => {
  let endpoint: OgcApiEndpoint;

  beforeEach(() => {
    // Mock fetch to return sample CSAPI server responses
    globalThis.fetch = jest.fn((url: string) => {
      const urlStr = url.toString();

      // Root endpoint
      if (urlStr.includes('sample-csapi?f=json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          clone: function () {
            return this;
          },
          json: () =>
            Promise.resolve({
              title: 'Sample CSAPI Server',
              links: [
                {
                  rel: 'self',
                  href: 'http://example.com/csapi',
                  type: 'application/json',
                },
                {
                  rel: 'conformance',
                  href: 'http://example.com/csapi/conformance',
                  type: 'application/json',
                },
                {
                  rel: 'data',
                  href: 'http://example.com/csapi/collections',
                  type: 'application/json',
                },
                {
                  rel: 'service-desc',
                  href: 'http://example.com/csapi/api',
                  type: 'application/vnd.oai.openapi+json;version=3.0',
                },
              ],
            }),
        } as Response);
      }

      // Conformance endpoint
      if (urlStr.includes('conformance?f=json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          clone: function () {
            return this;
          },
          json: () =>
            Promise.resolve({
              conformsTo: [
                'http://www.opengis.net/spec/ogcapi-common-1/1.0/conf/core',
                'http://www.opengis.net/spec/ogcapi-common-2/1.0/conf/collections',
                'http://www.opengis.net/spec/ogcapi-connected-systems-1/1.0/conf/core',
                'http://www.opengis.net/spec/ogcapi-connected-systems-1/1.0/conf/system-features',
                'http://www.opengis.net/spec/ogcapi-connected-systems-2/1.0/conf/datastream-features',
              ],
            }),
        } as Response);
      }

      // Collections endpoint
      if (urlStr.includes('collections?f=json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          clone: function () {
            return this;
          },
          json: () =>
            Promise.resolve({
              collections: [
                {
                  id: 'sensors',
                  title: 'Sensor Systems',
                  links: [
                    {
                      rel: 'self',
                      href: 'http://example.com/csapi/collections/sensors',
                      type: 'application/json',
                    },
                    {
                      rel: 'http://www.opengis.net/def/rel/ogc/1.0/systems',
                      href: 'http://example.com/csapi/collections/sensors/systems',
                      type: 'application/json',
                    },
                    {
                      rel: 'http://www.opengis.net/def/rel/ogc/1.0/datastreams',
                      href: 'http://example.com/csapi/collections/sensors/datastreams',
                      type: 'application/json',
                    },
                  ],
                },
                {
                  id: 'regular-features',
                  title: 'Regular GeoJSON Features',
                  links: [
                    {
                      rel: 'self',
                      href: 'http://example.com/csapi/collections/regular-features',
                      type: 'application/json',
                    },
                    {
                      rel: 'items',
                      href: 'http://example.com/csapi/collections/regular-features/items',
                      type: 'application/geo+json',
                    },
                  ],
                },
              ],
            }),
        } as Response);
      }

      // Individual collection endpoint
      if (urlStr.includes('collections/sensors?f=json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          clone: function () {
            return this;
          },
          json: () =>
            Promise.resolve({
              id: 'sensors',
              title: 'Sensor Systems',
              links: [
                {
                  rel: 'self',
                  href: 'http://example.com/csapi/collections/sensors',
                  type: 'application/json',
                },
                {
                  rel: 'http://www.opengis.net/def/rel/ogc/1.0/systems',
                  href: 'http://example.com/csapi/collections/sensors/systems',
                  type: 'application/json',
                },
                {
                  rel: 'http://www.opengis.net/def/rel/ogc/1.0/datastreams',
                  href: 'http://example.com/csapi/collections/sensors/datastreams',
                  type: 'application/json',
                },
              ],
            }),
        } as Response);
      }

      return Promise.reject(new Error(`Unmocked URL: ${urlStr}`));
    }) as jest.Mock;

    endpoint = new OgcApiEndpoint('http://example.com/sample-csapi');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('#hasConnectedSystems', () => {
    it('returns true when CSAPI conformance classes are present', async () => {
      const hasCSAPI = await endpoint.hasConnectedSystems;
      expect(hasCSAPI).toBe(true);
    });
  });

  describe('#csapiCollections', () => {
    it('returns only CSAPI-enabled collections', async () => {
      const collections = await endpoint.csapiCollections;
      expect(collections).toEqual(['sensors']);
      expect(collections).not.toContain('regular-features');
    });

    it('returns empty array when no CSAPI conformance', async () => {
      // Mock endpoint without CSAPI conformance
      globalThis.fetch = jest.fn((url: string) => {
        const urlStr = url.toString();

        if (urlStr.includes('conformance?f=json')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            clone: function () {
              return this;
            },
            json: () =>
              Promise.resolve({
                conformsTo: [
                  'http://www.opengis.net/spec/ogcapi-common-1/1.0/conf/core',
                ],
              }),
          } as Response);
        }

        if (urlStr.includes('sample-csapi?f=json')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            clone: function () {
              return this;
            },
            json: () =>
              Promise.resolve({
                title: 'Regular OGC API',
                links: [
                  {
                    rel: 'self',
                    href: 'http://example.com/csapi',
                    type: 'application/json',
                  },
                  {
                    rel: 'conformance',
                    href: 'http://example.com/csapi/conformance',
                    type: 'application/json',
                  },
                  {
                    rel: 'data',
                    href: 'http://example.com/csapi/collections',
                    type: 'application/json',
                  },
                  {
                    rel: 'service-desc',
                    href: 'http://example.com/csapi/api',
                    type: 'application/vnd.oai.openapi+json;version=3.0',
                  },
                ],
              }),
          } as Response);
        }

        if (urlStr.includes('collections?f=json')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            clone: function () {
              return this;
            },
            json: () => Promise.resolve({ collections: [] }),
          } as Response);
        }

        return Promise.reject(new Error(`Unmocked URL: ${urlStr}`));
      }) as jest.Mock;

      const endpoint2 = new OgcApiEndpoint('http://example.com/sample-csapi');
      const collections = await endpoint2.csapiCollections;
      expect(collections).toEqual([]);
    });
  });

  describe('#csapi()', () => {
    it('returns a CSAPINavigator instance', async () => {
      const navigator = await endpoint.csapi('sensors');
      expect(navigator).toBeInstanceOf(CSAPINavigator);
    });

    it('caches navigator instances per collection', async () => {
      const navigator1 = await endpoint.csapi('sensors');
      const navigator2 = await endpoint.csapi('sensors');
      expect(navigator1).toBe(navigator2); // Same instance
    });

    it('creates different navigator instances for different collections', async () => {
      // Add another CSAPI collection to the mock
      globalThis.fetch = jest.fn((url: string) => {
        const urlStr = url.toString();

        if (urlStr.includes('collections?f=json')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            clone: function () {
              return this;
            },
            json: () =>
              Promise.resolve({
                collections: [
                  {
                    id: 'sensors',
                    title: 'Sensor Systems',
                    links: [
                      {
                        rel: 'self',
                        href: 'http://example.com/csapi/collections/sensors',
                        type: 'application/json',
                      },
                      {
                        rel: 'http://www.opengis.net/def/rel/ogc/1.0/systems',
                        href: 'http://example.com/csapi/collections/sensors/systems',
                        type: 'application/json',
                      },
                    ],
                  },
                  {
                    id: 'actuators',
                    title: 'Actuator Systems',
                    links: [
                      {
                        rel: 'self',
                        href: 'http://example.com/csapi/collections/actuators',
                        type: 'application/json',
                      },
                      {
                        rel: 'http://www.opengis.net/def/rel/ogc/1.0/systems',
                        href: 'http://example.com/csapi/collections/actuators/systems',
                        type: 'application/json',
                      },
                    ],
                  },
                ],
              }),
          } as Response);
        }

        // Return defaults for other URLs
        if (urlStr.includes('sample-csapi?f=json')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            clone: function () {
              return this;
            },
            json: () =>
              Promise.resolve({
                title: 'Sample CSAPI Server',
                links: [
                  {
                    rel: 'self',
                    href: 'http://example.com/csapi',
                    type: 'application/json',
                  },
                  {
                    rel: 'conformance',
                    href: 'http://example.com/csapi/conformance',
                    type: 'application/json',
                  },
                  {
                    rel: 'data',
                    href: 'http://example.com/csapi/collections',
                    type: 'application/json',
                  },
                  {
                    rel: 'service-desc',
                    href: 'http://example.com/csapi/api',
                    type: 'application/vnd.oai.openapi+json;version=3.0',
                  },
                ],
              }),
          } as Response);
        }

        if (urlStr.includes('conformance?f=json')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            clone: function () {
              return this;
            },
            json: () =>
              Promise.resolve({
                conformsTo: [
                  'http://www.opengis.net/spec/ogcapi-connected-systems-1/1.0/conf/core',
                ],
              }),
          } as Response);
        }

        // Individual collection: sensors
        if (urlStr.includes('collections/sensors?f=json')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            clone: function () {
              return this;
            },
            json: () =>
              Promise.resolve({
                id: 'sensors',
                title: 'Sensor Systems',
                links: [
                  {
                    rel: 'self',
                    href: 'http://example.com/csapi/collections/sensors',
                    type: 'application/json',
                  },
                  {
                    rel: 'http://www.opengis.net/def/rel/ogc/1.0/systems',
                    href: 'http://example.com/csapi/collections/sensors/systems',
                    type: 'application/json',
                  },
                ],
              }),
          } as Response);
        }

        // Individual collection: actuators
        if (urlStr.includes('collections/actuators?f=json')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            clone: function () {
              return this;
            },
            json: () =>
              Promise.resolve({
                id: 'actuators',
                title: 'Actuator Systems',
                links: [
                  {
                    rel: 'self',
                    href: 'http://example.com/csapi/collections/actuators',
                    type: 'application/json',
                  },
                  {
                    rel: 'http://www.opengis.net/def/rel/ogc/1.0/systems',
                    href: 'http://example.com/csapi/collections/actuators/systems',
                    type: 'application/json',
                  },
                ],
              }),
          } as Response);
        }

        return Promise.reject(new Error(`Unmocked URL: ${urlStr}`));
      }) as jest.Mock;

      const endpoint2 = new OgcApiEndpoint('http://example.com/sample-csapi');
      const nav1 = await endpoint2.csapi('sensors');
      const nav2 = await endpoint2.csapi('actuators');
      expect(nav1).not.toBe(nav2); // Different instances
    });

    it('throws error if collection does not exist', async () => {
      await expect(endpoint.csapi('nonexistent')).rejects.toThrow();
    });

    it('provides working URL builders', async () => {
      const navigator = await endpoint.csapi('sensors');

      // Test that we can build URLs
      const systemsUrl = navigator.getSystemsUrl({ limit: 10 });
      expect(systemsUrl).toContain('/systems');
      expect(systemsUrl).toContain('limit=10');

      const datastreamUrl = navigator.getDatastreamsUrl({
        observedProperty: 'temperature',
      });
      expect(datastreamUrl).toContain('/datastreams');
      expect(datastreamUrl).toContain('observedProperty=temperature');
    });

    it('exposes available resources from collection', async () => {
      const navigator = await endpoint.csapi('sensors');
      expect(navigator.availableResources.has('systems')).toBe(true);
      expect(navigator.availableResources.has('datastreams')).toBe(true);
    });

    it('exposes supported formats from collection', async () => {
      const navigator = await endpoint.csapi('sensors');
      expect(navigator.supportedFormats.has('application/json')).toBe(true);
    });
  });
});
