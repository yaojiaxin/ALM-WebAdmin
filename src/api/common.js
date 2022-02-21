import request from '@/utils/request'

export function getIsLDAP() {
  return request({
    // url: '/v2/sa/api/site-params/AUTHENTICATION',
    // method: 'get'
  })
}

export function login(data) {
  return request({
    url: '/authentication-point/alm-authenticate',
    method: 'post',
    headers: {
      'Content-Type': 'application/xml'
    },
    data: `<alm-authentication>
        <user>${data.username}</user>
        <password>${data.password}</password>
        </alm-authentication>`
  })
}

export function siteSession() {
  return request({
    url: '/rest/site-session',
    method: 'post'
  })
}

export function getSiteSession() {
  return request({
    url: '/rest/site-session',
    method: 'get'
  })
}

export function deleteSiteSession() {
  return request({
    url: '/rest/site-session',
    method: 'delete'
  })
}

export function logout() {
  return request({
    url: '/authentication-point/logout',
    method: 'get'
  })
}

export function isAuthenticated() {
  return request({
    url: '/rest/is-authenticated',
    method: 'get'
  })
}

// To distinguish the environment
export function getServerType() {
  return request({
    url: '/rest/serversettings',
    method: 'get',
    headers: {
      Accept: 'application/json',
      PtAL: 'WebAdmin'
    }
  })
}

// Get current user's role with permissions.
export function getPermission() {
  return request({
    url: '/v2/sa/api/permissions',
    method: 'get'
  })
}

export function getDeniedFeature() {
  return request({
    url: '/v2/sa/api/denied-features',
    method: 'get'
  })
}

export function getServerTime() {
  return request({
    url: '/rest/server/time',
    method: 'get'
  })
}

export function getKeyStorage() {
  return request({
    url: '/rest/key-storage',
    method: 'get',
    headers: {
      Ptal: 'webadmin'
    }
  })
}

export function generateCaptchaCK() {
  return request({
    url: '/authentication-point/generateCaptchaCk',
    method: 'post',
    headers: {
      Ptal: 'webadmin'
    }
  })
}

export function forgotPassword(data) {
  return request({
    url: '/rest/sspr',
    method: 'post',
    headers: {
      Ptal: 'webadmin'
    },
    data
  })
}

export function forgotUserName(data) {
  return request({
    url: '/rest/sspr/fln',
    method: 'post',
    headers: {
      Ptal: 'webadmin'
    },
    data
  })
}

export function changePassword(data) {
  return request({
    url: '/rest/sspr/cp',
    method: 'post',
    headers: {
      Ptal: 'webadmin'
    },
    data
  })
}

