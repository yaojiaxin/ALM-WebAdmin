
import Layouts from '@/layouts'
import i18n from '@/locales'

const licenses = {
  path: '/licenses',
  name: 'licenses',
  nest: true,
  component: Layouts,
  meta: {
    title: i18n.tc('menu.Licenses'),
    icon: 'icon-licenses',
    permission: ['MY_CUSTOMER_CONTEXT_USAGE_REPORT_MODULE_ACCESS', 'SA_LICENSE_MANAGEMENT_MODULE_ACCESS'],
    switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_USAGE_REPORT_MODULE_ACCESS']
  },
  children: [{
    path: '/licenses/index',
    name: 'licenseManagement',
    meta: {
      title: i18n.tc('menu.LicenseManagement'),
      permission: ['SA_LICENSE_MANAGEMENT_MODULE_ACCESS'],
      switchPermission: ['SA_LICENSE_MANAGEMENT_MODULE_ACCESS']
    },
    component: () =>
      import('@/views/licenses/management/index.vue')
  },
  {
    path: '/licenses/usageReport',
    name: 'usageReport',
    meta: {
      title: i18n.tc('menu.LicenseUsageReport'),
      permission: ['MY_CUSTOMER_CONTEXT_USAGE_REPORT_MODULE_ACCESS'],
      switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_USAGE_REPORT_MODULE_ACCESS']
    },
    component: () =>
      import('@/views/licenses/usageReport/index.vue')
  }
  ]
}

export default licenses
