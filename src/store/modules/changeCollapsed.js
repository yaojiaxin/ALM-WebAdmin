const state = {
  isCollapsed: false
}

const mutations = {
  SET_COLLAPSED: (state, isCollapsed) => {
    state.isCollapsed = isCollapsed
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
