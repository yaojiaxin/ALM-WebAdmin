import MfConfirm from './main.vue'
import Vue from 'vue'
import i18n from '@/locales'

const defaults = {
  visible: false,
  title: i18n.tc('confirm'),
  cancelText: i18n.tc('no'),
  confirmText: i18n.tc('yes'),
  message: ''
}

const MfConfirmConstructor = Vue.extend(MfConfirm)

const install = (options = {}) => {
  options = Object.assign({}, defaults, options)

  const parent = document.body

  const instance = new MfConfirmConstructor({
    el: document.createElement('div'),
    data: options
  })

  parent.appendChild(instance.$el)

  Vue.nextTick(() => {
    instance.visible = true
  })

  return instance
}

export default install
