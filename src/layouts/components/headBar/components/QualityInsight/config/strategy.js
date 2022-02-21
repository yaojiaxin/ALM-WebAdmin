import { isChangeObjorArr } from '@/utils/index.js'

// initialQualityInsightInfo-qualityInsightStatus
export const strategyMap = {
  FALSE_FLASE: 'false-false',
  FALSE_TRUE: 'false-true',
  TRUE_FALSE: 'true-false',
  TRUE_TRUE: 'true-true'
}

const isSaveBtnDisabled = (initialInfo, currInfo) =>
  isChangeObjorArr(initialInfo, currInfo)

export const updateSaveBtnStatusStrategies = {
  [strategyMap.FALSE_FLASE]: () => true,
  [strategyMap.FALSE_TRUE]: isSaveBtnDisabled,
  [strategyMap.TRUE_FALSE]: () => false,
  [strategyMap.TRUE_TRUE]: isSaveBtnDisabled
}
