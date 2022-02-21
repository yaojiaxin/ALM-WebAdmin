import Layouts from '@/layouts'
import i18n from '@/locales'
import { AUTH_TYPE } from '@/store/const'
import store from '@/store'

const mainRouter = {
  path: '/',
  name: 'Layouts',
  nest: false,
  root: true,
  component: Layouts,
  redirect: '/user',
  meta: {
    permission: ['MY_CUSTOMER_CONTEXT_PROJECTS_MODULE_ACCESS',
      'MY_CUSTOMER_CONTEXT_CUSTOMERS_MODULE_ACCESS',
      'MY_CUSTOMER_CONTEXT_USERS_MODULE_ACCESS',
      'MY_CUSTOMER_CONTEXT_ROLES_MODULE_ACCESS',
      'MY_CUSTOMER_CONTEXT_POLICIES_VIEW'],
    switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_PROJECTS_MODULE_ACCESS', 'SWITCHED_CUSTOMER_CONTEXT_CUSTOMERS_MODULE_ACCESS',
      'SWITCHED_CUSTOMER_CONTEXT_USERS_MODULE_ACCESS', 'SWITCHED_CUSTOMER_CONTEXT_ROLES_MODULE_ACCESS',
      'SWITCHED_CUSTOMER_CONTEXT_AUTHENTICATION_MODULE_ACCESS']
  },
  children: [{
    path: '/projects',
    name: 'projects',
    component: () =>
      import('@/views/project/index.vue'),
    meta: {
      title: i18n.tc('menu.Projects'),
      icon: 'icon-projects',
      permission: ['MY_CUSTOMER_CONTEXT_PROJECTS_MODULE_ACCESS'],
      switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_PROJECTS_MODULE_ACCESS']
      // role: [OP_USER_ROLE.siteAdmin]
    }
  },
  {
    path: '/lab',
    name: 'lab',
    component: () =>
      import('@/views/lab/index.vue'),
    meta: {
      title: i18n.tc('menu.LabManagement'),
      icon: 'icon-labManagement',
      permission: ['SA_LAB_MANAGEMENT_MODULE_ACCESS'],
      license: ['LAB_MANAGEMENT_FEATURE']
    }
  },
  {
    path: '/customers',
    name: 'customers',
    component: () =>
      import('@/views/customers/customer.vue'),
    meta: {
      title: i18n.tc('menu.Customers'),
      icon: 'icon-customers',
      permission: ['MY_CUSTOMER_CONTEXT_CUSTOMERS_MODULE_ACCESS'],
      switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_CUSTOMERS_MODULE_ACCESS']
    }
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/views/user/index.vue'),
    meta: {
      title: i18n.tc('menu.UsersManagement'),
      icon: 'icon-usersManagement',
      permission: ['MY_CUSTOMER_CONTEXT_USERS_MODULE_ACCESS'],
      switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_USERS_MODULE_ACCESS']
    }
  },
  {
    path: '/role',
    name: 'role',
    component: () =>
      import('@/views/role/index.vue'),
    meta: {
      title: i18n.tc('menu.RoleManagement'),
      icon: 'icon-roleManagement',
      permission: ['MY_CUSTOMER_CONTEXT_ROLES_MODULE_ACCESS'],
      switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_ROLES_MODULE_ACCESS']
    }
  }
  ]
}

if (store.getters.authType !== AUTH_TYPE.SSO) {
  mainRouter.children.push(
    {
      path: '/authentication',
      name: 'authentication',
      component: () =>
        import('@/views/authentication/index.vue'),
      meta: {
        title: i18n.tc('menu.Authentication'),
        icon: 'icon-authentication',
        permission: ['MY_CUSTOMER_CONTEXT_AUTHENTICATION_MODULE_ACCESS'],
        switchPermission: ['SWITCHED_CUSTOMER_CONTEXT_AUTHENTICATION_MODULE_ACCESS']
      }
    }
  )
}

export default mainRouter
