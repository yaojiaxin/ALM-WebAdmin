<template>
  <div>
    <mf-form
      id="db_detail_form"
      ref="detailForm"
      v-bind="formItemLayout"
      layout="horizontal"
      label-align="left"
      :model="form"
      :rules="rules"
      class="db-detail-form"
    >
      <a-form-model-item
        :label="$t('servers.DatabaseType')"
        prop="databaseType"
      >
        <a-input
          id="db-server-databaseType"
          v-model="form.databaseType"
          disabled
        />
      </a-form-model-item>

      <a-form-model-item
        :label="$t('servers.DatabaseAdministratorUserName')"
        prop="admin-user"
      >
        <a-input
          id="db-server-admin-user"
          v-model="form['admin-user']"
          :disabled="form['is-native-auth']"
          :max-length="50"
          @change="$emit('onChange',true)"
        />
      </a-form-model-item>

      <a-form-model-item
        class="db-detail-form-three-item"
        :label="$t('servers.DatabaseAdministratorPassword')"
        prop="admin-password"
      >
        <!--        <a-input-password-->
        <!--          id="db-server-dbPassword"-->
        <!--          v-model="form['admin-password']"-->
        <!--          :visibility-toggle="false"-->
        <!--          disabled-->
        <!--        />-->

        <a-row :gutter="8">
          <a-col :span="20">
            <a-input-password
              id="db-server-dbPassword"
              v-model="form['admin-password']"
              :visibility-toggle="false"
              disabled
            />
          </a-col>
          <a-col :span="4">
            <a-button
              id="db-server-alManagementUserPassword-btn"
              type="link"
              :class="[
                'db-detail-link',
                'mf-btn-link-primary',
                dbServerDetail['is-native-auth'] && 'db-disabled-link'
              ]"
              :disabled="dbServerDetail['is-native-auth']"
              @click="onChangePassword"
            >
              {{ $t('change_password') }}
            </a-button>
          </a-col>
        </a-row>

      </a-form-model-item>

      <a-form-model-item
        class="db-detail-form-three-item"
        :label="$t('servers.ApplicationLifecycleManagementUserPassword')"
        prop="alManagementUserPassword"
      >
        <a-row :gutter="8">
          <a-col :span="20">
            <a-input-password
              id="db-server-alManagementUserPassword"
              v-model="form.alManagementUserPassword"
              :visibility-toggle="false"
              disabled
            />
          </a-col>
          <a-col :span="4">
            <a-button id="db-server-alManagementUserPassword-btn" type="link" :class="['db-detail-link','mf-btn-link-primary',form['is-native-auth']&&'db-disabled-link']" :disabled="form['is-native-auth']" @click="onChangeUserPassword">
              {{ $t('change_password') }}
            </a-button>
          </a-col>
        </a-row>
      </a-form-model-item>

      <a-form-model-item
        :label="$t('servers.TextSearch')"
        prop="textSearch"
        class="db-detail-form-three-item"
      >
        <a-row :gutter="8">
          <a-col :span="20">
            <a-input
              id="db-server-textSearch"
              v-model="form.textSearch"
              disabled
            />
          </a-col>
          <a-col :span="4">
            <a-button v-show="!form['is-text-search-enabled']" id="db-server-enable" type="link" class="db-detail-link mf-btn-link-primary" @click="onEnable">
              {{ $t('Enable') }}
            </a-button>
          </a-col>
        </a-row>
      </a-form-model-item>

      <a-form-model-item
        :label="$t('servers.DefaultSearchLanguage')"
        prop="text-search-language"
      >
        <mf-select
          id="db-server-text-search-language"
          v-model="form['text-search-language']"
          :disabled="!form['is-text-search-enabled']"
          :allow-clear="false"
          @change="$emit('onChange',true)"
        >
          <a-select-option v-for="(item,index) in SearchLanguages" id="select_language_Chinese" :key="index" :value="item">
            {{ item }}
          </a-select-option>
        </mf-select>
      </a-form-model-item>

      <a-form-model-item
        class="db-detail-form-large-item"
        :label="$t('servers.ConnectionString')"
        prop="connection-string"
      >
        <a-row :gutter="8">
          <a-col :span="20">
            <a-input
              id="db-server-connectionString"
              v-model="form['connection-string']"
              disabled
            />
          </a-col>
          <a-col :span="4">
            <a-button id="db-server-connectionString-btn" type="link" class="db-detail-link mf-btn-link-primary" @click="onConnectingString">
              {{ $t('servers.ConnectingString') }}
            </a-button>
          </a-col>
        </a-row>
      </a-form-model-item>
    </mf-form>

    <!-- Connecting String -->
    <connecting-string ref="connectingString" @changeConnectionString="onChangeConnectionString" />

    <!-- change password -->
    <change-password
      ref="changeUserPassword"
      help-href="#"
      :password-type="passwordType"
    />
  </div>
</template>

<script>
import { getDbServerDetail, updateDbServerDetail, getSupportedSearchLanguage } from '@/api/servers'
import ConnectingString from './connectingString'
import ChangePassword from '../../components/changePassword'
import { Encrypt } from '@/utils/forge'
import { isChangeObjorArr, errorMessage } from '@/utils'
import { mapGetters } from 'vuex'

