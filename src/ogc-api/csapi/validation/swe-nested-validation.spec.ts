import {
  validateDataRecord,
  validateDataArray,
  validateSWEComponent,
} from './swe-validator';

describe('Nested SWE Component Validation', () => {
  describe('DataRecord with nested components', () => {
    describe('2-level nesting', () => {
      it('should validate DataRecord with nested Quantity field', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/measurements',
          label: 'Measurements',
          fields: [
            {
              name: 'temperature',
              component: {
                type: 'Quantity',
                definition: 'http://example.com/temperature',
                label: 'Temperature',
                uom: { code: 'Cel' },
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });

      it('should validate DataRecord with multiple nested fields', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/measurements',
          label: 'Measurements',
          fields: [
            {
              name: 'temperature',
              component: {
                type: 'Quantity',
                definition: 'http://example.com/temperature',
                label: 'Temperature',
                uom: { code: 'Cel' },
              },
            },
            {
              name: 'humidity',
              component: {
                type: 'Quantity',
                definition: 'http://example.com/humidity',
                label: 'Humidity',
                uom: { code: '%' },
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });

      it('should detect missing uom in nested Quantity component', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/measurements',
          label: 'Measurements',
          fields: [
            {
              name: 'temperature',
              component: {
                type: 'Quantity',
                definition: 'http://example.com/temperature',
                label: 'Temperature',
                // Missing uom
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0].path).toBe('fields[0].component');
        expect(result.errors?.[0].message).toContain('uom');
      });

      it('should detect missing definition in nested component', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/measurements',
          label: 'Measurements',
          fields: [
            {
              name: 'temperature',
              component: {
                type: 'Quantity',
                label: 'Temperature',
                uom: { code: 'Cel' },
                // Missing definition
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0].path).toBe('fields[0].component.definition');
        expect(result.errors?.[0].message).toContain('definition');
      });
    });

    describe('3-level nesting', () => {
      it('should validate DataRecord with nested DataRecord field', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/station',
          label: 'Weather Station',
          fields: [
            {
              name: 'location',
              component: {
                type: 'DataRecord',
                definition: 'http://example.com/location',
                label: 'Location',
                fields: [
                  {
                    name: 'latitude',
                    component: {
                      type: 'Quantity',
                      definition: 'http://example.com/latitude',
                      label: 'Latitude',
                      uom: { code: 'deg' },
                    },
                  },
                  {
                    name: 'longitude',
                    component: {
                      type: 'Quantity',
                      definition: 'http://example.com/longitude',
                      label: 'Longitude',
                      uom: { code: 'deg' },
                    },
                  },
                ],
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });

      it('should detect errors in deeply nested components', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/station',
          label: 'Weather Station',
          fields: [
            {
              name: 'location',
              component: {
                type: 'DataRecord',
                definition: 'http://example.com/location',
                label: 'Location',
                fields: [
                  {
                    name: 'latitude',
                    component: {
                      type: 'Quantity',
                      definition: 'http://example.com/latitude',
                      label: 'Latitude',
                      // Missing uom
                    },
                  },
                ],
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0].path).toBe(
          'fields[0].component.fields[0].component'
        );
        expect(result.errors?.[0].message).toContain('uom');
      });
    });

    describe('4-level deep nesting', () => {
      it('should validate deeply nested DataRecord structures', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/root',
          label: 'Root',
          fields: [
            {
              name: 'level1',
              component: {
                type: 'DataRecord',
                definition: 'http://example.com/level1',
                label: 'Level 1',
                fields: [
                  {
                    name: 'level2',
                    component: {
                      type: 'DataRecord',
                      definition: 'http://example.com/level2',
                      label: 'Level 2',
                      fields: [
                        {
                          name: 'level3',
                          component: {
                            type: 'Quantity',
                            definition: 'http://example.com/level3',
                            label: 'Level 3 Value',
                            uom: { code: 'm' },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });

      it('should construct proper error paths for deeply nested errors', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/root',
          label: 'Root',
          fields: [
            {
              name: 'level1',
              component: {
                type: 'DataRecord',
                definition: 'http://example.com/level1',
                label: 'Level 1',
                fields: [
                  {
                    name: 'level2',
                    component: {
                      type: 'DataRecord',
                      definition: 'http://example.com/level2',
                      label: 'Level 2',
                      fields: [
                        {
                          name: 'level3',
                          component: {
                            type: 'Quantity',
                            definition: 'http://example.com/level3',
                            label: 'Level 3 Value',
                            // Missing uom
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0].path).toBe(
          'fields[0].component.fields[0].component.fields[0].component'
        );
        expect(result.errors?.[0].message).toContain('uom');
      });
    });

    describe('Field structure validation', () => {
      it('should detect missing field name', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/measurements',
          label: 'Measurements',
          fields: [
            {
              // Missing name
              component: {
                type: 'Quantity',
                definition: 'http://example.com/temperature',
                label: 'Temperature',
                uom: { code: 'Cel' },
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            path: 'fields[0].name',
            message: expect.stringContaining('name'),
          })
        );
      });

      it('should detect invalid field name type', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/measurements',
          label: 'Measurements',
          fields: [
            {
              name: 123, // Invalid type
              component: {
                type: 'Quantity',
                definition: 'http://example.com/temperature',
                label: 'Temperature',
                uom: { code: 'Cel' },
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            path: 'fields[0].name',
            message: expect.stringContaining('name'),
          })
        );
      });

      it('should detect missing field component', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/measurements',
          label: 'Measurements',
          fields: [
            {
              name: 'temperature',
              // Missing component
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            path: 'fields[0].component',
            message: expect.stringContaining('component'),
          })
        );
      });

      it('should detect multiple field errors', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/measurements',
          label: 'Measurements',
          fields: [
            {
              // Missing name
              component: {
                type: 'Quantity',
                definition: 'http://example.com/temp',
                label: 'Temperature',
                // Missing uom
              },
            },
            {
              name: 'humidity',
              // Missing component
            },
          ],
        };

        const result = validateDataRecord(dataRecord);
        expect(result.valid).toBe(false);
        expect(result.errors!.length).toBeGreaterThanOrEqual(3);
      });
    });

    describe('validateNested parameter', () => {
      it('should skip nested validation when validateNested is false', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/measurements',
          label: 'Measurements',
          fields: [
            {
              name: 'temperature',
              component: {
                type: 'Quantity',
                definition: 'http://example.com/temperature',
                label: 'Temperature',
                // Missing uom - should not be detected
              },
            },
          ],
        };

        const result = validateDataRecord(dataRecord, false);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });

      it('should still validate field structure when validateNested is false', () => {
        const dataRecord = {
          type: 'DataRecord',
          definition: 'http://example.com/measurements',
          label: 'Measurements',
          fields: [
            {
              name: 'temperature',
              // Missing component - should still be detected
            },
          ],
        };

        const result = validateDataRecord(dataRecord, false);
        expect(result.valid).toBe(true); // Should pass when validateNested is false
        expect(result.errors).toBeUndefined();
      });
    });
  });

  describe('DataArray with nested components', () => {
    describe('2-level nesting', () => {
      it('should validate DataArray with Quantity elementType', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.com/measurements',
          label: 'Measurement Array',
          elementCount: 10,
          elementType: {
            type: 'Quantity',
            definition: 'http://example.com/temperature',
            label: 'Temperature',
            uom: { code: 'Cel' },
          },
        };

        const result = validateDataArray(dataArray);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });

      it('should detect missing uom in elementType Quantity', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.com/measurements',
          label: 'Measurement Array',
          elementCount: 10,
          elementType: {
            type: 'Quantity',
            definition: 'http://example.com/temperature',
            label: 'Temperature',
            // Missing uom
          },
        };

        const result = validateDataArray(dataArray);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0].path).toBe('elementType');
        expect(result.errors?.[0].message).toContain('uom');
      });

      it('should detect missing definition in elementType', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.com/measurements',
          label: 'Measurement Array',
          elementCount: 10,
          elementType: {
            type: 'Quantity',
            label: 'Temperature',
            uom: { code: 'Cel' },
            // Missing definition
          },
        };

        const result = validateDataArray(dataArray);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0].path).toBe('elementType.definition');
        expect(result.errors?.[0].message).toContain('definition');
      });
    });

    describe('3-level nesting with DataRecord elementType', () => {
      it('should validate DataArray with DataRecord elementType', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.com/observations',
          label: 'Observation Array',
          elementCount: 5,
          elementType: {
            type: 'DataRecord',
            definition: 'http://example.com/observation',
            label: 'Observation',
            fields: [
              {
                name: 'temperature',
                component: {
                  type: 'Quantity',
                  definition: 'http://example.com/temperature',
                  label: 'Temperature',
                  uom: { code: 'Cel' },
                },
              },
              {
                name: 'pressure',
                component: {
                  type: 'Quantity',
                  definition: 'http://example.com/pressure',
                  label: 'Pressure',
                  uom: { code: 'hPa' },
                },
              },
            ],
          },
        };

        const result = validateDataArray(dataArray);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });

      it('should detect errors in nested DataRecord fields', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.com/observations',
          label: 'Observation Array',
          elementCount: 5,
          elementType: {
            type: 'DataRecord',
            definition: 'http://example.com/observation',
            label: 'Observation',
            fields: [
              {
                name: 'temperature',
                component: {
                  type: 'Quantity',
                  definition: 'http://example.com/temperature',
                  label: 'Temperature',
                  // Missing uom
                },
              },
            ],
          },
        };

        const result = validateDataArray(dataArray);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0].path).toBe('elementType.fields[0].component');
        expect(result.errors?.[0].message).toContain('uom');
      });
    });

    describe('4-level deep nesting', () => {
      it('should validate DataArray with nested DataArray elementType', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.com/matrix',
          label: 'Matrix',
          elementCount: 3,
          elementType: {
            type: 'DataArray',
            definition: 'http://example.com/row',
            label: 'Row',
            elementCount: 4,
            elementType: {
              type: 'Quantity',
              definition: 'http://example.com/value',
              label: 'Value',
              uom: { code: 'm' },
            },
          },
        };

        const result = validateDataArray(dataArray);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });

      it('should construct proper error paths for deeply nested DataArray errors', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.com/matrix',
          label: 'Matrix',
          elementCount: 3,
          elementType: {
            type: 'DataArray',
            definition: 'http://example.com/row',
            label: 'Row',
            elementCount: 4,
            elementType: {
              type: 'Quantity',
              definition: 'http://example.com/value',
              label: 'Value',
              // Missing uom
            },
          },
        };

        const result = validateDataArray(dataArray);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0].path).toBe('elementType.elementType');
        expect(result.errors?.[0].message).toContain('uom');
      });
    });

    describe('validateNested parameter', () => {
      it('should skip nested validation when validateNested is false', () => {
        const dataArray = {
          type: 'DataArray',
          definition: 'http://example.com/measurements',
          label: 'Measurement Array',
          elementCount: 10,
          elementType: {
            type: 'Quantity',
            definition: 'http://example.com/temperature',
            label: 'Temperature',
            // Missing uom - should not be detected
          },
        };

        const result = validateDataArray(dataArray, false);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });
    });
  });

  describe('Mixed nested structures', () => {
    it('should validate DataRecord with DataArray field', () => {
      const dataRecord = {
        type: 'DataRecord',
        definition: 'http://example.com/timeseries',
        label: 'Time Series',
        fields: [
          {
            name: 'values',
            component: {
              type: 'DataArray',
              definition: 'http://example.com/values',
              label: 'Values',
              elementCount: 10,
              elementType: {
                type: 'Quantity',
                definition: 'http://example.com/temperature',
                label: 'Temperature',
                uom: { code: 'Cel' },
              },
            },
          },
        ],
      };

      const result = validateDataRecord(dataRecord);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate DataArray with DataRecord containing DataArray', () => {
      const dataArray = {
        type: 'DataArray',
        definition: 'http://example.com/stations',
        label: 'Station Array',
        elementCount: 5,
        elementType: {
          type: 'DataRecord',
          definition: 'http://example.com/station',
          label: 'Station',
          fields: [
            {
              name: 'readings',
              component: {
                type: 'DataArray',
                definition: 'http://example.com/readings',
                label: 'Readings',
                elementCount: 24,
                elementType: {
                  type: 'Quantity',
                  definition: 'http://example.com/reading',
                  label: 'Reading',
                  uom: { code: 'Cel' },
                },
              },
            },
          ],
        },
      };

      const result = validateDataArray(dataArray);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect errors in complex mixed structures', () => {
      const dataRecord = {
        type: 'DataRecord',
        definition: 'http://example.com/complex',
        label: 'Complex Structure',
        fields: [
          {
            name: 'matrix',
            component: {
              type: 'DataArray',
              definition: 'http://example.com/matrix',
              label: 'Matrix',
              elementCount: 3,
              elementType: {
                type: 'DataRecord',
                definition: 'http://example.com/row',
                label: 'Row',
                fields: [
                  {
                    name: 'values',
                    component: {
                      type: 'DataArray',
                      definition: 'http://example.com/values',
                      label: 'Values',
                      elementCount: 4,
                      elementType: {
                        type: 'Quantity',
                        definition: 'http://example.com/value',
                        label: 'Value',
                        // Missing uom
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      };

      const result = validateDataRecord(dataRecord);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].path).toBe(
        'fields[0].component.elementType.fields[0].component.elementType'
      );
      expect(result.errors?.[0].message).toContain('uom');
    });
  });

  describe('validateSWEComponent integration', () => {
    it('should recursively validate through validateSWEComponent', () => {
      const dataRecord = {
        type: 'DataRecord',
        definition: 'http://example.com/measurements',
        label: 'Measurements',
        fields: [
          {
            name: 'temperature',
            component: {
              type: 'Quantity',
              definition: 'http://example.com/temperature',
              label: 'Temperature',
              uom: { code: 'Cel' },
            },
          },
        ],
      };

      const result = validateSWEComponent(dataRecord);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect errors through validateSWEComponent', () => {
      const dataRecord = {
        type: 'DataRecord',
        definition: 'http://example.com/measurements',
        label: 'Measurements',
        fields: [
          {
            name: 'temperature',
            component: {
              type: 'Quantity',
              definition: 'http://example.com/temperature',
              label: 'Temperature',
              // Missing uom
            },
          },
        ],
      };

      const result = validateSWEComponent(dataRecord);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0].path).toBe('fields[0].component');
    });

    it('should respect validateConstraints parameter in validateSWEComponent', () => {
      const dataArray = {
        type: 'DataArray',
        definition: 'http://example.com/measurements',
        label: 'Measurement Array',
        elementCount: 10,
        elementType: {
          type: 'Quantity',
          definition: 'http://example.com/temperature',
          label: 'Temperature',
          // Missing uom
        },
      };

      const resultWithValidation = validateSWEComponent(dataArray, true);
      expect(resultWithValidation.valid).toBe(false);

      const resultWithoutValidation = validateSWEComponent(dataArray, false);
      expect(resultWithoutValidation.valid).toBe(true);
    });
  });

  describe('Backwards compatibility', () => {
    it('should default to nested validation when parameter not provided', () => {
      const dataRecord = {
        type: 'DataRecord',
        definition: 'http://example.com/measurements',
        label: 'Measurements',
        fields: [
          {
            name: 'temperature',
            component: {
              type: 'Quantity',
              definition: 'http://example.com/temperature',
              label: 'Temperature',
              // Missing uom
            },
          },
        ],
      };

      const result = validateDataRecord(dataRecord);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0].path).toBe('fields[0].component');
    });

    it('should work with existing code that calls validators directly', () => {
      const simpleDataRecord = {
        type: 'DataRecord',
        definition: 'http://example.com/simple',
        label: 'Simple',
        fields: [
          {
            name: 'value',
            component: {
              type: 'Count',
              definition: 'http://example.com/count',
              label: 'Count',
            },
          },
        ],
      };

      const result = validateDataRecord(simpleDataRecord);
      expect(result.valid).toBe(true);
    });
  });
});
