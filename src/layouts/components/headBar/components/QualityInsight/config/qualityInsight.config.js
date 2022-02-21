export const dataWrapperMap = {
  // getQualityInsightSettings
  qualityInsight: 'quality-insight',
  // getGlobalUsers
  users: 'users',
  user: 'user',
  totalUserCount: '@total-results'
}

export const fieldMap = {
  searchServerUrl: 'search-server-url',
  searchServerUser: 'search-server-user',
  status: 'qis-enabled'
}

export const Placeholders = {
  QUALITY_INSIGHT_SERVER: '<http://Host:Port/>'
}

export const userFieldMap = {
  isActive: 'is-active'
}

export const createQualityInsightInfo = defaultValue => ({
  [fieldMap.searchServerUrl]: defaultValue,
  [fieldMap.searchServerUser]: defaultValue,
  [fieldMap.status]: false
})
