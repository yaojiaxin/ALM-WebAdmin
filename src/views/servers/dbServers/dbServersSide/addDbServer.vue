<template>
  <mf-modal
    id="db_server_add"
    :visible="visible"
    :confirm-loading="loading"
    :operation-disabled="pingLoading"
    :ok-text="$t('OK')"
    width="908px"
    @cancel="onCancel"
    @ok="onOk"
  >

    <!-- title -->
    <span slot="title">
      {{ $t('servers.CreateDatabaseServer') }}
      <mf-help-btn :help="NEW_DB_SERVER" />
    </span>
    <a-spin :spinning="pingLoading">
      <!-- form -->
      <mf-form
        id="db_server_addform"
        ref="dbServerAddForm"
        class="add-db-form"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :model="form"
        :rules="rules"
      >
        <a-form-model-item>
          <h5 class="db-server-add-h5"> {{ $t('servers.DatabaseType') }}</h5>
        </a-form-model-item>
        <a-row :gutter="24">
          <a-col :span="12" :xs="{span:16,offset:1}" :lg="{span:11,offset:1}">
            <a-form-model-item class="db-server-add-indent db-server-add-field" :label="$t('servers.DatabaseType')" prop="type">
              <mf-select
                id="db-server-database-type-select"
                v-model="DataBaseType"
                :allow-clear="false"
                @change="onChange"
              >
                <a-select-option id="add_server_type_mssql" :value="1">
                  {{ $t('servers.MSSQLSQLAuth') }}
                </a-select-option>
                <a-select-option id="add_server_type_mssql" :value="2">
                  {{ $t('servers.MSSQLWinAuth') }}
                </a-select-option>
                <a-select-option id="add_server_type_oracle" :value="3">
                  {{ $t('Oracle') }}
                </a-select-option>
              </mf-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-form-model-item>
          <h5 class="db-server-add-h5"> {{ $t('servers.DatabaseValues') }}</h5>
        </a-form-model-item>
        <a-row :gutter="24" class="db-server-add-row">
          <a-col :span="12" :xs="{span:16,offset:1}" :lg="{span:11,offset:1}">
            <a-form-model-item class="db-server-add-indent" :label="$t('servers.DatabaseName')" prop="name">
              <a-input
                id="db_add_name"
                v-model.trim="form.name"
                :max-length="50"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="12" :xs="{span:16,offset:1}" :lg="11">
            <a-form-model-item class="db-server-add-second-indent" :label="$t('servers.DBAdminUser')" prop="admin-user">
              <a-input
                id="db_add_adminuser"
                v-model.trim="form['admin-user']"
                :disabled="DataBaseType===2"
                :max-length="50"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="24" class="db-server-add-row">
          <a-col :span="12" :xs="{span:16,offset:1}" :lg="{span:11,offset:1}">
            <a-form-model-item class="db-server-add-indent db-server-add-field" :label="$t('servers.DBAdminPassword')" prop="admin-password">
              <a-input-password id="db_add_dbAdminPassword" v-model.trim="form['admin-password']" :disabled="DataBaseType===2" :max-length="50" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-form-model-item>
          <h5 class="db-server-add-h5">{{ $t('servers.DefaultConnectionString') }}</h5>
        </a-form-model-item>

        <a-form-model-item>
          <a-radio-group v-model="form.isConnectionString">
            <a-radio id="db-server-isConnectionString-parameters-radio" class="db-server-add-radio" :value="false">{{ $t('servers.ConnectionStringParameters') }}</a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-row :gutter="24">
          <a-col :span="12" :xs="{span:16,offset:1}" :lg="{span:11,offset:1}">
            <a-form-model-item class="db-server-add-indent" :label="$t('servers.ServerHost')" prop="serverHost">
              <a-input id="db_add_serverHost" v-model.trim="form.serverHost" :disabled="form.isConnectionString" :max-length="100" />
            </a-form-model-item>
          </a-col>
          <a-col :span="12" :xs="{span:16,offset:1}" :lg="11">
            <a-form-model-item class="db-server-add-second-indent" :label="$t('servers.Port')" prop="port">
              <a-input id="db_add_port" v-model.trim="form.port" :disabled="form.isConnectionString" :max-length="5" @change="onPortChange" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12" :xs="{span:16,offset:1}" :lg="{span:11,offset:1}">
            <a-form-model-item class="db-server-add-indent" :label="$t('servers.OracleServiceName')" prop="oracleServiceName">
              <a-input id="db_add_oracleServiceName" v-model.trim="form.oracleServiceName" :disabled="form.isConnectionString||DataBaseType !==3" :max-length="100" />
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-form-model-item>
          <a-radio-group v-model="form.isConnectionString">
            <a-radio id="db-server-isConnectionString-radio" class="db-server-add-radio" :value="true">{{ $t('servers.ConnectionString') }}</a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-row :gutter="24">
          <a-col :span="23" :offset="1">
            <a-form-model-item prop="connection-string" class="add-bd-connectstr db-server-add-indent">
              <!-- <a-input id="db_add_connectionString" v-model.trim="form['connection-string']" :disabled="!form.isConnectionString" /> -->
              <a-textarea
                id="db-server-connectionString-textarea"
                v-model.trim="form['connection-string']"
                :disabled="!form.isConnectionString"
                :auto-size="{ minRows: 2, maxRows: 6 }"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
      </mf-form>
    </a-spin>

    <template slot="footer">
      <a-button
        id="db_server_modal_pingbtn"
        key="ping"
        type="link"
        class="mf-btn-dashed"
        :loading="pingLoading"
        :disabled="loading"
        @click="onPing"
      >
        {{ $t('servers.Ping') }}
      </a-button>
    </template>
  </mf-modal>
