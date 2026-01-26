/**
 * Explicit SWE Common component parsers
 * 
 * This module provides explicit parsing and validation for SWE Common data components.
 * Parsers validate structure during parsing and provide clear error messages for malformed data.
 * 
 * @see https://docs.ogc.org/is/24-014/24-014.html
 */

import type {
  AnyDataComponent,
  DataComponent,
  QuantityComponent,
  CountComponent,
  BooleanComponent,
  TextComponent,
  CategoryComponent,
  TimeComponent,
} from '../swe-common/types/simple-components.js';
import type {
  QuantityRangeComponent,
  CountRangeComponent,
  CategoryRangeComponent,
  TimeRangeComponent,
} from '../swe-common/types/range-components.js';
import type {
  DataRecordComponent,
  VectorComponent,
  DataChoiceComponent,
} from '../swe-common/types/aggregate-components.js';
import type {
  DataArrayComponent,
  MatrixComponent,
  DataStreamComponent,
} from '../swe-common/types/block-components.js';
import type { GeometryComponent } from '../swe-common/types/geometry-component.js';

/**
 * Parser error
 */
export class ParseError extends Error {
  constructor(message: string, public path?: string) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Helper to check if value is an object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Parse QuantityComponent
 */
export function parseQuantityComponent(data: unknown): QuantityComponent {
  if (!isObject(data)) {
    throw new ParseError('Quantity must be an object');
  }

  if (data.type !== 'Quantity') {
    throw new ParseError(`Expected type 'Quantity', got '${data.type}'`);
  }

  if (!data.uom || typeof data.uom !== 'object') {
    throw new ParseError('Quantity requires uom with code or href');
  }

  const uom = data.uom as any;
  if (!uom.code && !uom.href) {
    throw new ParseError('Quantity uom must have code or href property');
  }

  return data as QuantityComponent;
}

/**
 * Parse CountComponent
 */
export function parseCountComponent(data: unknown): CountComponent {
  if (!isObject(data)) {
    throw new ParseError('Count must be an object');
  }

  if (data.type !== 'Count') {
    throw new ParseError(`Expected type 'Count', got '${data.type}'`);
  }

  return data as CountComponent;
}

/**
 * Parse BooleanComponent
 */
export function parseBooleanComponent(data: unknown): BooleanComponent {
  if (!isObject(data)) {
    throw new ParseError('Boolean must be an object');
  }

  if (data.type !== 'Boolean') {
    throw new ParseError(`Expected type 'Boolean', got '${data.type}'`);
  }

  return data as BooleanComponent;
}

/**
 * Parse TextComponent
 */
export function parseTextComponent(data: unknown): TextComponent {
  if (!isObject(data)) {
    throw new ParseError('Text must be an object');
  }

  if (data.type !== 'Text') {
    throw new ParseError(`Expected type 'Text', got '${data.type}'`);
  }

  return data as TextComponent;
}

/**
 * Parse CategoryComponent
 */
export function parseCategoryComponent(data: unknown): CategoryComponent {
  if (!isObject(data)) {
    throw new ParseError('Category must be an object');
  }

  if (data.type !== 'Category') {
    throw new ParseError(`Expected type 'Category', got '${data.type}'`);
  }

  return data as CategoryComponent;
}

/**
 * Parse TimeComponent
 */
export function parseTimeComponent(data: unknown): TimeComponent {
  if (!isObject(data)) {
    throw new ParseError('Time must be an object');
  }

  if (data.type !== 'Time') {
    throw new ParseError(`Expected type 'Time', got '${data.type}'`);
  }

  if (!data.uom || typeof data.uom !== 'object') {
    throw new ParseError('Time requires uom with code or href');
  }

  return data as TimeComponent;
}

/**
 * Parse QuantityRangeComponent
 */
export function parseQuantityRangeComponent(data: unknown): QuantityRangeComponent {
  if (!isObject(data)) {
    throw new ParseError('QuantityRange must be an object');
  }

  if (data.type !== 'QuantityRange') {
    throw new ParseError(`Expected type 'QuantityRange', got '${data.type}'`);
  }

  if (!data.uom || typeof data.uom !== 'object') {
    throw new ParseError('QuantityRange requires uom with code or href');
  }

  return data as QuantityRangeComponent;
}

/**
 * Parse CountRangeComponent
 */
export function parseCountRangeComponent(data: unknown): CountRangeComponent {
  if (!isObject(data)) {
    throw new ParseError('CountRange must be an object');
  }

  if (data.type !== 'CountRange') {
    throw new ParseError(`Expected type 'CountRange', got '${data.type}'`);
  }

  return data as CountRangeComponent;
}

/**
 * Parse CategoryRangeComponent
 */
export function parseCategoryRangeComponent(data: unknown): CategoryRangeComponent {
  if (!isObject(data)) {
    throw new ParseError('CategoryRange must be an object');
  }

  if (data.type !== 'CategoryRange') {
    throw new ParseError(`Expected type 'CategoryRange', got '${data.type}'`);
  }

  return data as CategoryRangeComponent;
}

/**
 * Parse TimeRangeComponent
 */
export function parseTimeRangeComponent(data: unknown): TimeRangeComponent {
  if (!isObject(data)) {
    throw new ParseError('TimeRange must be an object');
  }

  if (data.type !== 'TimeRange') {
    throw new ParseError(`Expected type 'TimeRange', got '${data.type}'`);
  }

  if (!data.uom || typeof data.uom !== 'object') {
    throw new ParseError('TimeRange requires uom with code or href');
  }

  return data as TimeRangeComponent;
}

/**
 * Parse DataRecordComponent (recursive)
 */
export function parseDataRecordComponent(data: unknown): DataRecordComponent {
  if (!isObject(data)) {
    throw new ParseError('DataRecord must be an object');
  }

  if (data.type !== 'DataRecord') {
    throw new ParseError(`Expected type 'DataRecord', got '${data.type}'`);
  }

  if (!Array.isArray(data.fields)) {
    throw new ParseError('DataRecord.fields must be an array');
  }

  if (data.fields.length === 0) {
    throw new ParseError('DataRecord must have at least one field');
  }

  // Recursively parse nested components
  const fields = data.fields.map((field: any, index: number) => {
    if (!isObject(field)) {
      throw new ParseError(`DataRecord.fields[${index}] must be an object`);
    }

    if (!field.name || typeof field.name !== 'string') {
      throw new ParseError(`DataRecord.fields[${index}] must have a name property`);
    }

    if (!field.component) {
      // Check for href (external reference)
      if (!field.href) {
        throw new ParseError(`DataRecord.fields[${index}] must have either component or href`);
      }
      return field;
    }

    try {
      const parsedComponent = parseDataComponent(field.component);
      return {
        ...field,
        component: parsedComponent,
      };
    } catch (error) {
      if (error instanceof ParseError) {
        throw new ParseError(
          error.message,
          `fields[${index}].component${error.path ? '.' + error.path : ''}`
        );
      }
      throw error;
    }
  });

  return {
    ...data,
    fields,
  } as DataRecordComponent;
}

/**
 * Parse VectorComponent
 */
export function parseVectorComponent(data: unknown): VectorComponent {
  if (!isObject(data)) {
    throw new ParseError('Vector must be an object');
  }

  if (data.type !== 'Vector') {
    throw new ParseError(`Expected type 'Vector', got '${data.type}'`);
  }

  if (!Array.isArray(data.coordinates)) {
    throw new ParseError('Vector.coordinates must be an array');
  }

  if (data.coordinates.length === 0) {
    throw new ParseError('Vector must have at least one coordinate');
  }

  // Parse coordinate components
  const coordinates = data.coordinates.map((coord: any, index: number) => {
    if (!isObject(coord)) {
      throw new ParseError(`Vector.coordinates[${index}] must be an object`);
    }

    if (!coord.name || typeof coord.name !== 'string') {
      throw new ParseError(`Vector.coordinates[${index}] must have a name property`);
    }

    if (!coord.component) {
      if (!coord.href) {
        throw new ParseError(`Vector.coordinates[${index}] must have either component or href`);
      }
      return coord;
    }

    try {
      const parsedComponent = parseDataComponent(coord.component);
      return {
        ...coord,
        component: parsedComponent,
      };
    } catch (error) {
      if (error instanceof ParseError) {
        throw new ParseError(
          error.message,
          `coordinates[${index}].component${error.path ? '.' + error.path : ''}`
        );
      }
      throw error;
    }
  });

  return {
    ...data,
    coordinates,
  } as VectorComponent;
}

/**
 * Parse DataChoiceComponent
 */
export function parseDataChoiceComponent(data: unknown): DataChoiceComponent {
  if (!isObject(data)) {
    throw new ParseError('DataChoice must be an object');
  }

  if (data.type !== 'DataChoice') {
    throw new ParseError(`Expected type 'DataChoice', got '${data.type}'`);
  }

  if (!Array.isArray(data.items)) {
    throw new ParseError('DataChoice.items must be an array');
  }

  if (data.items.length === 0) {
    throw new ParseError('DataChoice must have at least one item');
  }

  // Parse item components
  const items = data.items.map((item: any, index: number) => {
    if (!isObject(item)) {
      throw new ParseError(`DataChoice.items[${index}] must be an object`);
    }

    if (!item.name || typeof item.name !== 'string') {
      throw new ParseError(`DataChoice.items[${index}] must have a name property`);
    }

    if (!item.component) {
      if (!item.href) {
        throw new ParseError(`DataChoice.items[${index}] must have either component or href`);
      }
      return item;
    }

    try {
      const parsedComponent = parseDataComponent(item.component);
      return {
        ...item,
        component: parsedComponent,
      };
    } catch (error) {
      if (error instanceof ParseError) {
        throw new ParseError(
          error.message,
          `items[${index}].component${error.path ? '.' + error.path : ''}`
        );
      }
      throw error;
    }
  });

  return {
    ...data,
    items,
  } as DataChoiceComponent;
}

/**
 * Parse DataArrayComponent
 */
export function parseDataArrayComponent(data: unknown): DataArrayComponent {
  if (!isObject(data)) {
    throw new ParseError('DataArray must be an object');
  }

  if (data.type !== 'DataArray') {
    throw new ParseError(`Expected type 'DataArray', got '${data.type}'`);
  }

  if (!data.elementType) {
    throw new ParseError('DataArray requires elementType property');
  }

  const elementType = data.elementType as any;
  if (!isObject(elementType)) {
    throw new ParseError('DataArray.elementType must be an object');
  }

  if (!elementType.component && !elementType.href) {
    throw new ParseError('DataArray.elementType must have either component or href');
  }

  // Parse element type component if inline
  if (elementType.component) {
    try {
      const parsedComponent = parseDataComponent(elementType.component);
      return {
        ...data,
        elementType: {
          ...elementType,
          component: parsedComponent,
        },
      } as DataArrayComponent;
    } catch (error) {
      if (error instanceof ParseError) {
        throw new ParseError(error.message, `elementType.component${error.path ? '.' + error.path : ''}`);
      }
      throw error;
    }
  }

  return data as DataArrayComponent;
}

/**
 * Parse MatrixComponent
 */
export function parseMatrixComponent(data: unknown): MatrixComponent {
  if (!isObject(data)) {
    throw new ParseError('Matrix must be an object');
  }

  if (data.type !== 'Matrix') {
    throw new ParseError(`Expected type 'Matrix', got '${data.type}'`);
  }

  if (!data.elementType) {
    throw new ParseError('Matrix requires elementType property');
  }

  const elementType = data.elementType as any;
  if (!isObject(elementType)) {
    throw new ParseError('Matrix.elementType must be an object');
  }

  if (!elementType.component && !elementType.href) {
    throw new ParseError('Matrix.elementType must have either component or href');
  }

  // Parse element type component if inline
  if (elementType.component) {
    try {
      const parsedComponent = parseDataComponent(elementType.component);
      return {
        ...data,
        elementType: {
          ...elementType,
          component: parsedComponent,
        },
      } as MatrixComponent;
    } catch (error) {
      if (error instanceof ParseError) {
        throw new ParseError(error.message, `elementType.component${error.path ? '.' + error.path : ''}`);
      }
      throw error;
    }
  }

  return data as MatrixComponent;
}

/**
 * Parse DataStreamComponent
 */
export function parseDataStreamComponent(data: unknown): DataStreamComponent {
  if (!isObject(data)) {
    throw new ParseError('DataStream must be an object');
  }

  if (data.type !== 'DataStream') {
    throw new ParseError(`Expected type 'DataStream', got '${data.type}'`);
  }

  if (!data.elementType) {
    throw new ParseError('DataStream requires elementType property');
  }

  const elementType = data.elementType as any;
  if (!isObject(elementType)) {
    throw new ParseError('DataStream.elementType must be an object');
  }

  if (!elementType.component && !elementType.href) {
    throw new ParseError('DataStream.elementType must have either component or href');
  }

  // Parse element type component if inline
  if (elementType.component) {
    try {
      const parsedComponent = parseDataComponent(elementType.component);
      return {
        ...data,
        elementType: {
          ...elementType,
          component: parsedComponent,
        },
      } as DataStreamComponent;
    } catch (error) {
      if (error instanceof ParseError) {
        throw new ParseError(error.message, `elementType.component${error.path ? '.' + error.path : ''}`);
      }
      throw error;
    }
  }

  return data as DataStreamComponent;
}

/**
 * Parse GeometryComponent
 */
export function parseGeometryComponent(data: unknown): GeometryComponent {
  if (!isObject(data)) {
    throw new ParseError('Geometry must be an object');
  }

  if (data.type !== 'Geometry') {
    throw new ParseError(`Expected type 'Geometry', got '${data.type}'`);
  }

  return data as GeometryComponent;
}

/**
 * Parse any DataComponent - dispatcher function
 * 
 * This function validates structure during parsing and recursively parses nested components.
 */
export function parseDataComponent(data: unknown): DataComponent {
  if (!isObject(data)) {
    throw new ParseError('Data component must be an object');
  }

  if (!data.type || typeof data.type !== 'string') {
    throw new ParseError('Data component must have a type property');
  }

  // Dispatch to specific parser based on type
  switch (data.type) {
    // Simple components
    case 'Boolean':
      return parseBooleanComponent(data);
    case 'Text':
      return parseTextComponent(data);
    case 'Category':
      return parseCategoryComponent(data);
    case 'Count':
      return parseCountComponent(data);
    case 'Quantity':
      return parseQuantityComponent(data);
    case 'Time':
      return parseTimeComponent(data);

    // Range components
    case 'CategoryRange':
      return parseCategoryRangeComponent(data);
    case 'CountRange':
      return parseCountRangeComponent(data);
    case 'QuantityRange':
      return parseQuantityRangeComponent(data);
    case 'TimeRange':
      return parseTimeRangeComponent(data);

    // Aggregate components
    case 'DataRecord':
      return parseDataRecordComponent(data);
    case 'Vector':
      return parseVectorComponent(data);
    case 'DataChoice':
      return parseDataChoiceComponent(data);

    // Block components
    case 'DataArray':
      return parseDataArrayComponent(data);
    case 'Matrix':
      return parseMatrixComponent(data);
    case 'DataStream':
      return parseDataStreamComponent(data);

    // Geometry component
    case 'Geometry':
      return parseGeometryComponent(data);

    default:
      throw new ParseError(`Unknown or unsupported component type: ${data.type}`);
  }
}
