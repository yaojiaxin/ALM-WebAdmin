import store from '@/store'
import { ROLE, AUTH_TYPE } from '@/store/const'

export const checkPermission = (permissions, switchPermissions) => {
  const activeCustomer = store.getters.activeCustomerId ? parseInt(store.getters.activeCustomerId) : 0
  // current user is switch customer
  if (activeCustomer !== store.getters.customerId && switchPermissions) {
    if (switchPermissions && permissions instanceof Array && permissions.length > 0) {
      const userPermission = store.getters.permission

      return userPermission.findIndex(p => switchPermissions.includes(p['permission-name'])) > -1
    }
  } else {
    if (permissions && permissions instanceof Array && permissions.length > 0) {
      const userPermission = store.getters.permission || []

      return userPermission.findIndex(p => permissions.includes(p['permission-name'])) > -1
    } else {
      return false
    }
  }
}

export const isNotDeniedFeature = (license) => {
  if (license && license instanceof Array && license.length > 0) {
    const userDeniedFeature = store.getters.deniedFeature || []

    return !(userDeniedFeature.findIndex(p => license.includes(p)) > -1)
  } else {
    return true
  }
}

export const isSiteAdmin = () => {
  if (store.getters.roleId === ROLE.SiteAdmin) {
    return true
  }
  return false
}

export const isCustomerAdmin = () => {
  if (store.getters.roleId === ROLE.CustomerAdmin) {
    return true
  }
  return false
}

export const isBasicUser = () => {
  if (store.getters.roleId === ROLE.BasicUser) {
    return true
  }
  return false
}

export const activeCustomerIsRootCustomer = () => {
  if (parseInt(store.getters.activeCustomerId) === 0) {
    return true
  }
  return false
}

export const myCustomerIsRootCustomer = () => {
  if (parseInt(store.getters.customerId) === 0) {
    return true
  }
  return false
}

/**
 * judge current env is ldap
 * can't use AUTH_TYPE.LDAP directly
 */
export const isLDAP = () => store.getters.canChangePassword === false && store.getters.authType === AUTH_TYPE.ALM
