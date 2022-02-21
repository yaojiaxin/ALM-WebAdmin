<template>
  <div class="miscellaneous-content">

    <template>
      <div class="mf-subtitle mf-margin-b-24">{{ $t('project.directories') }}</div>

      <a-form layout="horizontal" style="max-width: 600px" v-bind="formItemLayout">
        <a-form-item :label="$t('project.physical_directory')">
          <a-tooltip overlay-class-name="directories-tooltip" placement="topLeft" :title="src">
            <span>
              <a-input id="pro-phy-dir" :value="src" disabled />
            </span>
          </a-tooltip>
        </a-form-item>
      </a-form>
    </template>

    <template v-if="selectTreeNode && selectTreeNode.level === 1">
      <div class="mf-subtitle mf-margin-b-24">{{ $t('project.miscellaneous') }}</div>

      <mf-form
        ref="domainForm"
        v-bind="formItemLayout"
        style="max-width: 600px"
        :rules="rules"
        :model="form"
      >
        <a-form-model-item :label="$t('project.contact_name')">
          <a-input
            id="pro-contactName"
            v-model="form['contact-name']"
            :max-length="40"
          />
        </a-form-model-item>

        <a-form-model-item :label="$t('project.contact_email')" prop="contact-email">
          <a-input id="pro-contactMail" v-model="form['contact-email']" :max-length="40" />
        </a-form-model-item>

        <a-form-model-item :label="$t('project.user_quota')">
          <a-radio-group v-model="isLimited" @change="onChangeLimited">
            <a-radio id="pro-Quota-unlimted" :value="false">{{ $t('project.unlimited_connections') }}</a-radio>
            <a-radio id="pro-Quota-limtedMax" :value="true" style="margin-top: 8px">
              <span>{{ $t('project.maximum') }}</span>
              <a-input-number
                id="pro-Quota-limtedMax_num"
                v-model="maximum"
                class="miscellaneous-row-number"
                :disabled="!isLimited"
                :min="0"
                :max="MAX_CONNECTIONS"
                :formatter="limitNumber"
                :parser="limitNumber"
                @blur="check"
                @pressEnter="check"
              />
              {{ $t('project.connections') }}
            </a-radio>
          </a-radio-group>
        </a-form-model-item>

        <a-form-model-item :label="$t('project.default_db_server')">
          <mf-select id="pro-DBserver-input" v-model="form['default-db-server-name']" :allow-clear="false">
            <a-select-option value="">{{ $t('configuration.none') }}</a-select-option>
            <a-select-option
              v-for="item in serverList"
              :key="item.name"
            >
              {{ item.name }}
            </a-select-option>
          </mf-select>
        </a-form-model-item>
      </mf-form>

      <div
        class="project-bottom-btn"
      >
        <a-button id="pro-domain-restore" :disabled="submiting || isSave" style="margin-right: 8px;" class="mf-btn-dashed" @click="restoreDomain"> {{ $t('Restore') }} </a-button>
        <a-button id="pro-domain-save" :disabled="isSave" type="primary" :loading="submiting" @click="saveDomain">{{ $t('Save') }}</a-button>
      </div>

    </template>
  </div>
</template>

<script>
import { getDomain, updateDomain, getAllDBServers } from '@/api/project'
import { MAX_CONNECTIONS } from '@/store/const'
import { mapGetters } from 'vuex'
import { eventListener } from '../event'
import { limitNumber } from '@/utils/validate'
import { isChangeObjorArr } from '@/utils'
import { getIsLogin } from '@/utils/auth'

