<template>
  <div id="restrictions" class="content">
    <div class="authentication-content-right">

      <div class="right-header">
        <span class="mf-subtitle">{{ $t('authentication.Restrictions') }}</span>
      </div>

      <div class="right-cont">
        <div class="cont-item">
          <restriction-item
            v-for="(item, index) in formValidators"
            :key="index"
            v-model="item.restriction"
            :validator="item.description"
            @change="onChange"
          />
        </div>

      </div>

    </div>
    <div class="right-footer">
      <a-button
        id="restore-restrictions"
        :disabled="saveBtnDisabled"
        style="margin-right: 8px;"
        class="mf-btn-dashed"
        @click="onRestoreRestrictions"
      >
        {{ $t('Restore') }}
      </a-button>
      <a-button
        v-if="checkPermission(['MY_CUSTOMER_CONTEXT_POLICIES_MANAGE'],['SWITCHED_CUSTOMER_CONTEXT_POLICIES_MANAGE'])"
        id="savePolicy"
        class="footer-btn"
        type="primary"
        :loading="loading"
        :disabled="saveBtnDisabled"
        @click="onSavePolicy"
      >
        {{ $t('Save') }}

      </a-button>
    </div>
  </div>

</template>

<script>
import RestrictionItem from './RestrictionItem'
import { getAllValidators, updateAPolicy, getOnePolicy } from '@/api/authentication'
import { isChangeObjorArr } from '@/utils'

export default {
  components: { RestrictionItem },
  props: {
    list: {
      default: () => [],
      type: Array
    },

    policyId: {
      type: Number,
      default: 0
    },
    policyName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      value: 1,
      validators: [],

      formValidators: [],
      initFormValidators: [],

      loading: false,
      saveBtnDisabled: true,

      selected: '',
      selectedName: '',
      isDefault: false
    }
  },

  watch: {
    formValidators: {
      handler: function(form) {
        this.saveBtnDisabled = isChangeObjorArr(form, this.initFormValidators)
        if (!this.saveBtnDisabled) {
          this.$store.dispatch('pageChange/pageChanged', { func: null, params: [] })
        } else {
          this.$store.dispatch('pageChange/resetPageChanged')
        }
      },
      deep: true
    }
  },

  created() {
    this.getAllValidators()
  },

  methods: {
    // get details of selected policy
    getOnePolicy(id, name, isDefault) {
      this.selected = id
      this.selectedName = name
      this.isDefault = isDefault
      getOnePolicy(id).then((request) => {
        let validators = []
        Array.isArray(request.policy.validators) ? validators = request.policy.validators : validators.push(request.policy.validators)
        const forms = []
        // reset formValidators
        this.validators.forEach(item => {
          forms.push({
            restriction: {
              validatorId: item['validator-type'],
              isMandatory: false,
              parameters: Array.isArray(item.parameters) ? item.parameters.map(item => {
                return { param: item }
              }) : item.parameters,
              checked: false
            },

            description: item.description
          })
        })
        // match existed validators form
        if (validators[0]) {
          validators.forEach(item => {
            let parameters = ''
            const index = forms.findIndex(value => value.restriction.validatorId === item['validator-type'])
            parameters = item.parameters
            if (parameters !== undefined) {
              forms[index].restriction.parameters = Array.isArray(parameters) ? parameters.map(i => {
                return { param: i }
              }) : parameters
            } else {
              forms[index].restriction.parameters = null
            }
            forms[index].restriction.isMandatory = item['is-mandatory']
            forms[index].restriction.validatorId = item['validator-type']
            forms[index].restriction.checked = true
          })
        }

        this.formValidators = forms
        this.initFormValidators = JSON.parse(JSON.stringify(this.formValidators))
      })
    },

    // save policy
    onSavePolicy() {
      const validators = this.formatValidators()
      const passwordValidator = validators.find(item => item['validator-type'] === 5)
      if (!validators.length) {
        // this.$message.error(this.$t('authentication.save_policy_one_error'))
        // return
      } else if (passwordValidator && Number(passwordValidator.parameters[0]) > Number(passwordValidator.parameters[1])) {
        this.$message.error(this.$t('authentication.password_error'))
        return
      }
      this.loading = true

      updateAPolicy(
        {
          policy: {
            'policy-id': this.selected,
            'is-default': this.isDefault,
            'policy-name': this.selectedName,
            validators: validators.length === 0 ? {} : validators
          }
        }
      ).then(data => {
        this.loading = false
        this.$message.success(this.$t('authentication.policy_save_success'))
        this.getOnePolicy(this.selected, this.selectedName, this.isDefault)
      }).catch(() => {
        this.loading = false
      }).finally(() => {
        this.saveBtnDisabled = true
      })
    },

    // set validators data
    formatValidators() {
      const arr = []

      this.formValidators.map(item => {
        const res = item.restriction
        if (res.parameters !== null && res.checked) {
          if (res.validatorId === 5) {
            arr.push({
              'validator-type': res.validatorId,
              'is-mandatory': res.isMandatory,
              parameters: res.parameters.map(item => {
                return item.param === null || item.param === undefined || item.param === '' ? 0 : item.param
              })
            })
          } else {
            arr.push({
              'validator-type': res.validatorId,
              'is-mandatory': res.isMandatory,
              parameters: Array.isArray(res.parameters) ? res.parameters.map(item => {
                return item.param
              }) : res.parameters
            })
          }
        } else if (res.parameters === null && res.checked) {
          arr.push({
            'validator-type': res.validatorId,
            'is-mandatory': res.isMandatory
          })
        }
      })
      return arr
    },

    // get all validators
    getAllValidators() {
      getAllValidators().then((res) => {
        this.validators = res.validators.validator
        const forms = []

        this.validators.forEach(item => {
          forms.push({
            restriction: {
              validatorId: item['validator-type'],
              isMandatory: false,
              parameters: Array.isArray(item.parameters) ? item.parameters.map(item => {
                return { param: item }
              }) : item.parameters,
              checked: false
            },

            description: item.description
          })
        })
        this.formValidators = forms
        this.initFormValidators = JSON.parse(JSON.stringify(this.formValidators))
        this.$parent.getPolicies()
      })
    },

    onChange() {
      this.saveBtnDisabled = false
    },
    onRestoreRestrictions() {
      this.getOnePolicy(this.selected, this.selectedName, this.isDefault)
    }
  }
}
</script>

