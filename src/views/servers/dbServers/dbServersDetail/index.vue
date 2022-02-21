<template>
  <div class="mf-db-detail">

    <div class="db-detail-title mf-h5 mf-subtitle">
      {{ dbServerName }}
    </div>

    <div :class="['db-detail-form',isOp&&'db-detail-form-op']">
      <detail-form
        ref="serversDetailForm"
        :is-disabled.sync="isDisabled"
        :db-server-detail="dbServerDetail"
        @onChange="isSave=$event"
        @getDBName="dbServerName=$event?$event:$t('Details')"
      />
    </div>

    <div class="db-detail-footer">
      <a-button
        id="db-detail-restore-btn"
        style="margin-right:8px"
        class="mf-btn-dashed"
        :disabled="isDisabled"
        @click="restoreDbserverDetail"
      >
        {{ $t('Restore') }}
      </a-button>
      <a-button id="db-detail-save-btn" type="primary" :disabled="isDisabled" @click="saveDbserverDetail">
        {{ $t('Save') }}
      </a-button>
    </div>
  </div>
</template>

<script>
import DetailForm from './components/dbDetailsForm'
import { SERVER_TYPE } from '@/store/const'
import { mapGetters } from 'vuex'

export default {
  components: { DetailForm },
  props: {
    dbServerId: {
      type: Number || String,
      default: 1
    },
    dbServerDetail: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isDisabled: true,
      dbServerName: ''
    }
  },

  computed: {
    ...mapGetters(['serverType']),
    isOp() {
      return this.serverType === SERVER_TYPE.OnPremise
    }
  },

  watch: {
    dbServerId: {
      handler: function(id) {
        this.getDBServerDetail()
      }
    }
  },

  methods: {
    saveDbserverDetail() {
      this.$refs.serversDetailForm.editDbServer(this.dbServerId)
    },
    restoreDbserverDetail() {
      this.getDBServerDetail()
    },
    getDBServerDetail() {
      this.$refs.serversDetailForm.getServerDetail(this.dbServerId)
    }
  }

}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.mf-db-detail{
    flex:1;
    overflow:hidden;
    .db-detail-title{
        height: 30px;
        line-height: 30px;
        width: 100%;
        padding:24px
    }

    .db-detail-form{
        width: 100%;
        height: calc(100vh - 317px);
        padding: 0 24px;
        overflow-y:auto;
        overflow-x: hidden;
    }

    .db-detail-form-op{
      height:calc(100vh - 276px)
    }

    .db-detail-footer{
        height: 64px;
        line-height: 64px;
        padding-right: 24px;
        padding-top: 16px;
        border-top: 1px solid fade(@dim-gray,16%);
        display: flex;
        justify-content: flex-end;
    }

}
</style>