</template>

<script>
import { createDBServer, pingDb } from '@/api/servers'
import { Encrypt } from '@/utils/forge'
import { ADD_DB_SERVER } from '@/store/const'
import { NEW_DB_SERVER } from 'config/help'

export default {
  data() {
    return {
      visible: false,
      loading: false,
      NEW_DB_SERVER,
      pingLoading: false,
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      DataBaseType: 1,
      form: {
        type: 2,
        name: '',
        'admin-user': '',
        'admin-password': '',
        'connection-string': '',
        serverHost: '',
        port: '',
        oracleServiceName: '',
        'is-native-auth': false,
        isConnectionString: false
      },
      rules: {
        name: { required: true, message: this.$t('servers.DatabaseNameRequired'), trigger: 'blur' },
        'admin-user': { required: true, message: this.$t('servers.DBAdminUserRequired'), trigger: 'blur' },
        'admin-password': { required: true, message: this.$t('servers.DBAdminPasswordRequired'), trigger: 'blur' },
        serverHost: { required: true, message: this.$t('servers.ServerHostRequired'), trigger: 'blur' },
        port: { required: true, message: this.$t('servers.PortRequired'), trigger: 'blur' },
        'connection-string': { required: true, message: this.$t('servers.ConnectionStringRequired'), trigger: 'change' },
        oracleServiceName: { required: false, message: this.$t('servers.OracleServiceNameRequired'), trigger: 'blur' }
      }
    }
  },

  computed: {
    connectionString() {
      // serverHost、port、oracleServiceName splice into connectionString
      const { serverHost, port, oracleServiceName } = this.form
      return `${this.DataBaseType === 3 ? ADD_DB_SERVER.oracle_thin : ADD_DB_SERVER.sqlServer}${serverHost}${port === '' ? '' : ':'}${port}${oracleServiceName === '' ? '' : '/'}${oracleServiceName}`
    }
  },

  watch: {
    connectionString(string) {
      this.form['connection-string'] = string
    },
    'form.isConnectionString'(isConnection) {
      // if isConnectionString is true port、host and oracleServiceName is not required
      if (isConnection) {
        this.rules.serverHost.required = false
        this.rules.port.required = false
        this.rules.oracleServiceName.required = false
      } else {
        this.rules.serverHost.required = true
        this.rules.port.required = true
        // when isConnectionString is false and DataBaseType is oracle, the oracleServiceName is required
        this.DataBaseType === 3 ? this.rules.oracleServiceName.required = true : this.rules.oracleServiceName.required = false
      }
    }
  },

  methods: {
    show() {
      this.visible = true
      if (this.visible) {
        this.form.port = ADD_DB_SERVER.sql_port
        this.form['connection-string'] = `${ADD_DB_SERVER.sqlServer}${ADD_DB_SERVER.hostName}:${this.form.port}`
      }
    },

    onPortChange() {
      this.form.port = this.form.port.replace(/[^\d]/g, '')
    },

    onChange() {
      this.$refs.dbServerAddForm.$children[0].resetFields()
      // when DataBaseType is changed, the required in rules must be change
      const changeRules = (userBoolean, serviceBoolean) => {
        this.rules['admin-user'].required = userBoolean
        this.rules['admin-password'].required = userBoolean
        this.rules.oracleServiceName.required = serviceBoolean
      }
      switch (this.DataBaseType) {
        case 1:
        case 2:
          this.form.type = 2
          this.form.port = ADD_DB_SERVER.sql_port
          this.form['connection-string'] = `${ADD_DB_SERVER.sqlServer}${ADD_DB_SERVER.hostName}:${this.form.port}`
          // when the type is SQL, admin-user and admin-password is required,the oracleServiceName is not required
          // when the type is Win, admin-user,admin-password and oracleServiceName is not required.
          this.DataBaseType === 1 ? changeRules(true, false) : changeRules(false, false)
          break
        case 3:
          this.form.type = 3
          this.form.port = ADD_DB_SERVER.oracle_port
          this.form['connection-string'] = `${ADD_DB_SERVER.oracle_thin}${ADD_DB_SERVER.hostName}:${this.form.port}/${ADD_DB_SERVER.serviceName}`
          // when the type is Oracle, admin-user,admin-password is required. if isConnectionStgring is true,oracleServiceName is not required
          this.form.isConnectionString ? changeRules(true, false) : changeRules(true, true)
          break
      }
    },

    resetForm() {
      this.$refs.dbServerAddForm.$children[0].resetFields()
      this.form.type = 2
      // this.form['connection-string'] = `${ADD_DB_SERVER.sqlServer}${ADD_DB_SERVER.hostName}:${this.form.port}`
      this.DataBaseType = 1
    },

    onCancel() {
      this.visible = false
      this.loading = false
      this.resetForm()
    },

    onOk() {
      this.$refs.dbServerAddForm.$children[0].validate(valid => {
        if (!valid) return false
        this.loading = true
        createDBServer(this.makeSaveResult()).then(res => {
          this.visible = false
          this.loading = false
          this.$message.success(this.$t('servers.DBServerAddedSuccess'))
          this.$parent.getServersList(res['db-server'])
          this.resetForm()
        }).catch(() => {
          this.visible = true
          this.loading = false
        })
      })
    },

    onPing() {
      this.$refs.dbServerAddForm.$children[0].validate(valid => {
        if (!valid) return false
        this.pingLoading = true
        pingDb(0, this.makeSaveResult()).then(res => {
          this.$message.success(this.$t('servers.pingSuccess'))
        }).finally(() => {
          this.pingLoading = false
        })
      })
    },

    makeSaveResult() {
      const result = JSON.parse(JSON.stringify(this.form))
      // password need encrypt
      const password = result['admin-password']
      result['admin-password'] = password.trim() ? Encrypt(password) : ''
      if (this.DataBaseType === 2) {
        result['is-native-auth'] = true
        this.deleteKey(['admin-user', 'admin-password'], result)
      }
      this.deleteKey(['port', 'serverHost', 'oracleServiceName', 'isConnectionString'], result)
      return result
    },

    deleteKey(arr, obj) {
      arr.forEach(item => {
        delete obj[item]
      })
    }
  }
}
</script>

<style lang="less" scoped>
.db-server-add-h5{
    position: relative;
    color: #000;
    font-weight: bold;
    font-size: 14px;
    line-height: 16px;
    height: 19px;
    padding-left: 16px;
    // margin-bottom: 24px;
}

.db-server-add-h5::before{
    content: ' ';
    position: absolute;
    top: 45%;
    left: 0;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: #0075F3;
    border-radius: 50%;
}

.db-server-add-row{
  .ant-form-item{
    height:62px;
    margin-bottom:0;
  }
}

.add-db-form{
    width: 100%;
    .add-bd-connectstr{
     /deep/ .ant-radio-wrapper {
        margin-left: 0;
      }
      /deep/ .ant-form-item-control-wrapper{
        width:100%;
      }
    }

    /deep/ .ant-radio-wrapper{
        span:nth-last-child(1){
          color:#000
        }
    }

    /deep/ .ant-form-item-label label{
      color:#323435
    }

    .db-server-add-height{
      height:62px;
    }

    // .db-server-add-indent{
    //   margin-left:37px;
    // }

    // .db-server-add-second-indent{
    //   margin-left:0;
    // }

    .db-server-add-field{
      margin-bottom:22px;
    }
}

</style>
