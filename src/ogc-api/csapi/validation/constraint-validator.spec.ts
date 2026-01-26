/**
 * Tests for SWE Common Constraint Validation
 */
import {
  validateQuantityConstraint,
  validateCountConstraint,
  validateTextConstraint,
  validateCategoryConstraint,
  validateTimeConstraint,
  validateRangeConstraint,
} from './constraint-validator.js';
import {
  validateQuantity,
  validateCount,
  validateText,
  validateCategory,
  validateTime,
  validateRangeComponent,
} from './swe-validator.js';

describe('SWE Common Constraint Validation', () => {
  describe('Quantity Constraint Validation', () => {
    it('should pass validation when value is within interval', () => {
      const component = {
        type: 'Quantity' as const,
        definition: 'http://example.com/temperature',
        label: 'Temperature',
        uom: { code: 'Cel' },
        constraint: {
          intervals: [[0, 100] as [number, number]],
        },
        value: 25,
      };

      const result = validateQuantityConstraint(component, 25);
      expect(result.valid).toBe(true);
    });

    it('should fail validation when value is outside interval', () => {
      const component = {
        type: 'Quantity' as const,
        definition: 'http://example.com/temperature',
        label: 'Temperature',
        uom: { code: 'Cel' },
        constraint: {
          intervals: [[0, 100] as [number, number]],
        },
        value: 150,
      };

      const result = validateQuantityConstraint(component, 150);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('outside allowed intervals');
    });

    it('should pass validation when value is in allowed values list', () => {
      const component = {
        type: 'Quantity' as const,
        definition: 'http://example.com/distance',
        label: 'Distance',
        uom: { code: 'm' },
        constraint: {
          values: [1, 2, 5, 10, 20],
        },
        value: 5,
      };

      const result = validateQuantityConstraint(component, 5);
      expect(result.valid).toBe(true);
    });

    it('should fail validation when value is not in allowed values list', () => {
      const component = {
        type: 'Quantity' as const,
        uom: { code: 'm' },
        constraint: {
          value: [1, 2, 3, 5, 10],
        },
        value: 7,
      };

      const result = validateQuantityConstraint(component, 7);
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('not in allowed values');
    });

    it('should validate significant figures constraint', () => {
      const component = {
        type: 'Quantity' as const,        definition: 'http://example.com/distance',
        label: 'Distance',        uom: { code: 'm' },
        constraint: {
          significantFigures: 3,
        },
        value: 123.456,
      };

      const result = validateQuantityConstraint(component, 123.456);
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('significant figures');
    });

    it('should integrate with validateQuantity function', () => {
      const component = {
        type: 'Quantity',
        uom: { code: 'Cel' },
        constraint: {
          interval: [[0, 100]],
        },
        value: 150,
      };

      const result = validateQuantity(component, true);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Count Constraint Validation', () => {
    it('should pass validation when value is within interval', () => {
      const component = {
        type: 'Count' as const,
        definition: 'http://example.com/count',
        label: 'Count',
        constraint: {
          intervals: [[0, 100] as [number, number]],
        },
        value: 50,
      };

      const result = validateCountConstraint(component, 50);
      expect(result.valid).toBe(true);
    });

    it('should fail validation when value is outside interval', () => {
      const component = {
        type: 'Count' as const,
        definition: 'http://example.com/count',
        label: 'Count',
        constraint: {
          intervals: [[0, 100] as [number, number]],
        },
        value: 150,
      };

      const result = validateCountConstraint(component, 150);
      expect(result.valid).toBe(false);
    });

    it('should fail validation for non-integer values', () => {
      const component = {
        type: 'Count' as const,
        definition: 'http://example.com/count',
        label: 'Count',
        value: 12.5,
      };

      const result = validateCountConstraint(component, 12.5);
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('must be an integer');
    });

    it('should integrate with validateCount function', () => {
      const component = {
        type: 'Count',
        constraint: {
          interval: [[0, 10]],
        },
        value: 20,
      };

      const result = validateCount(component, true);
      expect(result.valid).toBe(false);
    });
  });

  describe('Text Constraint Validation', () => {
    it('should pass validation when value matches pattern', () => {
      const component = {
        type: 'Text' as const,
        constraint: {
          pattern: '^[A-Z]{3}[0-9]{4}$',
        },
        value: 'ABC1234',
      };

      const result = validateTextConstraint(component, 'ABC1234');
      expect(result.valid).toBe(true);
    });

    it('should fail validation when value does not match pattern', () => {
      const component = {
        type: 'Text' as const,
        constraint: {
          pattern: '^[A-Z]{3}[0-9]{4}$',
        },
        value: 'abc1234',
      };

      const result = validateTextConstraint(component, 'abc1234');
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('does not match required pattern');
    });

    it('should pass validation when value is in allowed tokens', () => {
      const component = {
        type: 'Text' as const,
        constraint: {
          value: ['red', 'green', 'blue'],
        },
        value: 'green',
      };

      const result = validateTextConstraint(component, 'green');
      expect(result.valid).toBe(true);
    });

    it('should fail validation when value is not in allowed tokens', () => {
      const component = {
        type: 'Text' as const,
        constraint: {
          value: ['red', 'green', 'blue'],
        },
        value: 'yellow',
      };

      const result = validateTextConstraint(component, 'yellow');
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('not in allowed tokens');
    });

    it('should integrate with validateText function', () => {
      const component = {
        type: 'Text',
        constraint: {
          pattern: '^[A-Z]+$',
        },
        value: 'lowercase',
      };

      const result = validateText(component, true);
      expect(result.valid).toBe(false);
    });
  });

  describe('Category Constraint Validation', () => {
    it('should pass validation when value is in allowed tokens', () => {
      const component = {
        type: 'Category' as const,
        constraint: {
          value: ['sunny', 'cloudy', 'rainy', 'snowy'],
        },
        value: 'sunny',
      };

      const result = validateCategoryConstraint(component, 'sunny');
      expect(result.valid).toBe(true);
    });

    it('should fail validation when value is not in allowed tokens', () => {
      const component = {
        type: 'Category' as const,
        constraint: {
          value: ['sunny', 'cloudy', 'rainy', 'snowy'],
        },
        value: 'foggy',
      };

      const result = validateCategoryConstraint(component, 'foggy');
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('not in allowed tokens');
    });

    it('should integrate with validateCategory function', () => {
      const component = {
        type: 'Category',
        constraint: {
          value: ['A', 'B', 'C'],
        },
        value: 'D',
      };

      const result = validateCategory(component, true);
      expect(result.valid).toBe(false);
    });
  });

  describe('Time Constraint Validation', () => {
    it('should pass validation when value is within time interval', () => {
      const component = {
        type: 'Time' as const,
        uom: { code: 'ISO-8601' },
        constraint: {
          interval: [['2024-01-01', '2024-12-31'] as [string, string]],
        },
        value: '2024-06-15',
      };

      const result = validateTimeConstraint(component, '2024-06-15');
      expect(result.valid).toBe(true);
    });

    it('should fail validation when value is outside time interval', () => {
      const component = {
        type: 'Time' as const,
        uom: { code: 'ISO-8601' },
        constraint: {
          interval: [['2024-01-01', '2024-12-31'] as [string, string]],
        },
        value: '2025-01-01',
      };

      const result = validateTimeConstraint(component, '2025-01-01');
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('outside allowed intervals');
    });

    it('should handle numeric timestamps', () => {
      const component = {
        type: 'Time' as const,
        uom: { code: 'ms' },
        constraint: {
          interval: [[0, 1000000] as [number, number]],
        },
        value: 500000,
      };

      const result = validateTimeConstraint(component, 500000);
      expect(result.valid).toBe(true);
    });

    it('should integrate with validateTime function', () => {
      const component = {
        type: 'Time',
        uom: { code: 'ISO-8601' },
        constraint: {
          interval: [['2024-01-01', '2024-12-31']],
        },
        value: '2025-01-01',
      };

      const result = validateTime(component, true);
      expect(result.valid).toBe(false);
    });
  });

  describe('Range Constraint Validation', () => {
    it('should validate QuantityRange with both endpoints in range', () => {
      const component = {
        type: 'QuantityRange' as const,
        uom: { code: 'Cel' },
        constraint: {
          interval: [[-50, 150] as [number, number]],
        },
        value: [0, 100] as [number, number],
      };

      const result = validateRangeConstraint(component, [0, 100]);
      expect(result.valid).toBe(true);
    });

    it('should fail validation when range endpoint is outside constraint', () => {
      const component = {
        type: 'QuantityRange' as const,
        uom: { code: 'Cel' },
        constraint: {
          interval: [[-50, 150] as [number, number]],
        },
        value: [0, 200] as [number, number],
      };

      const result = validateRangeConstraint(component, [0, 200]);
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('Max');
    });

    it('should fail validation when min > max', () => {
      const component = {
        type: 'QuantityRange' as const,
        uom: { code: 'Cel' },
        value: [100, 0] as [number, number],
      };

      const result = validateRangeConstraint(component, [100, 0]);
      expect(result.valid).toBe(false);
      expect(result.errors![0].message).toContain('minimum');
      expect(result.errors![0].message).toContain('maximum');
    });

    it('should integrate with validateRangeComponent function', () => {
      const component = {
        type: 'QuantityRange',
        uom: { code: 'Cel' },
        constraint: {
          interval: [[0, 100]],
        },
        value: [50, 150],
      };

      const result = validateRangeComponent(component, true);
      expect(result.valid).toBe(false);
    });
  });

  describe('Constraint Validation Opt-Out', () => {
    it('should skip constraint validation when validateConstraints=false', () => {
      const component = {
        type: 'Quantity',
        uom: { code: 'Cel' },
        constraint: {
          interval: [[0, 100]],
        },
        value: 150, // Outside range
      };

      const result = validateQuantity(component, false);
      expect(result.valid).toBe(true); // Structural validation passes
    });

    it('should perform constraint validation by default', () => {
      const component = {
        type: 'Quantity',
        uom: { code: 'Cel' },
        constraint: {
          interval: [[0, 100]],
        },
        value: 150,
      };

      const result = validateQuantity(component); // validateConstraints defaults to true
      expect(result.valid).toBe(false);
    });
  });
});
