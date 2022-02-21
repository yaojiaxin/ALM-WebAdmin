<template>
  <div class="mf-display-inherit">
    <icon-btn
      id="a-icon-addDomain"
      :icon-title="$t('project.create_domain')"
      icon-style="icon-Project-CreateDomain"
      @onClick="onShowCreateModal"
    >
      <span slot="btnName" class="btn-name">{{ $t('project.CreateDomain') }}</span>
    </icon-btn>

    <mf-modal
      :visible="visible"
      width="430px"
      :confirm-loading="loading"
      destroy-on-close
      @ok="onAddProjectDomain"
      @cancel="onCancelModal"
    >
      <span slot="title">{{ $t('project.CreateDomain') }}
        <mf-help-btn :help="ADD_DOMAIN" />
      </span>
      <mf-form
        ref="addNameForm"
        :model="form"
        :rules="rules"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item :label="$t('domainName')" prop="domainName">
          <a-input id="create-domain" v-model.trim="nameComputed" :max-length="30" @keyup.enter.native="onAddProjectDomain" />
        </a-form-model-item>
      </mf-form>
    </mf-modal>

  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import { createProjectDomain } from '@/api/project'
import { ADD_DOMAIN } from 'config/help.js'
// import { validLetterBegin } from '@/utils/validate'
import { eventEmitter } from '../../event'

export default {
  name: 'CreateDomain',
  components: { IconBtn },

  data() {
    return {
      ADD_DOMAIN,
      visible: false,
      form: { domainName: '' },
      rules: {
        domainName: [{ required: true, message: this.$t('project.domain_name_required') }
        ]
      },

      loading: false
    }
  },

  computed: {
    nameComputed: {
      get: function() {
        return this.form.domainName
      },
      set: function(val) {
        this.form.domainName = val.toUpperCase()
      }
    }
  },

  methods: {
    onShowCreateModal() {
      this.visible = true
    },

    onAddProjectDomain() {
      this.$refs.addNameForm.$children[0].validate(valid => {
        if (valid) {
          this.loading = true
          createProjectDomain({
            domain: {
              name: this.form.domainName
            }
          })
            .then(res => {
              const domainName = res.domain.name
              this.visible = false
              this.loading = false
              this.$refs.addNameForm.$children[0].resetFields()
              this.$message.success(this.$t('project.createDomainSuccess'))
              eventEmitter.emit('setTreeSelect', { data: { level: 1, data: { name: domainName, key: domainName }}})
              // this.$emit('refresh')
            }).catch(_ => {
              this.loading = false
            })
        } else {
          return false
        }
      })
    },

    onCancelModal() {
      this.$refs.addNameForm.$children[0].resetFields()
      this.visible = false
    }
  }
}
</script>

<style scoped>

</style>
