<template>
  <a-tabs v-model="tab" :default-active-key="activeTab" class="mf-project-tab none-select" @change="tabChange">
    <a-tab-pane v-if="isSiteAdmin()" id="domain_details" key="details" :tab="$t('Details')">
      <keep-alive>
        <domain-detail v-if="tab === 'details'" :active-tab="tab" :unsaved-tabs="unsavedTabs" @update-unsaved-tabs="updateUnsavedTabs" @load="load" />
      </keep-alive>
    </a-tab-pane>

    <a-tab-pane
      v-if="checkPermission(['ADMIN_ACCESS']) && checkPermission(['SAAS_ALM_LICENSE_VIEW']) && isSaaS"
      id="domain_license"
      key="license"
      :tab="$t('project.ALMLicense')"
    >
      <keep-alive>
        <domain-license v-if="tab === 'license'" :active-tab="tab" :unsaved-tabs="unsavedTabs" @update-unsaved-tabs="updateUnsavedTabs" />
      </keep-alive>
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import { isSiteAdmin } from '@/utils/permission'
import DomainDetail from './ProjectMiscellaneous'
import DomainLicense from './DomainLicense'
import { mapGetters } from 'vuex'
import { SERVER_TYPE } from '@/store/const'
import { eventListener } from '../event'
import { HELP_ON_THIS_PAGE } from 'config/help'

export default {
  components: { DomainDetail, DomainLicense },
  props: {
    activeTab: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tab: '',
      unsavedTabs: [],
      SERVER_TYPE
    }
  },

  computed: {
    ...mapGetters(['serverType']),
    isSaaS() {
      return SERVER_TYPE.Saas === this.serverType
    }
  },
  created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.projects.domain.details)
    this.tab = this.isSiteAdmin() ? 'details' : 'license'
    this.$emit('update:activeTab', this.tab)
  },
  beforeDestroy() {
    // this.$emit('update:activeTab', '')
    eventListener.remove('domainSelected')
  },
  methods: {
    isSiteAdmin,
    tabChange(key) {
      if (['details', 'license'].includes(key)) { this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.projects.domain[key]) }
      this.$emit('update:activeTab', key)
    },

    updateUnsavedTabs(type, tab) {
      if (type === 'add') {
        this.unsavedTabs.push(tab)
        this.unsavedTabs = [...new Set(this.unsavedTabs)]
      } else {
        this.unsavedTabs = this.unsavedTabs.filter(item => item !== tab)
      }
    },

    load(status) {
      this.$emit('load', status)
    }
  }
}
</script>

<style scoped lang="less">
.mf-project-tab {
  height: 100%;
}
</style>
