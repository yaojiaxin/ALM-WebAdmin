import { getCustomerList } from '@/api/customers'
import { treeToList, formatCustomerTree } from '@/utils/customer'
import store from '../index'

const state = {
  customerList: [],

  selectCustomerTreeNode: null
}

const mutations = {
  SET_CUSTOMERLIST: (state, customerList) => {
    state.customerList = customerList
  },

  SET_CUSTOMERTREENODE: (state, selectCustomerTreeNode) => {
    state.selectCustomerTreeNode = selectCustomerTreeNode
  }
}

const actions = {
  async getCustomers({ state, commit }, isReload) {
    try {
      if (state.customerList.length === 0 || isReload) {
        const res = await getCustomerList()
        const customers = Array.isArray(res.customer) ? res.customer : [res.customer]
        const arr = []
        treeToList(customers, arr)

        commit('SET_CUSTOMERLIST', arr)
        return customers
      } else {
        return state.customerList
      }
    } catch (e) {
      console.log(e)
      return []
    }
  },

  getCustomerTree({ dispatch }, customerId) {
    return new Promise((resolve, reject) => {
      // getCustomerList().then(res => {
      // const customers = Array.isArray(res.customer) ? res.customer : [res.customer]
      let findCustomerId = store.getters.activeCustomerId
      if (typeof customerId === 'number' && parseInt(customerId) > -1) {
        findCustomerId = customerId
      }

      if (state.customerList.length === 0) {
        dispatch('getCustomers').then(() => {
          const currentCustomers = state.customerList.find(i => i['customer-id'] === parseInt(findCustomerId))

          resolve(formatCustomerTree([currentCustomers]))
        })
      } else {
        const currentCustomers = state.customerList.find(i => i['customer-id'] === parseInt(findCustomerId))

        resolve(formatCustomerTree([currentCustomers]))
      }

      // }).catch((e) => {
      //   reject(e)
      // })
    })
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
