const state = {
  isTaskReminderVisible: false
}

const mutations = {
  SET_IS_TASK_REMINDER_VISIBLE: (state, isVisible) => {
    state.isTaskReminderVisible = isVisible
  }
}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
