/**
 * Tests for SWE Common Validators
 */
import { validateSWEComponent } from './swe-validator.js';

describe('SWE Common Validators', () => {
  describe('validateSWEComponent', () => {
    describe('DataRecord', () => {
      it('should validate valid DataRecord', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.org/datarecord',
          label: 'Data Record',
          fields: [
            {
              name: 'temperature',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temperature',
                label: 'Temperature',
                uom: { code: 'Cel' },
              },
            },
          ],
        };

        const result = validateSWEComponent(dataRecord);
        expect(result.valid).toBe(true);
      });

      it('should validate DataRecord with multiple fields', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.org/datarecord',
          label: 'Data Record',
          fields: [
            {
              name: 'temperature',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temperature',
                label: 'Temperature',
                uom: { code: 'Cel' },
              },
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/humidity',
                label: 'Humidity',
                uom: { code: '%' },
              },
            },
          ],
        };

        const result = validateSWEComponent(dataRecord);
        expect(result.valid).toBe(true);
      });

      it('should reject DataRecord with missing fields', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.org/datarecord',
          label: 'Data Record',
        };

        const result = validateSWEComponent(dataRecord as any);
        expect(result.valid).toBe(false);
      });

      it('should reject DataRecord with empty fields array', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.org/datarecord',
          label: 'Data Record',
          fields: [],
        };

        const result = validateSWEComponent(dataRecord as any);
        expect(result.valid).toBe(false);
      });
    });

    describe('DataArray', () => {
      it('should validate valid DataArray', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.org/dataarray',
          label: 'Data Array',
          elementCount: 10,
          elementType: {
            type: 'Quantity',
            definition: 'http://example.org/distance',
            label: 'Distance',
            uom: { code: 'm' },
          },
        };

        const result = validateSWEComponent(dataArray);
        expect(result.valid).toBe(true);
      });

      it('should reject DataArray without elementType', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.org/dataarray',
          label: 'Data Array',
          elementCount: 10,
        };

        const result = validateSWEComponent(dataArray as any);
        expect(result.valid).toBe(false);
      });
    });

    describe('Vector', () => {
      it('should validate valid Vector', () => {
        const vector = {
          type: 'Vector',
          definition: 'http://example.org/vector',
          label: 'Vector',
          referenceFrame: 'http://www.opengis.net/def/crs/EPSG/0/4979',
          coordinates: [
            {
              name: 'x',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/x',
                label: 'X',
                uom: { code: 'm' },
              },
            },
            {
              name: 'y',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/y',
                label: 'Y',
                uom: { code: 'm' },
              },
            },
          ],
        };

        const result = validateSWEComponent(vector);
        expect(result.valid).toBe(true);
      });

      it('should validate Vector with referenceFrame', () => {
        const vector = {
          type: 'Vector',
          definition: 'http://example.org/location',
          label: 'Location',
          referenceFrame: 'http://www.opengis.net/def/crs/EPSG/0/4979',
          coordinates: [
            {
              name: 'lat',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/latitude',
                label: 'Latitude',
                uom: { code: 'deg' },
              },
            },
          ],
        };

        const result = validateSWEComponent(vector);
        expect(result.valid).toBe(true);
      });
    });

    describe('Quantity', () => {
      it('should validate valid Quantity', () => {
        const quantity = {
          type: 'Quantity',
          definition: 'http://example.org/temperature',
          label: 'Temperature',
          uom: { code: 'Cel' },
        };

        const result = validateSWEComponent(quantity);
        expect(result.valid).toBe(true);
      });

      it('should validate Quantity with all optional fields', () => {
        const quantity = {
          type: 'Quantity',
          definition: 'http://example.org/temperature',
          label: 'Temperature',
          description: 'Air temperature',
          uom: { code: 'Cel' },
          constraint: {
            intervals: [[-40, 50]],
          },
        };

        const result = validateSWEComponent(quantity);
        expect(result.valid).toBe(true);
      });

      it('should reject Quantity without uom', () => {
        const quantity = {
          type: 'Quantity',
        };

        const result = validateSWEComponent(quantity as any);
        expect(result.valid).toBe(false);
      });
    });

    describe('Category', () => {
      it('should validate valid Category', () => {
        const category = {
          type: 'Category',
          definition: 'http://example.org/category',
          label: 'Category',
          codeSpace: 'http://example.org/codes',
        };

        const result = validateSWEComponent(category);
        expect(result.valid).toBe(true);
      });

      it('should validate Category with constraint', () => {
        const category = {
          type: 'Category',
          definition: 'http://example.org/colors',
          label: 'Colors',
          codeSpace: 'http://example.org/codes',
          constraint: {
            values: ['red', 'green', 'blue'],
          },
        };

        const result = validateSWEComponent(category);
        expect(result.valid).toBe(true);
      });

      it('should accept Category without codeSpace (basic validation only)', () => {
        const category = {
          type: 'Category',
          definition: 'http://example.org/category',
          label: 'Category',
        };

        const result = validateSWEComponent(category as any);
        // validateSWEComponent does basic type checking, not deep validation
        expect(result.valid).toBe(true);
      });
    });

    describe('Text', () => {
      it('should validate valid Text', () => {
        const text = {
          type: 'Text',
          definition: 'http://example.org/text',
          label: 'Text',
        };

        const result = validateSWEComponent(text);
        expect(result.valid).toBe(true);
      });

      it('should validate Text with optional fields', () => {
        const text = {
          type: 'Text',
          definition: 'http://example.org/name',
          label: 'Name',
          constraint: {
            pattern: '[A-Za-z]+',
          },
        };

        const result = validateSWEComponent(text);
        expect(result.valid).toBe(true);
      });
    });

    describe('Boolean', () => {
      it('should validate valid Boolean', () => {
        const boolean = {
          type: 'Boolean',
          definition: 'http://example.org/boolean',
          label: 'Boolean',
        };

        const result = validateSWEComponent(boolean);
        expect(result.valid).toBe(true);
      });
    });

    describe('Count', () => {
      it('should validate valid Count', () => {
        const count = {
          type: 'Count',
          definition: 'http://example.org/count',
          label: 'Count',
        };

        const result = validateSWEComponent(count);
        expect(result.valid).toBe(true);
      });

      it('should validate Count with constraint', () => {
        const count = {
          type: 'Count',
          definition: 'http://example.org/count',
          label: 'Count',
          constraint: {
            intervals: [[0, 100]],
          },
        };

        const result = validateSWEComponent(count);
        expect(result.valid).toBe(true);
      });
    });

    describe('Time', () => {
      it('should validate valid Time', () => {
        const time = {
          type: 'Time',
          definition: 'http://example.org/time',
          label: 'Time',
          uom: { code: 's' },
        };

        const result = validateSWEComponent(time);
        expect(result.valid).toBe(true);
      });

      it('should validate Time with referenceTime', () => {
        const time = {
          type: 'Time',
          definition: 'http://example.org/time',
          label: 'Time',
          uom: { code: 's' },
          referenceTime: '1970-01-01T00:00:00Z',
        };

        const result = validateSWEComponent(time);
        expect(result.valid).toBe(true);
      });
    });

    describe('Nested structures', () => {
      it('should validate nested DataRecord', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.org/datarecord',
          label: 'Data Record',
          fields: [
            {
              name: 'location',
              component: {
                type: 'Vector',
                definition: 'http://example.org/location',
                label: 'Location',
                referenceFrame: 'http://www.opengis.net/def/crs/EPSG/0/4979',
                coordinates: [
                  {
                    name: 'x',
                    component: {
                      type: 'Quantity',
                      definition: 'http://example.org/x',
                      label: 'X',
                      uom: { code: 'm' },
                    },
                  },
                ],
              },
            },
          ],
        };

        const result = validateSWEComponent(dataRecord);
        expect(result.valid).toBe(true);
      });

      it('should validate DataArray with DataRecord elements', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.org/dataarray',
          label: 'Data Array',
          elementCount: 10,
          elementType: {
            type: 'DataRecord',
            definition: 'http://example.org/datarecord',
            label: 'Data Record',
            fields: [
              {
                name: 'temp',
                component: {
                  type: 'Quantity',
                  definition: 'http://example.org/temperature',
                  label: 'Temperature',
                  uom: { code: 'Cel' },
                },
              },
            ],
          },
        };

        const result = validateSWEComponent(dataArray);
        expect(result.valid).toBe(true);
      });
    });

    describe('Invalid types', () => {
      it('should reject unknown type', () => {
        const invalid = {
          type: 'UnknownType',
        };

        const result = validateSWEComponent(invalid as any);
        expect(result.valid).toBe(false);
      });

      it('should reject null', () => {
        const result = validateSWEComponent(null as any);
        expect(result.valid).toBe(false);
      });

      it('should reject undefined', () => {
        const result = validateSWEComponent(undefined as any);
        expect(result.valid).toBe(false);
      });
    });

    describe('Error messages', () => {
      it('should provide error details', () => {
        const invalid = {
          type: 'Quantity',
          // Missing required uom
        };

        const result = validateSWEComponent(invalid as any);
        expect(result.valid).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors?.[0]).toHaveProperty('message');
        // path property is optional
      });
    });

    describe('Quantity validation edge cases', () => {
      it('should reject Quantity with wrong type', () => {
        const quantity = {
          type: 'DataRecord', // wrong type
          uom: { code: 'm' },
        };

        const result = validateSWEComponent(quantity as any);
        expect(result.valid).toBe(false);
      });

      it('should reject Quantity missing required properties', () => {
        const result = validateSWEComponent({} as any);
        expect(result.valid).toBe(false);
      });
    });

    describe('DataRecord validation edge cases', () => {
      it('should reject DataRecord with wrong type', () => {
        const dataRecord = {
          type: 'Quantity',
          definition: 'http://example.org/quantity',
          label: 'Quantity',
          fields: [{ name: 'field1', type: 'Quantity', definition: 'http://example.org/field1', label: 'Field 1', uom: { code: 'm' } }],
        };

        const result = validateSWEComponent(dataRecord as any);
        expect(result.valid).toBe(false);
      });

      it('should reject DataRecord with empty fields array', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.org/datarecord',
          label: 'Data Record',
          fields: [],
        };

        const result = validateSWEComponent(dataRecord as any);
        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain('at least one field');
      });

      it('should reject DataRecord with non-array fields', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.org/datarecord',
          label: 'Data Record',
          fields: 'not-an-array',
        };

        const result = validateSWEComponent(dataRecord as any);
        expect(result.valid).toBe(false);
      });

      it('should reject DataRecord missing required properties', () => {
        const result = validateSWEComponent({ type: 'DataRecord' } as any);
        expect(result.valid).toBe(false);
      });
    });

    describe('DataArray validation edge cases', () => {
      it('should reject DataArray with wrong type', () => {
        const dataArray = {
          type: 'DataRecord',
          definition: 'http://example.org/datarecord',
          label: 'Data Record',
          elementCount: { type: 'Count', definition: 'http://example.org/count', label: 'Count', value: 10 },
          elementType: { type: 'Quantity', definition: 'http://example.org/distance', label: 'Distance', uom: { code: 'm' } },
        };

        const result = validateSWEComponent(dataArray as any);
        expect(result.valid).toBe(false);
      });

      it('should reject DataArray missing elementCount', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.org/dataarray',
          label: 'Data Array',
          elementType: { type: 'Quantity', definition: 'http://example.org/distance', label: 'Distance', uom: { code: 'm' } },
        };

        const result = validateSWEComponent(dataArray as any);
        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain('elementCount');
      });

      it('should reject DataArray missing required properties', () => {
        const result = validateSWEComponent({ type: 'DataArray' } as any);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('validateObservationResult', () => {
    it('should reject null result', () => {
      const { validateObservationResult } = require('./swe-validator.js');
      const result = validateObservationResult(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Observation result cannot be null or undefined');
    });

    it('should reject undefined result', () => {
      const { validateObservationResult } = require('./swe-validator.js');
      const result = validateObservationResult(undefined);
      expect(result.valid).toBe(false);
    });

    it('should validate simple value results', () => {
      const { validateObservationResult } = require('./swe-validator.js');
      expect(validateObservationResult(42).valid).toBe(true);
      expect(validateObservationResult('test').valid).toBe(true);
      expect(validateObservationResult(true).valid).toBe(true);
    });

    it('should validate SWE component results', () => {
      const { validateObservationResult } = require('./swe-validator.js');
      const sweResult = {
        type: 'Quantity',
        definition: 'http://example.com/temp',
        label: 'Temperature',
        uom: { code: 'degC' },
      };

      const result = validateObservationResult(sweResult);
      expect(result.valid).toBe(true);
    });

    it('should validate invalid SWE component results', () => {
      const { validateObservationResult } = require('./swe-validator.js');
      const invalidResult = {
        type: 'Quantity',
        // Missing definition and uom
      };

      const result = validateObservationResult(invalidResult);
      expect(result.valid).toBe(false);
    });
  });

  describe('Individual validator error paths', () => {
    it('should catch Quantity missing required DataComponent properties', () => {
      const { validateQuantity } = require('./swe-validator.js');
      const result = validateQuantity({
        // Missing type property entirely
        definition: 'test',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some((e: any) => e.message?.includes('required DataComponent'))).toBe(true);
    });

    it('should catch Quantity type mismatch', () => {
      const { validateQuantity } = require('./swe-validator.js');
      const result = validateQuantity({
        type: 'DataRecord', // Wrong type
        definition: 'test',
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some((e: any) => typeof e === 'string' && e.includes('Quantity'))).toBe(true);
    });

    it('should catch Quantity missing uom', () => {
      const { validateQuantity } = require('./swe-validator.js');
      const result = validateQuantity({
        type: 'Quantity',
        definition: 'test',
        // Missing uom
      });
      expect(result.valid).toBe(false);
    });

    it('should catch DataRecord missing required DataComponent properties', () => {
      const { validateDataRecord } = require('./swe-validator.js');
      const result = validateDataRecord({
        // Missing type property
        definition: 'test',
        fields: [{ type: 'Quantity', definition: 'test', uom: { code: 'm' } }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some((e: any) => e.message?.includes('required DataComponent'))).toBe(true);
    });

    it('should catch DataRecord type mismatch', () => {
      const { validateDataRecord } = require('./swe-validator.js');
      const result = validateDataRecord({
        type: 'Quantity', // Wrong type
        definition: 'test',
        fields: [],
      });
      expect(result.valid).toBe(false);
    });

    it('should catch DataRecord empty fields', () => {
      const { validateDataRecord } = require('./swe-validator.js');
      const result = validateDataRecord({
        type: 'DataRecord',
        definition: 'test',
        fields: [], // Empty array
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some((e: any) => e.message?.includes('at least one field'))).toBe(true);
    });

    it('should catch DataArray missing required DataComponent properties', () => {
      const { validateDataArray } = require('./swe-validator.js');
      const result = validateDataArray({
        // Missing type property
        definition: 'test',
        elementCount: { type: 'Count', value: 3 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some((e: any) => e.message?.includes('required DataComponent'))).toBe(true);
    });

    it('should catch DataArray type mismatch', () => {
      const { validateDataArray } = require('./swe-validator.js');
      const result = validateDataArray({
        type: 'DataRecord', // Wrong type
        definition: 'test',
        elementCount: { type: 'Count', value: 3 },
      });
      expect(result.valid).toBe(false);
    });

    it('should catch DataArray missing elementCount', () => {
      const { validateDataArray } = require('./swe-validator.js');
      const result = validateDataArray({
        type: 'DataArray',
        definition: 'test',
        // Missing elementCount
      });
      expect(result.valid).toBe(false);
    });
  });
});