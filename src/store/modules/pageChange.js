const state = {
  isPageChanged: false,

  runFunc: null,
  parameters: []
}

const mutations = {
  SET_ISCHANGED: (state, isChanged) => {
    state.isPageChanged = isChanged
  },

  SET_FUNC: (state, runFunc) => {
    state.runFunc = runFunc
  },

  SET_PARAMS: (state, params) => {
    state.parameters = params
  }
}

const actions = {
  pageChanged({ commit }, { func, params }) {
    commit('SET_ISCHANGED', true)
    commit('SET_FUNC', func)
    commit('SET_PARAMS', params)
  },

  async runSave({ state }) {
    try {
      await state.runFunc.apply(null, state.parameters)
    } catch (e) {
      console.log(e)
    }
  },

  resetPageChanged({ commit }) {
    commit('SET_ISCHANGED', false)
    commit('SET_FUNC', null, [])
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
