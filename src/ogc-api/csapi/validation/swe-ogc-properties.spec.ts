/**
 * Tests for OGC required properties (definition and label) validation
 * These tests verify Issue #47 implementation
 */
import {
  validateQuantity,
  validateCount,
  validateText,
  validateCategory,
  validateTime,
  validateRangeComponent,
  validateDataRecord,
  validateDataArray,
} from './swe-validator.js';

describe('OGC Property Validation (definition and label)', () => {
  describe('validateQuantity', () => {
    it('should reject Quantity without definition', () => {
      const quantity = {
        type: 'Quantity',
        label: 'Temperature',
        uom: { code: 'Cel' },
      };

      const result = validateQuantity(quantity as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      const defError = result.errors!.find(e => e.path === 'definition');
      expect(defError).toBeDefined();
      expect(defError!.message).toContain('Missing required property: definition');
    });

    it('should reject Quantity without label', () => {
      const quantity = {
        type: 'Quantity',
        definition: 'http://example.org/temperature',
        uom: { code: 'Cel' },
      };

      const result = validateQuantity(quantity as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      const labelError = result.errors!.find(e => e.path === 'label');
      expect(labelError).toBeDefined();
      expect(labelError!.message).toContain('Missing required property: label');
    });

    it('should reject Quantity with non-string definition', () => {
      const quantity = {
        type: 'Quantity',
        definition: 123,
        label: 'Temperature',
        uom: { code: 'Cel' },
      };

      const result = validateQuantity(quantity as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      const defError = result.errors!.find(e => e.path === 'definition');
      expect(defError).toBeDefined();
      expect(defError!.message).toContain('must be a string');
    });

    it('should reject Quantity with non-string label', () => {
      const quantity = {
        type: 'Quantity',
        definition: 'http://example.org/temperature',
        label: 123,
        uom: { code: 'Cel' },
      };

      const result = validateQuantity(quantity as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      const labelError = result.errors!.find(e => e.path === 'label');
      expect(labelError).toBeDefined();
      expect(labelError!.message).toContain('must be a string');
    });

    it('should validate Quantity with all required properties', () => {
      const quantity = {
        type: 'Quantity',
        definition: 'http://example.org/temperature',
        label: 'Temperature',
        uom: { code: 'Cel' },
      };

      const result = validateQuantity(quantity);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCount', () => {
    it('should reject Count without definition', () => {
      const count = {
        type: 'Count',
        label: 'Count',
      };

      const result = validateCount(count as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'definition')).toBeDefined();
    });

    it('should reject Count without label', () => {
      const count = {
        type: 'Count',
        definition: 'http://example.org/count',
      };

      const result = validateCount(count as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'label')).toBeDefined();
    });

    it('should validate Count with all required properties', () => {
      const count = {
        type: 'Count',
        definition: 'http://example.org/count',
        label: 'Count',
      };

      const result = validateCount(count);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateText', () => {
    it('should reject Text without definition', () => {
      const text = {
        type: 'Text',
        label: 'Text',
      };

      const result = validateText(text as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'definition')).toBeDefined();
    });

    it('should reject Text without label', () => {
      const text = {
        type: 'Text',
        definition: 'http://example.org/text',
      };

      const result = validateText(text as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'label')).toBeDefined();
    });

    it('should validate Text with all required properties', () => {
      const text = {
        type: 'Text',
        definition: 'http://example.org/text',
        label: 'Text',
      };

      const result = validateText(text);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCategory', () => {
    it('should reject Category without definition', () => {
      const category = {
        type: 'Category',
        label: 'Category',
      };

      const result = validateCategory(category as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'definition')).toBeDefined();
    });

    it('should reject Category without label', () => {
      const category = {
        type: 'Category',
        definition: 'http://example.org/category',
      };

      const result = validateCategory(category as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'label')).toBeDefined();
    });

    it('should validate Category with all required properties', () => {
      const category = {
        type: 'Category',
        definition: 'http://example.org/category',
        label: 'Category',
      };

      const result = validateCategory(category);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateTime', () => {
    it('should reject Time without definition', () => {
      const time = {
        type: 'Time',
        label: 'Time',
        uom: { code: 's' },
      };

      const result = validateTime(time as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'definition')).toBeDefined();
    });

    it('should reject Time without label', () => {
      const time = {
        type: 'Time',
        definition: 'http://example.org/time',
        uom: { code: 's' },
      };

      const result = validateTime(time as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'label')).toBeDefined();
    });

    it('should validate Time with all required properties', () => {
      const time = {
        type: 'Time',
        definition: 'http://example.org/time',
        label: 'Time',
        uom: { code: 's' },
      };

      const result = validateTime(time);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateRangeComponent', () => {
    it('should reject QuantityRange without definition', () => {
      const range = {
        type: 'QuantityRange',
        label: 'Range',
        uom: { code: 'm' },
      };

      const result = validateRangeComponent(range as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'definition')).toBeDefined();
    });

    it('should reject CountRange without label', () => {
      const range = {
        type: 'CountRange',
        definition: 'http://example.org/range',
      };

      const result = validateRangeComponent(range as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'label')).toBeDefined();
    });

    it('should validate QuantityRange with all required properties', () => {
      const range = {
        type: 'QuantityRange',
        definition: 'http://example.org/range',
        label: 'Range',
        uom: { code: 'm' },
      };

      const result = validateRangeComponent(range);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDataRecord', () => {
    it('should reject DataRecord without definition', () => {
      const dataRecord = {
        type: 'DataRecord',
        label: 'Data Record',
        fields: [
          {
            name: 'field1',
            component: {
              type: 'Quantity',
              definition: 'http://example.org/field1',
              label: 'Field 1',
              uom: { code: 'm' },
            },
          },
        ],
      };

      const result = validateDataRecord(dataRecord as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'definition')).toBeDefined();
    });

    it('should reject DataRecord without label', () => {
      const dataRecord = {
        type: 'DataRecord',
        definition: 'http://example.org/datarecord',
        fields: [
          {
            name: 'field1',
            component: {
              type: 'Quantity',
              definition: 'http://example.org/field1',
              label: 'Field 1',
              uom: { code: 'm' },
            },
          },
        ],
      };

      const result = validateDataRecord(dataRecord as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'label')).toBeDefined();
    });

    it('should validate DataRecord with all required properties', () => {
      const dataRecord = {
        type: 'DataRecord',
        definition: 'http://example.org/datarecord',
        label: 'Data Record',
        fields: [
          {
            name: 'field1',
            component: {
              type: 'Quantity',
              definition: 'http://example.org/field1',
              label: 'Field 1',
              uom: { code: 'm' },
            },
          },
        ],
      };

      const result = validateDataRecord(dataRecord);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDataArray', () => {
    it('should reject DataArray without definition', () => {
      const dataArray = {
        type: 'DataArray',
        label: 'Data Array',
        elementCount: 10,
        elementType: {
          type: 'Quantity',
          definition: 'http://example.org/element',
          label: 'Element',
          uom: { code: 'm' },
        },
      };

      const result = validateDataArray(dataArray as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'definition')).toBeDefined();
    });

    it('should reject DataArray without label', () => {
      const dataArray = {
        type: 'DataArray',
        definition: 'http://example.org/dataarray',
        elementCount: 10,
        elementType: {
          type: 'Quantity',
          definition: 'http://example.org/element',
          label: 'Element',
          uom: { code: 'm' },
        },
      };

      const result = validateDataArray(dataArray as any);
      expect(result.valid).toBe(false);
      expect(result.errors!.find(e => e.path === 'label')).toBeDefined();
    });

    it('should validate DataArray with all required properties', () => {
      const dataArray = {
        type: 'DataArray',
        definition: 'http://example.org/dataarray',
        label: 'Data Array',
        elementCount: 10,
        elementType: {
          type: 'Quantity',
          definition: 'http://example.org/element',
          label: 'Element',
          uom: { code: 'm' },
        },
      };

      const result = validateDataArray(dataArray);
      expect(result.valid).toBe(true);
    });
  });
});
