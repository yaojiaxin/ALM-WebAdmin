import { getLocalStorage, setLocalStorage } from '@/utils/auth.js'
import {
  REFRESH_INTERVAL_COOKIE_NAME,
  QPM_BOUNDARY_CONDITION
} from '@/store/const.js'

export const getRefreshInterval = () => {
  return +getLocalStorage(REFRESH_INTERVAL_COOKIE_NAME) || -1
}

export const setRefreshInterval = interval => {
  if (
    interval !== QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.isMenuRefresh
  ) {
    if (interval > QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.max) {
      interval = QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.max
    } else if (
      interval < QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.min
    ) {
      interval = QPM_BOUNDARY_CONDITION.qpmGeneral.refreshInterval.min
    }
  }

  setLocalStorage(REFRESH_INTERVAL_COOKIE_NAME, interval)
}
