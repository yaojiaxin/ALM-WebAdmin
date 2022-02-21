const events = []

export const eventEmitter = {
  emit: function(eventName, params) {
    const callbackArr = events[eventName]
    if (callbackArr && callbackArr.length) {
      // callbackArr[0](params)
      for (let i = 0; i < callbackArr.length; i++) {
        callbackArr[i](params)
      }
    }
  },

  isEmit: function(eventName) {
    return !!events[eventName]
  }
}

export const eventListener = {
  on: function(eventName, callback) {
    if (!events[eventName]) {
      events[eventName] = []
    }
    events[eventName].push(callback)
  },

  remove: function(eventName, callback) {
    const callbackArr = events[eventName]
    if (callbackArr && callbackArr.length) {
      const index = callbackArr.indexOf(callback)
      callbackArr.splice(index, 1)
    }
  }
}
