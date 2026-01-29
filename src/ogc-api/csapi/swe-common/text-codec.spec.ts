/**
 * Tests for Text Encoding/Decoding
 */

import { decodeText } from './text-decoder.js';
import { encodeText } from './text-encoder.js';
import {
  validateTextEncoding,
  validateTextDataLength,
  validateTextDataStructure,
} from './text-validation.js';
import type { TextEncoding } from './types/encodings.js';
import type {
  DataRecordComponent,
  DataArrayComponent,
  QuantityComponent,
  CountComponent,
  BooleanComponent,
  TextComponent,
  CategoryComponent,
  TimeComponent,
} from './types/index.js';

describe('Text Encoding/Decoding', () => {
  describe('decodeText()', () => {
    describe('CSV (comma-separated)', () => {
      it('should decode simple CSV with numbers', () => {
        const csvData = '22.5,65,1013.25';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'temp',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temp',
                label: 'Temperature',
                uom: { code: 'Cel' },
              } as QuantityComponent,
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/humidity',
                label: 'Humidity',
                uom: { code: '%' },
              } as QuantityComponent,
            },
            {
              name: 'pressure',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/pressure',
                label: 'Pressure',
                uom: { code: 'hPa' },
              } as QuantityComponent,
            },
          ],
        };

        const result = decodeText(csvData, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          temp: 22.5,
          humidity: 65,
          pressure: 1013.25,
        });
      });

      it('should decode CSV array with multiple records', () => {
        const csvData = '22.5,65\n23.1,64\n22.8,63';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataArrayComponent = {
          type: 'DataArray',
          definition: 'http://example.org/array',
          label: 'Test Array',
          elementCount: { value: 3 },
          elementType: {
            name: 'observation',
            component: {
              type: 'DataRecord',
              definition: 'http://example.org/record',
              label: 'Observation',
              fields: [
                {
                  name: 'temp',
                  component: {
                    type: 'Quantity',
                    definition: 'http://example.org/temp',
                    label: 'Temperature',
                    uom: { code: 'Cel' },
                  } as QuantityComponent,
                },
                {
                  name: 'humidity',
                  component: {
                    type: 'Quantity',
                    definition: 'http://example.org/humidity',
                    label: 'Humidity',
                    uom: { code: '%' },
                  } as QuantityComponent,
                },
              ],
            } as DataRecordComponent,
          },
        };

        const result = decodeText(csvData, encoding, component) as Record<
          string,
          unknown
        >[];

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({ temp: 22.5, humidity: 65 });
        expect(result[1]).toEqual({ temp: 23.1, humidity: 64 });
        expect(result[2]).toEqual({ temp: 22.8, humidity: 63 });
      });
    });

    describe('TSV (tab-separated)', () => {
      it('should decode tab-separated values', () => {
        const tsvData = '22.5\t65\t1013.25';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: '\t',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'temp',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temp',
                label: 'Temperature',
                uom: { code: 'Cel' },
              } as QuantityComponent,
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/humidity',
                label: 'Humidity',
                uom: { code: '%' },
              } as QuantityComponent,
            },
            {
              name: 'pressure',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/pressure',
                label: 'Pressure',
                uom: { code: 'hPa' },
              } as QuantityComponent,
            },
          ],
        };

        const result = decodeText(tsvData, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          temp: 22.5,
          humidity: 65,
          pressure: 1013.25,
        });
      });
    });

    describe('Custom decimal separator', () => {
      it('should handle European format (comma as decimal)', () => {
        const data = '22,5;65;1013,25';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ';',
          blockSeparator: '\n',
          decimalSeparator: ',',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'temp',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temp',
                label: 'Temperature',
                uom: { code: 'Cel' },
              } as QuantityComponent,
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/humidity',
                label: 'Humidity',
                uom: { code: '%' },
              } as QuantityComponent,
            },
            {
              name: 'pressure',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/pressure',
                label: 'Pressure',
                uom: { code: 'hPa' },
              } as QuantityComponent,
            },
          ],
        };

        const result = decodeText(data, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          temp: 22.5,
          humidity: 65,
          pressure: 1013.25,
        });
      });
    });

    describe('Quoted strings', () => {
      it('should handle quoted strings with separator inside', () => {
        const data = '"Station A, Site 1",22.5';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'station',
              component: {
                type: 'Text',
                definition: 'http://example.org/station',
                label: 'Station',
              } as TextComponent,
            },
            {
              name: 'temp',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temp',
                label: 'Temperature',
                uom: { code: 'Cel' },
              } as QuantityComponent,
            },
          ],
        };

        const result = decodeText(data, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          station: 'Station A, Site 1',
          temp: 22.5,
        });
      });

      it('should handle escaped quotes', () => {
        const data = '"Say ""Hello""",22.5';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'message',
              component: {
                type: 'Text',
                definition: 'http://example.org/message',
                label: 'Message',
              } as TextComponent,
            },
            {
              name: 'value',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/value',
                label: 'Value',
                uom: { code: 'none' },
              } as QuantityComponent,
            },
          ],
        };

        const result = decodeText(data, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          message: 'Say "Hello"',
          value: 22.5,
        });
      });
    });

    describe('Whitespace collapse', () => {
      it('should collapse multiple spaces to single separator', () => {
        const data = '22.5    65    1013.25';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ' ',
          blockSeparator: '\n',
          collapseWhiteSpaces: true,
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'temp',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temp',
                label: 'Temperature',
                uom: { code: 'Cel' },
              } as QuantityComponent,
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/humidity',
                label: 'Humidity',
                uom: { code: '%' },
              } as QuantityComponent,
            },
            {
              name: 'pressure',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/pressure',
                label: 'Pressure',
                uom: { code: 'hPa' },
              } as QuantityComponent,
            },
          ],
        };

        const result = decodeText(data, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          temp: 22.5,
          humidity: 65,
          pressure: 1013.25,
        });
      });
    });

    describe('Empty fields', () => {
      it('should handle empty fields as null', () => {
        const data = '22.5,,1013.25';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'temp',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temp',
                label: 'Temperature',
                uom: { code: 'Cel' },
              } as QuantityComponent,
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/humidity',
                label: 'Humidity',
                uom: { code: '%' },
              } as QuantityComponent,
            },
            {
              name: 'pressure',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/pressure',
                label: 'Pressure',
                uom: { code: 'hPa' },
              } as QuantityComponent,
            },
          ],
        };

        const result = decodeText(data, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          temp: 22.5,
          humidity: null,
          pressure: 1013.25,
        });
      });
    });

    describe('Data types', () => {
      it('should decode Boolean values', () => {
        const data = 'true,false,1,0';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'a',
              component: {
                type: 'Boolean',
                definition: 'http://example.org/a',
                label: 'A',
              } as BooleanComponent,
            },
            {
              name: 'b',
              component: {
                type: 'Boolean',
                definition: 'http://example.org/b',
                label: 'B',
              } as BooleanComponent,
            },
            {
              name: 'c',
              component: {
                type: 'Boolean',
                definition: 'http://example.org/c',
                label: 'C',
              } as BooleanComponent,
            },
            {
              name: 'd',
              component: {
                type: 'Boolean',
                definition: 'http://example.org/d',
                label: 'D',
              } as BooleanComponent,
            },
          ],
        };

        const result = decodeText(data, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          a: true,
          b: false,
          c: true,
          d: false,
        });
      });

      it('should decode Count (integer) values', () => {
        const data = '42,100,-5';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'count1',
              component: {
                type: 'Count',
                definition: 'http://example.org/count1',
                label: 'Count1',
              } as CountComponent,
            },
            {
              name: 'count2',
              component: {
                type: 'Count',
                definition: 'http://example.org/count2',
                label: 'Count2',
              } as CountComponent,
            },
            {
              name: 'count3',
              component: {
                type: 'Count',
                definition: 'http://example.org/count3',
                label: 'Count3',
              } as CountComponent,
            },
          ],
        };

        const result = decodeText(data, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          count1: 42,
          count2: 100,
          count3: -5,
        });
      });

      it('should decode Time values', () => {
        const data = '2026-01-28T12:00:00Z,1706443200';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'time1',
              component: {
                type: 'Time',
                definition: 'http://example.org/time1',
                label: 'Time1',
                uom: { code: 'iso8601' },
              } as TimeComponent,
            },
            {
              name: 'time2',
              component: {
                type: 'Time',
                definition: 'http://example.org/time2',
                label: 'Time2',
                uom: { code: 'unix' },
              } as TimeComponent,
            },
          ],
        };

        const result = decodeText(data, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          time1: '2026-01-28T12:00:00Z',
          time2: 1706443200,
        });
      });

      it('should decode Category and Text values', () => {
        const data = 'clear,Station A';
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'weather',
              component: {
                type: 'Category',
                definition: 'http://example.org/weather',
                label: 'Weather',
              } as CategoryComponent,
            },
            {
              name: 'location',
              component: {
                type: 'Text',
                definition: 'http://example.org/location',
                label: 'Location',
              } as TextComponent,
            },
          ],
        };

        const result = decodeText(data, encoding, component) as Record<
          string,
          unknown
        >;

        expect(result).toEqual({
          weather: 'clear',
          location: 'Station A',
        });
      });
    });
  });

  describe('encodeText()', () => {
    describe('CSV encoding', () => {
      it('should encode record to CSV', () => {
        const values = {
          temp: 22.5,
          humidity: 65,
          pressure: 1013.25,
        };
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'temp',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temp',
                label: 'Temperature',
                uom: { code: 'Cel' },
              } as QuantityComponent,
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/humidity',
                label: 'Humidity',
                uom: { code: '%' },
              } as QuantityComponent,
            },
            {
              name: 'pressure',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/pressure',
                label: 'Pressure',
                uom: { code: 'hPa' },
              } as QuantityComponent,
            },
          ],
        };

        const result = encodeText(values, encoding, component);

        expect(result).toBe('22.5,65,1013.25');
      });

      it('should encode array to CSV', () => {
        const values = [
          { temp: 22.5, humidity: 65 },
          { temp: 23.1, humidity: 64 },
          { temp: 22.8, humidity: 63 },
        ];
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataArrayComponent = {
          type: 'DataArray',
          definition: 'http://example.org/array',
          label: 'Test Array',
          elementCount: { value: 3 },
          elementType: {
            name: 'observation',
            component: {
              type: 'DataRecord',
              definition: 'http://example.org/record',
              label: 'Observation',
              fields: [
                {
                  name: 'temp',
                  component: {
                    type: 'Quantity',
                    definition: 'http://example.org/temp',
                    label: 'Temperature',
                    uom: { code: 'Cel' },
                  } as QuantityComponent,
                },
                {
                  name: 'humidity',
                  component: {
                    type: 'Quantity',
                    definition: 'http://example.org/humidity',
                    label: 'Humidity',
                    uom: { code: '%' },
                  } as QuantityComponent,
                },
              ],
            } as DataRecordComponent,
          },
        };

        const result = encodeText(values, encoding, component);

        expect(result).toBe('22.5,65\n23.1,64\n22.8,63');
      });
    });

    describe('Quoting', () => {
      it('should quote strings with separators', () => {
        const values = {
          station: 'Station A, Site 1',
          temp: 22.5,
        };
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'station',
              component: {
                type: 'Text',
                definition: 'http://example.org/station',
                label: 'Station',
              } as TextComponent,
            },
            {
              name: 'temp',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temp',
                label: 'Temperature',
                uom: { code: 'Cel' },
              } as QuantityComponent,
            },
          ],
        };

        const result = encodeText(values, encoding, component);

        expect(result).toBe('"Station A, Site 1",22.5');
      });

      it('should escape quotes in strings', () => {
        const values = {
          message: 'Say "Hello"',
          value: 22.5,
        };
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'message',
              component: {
                type: 'Text',
                definition: 'http://example.org/message',
                label: 'Message',
              } as TextComponent,
            },
            {
              name: 'value',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/value',
                label: 'Value',
                uom: { code: 'none' },
              } as QuantityComponent,
            },
          ],
        };

        const result = encodeText(values, encoding, component);

        expect(result).toBe('"Say ""Hello""",22.5');
      });
    });

    describe('Custom decimal separator', () => {
      it('should use custom decimal separator', () => {
        const values = {
          temp: 22.5,
          humidity: 65,
          pressure: 1013.25,
        };
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ';',
          blockSeparator: '\n',
          decimalSeparator: ',',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'temp',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temp',
                label: 'Temperature',
                uom: { code: 'Cel' },
              } as QuantityComponent,
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/humidity',
                label: 'Humidity',
                uom: { code: '%' },
              } as QuantityComponent,
            },
            {
              name: 'pressure',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/pressure',
                label: 'Pressure',
                uom: { code: 'hPa' },
              } as QuantityComponent,
            },
          ],
        };

        const result = encodeText(values, encoding, component);

        expect(result).toBe('22,5;65;1013,25');
      });
    });

    describe('Null values', () => {
      it('should encode null values as empty strings', () => {
        const values = {
          temp: 22.5,
          humidity: null,
          pressure: 1013.25,
        };
        const encoding: TextEncoding = {
          type: 'TextEncoding',
          tokenSeparator: ',',
          blockSeparator: '\n',
        };
        const component: DataRecordComponent = {
          type: 'DataRecord',
          definition: 'http://example.org/record',
          label: 'Test Record',
          fields: [
            {
              name: 'temp',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/temp',
                label: 'Temperature',
                uom: { code: 'Cel' },
              } as QuantityComponent,
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/humidity',
                label: 'Humidity',
                uom: { code: '%' },
              } as QuantityComponent,
            },
            {
              name: 'pressure',
              component: {
                type: 'Quantity',
                definition: 'http://example.org/pressure',
                label: 'Pressure',
                uom: { code: 'hPa' },
              } as QuantityComponent,
            },
          ],
        };

        const result = encodeText(values, encoding, component);

        expect(result).toBe('22.5,,1013.25');
      });
    });
  });

  describe('Round-trip encoding', () => {
    it('should encode and decode to same values', () => {
      const originalValues = [
        { temp: 22.5, humidity: 65, pressure: 1013.25 },
        { temp: 23.1, humidity: 64, pressure: 1012.8 },
        { temp: 22.8, humidity: 63, pressure: 1013.1 },
      ];
      const encoding: TextEncoding = {
        type: 'TextEncoding',
        tokenSeparator: ',',
        blockSeparator: '\n',
      };
      const component: DataArrayComponent = {
        type: 'DataArray',
        definition: 'http://example.org/array',
        label: 'Test Array',
        elementCount: { value: 3 },
        elementType: {
          name: 'observation',
          component: {
            type: 'DataRecord',
            definition: 'http://example.org/record',
            label: 'Observation',
            fields: [
              {
                name: 'temp',
                component: {
                  type: 'Quantity',
                  definition: 'http://example.org/temp',
                  label: 'Temperature',
                  uom: { code: 'Cel' },
                } as QuantityComponent,
              },
              {
                name: 'humidity',
                component: {
                  type: 'Quantity',
                  definition: 'http://example.org/humidity',
                  label: 'Humidity',
                  uom: { code: '%' },
                } as QuantityComponent,
              },
              {
                name: 'pressure',
                component: {
                  type: 'Quantity',
                  definition: 'http://example.org/pressure',
                  label: 'Pressure',
                  uom: { code: 'hPa' },
                } as QuantityComponent,
              },
            ],
          } as DataRecordComponent,
        },
      };

      // Encode
      const encoded = encodeText(originalValues, encoding, component);

      // Decode
      const decoded = decodeText(encoded, encoding, component) as Record<
        string,
        unknown
      >[];

      expect(decoded).toEqual(originalValues);
    });
  });

  describe('validateTextEncoding()', () => {
    it('should validate correct encoding', () => {
      const encoding: TextEncoding = {
        type: 'TextEncoding',
        tokenSeparator: ',',
        blockSeparator: '\n',
      };

      const result = validateTextEncoding(encoding);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing token separator', () => {
      const encoding = {
        type: 'TextEncoding',
        blockSeparator: '\n',
      } as unknown as TextEncoding;

      const result = validateTextEncoding(encoding);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('tokenSeparator is required');
    });

    it('should reject missing block separator', () => {
      const encoding = {
        type: 'TextEncoding',
        tokenSeparator: ',',
      } as unknown as TextEncoding;

      const result = validateTextEncoding(encoding);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('blockSeparator is required');
    });

    it('should reject same token and block separator', () => {
      const encoding: TextEncoding = {
        type: 'TextEncoding',
        tokenSeparator: ',',
        blockSeparator: ',',
      };

      const result = validateTextEncoding(encoding);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'tokenSeparator and blockSeparator should be different to avoid ambiguity'
      );
    });

    it('should reject decimal separator same as token separator', () => {
      const encoding: TextEncoding = {
        type: 'TextEncoding',
        tokenSeparator: ',',
        blockSeparator: '\n',
        decimalSeparator: ',',
      };

      const result = validateTextEncoding(encoding);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'decimalSeparator must be different from tokenSeparator'
      );
    });
  });

  describe('validateTextDataLength()', () => {
    it('should validate correct record count', () => {
      const csvData = '22.5,65\n23.1,64\n22.8,63';
      const encoding: TextEncoding = {
        type: 'TextEncoding',
        tokenSeparator: ',',
        blockSeparator: '\n',
      };

      const result = validateTextDataLength(csvData, encoding, 3);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect record count mismatch', () => {
      const csvData = '22.5,65\n23.1,64';
      const encoding: TextEncoding = {
        type: 'TextEncoding',
        tokenSeparator: ',',
        blockSeparator: '\n',
      };

      const result = validateTextDataLength(csvData, encoding, 3);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Record count mismatch: expected 3, found 2'
      );
    });
  });

  describe('validateTextDataStructure()', () => {
    it('should validate correct field count', () => {
      const csvData = '22.5,65,1013.25\n23.1,64,1012.80';
      const encoding: TextEncoding = {
        type: 'TextEncoding',
        tokenSeparator: ',',
        blockSeparator: '\n',
      };
      const component: DataRecordComponent = {
        type: 'DataRecord',
        definition: 'http://example.org/record',
        label: 'Test Record',
        fields: [
          {
            name: 'temp',
            component: {
              type: 'Quantity',
              definition: 'http://example.org/temp',
              label: 'Temperature',
              uom: { code: 'Cel' },
            } as QuantityComponent,
          },
          {
            name: 'humidity',
            component: {
              type: 'Quantity',
              definition: 'http://example.org/humidity',
              label: 'Humidity',
              uom: { code: '%' },
            } as QuantityComponent,
          },
          {
            name: 'pressure',
            component: {
              type: 'Quantity',
              definition: 'http://example.org/pressure',
              label: 'Pressure',
              uom: { code: 'hPa' },
            } as QuantityComponent,
          },
        ],
      };

      const result = validateTextDataStructure(csvData, encoding, component);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect field count mismatch', () => {
      const csvData = '22.5,65\n23.1,64,1012.80\n';
      const encoding: TextEncoding = {
        type: 'TextEncoding',
        tokenSeparator: ',',
        blockSeparator: '\n',
      };
      const component: DataRecordComponent = {
        type: 'DataRecord',
        definition: 'http://example.org/record',
        label: 'Test Record',
        fields: [
          {
            name: 'temp',
            component: {
              type: 'Quantity',
              definition: 'http://example.org/temp',
              label: 'Temperature',
              uom: { code: 'Cel' },
            } as QuantityComponent,
          },
          {
            name: 'humidity',
            component: {
              type: 'Quantity',
              definition: 'http://example.org/humidity',
              label: 'Humidity',
              uom: { code: '%' },
            } as QuantityComponent,
          },
        ],
      };

      const result = validateTextDataStructure(csvData, encoding, component);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Record 2: expected 2 fields, found 3');
    });
  });
});
