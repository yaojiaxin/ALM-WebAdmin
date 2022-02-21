import permission from './permission'
import serverType from './serverType'
import tableScroll from './tableScroll'

const directives = [permission, serverType, tableScroll]
export default {
  install: Vue => {
    if (directives.length && directives.length > 0) {
      directives.forEach(item => {
        Vue.directive(item.key, item.func)
      })
    }
  }
}
