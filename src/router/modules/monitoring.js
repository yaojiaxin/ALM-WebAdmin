import Layouts from '@/layouts'
import i18n from '@/locales'

const monitoring = {
  path: '/monitoring',
  name: 'monitoring',
  nest: true,
  component: Layouts,
  meta: {
    title: i18n.tc('menu.Monitoring'),
    icon: 'icon-monitoring',
    permission: ['MY_CUSTOMER_CONTEXT_USER_PROJECT_CONNECTIONS_MODULE_ACCESS', 'MY_CUSTOMER_CONTEXT_AUDIT_MODULE_ACCESS'],
    switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_USER_PROJECT_CONNECTIONS_MODULE_ACCESS', 'SWITCHED_CUSTOMER_CONTEXT_AUDIT_MODULE_ACCESS']
  },
  children: [{
    path: '/monitoring/connectedUsers',
    name: 'connectedUsers',
    meta: {
      title: i18n.tc('menu.ConnectedUsers'),
      permission: ['MY_CUSTOMER_CONTEXT_USER_PROJECT_CONNECTIONS_MODULE_ACCESS'],
      switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_USER_PROJECT_CONNECTIONS_MODULE_ACCESS']
    },
    component: () =>
      import('@/views/monitoring/connectedUsers.vue')
  },
  {
    path: '/monitoring/auditLog', // The route must be the specified route because the nested route cannot be determined during the post-login routing jump
    name: 'auditLog',
    meta: {
      title: i18n.tc('menu.AuditLog'),
      permission: ['MY_CUSTOMER_CONTEXT_AUDIT_MODULE_ACCESS'],
      switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_AUDIT_MODULE_ACCESS']
    },
    component: () =>
      import('@/views/monitoring/auditLog.vue')
  }]
}
export default monitoring