<style lang="less">
  .content{
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 70%;
    position: relative;
  }
  .authentication-content-right{
    width: 100%;
    height: auto;
    border-right: 1px solid rgba(101, 102, 104, 0.16);
    background: #ffffff;
    overflow: hidden;
  }

  .right-header{
    font-size: 14px;
    font-family: BoldWeb, serif;
    font-weight: bold;
    color: #333333;
    padding-left: 24px;
    height: 40px;
    width: 100%;
    display: flex;
    align-items: center;
  }

  .right-cont{
    padding-left: 24px;
    // border-bottom: 1px solid #DCDEDF;
    overflow: auto;
    margin-bottom: 63px;
    height: calc(100vh - 265px);
  }

  .main-has-customer .right-cont{
    height: calc(100vh - 307px);
  }

  .cont-item{
    padding-bottom: 20px;
  }

  .right-cont-txt-che{
    margin-left: 24px;
    font-size: 16px;
    font-family: RegularWeb, serif;
    font-weight: 400;
    color: #323435;
    line-height: 19px;
  }

  .right-cont-txt{
    margin-left: 10px;
    font-size: 16px;
    font-family: RegularWeb, serif;
    font-weight: 400;
    color: #323435;
    line-height: 19px;
    word-wrap:break-word;
  }

  .inputNumber{
    margin:0 8px;
    width: 70px;
  }

  .right-footer{
    display: flex;
    justify-content: flex-end;
    align-items: center;
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 64px;
    background: #ffffff;
    border: 1px solid rgba(101, 102, 104, 0.16);
    border-left: none;
    // box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
  }

  .footer-btn{
    margin-right: 24px;
    min-width: 96px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1px;
  }
</style>
