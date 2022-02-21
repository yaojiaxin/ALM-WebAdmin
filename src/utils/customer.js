import { ROOT_CUSTOMER_ID } from '@/store/const'
import { getLocalStorage } from '@/utils/auth'

// Determine if it is an array
function isArray(arr) {
  return Array.isArray(arr)
}

export function treeToList(treeData, arr) {
  const tree = isArray(treeData) ? treeData : [treeData]

  tree.forEach(item => {
    item.icon = item['customer-id'] === ROOT_CUSTOMER_ID ? 'icon-CustomerSetting' : item['is-owning-customer'] ? 'icon-owner_customer' : 'icon-end_customer'
    arr.push(item)
    if (item['sub-customers']) {
      treeToList(item['sub-customers'].customer, arr)
    }
  })
}

export function formatCustomerTree(treeData) {
  const tree = []

  treeData.forEach(item => {
    item.slots = {
      icon: initNodeIcon(item)
    }

    if (item['sub-customers']) {
      const customers = item['sub-customers'].customer
      if (customers) {
        item['sub-customers'] = formatCustomerTree(isArray(customers) ? customers : [customers])
      }
    }
    tree.push(item)
  })

  return tree
}

export function initNodeIcon(node) {
  if (node && node['customer-id'] === ROOT_CUSTOMER_ID) {
    return 'customers'
  } else if (node) {
    if (node['is-owning-customer']) {
      return node['is-active'] ? 'owner-active' : 'owner-inactive'
    } else {
      return node['is-active'] ? 'end-active' : 'end-inactive'
    }
  }
}

// clone customer tree
export function copyCustomersTree(trees) {
  const Tree = isArray(trees) ? trees : [trees]
  const arr = []

  Tree.forEach(tree => {
    const tmp = {
      key: tree['customer-id'] + '',
      value: tree['customer-name'],
      label: tree['customer-name'],
      scopedSlots: {
        title: tree.icon
      }
    }

    if (tree['sub-customers']) {
      tmp.children = copyCustomersTree(tree['sub-customers'])
    }

    arr.push(tmp)
  })

  return arr
}

// is switch root customer
export function isSwitchRootCustomer() {
  if (+getLocalStorage('activeCustomerId')) {
    return parseInt(getLocalStorage('activeCustomerId')) !== ROOT_CUSTOMER_ID
  }
  return false
}

