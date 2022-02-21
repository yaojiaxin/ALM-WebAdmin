<template>
  <mf-form
    ref="ProjectdbForm"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    :model="form"
    :rules="rules"
    class="mf-step-content step-form"
  >
    <div class="mf-subtitle mf-margin-b-8">{{ $t('project.DatabaseType') }}</div>
    <a-form-model-item prop="db-type" :wrapper-col="{ md: 24, lg:24, xl:24, xxl: 24}">
      <a-radio-group id="ep_databaseType" v-model="form['db-type']" @change="onChangeRadio">
        <a-radio :value="3" :disabled="!isEnableOrale">
          {{ $t('Oracle') }}
        </a-radio>
        <a-radio :value="2" :disabled="!isEnableSQL">
          {{ $t('MS-SQL') }}
        </a-radio>
      </a-radio-group>
    </a-form-model-item>

    <div class="mf-subtitle mf-margin-b-8">{{ $t('project.DbServer') }}</div>

    <a-form-model-item :label="$t('userManagement.serverName')" prop="dbServerId">
      <mf-select id="ep_dbServerName" v-model="form.dbServerId" :allow-clear="false" @select="onServersChange">
        <a-select-option v-for="item in severData" :key="item.id" :value="item.id">
          {{ item.name }}
        </a-select-option>
      </mf-select>
    </a-form-model-item>

    <a-form-model-item :label="$t('project.db_admin_user')" prop="db-admin-user">
      <a-input id="ep_dbAdminUser" v-model.trim="form['db-admin-user']" :disabled="isNativeAuth" :max-length="30" class="name-input" />
    </a-form-model-item>
    <a-form-model-item :label="$t('project.db_admin_password')" prop="db-admin-pass">
      <a-input-password id="ep_ddbAdminPassword" v-model.trim="password" :disabled="isNativeAuth" :max-length="30" :default-value="DEFAULT_PASSWORD" class="name-input-password" @input="changePassword" />
    </a-form-model-item>

    <a-checkbox v-if="form['db-type'] === DATABASE_TYPE.MSSQL && createType === 1" id="enable_unicode" @change="onChangeUnicode">{{ $t('project.create_as_unicode') }}</a-checkbox>
  </mf-form>
</template>

<script>
import { DEFAULT_PASSWORD, DATABASE_TYPE } from '@/store/const'
import { getAllDBServers, getDBServersInfo, getDomain } from '@/api/project'
import { pingDb } from '@/api/servers'
import { mapGetters } from 'vuex'
import { Encrypt } from '@/utils/forge'

export default {
  props: {
    createType: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      DEFAULT_PASSWORD,
      DATABASE_TYPE,

      password: DEFAULT_PASSWORD,
      isChangedPassword: false,

      form: {
        'db-type': DATABASE_TYPE.Oracle,
        dbServerId: '',
        'db-server-name': '',
        'db-admin-user': '',
        'db-admin-pass': DEFAULT_PASSWORD,
        'is-unicode': false
      },
      rules: {
        dbServerId: { required: true, message: this.$t('servers.DatabaseNameRequired'), trigger: 'blur' },
        'db-admin-user': { required: true, message: this.$t('servers.DBAdminUserRequired'), trigger: 'blur' }
      },
      isNativeAuth: false,
      isTextSearchWarning: false,

      labelCol: { span: 10 },
      wrapperCol: { span: 14 },

      allServers: [],

      defaultServer: null
    }
  },

  computed: {
    ...mapGetters(['selectDomain', 'selectTreeNode']),

    isEnableOrale: function() {
      return this.allServers.findIndex(i => i.type === DATABASE_TYPE.Oracle) > -1
    },

    isEnableSQL: function() {
      return this.allServers.findIndex(i => i.type === DATABASE_TYPE.MSSQL) > -1
    },

    severData: function() {
      return this.allServers.filter(i => i.type === this.form['db-type'])
    }
  },

  created() {
    this.$store.dispatch('forge/getKey')
    this.getDbList()
  },

  methods: {
    changePassword() {
      this.isChangedPassword = true
    },
    // db type changed
    onChangeRadio(e) {
      this.form['db-type'] = e.target.value

      this.form.dbServerId = this.severData[0].id
      this.getDbInfo(this.form.dbServerId)
    },

    // db server changed
    onServersChange(serverId) {
      this.form.dbServerId = serverId
      this.getDbInfo(this.form.dbServerId)
    },

    onChangeUnicode(e) {
      this.form['is-unicode'] = e.target.checked
    },

    async getDbList() {
      try {
        let servers = await getAllDBServers().then(res => res['db-servers'])
        servers = servers && servers['db-server']

        const res = await getDomain(this.selectDomain.name)
        const domain = res.domain

        this.allServers = Array.isArray(servers) ? servers : [servers]

        if (domain['default-db-server-name']) { // Select Domain Default DB information
          this.form['db-type'] = domain['default-db-server-type']
          this.defaultServer = this.severData.find(i => i.name === domain['default-db-server-name'])
          this.form.dbServerId = this.defaultServer.id
        } else {
          const dbOracle = this.allServers.filter(i => i.type === (domain['default-db-server-type'] || DATABASE_TYPE.Oracle))
          if (dbOracle.length > 0) {
            this.form['db-type'] = DATABASE_TYPE.Oracle
          } else {
            this.form['db-type'] = DATABASE_TYPE.MSSQL
          }
          this.form.dbServerId = this.severData[0].id
        }

        this.getDbInfo(this.form.dbServerId)
      } catch (e) {
        console.log(e)
      }
    },

    async getDbInfo(serverId) {
      this.$refs.ProjectdbForm.$children[0].clearValidate()
      this.password = DEFAULT_PASSWORD
      this.isChangedPassword = false
      try {
        const dbInfo = await getDBServersInfo(serverId).then(res => res['db-server'])

        this.form['db-admin-user'] = dbInfo['admin-user']
        this.form['db-server-name'] = dbInfo.name
        this.isNativeAuth = dbInfo['is-native-auth']
        this.isTextSearchWarning = !dbInfo['is-text-search-enabled']
        if (this.form['db-type'] === 2 && this.isNativeAuth) {
          this.rules['db-admin-user'].required = false
        } else {
          this.rules['db-admin-user'].required = true
        }
      } catch (e) {
        console.log(e)
      }
    },

    async validate() {
      try {
        let isValid = false
        const valid = await this.$refs.ProjectdbForm.$children[0].validate()

        if (valid) {
          isValid = true
          this.form['db-admin-pass'] = this.isChangedPassword ? Encrypt(this.password) : undefined
          await pingDb(this.form.dbServerId, {
            'admin-user': this.form['db-admin-user'],
            'admin-password': this.form['db-admin-pass']
          })

          if (this.isTextSearchWarning) {
            return new Promise((resolve, reject) => {
              this.$mfConfirm({
                id: 'db_search_warning',
                title: this.$t('project.warning'),
                iconType: 'Warning',
                message: this.$t('project.db_server_text_search_feature_warning'),
                isShowCancel: false,
                confirmText: this.$t('OK'),
                onConfirm: () => {
                  return resolve({ continue: true, data: this.form })
                },
                onCloseChange: () => {
                  reject(new Error())
                }

              })
            })
          }
        }

        return { continue: isValid, data: this.form }
      } catch (e) {
        return { continue: false }
      }
    }
  }
}
</script>

<style>

</style>
