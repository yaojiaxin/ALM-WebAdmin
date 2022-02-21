import Vue from 'vue'
import mfConfirm from './index.vue'

const defaults = {
  title: null,
  message: '',
  type: '',
  confirmText: '',
  cancelText: ''
}

const ConfirmConstructor = Vue.extend(mfConfirm)

let currentConfirm, instance
let confirmQueue = []

const defaultCallback = action => {
  if (currentConfirm) {
    const callback = currentConfirm.callback

    if (typeof callback === 'function') {
      callback(action)
    }
  }

  if (currentConfirm.resolve) {
    if (action === 'confirm') {
      currentConfirm.resolve(action)
    }
  } else if (currentConfirm.reject && (action === 'cancel' || action === 'close')) {
    currentConfirm.reject(action)
  }
}

const initInstance = () => {
  instance = new ConfirmConstructor({
    el: document.createElement('div')
  })

  instance.callback = defaultCallback
}

const showNextConfirm = () => {
  if (!instance) {
    initInstance()
  }
  instance.action = ''

  if (!instance.visible) {
    if (confirmQueue.length > 0) {
      currentConfirm = confirmQueue.shift()

      const options = currentConfirm.options

      for (const prop in options) {
        // eslint-disable-next-line no-prototype-builtins
        if (options.hasOwnProperty(prop)) {
          instance[prop] = options[prop]
        }
      }

      if (options.callback === undefined) {
        instance.callback = defaultCallback
      }

      const oldCb = instance.callback
      instance.callback = (action, ins) => {
        oldCb(action, ins)
        showNextConfirm()
      }

      delete instance.$slots.default;

      ['modal', 'showClose', 'closeOnClickModal', 'closeOnPressEscape', 'closeOnHashChange'].forEach(prop => {
        if (instance[prop] === undefined) {
          instance[prop] = true
        }
      })

      document.body.appendChild(instance.$el)

      Vue.nextTick(() => {
        instance.visible = true
      })
    }
  }
}

const ConfirmBox = function(options, callback) {
  if (typeof options === 'string') {
    options = {
      message: options
    }

    if (typeof arguments[1] === 'string') {
      options.title = arguments[1]
    }
  } else if (options.callback && !callback) {
    callback = options.callback
  }

  if (typeof Promise !== 'undefined') {
    return new Promise((resolve, reject) => {
      confirmQueue.push({
        options: { ...defaults, ...ConfirmBox.defaults, ...options },
        callback: callback,
        resolve: resolve,
        reject: reject
      })

      showNextConfirm()
    })
  } else {
    confirmQueue.push({
      options: { ...defaults, ...ConfirmBox.defaults, ...options },
      callback
    })

    showNextConfirm()
  }
}

ConfirmBox.setDefaults = config => {
  ConfirmBox.defaults = config
}

ConfirmBox.confirm = (message, title, options) => {
  if (typeof title === 'object') {
    options = title
    title = ''
  } else if (title === undefined) {
    title = ''
  }

  return ConfirmBox({
    title: title,
    message: message,
    $type: 'confirm',
    ...options
  })
}

ConfirmBox.close = () => {
  instance.doClose()
  instance.visible = false
  confirmQueue = []
  currentConfirm = null
}

export default ConfirmBox
export { ConfirmBox }
