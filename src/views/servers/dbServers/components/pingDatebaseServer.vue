<template>
  <mf-modal
    id="db_server_ping"
    :visible="visible"
    :confirm-loading="loading"
    width="500px"
    :ok-text="$t('OK')"
    @cancel="onCancel"
    @ok="onOk"
  >

    <!-- title -->
    <span slot="title">
      {{ $t('servers.PingDatabaseServer') }}
    </span>

    <!-- ping title -->
    <h5 class="db-server-ping-h5">{{ pingForm.type === 2 ? $t('servers.MS-SQL_Settings'):$t('servers.Oracle_Settings') }}</h5>

    <!-- form -->
    <mf-form
      id="ping_db_server_form"
      ref="pingDbServerForm"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      :model="pingForm"
      :rules="rules"
    >
      <a-form-model-item
        class="db_server_ping_user_item"
        :label="$t('servers.DatabaseAdministratorUser')"
        prop="admin-user"
        :label-col="{span: 12}"
        :wrapper-col="{span: 10,offset: 1}"
      >
        <a-input id="db_ping_adminUser" v-model.trim="pingForm['admin-user']" :placeholder="$t('userManagement.Please enter')" :max-length="30" />
      </a-form-model-item>

      <a-form-model-item
        class="db_server_ping_password_item"
        :label="$t('servers.DatabaseAdministratorPassword')"
        prop="admin-password"
        :label-col="{span: 12}"
        :wrapper-col="{span: 10,offset: 1}"
      >
        <a-input-password id="db_ping_dbPassword" v-model.trim="pingForm['admin-password']" :placeholder="$t('userManagement.Please enter')" :max-length="30" @input="changePassword" />
      </a-form-model-item>
    </mf-form>

  </mf-modal>
</template>

<script>
import { pingDb } from '@/api/servers'
import { Encrypt } from '@/utils/forge'
import { DEFAULT_PASSWORD } from '@/store/const'
export default {

  props: {
    isOpenMsg: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      serverId: null,
      DEFAULT_PASSWORD,
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      pingForm: {
        'admin-user': '',
        'admin-password': ''
      },
      isChangedPassword: false,
      rules: {},
      isStringPing: false
    }
  },

  methods: {
    show(data, isStringPing) {
      this.serverId = data.id
      this.isStringPing = isStringPing
      this.pingForm['admin-password'] = data['is-native-auth'] ? '' : this.DEFAULT_PASSWORD
      this.isChangedPassword = false
      this.pingForm['admin-user'] = data['admin-user']
      this.pingForm['connection-string'] = data['connection-string']
      this.pingForm['is-native-auth'] = data['is-native-auth']
      this.pingForm.name = data.name
      this.pingForm.type = data.type
      if (!isStringPing && data['is-native-auth']) {
        this.handlePingDB()
      } else {
        this.visible = true
      }
    },

    changePassword() {
      this.isChangedPassword = true
    },

    onCancel() {
      this.visible = false
      this.loading = false
      this.$refs.pingDbServerForm.$children[0].resetFields()
    },

    handlePingDB() {
      const isAuth = this.pingForm['is-native-auth']
      const result = JSON.parse(JSON.stringify(this.pingForm))
      if (!isAuth) {
        const password = result['admin-password']
        if (this.isChangedPassword) {
          result['admin-password'] = Encrypt(password)
        } else {
          // // if password is default password, delete admin-password. if password is empty, set admin-password is empty value
          // password.length ? delete result['admin-password'] : result['admin-password'] = ''
          delete result['admin-password']
        }
      } else {
        delete result['admin-user']
        delete result['admin-password']
      }
      pingDb(this.serverId, result).then(res => {
        this.visible = false
        this.loading = false
        this.$message.success(this.$t('servers.pingSuccess'))
        this.$emit('update:isOpenMsg', false)
        this.$refs.pingDbServerForm.$children[0].resetFields()
      }).catch(() => {
        if (this.isStringPing) {
          this.visible = false
          this.$emit('update:isConnectFailed', true)
        }
        this.$emit('update:isOpenMsg', false)
        this.loading = false
      })
    },

    onOk() {
      this.loading = true
      this.handlePingDB(false)
    }
  }
}
</script>

<style lang="less" scoped>
   #ping_db_server_form {
      /deep/ .ant-form-item-label{
          padding-right:0;
          label{
            margin-left:0;
            color:#323435
          }
    }
    }

    .db-server-ping-h5{
        position: relative;
        color: #333;
        font-weight: bold;
        font-size: 14px;
        line-height: 16px;
        height: 19px;
        padding-left: 16px;
        margin-bottom: 24px;
    }

    .db-server-ping-h5::before{
        content: ' ';
        position: absolute;
        top: 44%;
        left: 0;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background: #0075F3;
        border-radius: 50%;
    }

</style>
