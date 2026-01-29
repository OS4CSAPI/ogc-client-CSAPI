/**
 * Tests for SWE Common component parsers
 */

import {
  parseQuantityComponent,
  parseCountComponent,
  parseBooleanComponent,
  parseTextComponent,
  parseCategoryComponent,
  parseTimeComponent,
  parseQuantityRangeComponent,
  parseCountRangeComponent,
  parseCategoryRangeComponent,
  parseTimeRangeComponent,
  parseDataRecordComponent,
  parseVectorComponent,
  parseDataChoiceComponent,
  parseDataArrayComponent,
  parseMatrixComponent,
  parseDataStreamComponent,
  parseGeometryComponent,
  parseDataComponent,
  ParseError,
} from './swe-common-parser.js';

describe('SWE Common Parsers', () => {
  describe('Simple Components', () => {
    describe('parseQuantityComponent', () => {
      it('should parse valid Quantity component', () => {
        const data = {
          type: 'Quantity',
          definition: 'http://example.org/temperature',
          uom: { code: 'Cel' },
        };

        const result = parseQuantityComponent(data);
        expect(result.type).toBe('Quantity');
        expect(result.uom.code).toBe('Cel');
      });

      it('should reject non-object input', () => {
        expect(() => parseQuantityComponent('invalid')).toThrow(ParseError);
        expect(() => parseQuantityComponent('invalid')).toThrow(
          'Quantity must be an object'
        );
      });

      it('should reject wrong type', () => {
        const data = { type: 'Count', uom: { code: 'Cel' } };
        expect(() => parseQuantityComponent(data)).toThrow(
          "Expected type 'Quantity'"
        );
      });

      it('should reject missing uom', () => {
        const data = { type: 'Quantity' };
        expect(() => parseQuantityComponent(data)).toThrow(
          'Quantity requires uom'
        );
      });

      it('should reject uom without code or href', () => {
        const data = { type: 'Quantity', uom: {} };
        expect(() => parseQuantityComponent(data)).toThrow(
          'uom must have code or href'
        );
      });
    });

    describe('parseCountComponent', () => {
      it('should parse valid Count component', () => {
        const data = {
          type: 'Count',
          definition: 'http://example.org/count',
        };

        const result = parseCountComponent(data);
        expect(result.type).toBe('Count');
      });

      it('should reject non-object input', () => {
        expect(() => parseCountComponent(123)).toThrow(
          'Count must be an object'
        );
      });

      it('should reject wrong type', () => {
        const data = { type: 'Boolean' };
        expect(() => parseCountComponent(data)).toThrow(
          "Expected type 'Count'"
        );
      });
    });

    describe('parseBooleanComponent', () => {
      it('should parse valid Boolean component', () => {
        const data = {
          type: 'Boolean',
          definition: 'http://example.org/flag',
        };

        const result = parseBooleanComponent(data);
        expect(result.type).toBe('Boolean');
      });

      it('should reject non-object input', () => {
        expect(() => parseBooleanComponent(null)).toThrow(
          'Boolean must be an object'
        );
      });
    });

    describe('parseTextComponent', () => {
      it('should parse valid Text component', () => {
        const data = {
          type: 'Text',
          definition: 'http://example.org/description',
        };

        const result = parseTextComponent(data);
        expect(result.type).toBe('Text');
      });

      it('should reject non-object input', () => {
        expect(() => parseTextComponent([])).toThrow('Text must be an object');
      });
    });

    describe('parseCategoryComponent', () => {
      it('should parse valid Category component', () => {
        const data = {
          type: 'Category',
          definition: 'http://example.org/status',
        };

        const result = parseCategoryComponent(data);
        expect(result.type).toBe('Category');
      });

      it('should reject wrong type', () => {
        const data = { type: 'Text' };
        expect(() => parseCategoryComponent(data)).toThrow(
          "Expected type 'Category'"
        );
      });
    });

    describe('parseTimeComponent', () => {
      it('should parse valid Time component', () => {
        const data = {
          type: 'Time',
          definition: 'http://example.org/timestamp',
          uom: { href: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian' },
        };

        const result = parseTimeComponent(data);
        expect(result.type).toBe('Time');
      });

      it('should reject missing uom', () => {
        const data = { type: 'Time' };
        expect(() => parseTimeComponent(data)).toThrow('Time requires uom');
      });
    });
  });

  describe('Range Components', () => {
    describe('parseQuantityRangeComponent', () => {
      it('should parse valid QuantityRange component', () => {
        const data = {
          type: 'QuantityRange',
          definition: 'http://example.org/temperature-range',
          uom: { code: 'Cel' },
        };

        const result = parseQuantityRangeComponent(data);
        expect(result.type).toBe('QuantityRange');
        expect(result.uom.code).toBe('Cel');
      });

      it('should reject missing uom', () => {
        const data = { type: 'QuantityRange' };
        expect(() => parseQuantityRangeComponent(data)).toThrow(
          'QuantityRange requires uom'
        );
      });
    });

    describe('parseCountRangeComponent', () => {
      it('should parse valid CountRange component', () => {
        const data = {
          type: 'CountRange',
          definition: 'http://example.org/count-range',
        };

        const result = parseCountRangeComponent(data);
        expect(result.type).toBe('CountRange');
      });

      it('should reject wrong type', () => {
        const data = { type: 'Count' };
        expect(() => parseCountRangeComponent(data)).toThrow(
          "Expected type 'CountRange'"
        );
      });
    });

    describe('parseCategoryRangeComponent', () => {
      it('should parse valid CategoryRange component', () => {
        const data = {
          type: 'CategoryRange',
          definition: 'http://example.org/category-range',
        };

        const result = parseCategoryRangeComponent(data);
        expect(result.type).toBe('CategoryRange');
      });
    });

    describe('parseTimeRangeComponent', () => {
      it('should parse valid TimeRange component', () => {
        const data = {
          type: 'TimeRange',
          definition: 'http://example.org/time-range',
          uom: { href: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian' },
        };

        const result = parseTimeRangeComponent(data);
        expect(result.type).toBe('TimeRange');
      });

      it('should reject missing uom', () => {
        const data = { type: 'TimeRange' };
        expect(() => parseTimeRangeComponent(data)).toThrow(
          'TimeRange requires uom'
        );
      });
    });
  });

  describe('Aggregate Components', () => {
    describe('parseDataRecordComponent', () => {
      it('should parse valid DataRecord with simple fields', () => {
        const data = {
          type: 'DataRecord',
          fields: [
            {
              name: 'temperature',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temperature',
                uom: { code: 'Cel' },
              },
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/humidity',
                uom: { code: '%' },
              },
            },
          ],
        };

        const result = parseDataRecordComponent(data);
        expect(result.type).toBe('DataRecord');
        expect(result.fields).toHaveLength(2);
        expect(result.fields[0].component.type).toBe('Quantity');
      });

      it('should parse nested DataRecord', () => {
        const data = {
          type: 'DataRecord',
          fields: [
            {
              name: 'location',
              component: {
                type: 'DataRecord',
                fields: [
                  {
                    name: 'lat',
                    component: {
                      type: 'Quantity',
                      uom: { code: 'deg' },
                    },
                  },
                  {
                    name: 'lon',
                    component: {
                      type: 'Quantity',
                      uom: { code: 'deg' },
                    },
                  },
                ],
              },
            },
          ],
        };

        const result = parseDataRecordComponent(data);
        expect(result.type).toBe('DataRecord');
        expect(result.fields[0].component.type).toBe('DataRecord');
        const nestedRecord = result.fields[0].component as any;
        expect(nestedRecord.fields).toHaveLength(2);
      });

      it('should reject empty fields array', () => {
        const data = {
          type: 'DataRecord',
          fields: [],
        };
        expect(() => parseDataRecordComponent(data)).toThrow(
          'must have at least one field'
        );
      });

      it('should reject field without name', () => {
        const data = {
          type: 'DataRecord',
          fields: [
            {
              component: { type: 'Quantity', uom: { code: 'Cel' } },
            },
          ],
        };
        expect(() => parseDataRecordComponent(data)).toThrow(
          'must have a name property'
        );
      });

      it('should reject field without component or href', () => {
        const data = {
          type: 'DataRecord',
          fields: [
            {
              name: 'temperature',
            },
          ],
        };
        expect(() => parseDataRecordComponent(data)).toThrow(
          'must have either component or href'
        );
      });

      it('should allow field with href', () => {
        const data = {
          type: 'DataRecord',
          fields: [
            {
              name: 'temperature',
              href: 'http://example.org/components/temp',
            },
          ],
        };

        const result = parseDataRecordComponent(data);
        expect(result.fields[0].href).toBe(
          'http://example.org/components/temp'
        );
      });

      it('should provide path in nested error messages', () => {
        const data = {
          type: 'DataRecord',
          fields: [
            {
              name: 'location',
              component: {
                type: 'DataRecord',
                fields: [
                  {
                    name: 'temp',
                    component: {
                      type: 'Quantity',
                      // Missing uom
                    },
                  },
                ],
              },
            },
          ],
        };

        try {
          parseDataRecordComponent(data);
          fail('Should have thrown ParseError');
        } catch (error) {
          expect(error).toBeInstanceOf(ParseError);
          expect((error as ParseError).path).toContain('fields[0].component');
        }
      });
    });

    describe('parseVectorComponent', () => {
      it('should parse valid Vector component', () => {
        const data = {
          type: 'Vector',
          referenceFrame: 'http://www.opengis.net/def/crs/EPSG/0/4979',
          coordinates: [
            {
              name: 'x',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/x',
                uom: { code: 'm' },
              },
            },
            {
              name: 'y',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/y',
                uom: { code: 'm' },
              },
            },
            {
              name: 'z',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/z',
                uom: { code: 'm' },
              },
            },
          ],
        };

        const result = parseVectorComponent(data);
        expect(result.type).toBe('Vector');
        expect(result.coordinates).toHaveLength(3);
      });

      it('should reject empty coordinates array', () => {
        const data = {
          type: 'Vector',
          coordinates: [],
        };
        expect(() => parseVectorComponent(data)).toThrow(
          'must have at least one coordinate'
        );
      });

      it('should reject coordinate without name', () => {
        const data = {
          type: 'Vector',
          coordinates: [
            {
              component: { type: 'Quantity', uom: { code: 'm' } },
            },
          ],
        };
        expect(() => parseVectorComponent(data)).toThrow(
          'must have a name property'
        );
      });
    });

    describe('parseDataChoiceComponent', () => {
      it('should parse valid DataChoice component', () => {
        const data = {
          type: 'DataChoice',
          items: [
            {
              name: 'temperatureCelsius',
              component: {
                type: 'Quantity',
                uom: { code: 'Cel' },
              },
            },
            {
              name: 'temperatureFahrenheit',
              component: {
                type: 'Quantity',
                uom: { code: '[degF]' },
              },
            },
          ],
        };

        const result = parseDataChoiceComponent(data);
        expect(result.type).toBe('DataChoice');
        expect(result.items).toHaveLength(2);
      });

      it('should reject empty items array', () => {
        const data = {
          type: 'DataChoice',
          items: [],
        };
        expect(() => parseDataChoiceComponent(data)).toThrow(
          'must have at least one item'
        );
      });

      it('should allow items with href', () => {
        const data = {
          type: 'DataChoice',
          items: [
            {
              name: 'option1',
              href: 'http://example.org/components/opt1',
            },
          ],
        };

        const result = parseDataChoiceComponent(data);
        expect(result.items[0].href).toBe('http://example.org/components/opt1');
      });
    });
  });

  describe('Block Components', () => {
    describe('parseDataArrayComponent', () => {
      it('should parse valid DataArray with inline element type', () => {
        const data = {
          type: 'DataArray',
          elementType: {
            name: 'record',
            component: {
              type: 'DataRecord',
              fields: [
                {
                  name: 'time',
                  component: {
                    type: 'Time',
                    uom: {
                      href: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian',
                    },
                  },
                },
                {
                  name: 'value',
                  component: {
                    type: 'Quantity',
                    uom: { code: 'Cel' },
                  },
                },
              ],
            },
          },
        };

        const result = parseDataArrayComponent(data);
        expect(result.type).toBe('DataArray');
        expect(result.elementType.component.type).toBe('DataRecord');
      });

      it('should parse DataArray with href element type', () => {
        const data = {
          type: 'DataArray',
          elementType: {
            name: 'record',
            href: 'http://example.org/components/record',
          },
        };

        const result = parseDataArrayComponent(data);
        expect(result.elementType.href).toBe(
          'http://example.org/components/record'
        );
      });

      it('should reject missing elementType', () => {
        const data = {
          type: 'DataArray',
        };
        expect(() => parseDataArrayComponent(data)).toThrow(
          'DataArray requires elementType'
        );
      });

      it('should reject elementType without component or href', () => {
        const data = {
          type: 'DataArray',
          elementType: {
            name: 'record',
          },
        };
        expect(() => parseDataArrayComponent(data)).toThrow(
          'must have either component or href'
        );
      });
    });

    describe('parseMatrixComponent', () => {
      it('should parse valid Matrix component', () => {
        const data = {
          type: 'Matrix',
          elementType: {
            name: 'element',
            component: {
              type: 'Quantity',
              uom: { code: 'm' },
            },
          },
        };

        const result = parseMatrixComponent(data);
        expect(result.type).toBe('Matrix');
        expect(result.elementType.component.type).toBe('Quantity');
      });

      it('should reject missing elementType', () => {
        const data = {
          type: 'Matrix',
        };
        expect(() => parseMatrixComponent(data)).toThrow(
          'Matrix requires elementType'
        );
      });
    });

    describe('parseDataStreamComponent', () => {
      it('should parse valid DataStream component', () => {
        const data = {
          type: 'DataStream',
          elementType: {
            name: 'observation',
            component: {
              type: 'DataRecord',
              fields: [
                {
                  name: 'time',
                  component: {
                    type: 'Time',
                    uom: {
                      href: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian',
                    },
                  },
                },
              ],
            },
          },
        };

        const result = parseDataStreamComponent(data);
        expect(result.type).toBe('DataStream');
        expect(result.elementType.component.type).toBe('DataRecord');
      });

      it('should reject missing elementType', () => {
        const data = {
          type: 'DataStream',
        };
        expect(() => parseDataStreamComponent(data)).toThrow(
          'DataStream requires elementType'
        );
      });
    });
  });

  describe('Geometry Component', () => {
    describe('parseGeometryComponent', () => {
      it('should parse valid Geometry component', () => {
        const data = {
          type: 'Geometry',
          definition: 'http://example.org/geometry',
        };

        const result = parseGeometryComponent(data);
        expect(result.type).toBe('Geometry');
      });

      it('should reject non-object input', () => {
        expect(() => parseGeometryComponent(null)).toThrow(
          'Geometry must be an object'
        );
      });
    });
  });

  describe('parseDataComponent - dispatcher', () => {
    it('should dispatch to correct parser based on type', () => {
      const quantityData = {
        type: 'Quantity',
        uom: { code: 'Cel' },
      };
      const result = parseDataComponent(quantityData);
      expect((result as any).type).toBe('Quantity');
    });

    it('should reject non-object input', () => {
      expect(() => parseDataComponent('invalid')).toThrow(
        'Data component must be an object'
      );
    });

    it('should reject missing type property', () => {
      expect(() => parseDataComponent({})).toThrow('must have a type property');
    });

    it('should reject unknown component type', () => {
      const data = { type: 'UnknownType' };
      expect(() => parseDataComponent(data)).toThrow(
        'Unknown or unsupported component type'
      );
    });

    it('should handle all simple component types', () => {
      const types = [
        { type: 'Boolean' },
        { type: 'Text' },
        { type: 'Category' },
        { type: 'Count' },
        { type: 'Quantity', uom: { code: 'Cel' } },
        {
          type: 'Time',
          uom: { href: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian' },
        },
      ];

      types.forEach((data) => {
        const result = parseDataComponent(data);
        expect((result as any).type).toBe(data.type);
      });
    });

    it('should handle all range component types', () => {
      const types = [
        { type: 'CategoryRange' },
        { type: 'CountRange' },
        { type: 'QuantityRange', uom: { code: 'Cel' } },
        {
          type: 'TimeRange',
          uom: { href: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian' },
        },
      ];

      types.forEach((data) => {
        const result = parseDataComponent(data);
        expect((result as any).type).toBe(data.type);
      });
    });

    it('should handle aggregate component types', () => {
      const dataRecord = {
        type: 'DataRecord',
        fields: [
          {
            name: 'field1',
            component: { type: 'Quantity', uom: { code: 'Cel' } },
          },
        ],
      };

      const result = parseDataComponent(dataRecord);
      expect((result as any).type).toBe('DataRecord');
    });

    it('should recursively parse deeply nested structures', () => {
      const data = {
        type: 'DataRecord',
        fields: [
          {
            name: 'measurements',
            component: {
              type: 'DataArray',
              elementType: {
                name: 'measurement',
                component: {
                  type: 'DataRecord',
                  fields: [
                    {
                      name: 'value',
                      component: {
                        type: 'Quantity',
                        uom: { code: 'Cel' },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      };

      const result = parseDataComponent(data) as any;
      expect(result.type).toBe('DataRecord');
      expect(result.fields[0].component.type).toBe('DataArray');
      expect(result.fields[0].component.elementType.component.type).toBe(
        'DataRecord'
      );
      expect(
        result.fields[0].component.elementType.component.fields[0].component
          .type
      ).toBe('Quantity');
    });
  });

  describe('ParseError', () => {
    it('should create ParseError with message', () => {
      const error = new ParseError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ParseError);
      expect(error.name).toBe('ParseError');
      expect(error.message).toBe('Test error');
    });

    it('should create ParseError with path', () => {
      const error = new ParseError('Test error', 'fields[0].component');
      expect(error.path).toBe('fields[0].component');
    });
  });
});