export default {
  name: 'ProjectMiscellaneous',
  props: {
    unsavedTabs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      limitNumber,
      MAX_CONNECTIONS,
      isLimited: false,
      maximum: 0,

      submiting: false,
      src: '',

      formItemLayout: {
        labelCol: { span: 7 },
        wrapperCol: { span: 17 }
      },

      form: {
        'contact-name': '',
        'contact-email': '',
        'users-quota': 0,
        'default-db-server-name': null
      },

      initForm: {},
      initIsLimited: false,
      initMaximum: 0,
      isFormNoChange: true,
      isLimitedNoChange: true,
      isMaximumNoChange: true,

      serverList: [],

      rules: {
        'contact-email': [{ type: 'email', message: this.$t('valid.email') }]
      }
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode']),

    selectedDomain() {
      return this.selectTreeNode && this.selectTreeNode.data
    },

    isSave() {
      return this.isFormNoChange && this.isLimitedNoChange && this.isMaximumNoChange
    }
  },

  watch: {
    selectTreeNode: function(val) {
      if (val && val.level === 2) {
        this.src = val.parent.data['physical-directory']
      }
    },
    form: {
      handler: function(form) {
        this.isFormNoChange = isChangeObjorArr(form, this.initForm)
        if (!this.isFormNoChange) {
          this.$emit('update-unsaved-tabs', 'add', 'details')
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$emit('update-unsaved-tabs', 'remove', 'details')
          this.$nextTick(() => {
            if (this.unsavedTabs.length === 0) {
              this.$store.dispatch('pageChange/resetPageChanged')
            }
          })
        }
      },
      deep: true
    },
    isLimited(limited) {
      this.isLimitedNoChange = limited === this.initIsLimited
    },
    maximum(num) {
      this.isMaximumNoChange = num === this.initMaximum
    }
  },

  created() {
    this.getDB()
    const _this = this

    eventListener.on('domainSelected', function(active) {
      if (_this.$refs.domainForm) {
        _this.$refs.domainForm.$children[0].resetFields()
      }
      _this.getDomainDetail()
    })
  },

  beforeDestroy() {
    eventListener.remove('domainSelected')
  },

  deactivated() {
    if (this.$store.getters.isPageChanged) {
      const isLogin = getIsLogin() ? JSON.parse(getIsLogin()) : false
      if (!this.isSave && this.$route.path === '/projects' && isLogin) {
        this.$message.warning(this.$t('warningNoSave'))
      }
    }
  },

  methods: {
    onChangeLimited(e) {
      if (!e.target.value) {
        this.maximum = 0
      }
    },

    check() {
      // this.isSave = false
    },

    // get domain info
    getDomainDetail() {
      if (this.selectedDomain) {
        this.$emit('load', true)
        const param = this.selectTreeNode.level === 1 ? this.selectedDomain.name : this.selectedDomain['domain-name']
        getDomain(param).then(data => {
          if (data.domain) {
            data.domain['default-db-server-name'] = data.domain['default-db-server-name'] ? data.domain['default-db-server-name'] : ''
            this.form = data.domain
            this.src = data.domain['physical-directory']
            this.isLimited = data.domain['users-quota'] !== -1
            if (this.isLimited) {
              this.maximum = data.domain['users-quota']
            } else {
              this.maximum = 0
            }
            this.initForm = JSON.parse(JSON.stringify(this.form))
            this.initIsLimited = this.isLimited
            this.initMaximum = this.maximum
          }
        }).catch(_ => {

        }).finally(() => {
          this.$emit('load', false)
        })
      }
    },
    restoreDomain() {
      this.getDomainDetail()
    },

    // update domain
    saveDomain() {
      this.$refs.domainForm.$children[0].validate(valid => {
        if (valid) {
          const db = this.serverList.find(i => i.name === this.form['default-db-server-name'])
          const dbType = db ? db.type : 0
          const putData = {
            ...this.form,
            'default-db-server-type': dbType,
            'users-quota': this.isLimited ? this.maximum : -1
          }
          delete putData.maximum

          this.submiting = true
          updateDomain(this.selectedDomain.name, putData).then(_ => {
            this.submiting = false
            // set domain node data
            this.$store.commit('project/SET_SELECTTREENODE', { ...this.selectTreeNode, data: putData })
            // this.getDomainDetail()
            this.$message.success(this.$t('project.updateDomainSuccess'))
          }).catch(_ => {
            this.submiting = false
          }).finally(() => {
            this.isFormNoChange = this.isLimitedNoChange = this.isMaximumNoChange = true
          })
        }
      })
    },

    // get db list
    getDB() {
      getAllDBServers().then(data => {
        if (data['db-servers'] && data['db-servers']['db-server']) {
          this.serverList = Array.isArray(data['db-servers']['db-server']) ? data['db-servers']['db-server'] : [data['db-servers']['db-server']]
        }
      }).catch(e => {

      })
    }
  }
}
</script>
<style lang="less">
.directories-tooltip{
  .ant-tooltip-content{
    .ant-tooltip-inner{
      word-break: break-all;
    }
  }
}
</style>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.miscellaneous-content{
  padding: 0 20px 20px 20px;
  background-color: @white;
  height: calc(100% - 65px);
  overflow-y: auto;
}
.miscellaneous-row-number{
  margin: 0 10px;
}

.project-bottom-btn{
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 64px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top:1px solid fade(@dim-gray,16%);
  background-color: @white;
}

</style>
