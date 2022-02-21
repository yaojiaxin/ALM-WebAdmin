import Layouts from '@/layouts'
import i18n from '@/locales'

const configuration = {
  path: '/configuration',
  component: Layouts,
  name: 'config',
  nest: false,
  redirect: '/configuration',
  meta: {
    title: i18n.tc('menu.Configuration'),
    icon: 'icon-configuration',
    permission: ['SA_CONFIGURATION_MODULE_ACCESS'],
    switchPermission: ['SA_CONFIGURATION_MODULE_ACCESS']
  },
  children: [{
    path: '/configuration',
    name: 'configuration',
    component: () =>
      import('@/views/configuration/index.vue'),
    permission: ['SA_CONFIGURATION_MODULE_ACCESS'],
    switchPermission: ['SA_CONFIGURATION_MODULE_ACCESS']
  }]
}
export default configuration
