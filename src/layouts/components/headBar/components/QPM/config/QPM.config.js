/**
 * this file is to define field orm about api data
 */

import i18n from '@/locales/index.js'

export const QPMDataWrapperMap = {
  qpmSettings: 'qpm-settings',
  qpmGeneral: 'qpm-general',
  qpmScheduling: 'qpm-scheduling',
  qpmPurge: 'qpm-purge',
  qpmAdvanced: 'qpm-advanced'
}

export const QPMFieldMap = {
  qpmGeneral: {
    isEnabled: 'is-qpm-enabled'
  },

  qpmScheduling: {
    isAutoRun: 'is-qpm-scheduling-enabled',
    startTime: 'automatic-scheduling-start',
    recurrence: 'automatic-scheduling-recurrence',
    isAbortCalc: 'is-qpm-calculation-duration-limit-enabled',
    calcDurationLimit: 'qpm-calculation-duration-limit'
  },

  qpmPurge: {
    periodDays: 'qpm-purge-period-days',
    rowsLimit: 'qpm-cleaner-job-max-rows-purged-in-one-round'
  },

  qpmAdvanced: {
    engineCount: 'qpm-engines-per-site',
    engineThrottle: 'qpm-engines-speed',
    timeoutSeconds: 'ppt-engines-timeout-seconds',
    intervalMillisec: 'ppt-main-controller-interval-millisec'
  }
}

export const QPMStatusFieldMap = {
  currentStatus: 'current-status',
  isEnabled: 'is-qpm-enabled'
}

export const QPMStatusMap = {
  active: 'ACTIVE',
  inactive: 'INACTIVE'
}

export const schedulingStartTimeMap = [
  { title: `00:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '00:00:00' },
  { title: `01:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '01:00:00' },
  { title: `02:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '02:00:00' },
  { title: `03:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '03:00:00' },
  { title: `04:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '04:00:00' },
  { title: `05:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '05:00:00' },
  { title: `06:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '06:00:00' },
  { title: `07:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '07:00:00' },
  { title: `08:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '08:00:00' },
  { title: `09:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '09:00:00' },
  { title: `10:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '10:00:00' },
  { title: `11:00 ${i18n.t('tools.QPM.Scheduling.AM')}`, value: '11:00:00' },
  { title: `12:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '12:00:00' },
  { title: `01:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '13:00:00' },
  { title: `02:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '14:00:00' },
  { title: `03:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '15:00:00' },
  { title: `04:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '16:00:00' },
  { title: `05:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '17:00:00' },
  { title: `06:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '18:00:00' },
  { title: `07:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '19:00:00' },
  { title: `08:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '20:00:00' },
  { title: `09:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '21:00:00' },
  { title: `10:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '22:00:00' },
  { title: `11:00 ${i18n.t('tools.QPM.Scheduling.PM')}`, value: '23:00:00' }
]

export const schedulingRecurrenceMap = [
  { title: `12 ${i18n.t('tools.QPM.Scheduling.hours')}`, value: 720 },
  { title: `24 ${i18n.t('tools.QPM.Scheduling.hours')}`, value: 1440 }
]

export const schedulingCalcDurationLimitMap = [
  { title: `1 ${i18n.t('tools.QPM.Scheduling.hour')}`, value: 60 },
  { title: `2 ${i18n.t('tools.QPM.Scheduling.hours')}`, value: 120 },
  { title: `3 ${i18n.t('tools.QPM.Scheduling.hours')}`, value: 180 },
  { title: `4 ${i18n.t('tools.QPM.Scheduling.hours')}`, value: 240 },
  { title: `5 ${i18n.t('tools.QPM.Scheduling.hours')}`, value: 300 },
  { title: `6 ${i18n.t('tools.QPM.Scheduling.hours')}`, value: 360 },
  { title: `7 ${i18n.t('tools.QPM.Scheduling.hours')}`, value: 420 },
  { title: `8 ${i18n.t('tools.QPM.Scheduling.hours')}`, value: 480 }
]
