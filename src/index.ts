export { default as WfsEndpoint } from './wfs/endpoint.js';
export type {
  WfsVersion,
  WfsFeatureWithProps,
  WfsFeatureTypeSummary,
  WfsFeatureTypeBrief,
  FeatureGeometryType,
  FeaturePropertyType,
  WfsFeatureTypeFull,
  WfsFeatureTypePropDetails,
  WfsFeatureTypePropsDetails,
  WfsFeatureTypeUniqueValue,
  WfsGetFeatureOptions,
} from './wfs/model.js';
export { default as WmsEndpoint } from './wms/endpoint.js';
export type {
  WmsLayerFull,
  WmsVersion,
  WmsLayerSummary,
  WmsLayerAttribution,
} from './wms/model.js';
export { default as WmtsEndpoint } from './wmts/endpoint.js';
export type {
  WmtsLayerDimensionValue,
  WmtsLayerResourceLink,
  WmtsEndpointInfo,
  WmtsLayer,
  WmtsMatrixSet,
} from './wmts/model.js';
export type {
  Address,
  Contact,
  Provider,
  LayerStyle,
  BoundingBox,
  MetadataURL,
  FetchOptions,
  GenericEndpointInfo,
  MimeType,
  CrsCode,
} from './shared/models.js';
export { default as OgcApiEndpoint } from './ogc-api/endpoint.js';
export * from './ogc-api/model.js';
export { default as CSAPINavigator } from './ogc-api/csapi/navigator.js';
export { TypedCSAPINavigator } from './ogc-api/csapi/typed-navigator.js';
export type { TypedFetchOptions } from './ogc-api/csapi/typed-navigator.js';
export * from './ogc-api/csapi/model.js';

// Export parsers and their types
export * from './ogc-api/csapi/parsers/index.js';

// Export request builders
export * from './ogc-api/csapi/request-builders.js';

// Export feature types (selective to avoid conflicts)
export type {
  SystemFeature,
  SystemFeatureCollection,
  DeploymentFeature,
  DeploymentFeatureCollection,
  ProcedureFeature,
  ProcedureFeatureCollection,
  SamplingFeature,
  SamplingFeatureCollection,
  PropertyFeature,
  PropertyFeatureCollection,
  DatastreamFeature,
  DatastreamFeatureCollection,
  ControlStreamFeature,
  ControlStreamFeatureCollection,
} from './ogc-api/csapi/geojson/index.js';

// Export validation functions
export {
  validateSystemFeature,
  validateSystemFeatureCollection,
  validateDeploymentFeature,
  validateDeploymentFeatureCollection,
  validateProcedureFeature,
  validateProcedureFeatureCollection,
  validateSamplingFeature,
  validateSamplingFeatureCollection,
  validatePropertyFeature,
  validatePropertyFeatureCollection,
  validateDatastreamFeature,
  validateDatastreamFeatureCollection,
  validateControlStreamFeature,
  validateControlStreamFeatureCollection,
  validateCSAPIFeature,
} from './ogc-api/csapi/validation/index.js';

export { default as TmsEndpoint } from './tms/endpoint.js';
export * from './tms/model.js';
export { default as StacEndpoint } from './stac/endpoint.js';
export * from './stac/model.js';
export type {
  GetCollectionItemsOptions,
  StacEndpointInfo,
  StacItemsDocument,
} from './stac/index.js';

export { useCache, clearCache } from './shared/cache.js';
export {
  sharedFetch,
  setFetchOptions,
  resetFetchOptions,
} from './shared/http-utils.js';
export {
  check,
  ServiceExceptionError,
  EndpointError,
} from './shared/errors.js';

export { enableFallbackWithoutWorker } from './worker/index.js';
import './worker-fallback/index.js';
