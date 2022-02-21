<template>
  <div class="mf-db-tools">
    <span class="db-title">{{ $t('servers.SERVERS') }} </span>

    <!-- refresh -->
    <icon-btn
      id="db-icon-refresh"
      style="margin-left: 24px"
      :is-disabled="false"
      :icon-title="$t('refresh')"
      icon-style="icon-refresh"
      @onClick="$emit('refresh')"
    />

    <!-- reset password -->
    <!--    <icon-btn-->
    <!--      id="db-icon-password"-->
    <!--      :is-disabled="false"-->
    <!--      :icon-title="$t('change_password')"-->
    <!--      icon-style="icon-password"-->
    <!--      :disabled="dbServerDetail['is-native-auth']"-->
    <!--      @onClick="onChangePassword"-->
    <!--    />-->
    <!--    <change-password-->
    <!--      ref="changeDbPassword"-->
    <!--      help-href="#"-->
    <!--    />-->

    <icon-btn
      id="db-icon-delete"
      icon-style="icon-delete"
      class="icon-is-show"
      :icon-title="$t('servers.DeleteServer')"
      @onClick="onDeleteServer"
    />

    <!-- ping server -->
    <icon-btn
      id="db-icon-ping"
      :is-disabled="false"
      :icon-title="$t('servers.Ping')"
      icon-style="icon-Project-Ping"
      @onClick="onPingDBServer"
    />
    <ping-db ref="pingDbMSSQL" />

  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
// import ChangePassword from '../components/changePassword'
import PingDb from '../components/pingDatebaseServer'
import { mapGetters } from 'vuex'

export default {
  name: 'DbTools',
  // components: { IconBtn, CgePassword, PingDb },
  components: { IconBtn, PingDb },
  props: {
    dbServerDetail: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      serverDetail: {}
    }
  },
  computed: {
    ...mapGetters(['dbServerForm'])
  },
  methods: {
    //  password
    // onChangePassword() {
    //   this.$refs.changeDbPassword.show(this.dbServerForm)
    // },

    // ping
    onPingDBServer() {
      this.$refs.pingDbMSSQL.show(this.dbServerForm)
    },
    onDeleteServer() {
      this.$emit('onDeleteServer')
    }
  }

}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.mf-db-tools{
    display: flex;
    align-items: center;
    width: 100%;
    height: 56px;
    line-height: 56px;
    padding:0 24px;
    border-bottom: 1px solid fade(@dim-gray,16%);

    .db-title{
        font-size: 16px;
        font-family: MediumWeb;
        font-weight: 500;
    }

  .tool-icon-btn {
    line-height: 28px;
  }

}
</style>
