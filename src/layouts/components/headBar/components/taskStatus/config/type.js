import i18n from '@/locales/index.js'

const getTypeByMap = (typeData, interType) => {
  let type = []
  for (const key in typeData) {
    const value = typeData[key]
    // eslint-disable-next-line no-unused-vars
    // replace the blank space in string to underline
    const interKey = value.replace(/\s+/g, '_')
    const interValue = i18n.t(`taskStatus.${interType}.${interKey}`)
    type = [...type, { label: interValue, value: interValue }]
  }
  return type
}

export const MAP_TASK_STATUS_TYPE = {
  All: 'All',
  Processing: 'Processing',
  Success: 'Success',
  Fail: 'Fail'
}

export const MAP_TASK_TYPE = {
  All: 'All',
  CREATE: 'Create(Import) Project',
  ENABLE_EXTENSION: 'Enable Extension',
  EXPORT: 'Export Project',
  VERIFY: 'Verify Project',
  REALIGN: 'Realign Repository',
  UPGRADE: 'Upgrade Project',
  REPAIR: 'Repair Project',
  CONVERT_TO_UNICODE: 'Convert Project To Unicode'
}

export const MAP_TASK_DOWNLOAD_TYPE = {
  create: 'creation',
  upgrade: 'upgrade',
  verify: 'verification',
  repair: 'repair',
  realign: 'alignment',
  enable_extension: 'extensions',
  export: 'export',
  convert_to_unicode: 'conversion'
}

export const taskStatusType = getTypeByMap(MAP_TASK_STATUS_TYPE, 'statusType')

export const taskType = getTypeByMap(MAP_TASK_TYPE, 'type')

