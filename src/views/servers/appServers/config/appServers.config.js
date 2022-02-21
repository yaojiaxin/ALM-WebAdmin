/**
 * this file is to define field orm about api data
 */
import i18n from '@/locales/index.js'

export const dataWrapperMap = {
  wrapper: 'servers',
  serverList: 'server',
  server: 'server',
  totalResults: '@total-results'
}

export const fieldMap = {
  // basic info
  id: 'id',
  name: 'name',
  address: 'address',
  isActive: 'is-active',
  serverType: 'server-type',
  // client
  clientLogLevel: 'qc-log-level',
  clientLogLines: 'qc-log-lines',
  clientLogDays: 'qc-log-life-time',
  clientLogFileLocation: 'qc-log-path',
  // SA
  SALogLevel: 'sa-log-level',
  SALogLines: 'sa-log-lines',
  SALogDays: 'sa-log-life-time',
  SALogFileLocation: 'sa-log-path',
  // PPaT
  PPaTLogLevel: 'qpm-log-level',
  PPaTLogLines: 'qpm-log-lines',
  PPaTLogDays: 'qpm-log-life-time',
  PPaTLogFileLocation: 'qpm-log-path',
  // Miscellaneous
  maxDatabaseConnections: 'max-handlers'
}

// app servers log level
// key => show, value => put parameter
export const APP_SERVERS_LOG_LEVEL = {
  NONE: i18n.t('servers.LogLevelNone'),
  ERROR: i18n.t('servers.LogLevelError'),
  WARNING: i18n.t('servers.LogLevelWarning'),
  FLOW: i18n.t('servers.LogLevelFlow'),
  DEBUG: i18n.t('servers.LogLevelDebug')
}
