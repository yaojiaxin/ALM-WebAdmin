
// server type
export const SERVER_TYPE = {
  Saas: 'SaaS',
  OnPremise: 'On-Premise'
}

// auth type
export const AUTH_TYPE = {
  SSO: 2,
  ALM: 0,
  LDAP: 'LDAP'
}

// databse type
export const DATABASE_TYPE = {
  None: 0,
  MSSQL: 2,
  Oracle: 3
}

export const ROLE = {
  SiteAdmin: 10,
  CustomerAdmin: 2,
  BasicUser: 1
}

// default role
export const OP_USER_ROLE = {
  siteAdmin: 'Site Admin',
  basicUser: 'basic-user'
}

// max connection domain
export const MAX_CONNECTIONS = 999999

// max TableData  sql data
export const SHOW_TABLE_DATA = 200

// page size
export const PAGE_SIZE = 10
// page size
export const PAGE_SIZE_25 = 25
// page size list
export const PAGE_SIZE_LIST = ['25', '50', '100']

// tree select max-tag-count
export const MAX_TAG_COUNT = 3

// default password
export const DEFAULT_PASSWORD = '      '

// configuration mail setting
export const MAIL_RESTRICTION_LEVEL = 'MAIL_RESTRICTION_LEVEL'

export const AUTOMATIC_UPGRADE_PRIORITY_TOP_RANGE = 'AUTOMATIC_UPGRADE_PRIORITY_TOP_RANGE'

// digital input max length
export const MAXLENGTH = 9

// licenses input max
export const LICENSESMAXLENGTH = 999999999

// project status
export const PROJECT_STATUS = {
  // Active: 'Active',
  // Inactive: 'Inactive',
  // TargetBorrow: 'In creation',
  // SourceBorrow: 'Source for other project(s) that are currently in creation',
  // ContinueBorrow: 'Stopped during creation. Please, ask for support',
  // Export: 'Export',
  // Import: 'Import',
  // Maintenance: 'Maintenance',
  // MaintenanceResume: 'MaintenanceResume',
  // Unknown: 'Unknown'

  // Value Indicates the mapping path of the internationalization file
  Active: 'project.active',
  Inactive: 'project.inactive',
  TargetBorrow: 'project.project_status_map.TargetBorrow',
  SourceBorrow: 'project.project_status_map.SourceBorrow',
  ContinueBorrow: 'project.project_status_map.ContinueBorrow',
  Export: 'export',
  Import: 'import',
  Maintenance: 'project.project_status_map.Maintenance',
  MaintenanceResume: 'project.project_status_map.MaintenanceResume',
  Unknown: 'project.project_status_map.Unknown'
}

export const ROOT_CUSTOMER_ID = 0

// Create Quality Center demo project
export const QUALITY_PROJECT_DEMO = 'QualityCenter_Demo'

// Create Quality Center demo project
export const QUALITY_DOMAIN_DEMO = 'DEFAULT'

// user projects
export const USER_PROJECTS = {
  LabProject: 'LAB_PROJECT'
}

// project unlimited
export const PROJECT_UNLIMITED = -1

// sass info res
export const SASS_INFO_RES = {
  ok: 'OK',
  error: 'ERROR'
}

// sass info res
export const DB_PASSWORD_TYPE = {
  userPassword: 'userPassword',
  dbPassword: 'dbPassword'
}

export const ADD_DB_SERVER = {
  sqlServer: 'jdbc:sqlserver://',
  oracle_thin: 'jdbc:oracle:thin:@//',
  sql_port: '1433',
  oracle_port: '1521',
  hostName: '%HOST_NAME%',
  serviceName: '%SERVICE_NAME%'
}

export const LDAP_DEFAULT_VALUES = {
  timeout: 25,
  base: '',
  filter: '(objectClass=*)',
  'search-limit': 100,
  'search-criteria': {
    email: 'mail',
    'full-name': 'cn',
    phone: 'telephoneNumber',
    description: 'description'
  }
}
export const LDAP_DEFAULT_VALUES_ACTIVE_DIRECTORY = 'sAMAccountName'
export const LDAP_DEFAULT_VALUES_LDAP = 'uid'
export const LDAP_DEFAULT_VALUES_SEARCH_CRITERIA = {
  'full-name': 'cn',
  description: 'description',
  email: 'mail',
  phone: 'telephoneNumber'
}

// pp&t refresh interval cookie name
export const REFRESH_INTERVAL_COOKIE_NAME = 'qpmRefreshInterval'

export const PROJECT_LIMIT_STATUS = {
  noLimit: 204,
  maxLimit: 201,
  exceedLimit: 400
}

export const APP_SERVER_BOUNDARY_CONDITION = {
  LogLines: {
    min: 0,
    max: 9999999
  },
  LogDays: {
    unlimited: -1,
    min: 1,
    max: 365
  },
  DatabaseConnections: {
    min: 0,
    max: 99999
  }
}

export const QPM_BOUNDARY_CONDITION = {
  qpmGeneral: {
    refreshInterval: {
      isMenuRefresh: -1,
      default: 60,
      min: 1,
      max: 9999
    }
  },
  qpmPurge: {
    periodDays: {
      min: 0,
      max: Math.pow(2, 31) - 1
    }
  },
  qpmAdvanced: {
    engineCount: {
      min: 1,
      max: 16
    },
    engineThrottle: {
      min: 0,
      max: 10
    }
  }
}

export const MODAL_WIDTH = {
  withoutNewline: 300,
  withNewline: 150
}
