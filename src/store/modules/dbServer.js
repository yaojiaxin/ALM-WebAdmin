// import { getDbServerDetail } from '@/api/servers'
const state = {
  dbServerForm: null
}

const mutations = {
  SET_DB_SERVER_FORM: (state, dbServerForm) => {
    state.dbServerForm = dbServerForm
  }
}

export default {
  namespaced: true,
  state,
  mutations
}

