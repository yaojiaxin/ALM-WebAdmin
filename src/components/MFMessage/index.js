import Vue from 'vue'
import Main from './main'

const MessageConstructor = Vue.extend(Main)

let instance
const instances = []
let seed = 1
let defaultOptions = {
  duration: 3,
  top: 24,
  maxCount: -1
}

const div = document.createElement('div')
div.className = 'ant-message'

const Message = function(options) {
  options = { ...defaultOptions, ...options }

  if (typeof options === 'string') {
    options = {
      content: options,
      ...defaultOptions
    }
  }

  const userOnClose = options.onClose
  const id = 'message_' + seed++

  options.onClose = function() {
    Message.close(id, userOnClose)
  }
  instance = new MessageConstructor({
    data: options
  })
  instance.id = id

  instance.$mount()
  document.body.appendChild(div)
  div.appendChild(instance.$el)

  let verticalOffset = options.offset || 24

  instances.forEach(item => {
    verticalOffset += item.$el.offsetHeight + 16
  })
  instance.top = verticalOffset
  instance.duration = options.duration
  instance.visible = true

  // instance.$el.style.zIndex = 9999
  instances.push(instance)

  Message.instances = instances

  if (options.maxCount > 0) {
    for (let i = instances.length - options.maxCount - 1; i >= 0; i--) {
      instances[i].close()
    }
  }

  return instance
}
const types = ['success', 'info', 'warning', 'error', 'loading']

types.forEach(function(type) {
  Message[type] = (options, duration) => {
    if (typeof options === 'string') {
      options = {
        content: options
      }
    }
    options.type = type

    if (duration) {
      options.duration = duration
    }

    if (type === 'error') {
      options.duration = 0
    }

    return Message(options)
  }
})

Message.close = function(id, userOnClose) {
  const len = instances.length
  let index = -1
  let removeHeight

  for (let i = 0; i < len; i++) {
    if (id === instances[i].id) {
      removeHeight = instances[i].$el.offsetHeight
      index = i

      if (typeof userOnClose === 'function') {
        userOnClose(instances[i])
      }
      instances.splice(i, 1)
      break
    }
  }
  if (len <= 1 || index === -1 || index > instances.length - 1) return

  for (let i = index; i < len - 1; i++) {
    const dom = instances[i].$el
    dom.style.top = parseInt(dom.style.top, 10) - removeHeight - 16 + 'px'
  }
}

Message.destroy = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close()
  }
}

Message.config = function(options) {
  defaultOptions = { ...defaultOptions, ...options }
}

Message.hide = function() {
  Message.close()
}

export default Message
