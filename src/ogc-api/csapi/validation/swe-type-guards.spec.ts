/**
 * Tests for SWE Common Type Guards
 */

describe('SWE Common Type Guards', () => {
  describe('Range Component Type Guards', () => {
    it('should identify CategoryRangeComponent', () => {
      const { isCategoryRangeComponent } = require('../swe-common/types/range-components.js');
      const component = {
        type: 'CategoryRange',
        value: ['min', 'max'],
      };
      expect(isCategoryRangeComponent(component)).toBe(true);
      expect(isCategoryRangeComponent({ type: 'Category' })).toBe(false);
      expect(isCategoryRangeComponent(null)).toBe(false);
      expect(isCategoryRangeComponent('string')).toBe(false);
    });

    it('should identify CountRangeComponent', () => {
      const { isCountRangeComponent } = require('../swe-common/types/range-components.js');
      const component = {
        type: 'CountRange',
        value: [0, 100],
      };
      expect(isCountRangeComponent(component)).toBe(true);
      expect(isCountRangeComponent({ type: 'Count' })).toBe(false);
    });

    it('should identify QuantityRangeComponent', () => {
      const { isQuantityRangeComponent } = require('../swe-common/types/range-components.js');
      const component = {
        type: 'QuantityRange',
        uom: { code: 'Cel' },
        value: [0, 100],
      };
      expect(isQuantityRangeComponent(component)).toBe(true);
      expect(isQuantityRangeComponent({ type: 'Quantity' })).toBe(false);
    });

    it('should identify TimeRangeComponent', () => {
      const { isTimeRangeComponent } = require('../swe-common/types/range-components.js');
      const component = {
        type: 'TimeRange',
        uom: { code: 'ISO-8601' },
        value: ['2024-01-01', '2024-12-31'],
      };
      expect(isTimeRangeComponent(component)).toBe(true);
      expect(isTimeRangeComponent({ type: 'Time' })).toBe(false);
    });

    it('should identify any RangeComponent', () => {
      const { isRangeComponent } = require('../swe-common/types/range-components.js');
      expect(isRangeComponent({ type: 'CategoryRange' })).toBe(true);
      expect(isRangeComponent({ type: 'CountRange' })).toBe(true);
      expect(isRangeComponent({ type: 'QuantityRange' })).toBe(true);
      expect(isRangeComponent({ type: 'TimeRange' })).toBe(true);
      expect(isRangeComponent({ type: 'DataRecord' })).toBe(false);
      expect(isRangeComponent(null)).toBe(false);
    });
  });

  describe('Block Component Type Guards', () => {
    it('should identify DataArrayComponent', () => {
      const { isDataArrayComponent } = require('../swe-common/types/block-components.js');
      const component = {
        type: 'DataArray',
        elementCount: { type: 'Count', value: 10 },
        elementType: {
          name: 'value',
          component: { type: 'Quantity', uom: { code: 'Cel' } },
        },
      };
      expect(isDataArrayComponent(component)).toBe(true);
      expect(isDataArrayComponent({ type: 'Matrix' })).toBe(false);
      expect(isDataArrayComponent(null)).toBe(false);
    });

    it('should identify MatrixComponent', () => {
      const { isMatrixComponent } = require('../swe-common/types/block-components.js');
      const component = {
        type: 'Matrix',
        elementCount: {
          type: 'Count',
          value: 9,
        },
        elementType: {
          name: 'value',
          component: { type: 'Quantity', uom: { code: 'm' } },
        },
      };
      expect(isMatrixComponent(component)).toBe(true);
      expect(isMatrixComponent({ type: 'DataArray' })).toBe(false);
      expect(isMatrixComponent({})).toBe(false);
    });

    it('should identify DataStreamComponent', () => {
      const { isDataStreamComponent } = require('../swe-common/types/block-components.js');
      const component = {
        type: 'DataStream',
        elementType: {
          name: 'observation',
          component: {
            type: 'DataRecord',
            fields: [],
          },
        },
      };
      expect(isDataStreamComponent(component)).toBe(true);
      expect(isDataStreamComponent({ type: 'DataArray' })).toBe(false);
      expect(isDataStreamComponent(undefined)).toBe(false);
    });

    it('should identify any BlockComponent', () => {
      const { isBlockComponent } = require('../swe-common/types/block-components.js');
      expect(isBlockComponent({ type: 'DataArray' })).toBe(true);
      expect(isBlockComponent({ type: 'Matrix' })).toBe(true);
      expect(isBlockComponent({ type: 'DataStream' })).toBe(true);
      expect(isBlockComponent({ type: 'DataRecord' })).toBe(false);
      expect(isBlockComponent(null)).toBe(false);
    });
  });

  describe('Encoding Type Guards', () => {
    it('should identify BinaryEncoding', () => {
      const { isBinaryEncoding } = require('../swe-common/types/encodings.js');
      const encoding = {
        type: 'BinaryEncoding',
        byteOrder: 'bigEndian',
        member: [],
      };
      expect(isBinaryEncoding(encoding)).toBe(true);
      expect(isBinaryEncoding({ type: 'TextEncoding' })).toBe(false);
      expect(isBinaryEncoding(null)).toBe(false);
    });

    it('should identify TextEncoding', () => {
      const { isTextEncoding } = require('../swe-common/types/encodings.js');
      const encoding = {
        type: 'TextEncoding',
        tokenSeparator: ',',
        blockSeparator: '\n',
      };
      expect(isTextEncoding(encoding)).toBe(true);
      expect(isTextEncoding({ type: 'BinaryEncoding' })).toBe(false);
      expect(isTextEncoding({})).toBe(false);
    });

    it('should identify XMLEncoding', () => {
      const { isXMLEncoding } = require('../swe-common/types/encodings.js');
      const encoding = {
        type: 'XMLEncoding',
      };
      expect(isXMLEncoding(encoding)).toBe(true);
      expect(isXMLEncoding({ type: 'JSONEncoding' })).toBe(false);
      expect(isXMLEncoding(undefined)).toBe(false);
    });

    it('should identify JSONEncoding', () => {
      const { isJSONEncoding } = require('../swe-common/types/encodings.js');
      const encoding = {
        type: 'JSONEncoding',
      };
      expect(isJSONEncoding(encoding)).toBe(true);
      expect(isJSONEncoding({ type: 'XMLEncoding' })).toBe(false);
      expect(isJSONEncoding('string')).toBe(false);
    });

    it('should identify any Encoding', () => {
      const { isEncoding } = require('../swe-common/types/encodings.js');
      expect(isEncoding({ type: 'BinaryEncoding' })).toBe(true);
      expect(isEncoding({ type: 'TextEncoding' })).toBe(true);
      expect(isEncoding({ type: 'XMLEncoding' })).toBe(true);
      expect(isEncoding({ type: 'JSONEncoding' })).toBe(true);
      expect(isEncoding({ type: 'DataRecord' })).toBe(false);
      expect(isEncoding(null)).toBe(false);
      expect(isEncoding(undefined)).toBe(false);
    });
  });
});
