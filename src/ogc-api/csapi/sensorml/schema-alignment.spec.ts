/**
 * JSON Schema Alignment Tests
 * 
 * Tests to verify TypeScript types align with OGC SensorML 3.0 JSON schemas.
 * Based on issue #24 findings.
 */

import type { DescribedObject, Keyword, Event } from './base-types';
import type { PhysicalSystem } from './physical-system';

describe('SensorML JSON Schema Alignment', () => {
  describe('DescribedObject Schema Compliance', () => {
    it('should support lang property', () => {
      const obj: DescribedObject = {
        label: 'Test Object',
        lang: 'en',
      };
      
      expect(obj.lang).toBe('en');
    });

    it('should support string[] keywords (schema-compliant)', () => {
      const obj: DescribedObject = {
        label: 'Test Object',
        keywords: ['sensor', 'temperature', 'weather'],
      };
      
      expect(Array.isArray(obj.keywords)).toBe(true);
      expect(obj.keywords).toEqual(['sensor', 'temperature', 'weather']);
    });

    it('should support Keyword[] keywords (enhanced)', () => {
      const keywords: Keyword[] = [
        { value: 'sensor', label: 'Type' },
        { value: 'temperature' },
      ];
      
      const obj: DescribedObject = {
        label: 'Test Object',
        keywords,
      };
      
      expect(Array.isArray(obj.keywords)).toBe(true);
      expect(obj.keywords[0]).toHaveProperty('value');
    });

    it('should support history property with Event[]', () => {
      const events: Event[] = [
        {
          type: 'Event',
          time: '2024-01-15T10:00:00Z',
          classification: [{ value: 'calibration' }],
        },
        {
          type: 'Event',
          time: '2024-06-20T14:30:00Z',
          classification: [{ value: 'maintenance' }],
        },
      ];
      
      const obj: DescribedObject = {
        label: 'Test System',
        history: events,
      };
      
      expect(obj.history).toBeDefined();
      expect(obj.history?.length).toBe(2);
      expect(obj.history?.[0].type).toBe('Event');
    });

    it('should support all new properties together', () => {
      const obj: DescribedObject = {
        id: 'sys-001',
        uniqueId: 'urn:example:system:001',
        label: 'Weather Station',
        description: 'Automated weather monitoring system',
        lang: 'en',
        keywords: ['weather', 'sensor', 'automated'],
        history: [
          {
            type: 'Event',
            time: '2024-01-01T00:00:00Z',
            classification: [{ value: 'deployment' }],
          },
        ],
      };
      
      expect(obj.lang).toBe('en');
      expect(obj.keywords).toEqual(['weather', 'sensor', 'automated']);
      expect(obj.history?.length).toBe(1);
    });
  });

  describe('PhysicalSystem with new properties', () => {
    it('should create PhysicalSystem with lang and history', () => {
      const system: PhysicalSystem = {
        type: 'PhysicalSystem',
        label: 'Test System',
        lang: 'fr',
        keywords: ['capteur', 'température'],
        history: [
          {
            type: 'Event',
            time: '2024-03-15T12:00:00Z',
            classification: [{ value: 'calibration' }],
          },
        ],
        components: [],
      };
      
      expect(system.lang).toBe('fr');
      expect(system.keywords).toContain('capteur');
      expect(system.history?.[0].classification?.[0].value).toBe('calibration');
    });
  });

  describe('Backward compatibility', () => {
    it('should work with existing code using Keyword[]', () => {
      const keywords: Keyword[] = [
        { value: 'test', label: 'Test Keyword' },
      ];
      
      const obj: DescribedObject = {
        keywords,
      };
      
      // Both formats should be valid
      expect(obj.keywords).toBeDefined();
    });

    it('should work without new optional properties', () => {
      const obj: DescribedObject = {
        label: 'Minimal Object',
        description: 'Object without new properties',
      };
      
      // Should compile and work fine without lang, history
      expect(obj.label).toBe('Minimal Object');
      expect(obj.lang).toBeUndefined();
      expect(obj.history).toBeUndefined();
    });
  });
});
