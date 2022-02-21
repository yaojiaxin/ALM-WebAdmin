import request from '@/utils/request'
import { urlEncode } from '@/utils'
import { getLocalStorage } from '@/utils/auth'
// get customers list
export function getCustomerList() {
  return request({
    url: `/v2/sa/api/customers`,
    method: 'get',
    headers: {
      'customer-id': +getLocalStorage('customerId'),
      'has-customer': true
    }
  })
}

// get customers list
// export function getActiveCustomersList(customerId) {
//   return request({
//     url: `/v2/sa/api/customers`,
//     method: 'get',
//     headers: {
//       'customer-id': customerId || 0,
//       'has-customer': true
//     }
//   })
// }

// create customers
export function addCustomer(data) {
  return request({
    url: `/v2/sa/api/customers`,
    method: 'post',
    data: {
      customer: { ...data }
    },
    headers: {
      'customer-id': data['customer-id'],
      'has-customer': true
    }
  })
}

// activate customers
export function activateCustomer(customerId) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(customerId)}/activate`,
    method: 'post'
  })
}

// deactivate customers
export function deactivateCustomer(customerId) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(customerId)}/deactivate`,
    method: 'post'
  })
}

// get customers details
export function getCustomerDetails({ id }) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(id)}`,
    method: 'get',
    headers: {
      'customer-id': id,
      'has-customer': true
    }
  })
}

// update customers details
export function updateCustomerDetails({ id, data }) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(id)}`,
    method: 'put',
    data: {
      customer: data
    },
    headers: {
      'customer-id': id,
      'has-customer': true
    }
  })
}

// get customers licenses
export function getCustomerLicenses(customerId) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(customerId)}/licenses`,
    method: 'get',
    headers: {
      'customer-id': customerId,
      'has-customer': true
    }
  })
}

// update customers licenses
export function updateCustomerLicenses(customerId, data) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(customerId)}/licenses`,
    method: 'put',
    data: {
      license: {
        'expiration-date': data.date,
        'projects-limit': data.limit,
        'license-statuses': { 'license-status': data.licenses }
      }
    },
    headers: {
      'customer-id': customerId,
      'has-customer': true
    }
  })
}

// get customers recipients
export function getCustomerRecipients({ id }) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(id)}/recipients`,
    method: 'get',
    headers: {
      'customer-id': id,
      'has-customer': true
    }
  })
}

// add customers recipients
export function addCustomerRecipients({ customerId, name, email }) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(customerId)}/recipients`,
    method: 'post',
    data: {
      'customer-recipient': {
        'recipient-name': name,
        'recipient-emails': email
      }
    },
    headers: {
      'customer-id': customerId,
      'has-customer': true
    }
  })
}

// update customers recipients
export function updateCustomerRecipients({ customerId, recipientName, data }) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(customerId)}/recipients/${urlEncode(recipientName)}`,
    method: 'put',
    data: {
      'customer-recipient': data
    },
    headers: {
      'customer-id': customerId,
      'has-customer': true
    }
  })
}

// delete customers recipients
export function deleteCustomerRecipients({ customerId, recipientName }) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(customerId)}/recipients/${urlEncode(recipientName)}`,
    method: 'delete',
    headers: {
      'customer-id': customerId,
      'has-customer': true
    }
  })
}

// delete customers
export function deleteCustomer({ customerId }) {
  return request({
    url: `/v2/sa/api/customers/${urlEncode(customerId)}`,
    method: 'delete'
  })
}

// Get customer global search users
export function getGlobalUsers() {
  return request({
    url: `/v2/sa/api/customers/global-search-users`,
    method: 'get'
  })
}

export function getCustomerLDAPs(customerId) {
  return request({
    url: `/v2/sa/api/customers/${customerId}/ldaps`,
    method: 'get'
  })
}

export function selectedCustomerLDAPs(customerId, data) {
  return request({
    url: `/v2/sa/api/customers/${customerId}/ldaps`,
    method: 'put',
    data
  })
}

export function getCustomerIDPs(customerId) {
  return request({
    url: `/v2/sa/api/customers/${customerId}/idps`,
    method: 'get'
  })
}

export function selectedCustomerIDPs(customerId, data) {
  return request({
    url: `/v2/sa/api/customers/${customerId}/idps`,
    method: 'put',
    data
  })
}

export function getAllLDAPSaas(customerId) {
  return request({
    url: `/v2/sa/api/customers/ldaps`,
    method: 'get'
  })
}

export function getAllLDAPOp(customerId) {
  return request({
    url: `/v2/sa/api/ldap-servers`,
    method: 'get'
  })
}

export function getAllIDPs(customerId) {
  return request({
    url: `/v2/sa/api/customers/idps`,
    method: 'get'
  })
}

export function getAllIDPsOp() {
  return request({
    url: `/v2/sa/api/customers/idps`,
    method: 'get'
  })
}
