
import Vue from 'vue'
import VueI18n from 'vue-i18n'

import messages from './messages'
import langConfig from '../../lang/config.json'

Vue.use(VueI18n)

const i18n = new VueI18n({
  silentTranslationWarn: true,
  locale: langConfig.default,
  fallbackLocale: langConfig.default,

  // set locale messages
  messages
})

// export function loadAntdLanguage (lang = langConfig.default) {
//   return import(``)
// }

export default i18n
