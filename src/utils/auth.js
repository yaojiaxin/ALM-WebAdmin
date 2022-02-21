/** use localStorage */
export const getLocalStorage = key => localStorage.getItem(key)

export const setLocalStorage = (key, value) =>
  localStorage.setItem(key, value)

export const removeLocalStorage = key => localStorage.removeItem(key)
/** use localStorage */

/** login */
const key = 'isLogin'
export function getIsLogin() {
  return Boolean(getLocalStorage(key))
}

export function setIsLogin(isLogin) {
  return setLocalStorage(key, isLogin)
}

export function removeToken() {
  return removeLocalStorage(key)
}
/** login */

export function setName(name) {
  return setLocalStorage('name', name)
}

export function setActiveCustomerId(id) {
  return setLocalStorage('activeCustomerId', id)
}

export function setCustomerId(id) {
  return setLocalStorage('customerId', id)
}
