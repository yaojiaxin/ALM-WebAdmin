import Layouts from '@/layouts'
import i18n from '@/locales'

const servers = {
  path: '/servers',
  name: 'servers',
  component: Layouts,
  nest: true,
  meta: {
    title: i18n.tc('menu.Servers'),
    icon: 'icon-Servers',
    permission: ['SA_APPLICATION_SERVERS_MODULE_ACCESS', 'SA_DB_SERVERS_MODULE_ACCESS'],
    switchPermission: ['SA_APPLICATION_SERVERS_MODULE_ACCESS', 'SA_DB_SERVERS_MODULE_ACCESS']
  },
  children: [{
    path: '/servers/applicationServers',
    name: 'applicationServers',
    meta: {
      title: i18n.tc('menu.ApplicationServers'),
      permission: ['SA_APPLICATION_SERVERS_MODULE_ACCESS'],
      switchPermission: ['SA_APPLICATION_SERVERS_MODULE_ACCESS']
    },
    component: () =>
      import('@/views/servers/appServers/index.vue')
  },
  {
    path: '/servers/DBservers',
    name: 'DBservers',
    meta: {
      title: i18n.tc('menu.DBServers'),
      permission: ['SA_DB_SERVERS_MODULE_ACCESS'],
      switchPermission: ['SA_DB_SERVERS_MODULE_ACCESS'],
      license: ['DATABASE_SERVERS']
    },
    component: () =>
      import('@/views/servers/dbServers/index.vue')
  }]
}
export default servers