export default {
  components: { ConnectingString, ChangePassword },
  props: {
    isDisabled: {
      type: Boolean,
      default: true
    },
    dbServerDetail: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      formItemLayout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 4 }
      },
      passwordType: 'userPassword',
      form: {
        type: null,
        databaseType: '',
        'admin-user': '',
        'admin-password': '',
        alManagementUserPassword: '',
        'is-text-search-enabled': '',
        textSearch: 'enabled',
        'text-search-language': '',
        'connection-string': '',
        'is-native-auth': true
      },
      rules: {},
      serverId: 1,
      // Supported Search Language
      SearchLanguages: []

    }
  },
  computed: {
    ...mapGetters(['dbServerForm'])
  },

  watch: {
    form: {
      handler: function(form) {
        const isDisabled = isChangeObjorArr(form, this.initForm)
        this.$emit('update:isDisabled', isDisabled)
        if (!isDisabled) {
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$store.dispatch('pageChange/resetPageChanged')
        }
      },
      deep: true
    }
  },

  methods: {
    getServerDetail(id) {
      this.serverId = id
      getDbServerDetail(id).then(res => {
        this.form = res['db-server']
        this.form.databaseType = this.form.type === 2 ? this.form['is-native-auth'] ? this.$t('servers.MSSQLWinAuth') : this.$t('servers.MSSQLSQLAuth') : this.$t('Oracle')
        this.form.textSearch = this.form['is-text-search-enabled'] ? 'Enabled' : 'Disabled'
        this.$emit('getDBName', this.form.name)
        this.getSearchLanguages(id, this.form['is-text-search-enabled'])
        this.initForm = JSON.parse(JSON.stringify(this.form))
        this.$store.commit('dbServer/SET_DB_SERVER_FORM', this.form)
      }).catch(error => {
        const resStatus = error.response.status
        const resData = error.response.data
        if (resStatus === 404) {
          if (resData.QCRestException) {
            errorMessage(resData.QCRestException.Title, resData.QCRestException.StackTrace)
          }
        }
      })
    },

    editDbServer(id = this.serverId, form = this.form, callback, error) {
      const result = JSON.parse(JSON.stringify(form))
      if (result['admin-user'] !== undefined && !result['admin-user'].trim() && !result['is-native-auth']) {
        this.$message.error(this.$t('servers.DatabaseNameEmpty'))
        return
      }
      // password need encrypt
      const password = result['admin-password']
      if (!password) {
        delete result['admin-password']
      } else {
        result['admin-password'] = Encrypt(password.trim())
      }
      return updateDbServerDetail(id, result).then(res => {
        if (callback) {
          callback()
        } else {
          this.$message.success(this.$t('servers.EditDBServerSuccess'))
        }
        this.getServerDetail(id)
        this.$emit('onChange', false)
      }).catch(() => {
        error && error()
      })
    },

    // Supported Search Language
    getSearchLanguages(id, isTextSearchEnabled) {
      // if textSearch is disabled,don't request list for searchLanguage
      if (!isTextSearchEnabled) {
        this.SearchLanguages = []
        this.form['text-search-language'] = ''
        return
      }
      getSupportedSearchLanguage(id).then(res => {
        const languages = res['search-languages']['search-language']
        this.SearchLanguages = Array.isArray(languages) ? languages : []
      }).catch(() => {
        this.SearchLanguages = []
      })
    },

    // enable text-search
    onEnable() {
      this.$mfConfirm({
        title: this.$t('confirm'),
        message: this.$t('servers.ConfirmEnable', { DBName: this.form.name }),
        isShowCancel: true,
        confirmText: this.$t('OK'),
        cancelText: this.$t('Cancel'),
        onConfirm: () => {
          const result = {}
          result['is-text-search-enabled'] = true
          result['is-native-auth'] = this.form['is-native-auth']
          return this.editDbServer(this.serverId, result)
        }
      })
    },

    // Connecting String
    onConnectingString() {
      this.$refs.connectingString.show(this.form, this.serverId)
    },

    // update connection string
    onChangeConnectionString(string) {
      this.form['connection-string'] = string
    },

    onChangeUserPassword() {
      this.passwordType = 'userPassword'
      this.$refs.changeUserPassword.show(this.form)
    },
    onChangePassword() {
      this.passwordType = 'dbPassword'
      this.$refs.changeUserPassword.show(this.dbServerForm)
    }

  }
}
</script>

<style lang="less" scoped>
.db-detail-form{
  .ant-form{
    max-width:1600px;
  }
  /deep/ label{
    display:block
  }
}

/deep/ .ant-form-item-label{
  //min-width:230px;
  //width:250px;
  /*line-height:1.5;*/
  //white-space: initial;
  label{
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
}

.db-detail-form-three-item /deep/ .ant-form-item-control-wrapper{
  width:20.1%
}

.db-detail-form-large-item {
  /deep/ .ant-form-item-control-wrapper{
    width:30%
  }
}

.db-detail-link{
  font-size: 14px;
  color: #0073E7;
}

.db-disabled-link{
  color: rgba(0, 0, 0, 0.5);
}

</style>
