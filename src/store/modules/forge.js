import { getKeyStorage } from '@/api/common'

const state = {
  publicKeyPem: '',

  prefix: ''
}

const mutations = {
  SET_PREFIX: (state, prefix) => {
    state.prefix = prefix
  },

  SET_PUBLICKKEY: (state, publicKey) => {
    state.publicKeyPem = publicKey
  }
}

const actions = {
  getKey({ commit, state }) {
    if (!state.prefix && !state.publicKeyPem) {
      getKeyStorage().then(data => {
        const storage = data['key-storage']
        commit('SET_PREFIX', storage.prefix)
        commit('SET_PUBLICKKEY', storage['public-key'])
      }).catch()
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
