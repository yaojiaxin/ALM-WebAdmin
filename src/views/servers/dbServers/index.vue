<template>
  <div class="mf-box-shadow servers-db">

    <!-- dbserver header tools -->
    <db-tools
      :db-server-detail="detail"
      @onDeleteServer="onDeleteServer"
      @refresh="onRefresh"
    />

    <!-- dbserver contain -->
    <div class="db-server-contain">
      <db-servers-side ref="dbServersSide" @dbServerDetail="dbServerDetail" />
      <db-servers-detail
        ref="dbServersDetails"
        :db-server-detail="detail"
        :db-server-id="dbServerId"
      />
    </div>
  </div>
</template>

<script>
import DbTools from './dbServersTools/index'
import DbServersSide from './dbServersSide/index'
import DbServersDetail from './dbServersDetail/index'
import { HELP_ON_THIS_PAGE } from 'config/help'

export default {
  components: { DbTools, DbServersSide, DbServersDetail },
  data() {
    return {
      dbServerId: null,
      detail: {}
    }
  },
  created() {
    // encrypt password need dispatch
    this.$store.dispatch('forge/getKey')
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.servers['DB Servers'])
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
            this.doRefresh()
          }
        })
      } else {
        this.doRefresh()
      }
    },

    doRefresh() {
      this.$refs.dbServersSide.getServersList()
      this.$refs.dbServersDetails.getDBServerDetail()
    },

    dbServerDetail(item) {
      this.detail = item
      this.dbServerId = item.id
    },
    onDeleteServer() {
      this.$refs.dbServersSide.onDeleteServer()
    }
  }
}
</script>

<style lang="less" scoped>
.servers-db{
    // display: flex;
    width: 100%;
    background: #fff;
    border: 1px solid rgba(101, 102, 104, 0.16);
    // flex-wrap: wrap;

  .db-server-contain{
    width: 100%;
    height: calc(100% - 56px);
    display: flex;
  }
}
</style>
