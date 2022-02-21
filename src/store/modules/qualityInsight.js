import { getQualityInsightSettings } from '@/api/tools.js'

const state = {
  isSiteQualityInsightEnabled: undefined
}

const mutations = {
  SET_IS_SITE_QUALITY_INSIGHT_ENABLED: (state, isEnabled) => {
    state.isSiteQualityInsightEnabled = isEnabled
  }
}

const actions = {
  async getIsSiteQualityInsightEnabled({ state, commit }) {
    if (state.isSiteQualityInsightEnabled === undefined) {
      try {
        const data = await getQualityInsightSettings()
        const isEnabled = !!data['quality-insight']['qis-enabled']
        commit('SET_IS_SITE_QUALITY_INSIGHT_ENABLED', isEnabled)
      } catch (error) {
        console.log(error)
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
