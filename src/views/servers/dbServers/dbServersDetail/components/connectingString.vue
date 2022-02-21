<template>
  <mf-modal
    id="db_server_connecting"
    :visible="visible"
    :confirm-loading="loading"
    width="500px"
    :ok-text="$t('Save')"
    @cancel="onCancel"
    @ok="onOk"
  >

    <!-- title -->
    <span slot="title">
      {{ $t('servers.ConnectionStringEditor') }}
      <mf-help-btn :help="CONNECTING_STRING" />
    </span>

    <!-- form -->
    <mf-form
      id="connecting_string_form"
      ref="connectingStringForm"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :model="form"
      :rules="rules"
    >
      <a-form-model-item prop="connection-string">
        <a-input id="db_connection_string" v-model.trim="form['connection-string']" :placeholder="$t('userManagement.Please enter')" />
      </a-form-model-item>

    </mf-form>

    <a-button id="db-server-test-connection-btn" type="link" class="db-connect-link" @click="onPingDb">
      {{ $t('servers.TestConnection') }}
    </a-button>

    <!-- Ping Db servers -->
    <ping-db-server ref="pingDbServer" :is-open-msg.sync="isOpenMsg" :is-connect-failed.sync="isConnectFailed" ping-db-type="Oracle" />
  </mf-modal>
</template>

<script>
import PingDbServer from '../../components/pingDatebaseServer'
import { CONNECTING_STRING } from 'config/help'

export default {
  components: { PingDbServer },

  data() {
    return {
      visible: false,
      loading: false,
      CONNECTING_STRING,
      labelCol: { span: 0 },
      wrapperCol: { span: 24 },

      form: {},
      isOpenMsg: true,
      rules: {
        'connection-string': [{ required: true, message: this.$t('servers.ConnectionStringEmpty') }]
      },
      initConnectionString: '',
      isConnectFailed: false
    }
  },

  methods: {

    show(data, id) {
      this.visible = true
      this.isOpenMsg = true
      this.form = JSON.parse(JSON.stringify(data))
      this.form['server-id'] = id
      this.initConnectionString = this.form['connection-string']
    },

    onCancel() {
      this.visible = false
      this.isConnectFailed = false
      this.$refs.connectingStringForm.$children[0].resetFields()
    },

    // Connecting String
    onOk() {
      this.$refs.connectingStringForm.$children[0].validate(valid => {
        if (!valid) return
        const isChangeString = this.initConnectionString.trim() !== this.form['connection-string'].trim()
        if (this.isOpenMsg && isChangeString) {
          this.onConfirm(this.$t('project.confirmSaveConnectWithoutTest'))
        } else if (this.isConnectFailed && isChangeString) {
          this.onConfirm(this.$t('servers.ConnectionStringFailedChanges'))
        } else {
          isChangeString ? this.connectStrOKMsg() : this.onCancel()
        }
      })
    },

    connectStrOKMsg() {
      this.loading = true
      this.$parent.editDbServer(this.form['server-id'], this.form, () => {
        this.$message.success(this.$t('servers.ConnectingStringOK'))
        this.loading = false
        this.isOpenMsg = false
        this.onCancel()
      }, () => {
        this.loading = false
      })
    },

    onConfirm(message) {
      this.$mfConfirm({
        title: this.$t('confirm'),
        message,
        confirmText: this.$t('OK'),
        onConfirm: () => {
          this.connectStrOKMsg()
        }
      })
    },

    onPingDb() {
      const isStringPing = true
      this.$refs.pingDbServer.show(this.form, isStringPing)
    }
  }

}
</script>

<style lang="less" scoped>

.db-connect-link{
    float: right;
    font-size: 14px;
    color: #0079EF;
}
</style>
