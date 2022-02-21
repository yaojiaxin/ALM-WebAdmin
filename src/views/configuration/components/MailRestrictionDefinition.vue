<template>
  <mf-modal
    :visible="visible"
    :confirm-loading="loading"
    :ok-text="$t('OK')"
    @cancel="onCancel"
    @ok="onSubmit"
  >
    <span slot="title">
      {{ $t('configuration.MailRestrictionDefinition') }}
      <mf-help-btn style="font-size: 16px" :help="MAIL_RESTRICTION" />
    </span>
    <div class="form-title mf-h5 csv-h5">
      {{ $t('configuration.ServerInformation') }}
      <a-tooltip
        :title="$t('configuration.ServerInformationTooltip')"
        placement="right"
        class="tree-user-hi"
        :overlay-style="{'white-space': 'pre-line'}"
      >
        <a-icon style="font-size: 16px; color: #595757" type="exclamation-circle" />
      </a-tooltip>
    </div>

    <a-radio-group v-model="selectRadio">
      <a-radio id="mail_all" class="a-radio" :value="radioGroup.mailAll">
        {{ $t('configuration.All') }}
      </a-radio>
      <a-radio id="mail_users" class="a-radio" :value="radioGroup.mailUsers">
        {{ $t('configuration.PerSiteLevel') }}
      </a-radio>
      <a-radio id="mail_project" class="a-radio" :value="radioGroup.mailProject">
        {{ $t('configuration.PerProject') }}
      </a-radio>
    </a-radio-group>

  </mf-modal>

</template>

<script>
import { addConfigurationParameter, editConfigurationParameter, getParameterByParamName } from '@/api/configuration'
import { MAIL_SETTINGS, MAIL_RESTRICTION } from 'config/help'
import { MAIL_RESTRICTION_LEVEL } from '@/store/const'

export default {
  name: 'MailRestrictionDefinition',
  props: {
    parameters: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      visible: false,
      MAIL_RESTRICTION,
      MAIL_SETTINGS,
      radioGroup: {
        mailAll: 'MAIL_ALL',
        mailUsers: 'MAIL_USERS',
        mailProject: 'MAIL_PROJECT'
      },
      loading: false,
      selectRadio: '',
      MAIL_RESTRICTION_LEVEL,
      hasItem: null
    }
  },
  methods: {
    show() {
      this.visible = true
      // MAIL_RESTRICTION_LEVEL is exist?
      this.hasItem = this.parameters.find((item) => {
        return item.name === this.MAIL_RESTRICTION_LEVEL
      })
      // if MAIL_RESTRICTION_LEVEL not exist，The query returns an error
      if (this.hasItem) {
        getParameterByParamName(this.MAIL_RESTRICTION_LEVEL).then(response => {
          this.selectRadio = response['site-parameter'].value
        })
      } else {
        this.selectRadio = ''
      }
    },

    onSubmit() {
      this.visible = false
      this.loading = true
      // If MAIL_RESTRICTION_LEVEL exist , modify it directly
      if (this.hasItem) {
        editConfigurationParameter(
          {
            'site-parameter': {
              name: this.MAIL_RESTRICTION_LEVEL,
              value: this.selectRadio
            }
          },
          this.MAIL_RESTRICTION_LEVEL
        ).then(response => {
          this.$emit('refreshTableData')
          this.visible = false
          this.loading = false
        }).catch((error) => {
          this.loading = false
          this.$message.error(error)
        })
      } else {
        // If MAIL_RESTRICTION_LEVEL not exist , add it
        addConfigurationParameter({
          'site-parameter': {
            name: this.MAIL_RESTRICTION_LEVEL,
            value: this.selectRadio,
            description: ''
          }
        }).then(response => {
          this.$emit('refreshTableData')
          this.visible = false
          this.loading = false
        }).catch(e => {
          this.loading = false
        })
      }
    },
    onCancel() {
      this.visible = false
    }
  }
}
</script>

<style scoped lang="less">
.form-title{
  margin-bottom: 16px;
  color: #000000;
  font-size: 14px !important;
  font-weight: bold;
  line-height: 16px;
}
.tree-user-hi{
  margin-left: 10px;
}
.a-radio {
  display: block;
  height: 30px;
  line-height: 30px
}
</style>
