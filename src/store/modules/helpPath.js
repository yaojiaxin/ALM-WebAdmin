const state = {
  helpUrl: ''
}

const mutations = {
  SET_HELPLINK: (state, helpUrl) => {
    state.helpUrl = helpUrl
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
