// ==============================================
// KW APPS - Admin Generator Module Exports
// ==============================================
// Central export for admin dashboard generation
// ==============================================

// Schema Analyzer exports
export {
  SchemaAnalyzer,
  analyzeProjectSchema,
  getDefaultContent,
  type ContentType,
  type FieldType,
  type EditableField,
  type ContentSection,
  type ProjectSchema,
  DETECTION_PATTERNS,
  CONTENT_TYPE_FIELDS,
} from './schema-analyzer'

// Dashboard Generator exports
export {
  DashboardGenerator,
  generateAdminDashboard,
  type GeneratedDashboard,
  type DashboardConfig,
} from './dashboard-generator'
