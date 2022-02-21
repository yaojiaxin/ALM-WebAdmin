<template>
  <div id="app-servers" class="app-servers-wrapper">
    <!-- tools bar -->
    <app-servers-tools-bar @trigger:refresh="onRefresh" />

    <!-- body -->
    <div
      :class="[
        'app-servers-body',
        !hasCustomerWrapper && 'no-customer-wrapper'
      ]"
    >
      <!-- body left -->
      <app-servers-side
        ref="appServerSideRef"
        @update:selectedServerId="updateSelectedServerId"
      />

      <!-- body right -->
      <app-servers-content
        ref="appServersContentRef"
        @trigger:restore="onRestore"
      />
    </div>
  </div>
</template>

<script>
import AppServersToolsBar from './components/AppServersToolsBar/index.vue'
import AppServersSide from './components/AppServersSide/index.vue'
import AppServersContent from './components/AppServersContent/index.vue'
import { HELP_ON_THIS_PAGE } from 'config/help'
import { checkPermission } from '@/utils/permission'

export default {
  components: { AppServersToolsBar, AppServersSide, AppServersContent },

  data() {
    return {
      selectedServerId: null
    }
  },

  computed: {
    hasCustomerWrapper() {
      return checkPermission(['CUSTOMER_CONTEXT_SWITCH'])
    }
  },

  created() {
    this.$store.commit(
      'helpPath/SET_HELPLINK',
      HELP_ON_THIS_PAGE.servers['App Server']
    )
  },

  methods: {
    onRefresh() {
      if (this.$store.getters.isPageChanged) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('changePageConfirm'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.$store.dispatch('pageChange/resetPageChanged')
            this.$refs.appServerSideRef.getServerList(false)
          }
        })
      } else {
        this.$refs.appServerSideRef.getServerList(false)
      }
    },

    onRestore() {
      this.$refs.appServersContentRef.getAppServerInfo(this.selectedServerId)
    },

    updateSelectedServerId(serverId) {
      this.selectedServerId = serverId
      this.$refs.appServersContentRef.getAppServerInfo(serverId)
    }
  }
}
</script>

<style scoped lang="less">
.app-servers-wrapper {
  width: 100%;
  background: #ffffff;
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
  border: solid 1px rgba(101, 102, 104, 0.16);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .app-servers-body {
    display: flex;
    height: calc(100vh - 206px);
  }

  .no-customer-wrapper {
    height: calc(100vh - 163px);
  }
}
</style>
