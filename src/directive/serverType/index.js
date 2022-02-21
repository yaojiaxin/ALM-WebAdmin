import store from '@/store'
function checkServerType(el, binding) {
  const { value } = binding
  const serverType = store.getters && store.getters.serverType
  const authType = store.getters && store.getters.authType

  if (value && value instanceof Array && value.length >= 1) {
    if (value.length === 1) {
      if (!value.includes(serverType)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      if (!(value.includes(authType) && value.includes(serverType))) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  } else {
    throw new Error('need serverType')
  }
}

export default {
  key: 'serverType',
  func: {
    inserted(el, binding) {
      checkServerType(el, binding)
    },
    update(el, binding) {
      checkServerType(el, binding)
    }
  }
}
