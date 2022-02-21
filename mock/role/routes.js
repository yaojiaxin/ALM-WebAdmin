// Just a mock data

export const constantRoutes = [
  {
    path: '/redirect',
    component: 'layouts/Layouts',
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: 'views/redirect/index'
      }
    ]
  },
  {
    path: '/login',
    component: 'views/login/index',
    hidden: true
  },
  {
    path: '/404',
    component: 'views/error-page/404',
    hidden: true
  }
]

export const asyncRoutes = [

  { path: '*', redirect: '/404', hidden: true }
]
