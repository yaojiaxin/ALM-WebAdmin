<template>
  <mf-modal
    id="project_change_db_password"
    :visible="visible"
    :confirm-loading="loading"
    width="435px"
    :ok-text="$t('OK')"
    @cancel="onCancel"
    @ok="onSave"
  >
    <span slot="title">
      {{ $t('project.connectionString') }}
      <mf-help-btn :help="TEST_CONNECTION_STRING" />
    </span>

    <mf-form
      ref="connectionForm"
      :model="connectionForm"
      :rules="rules"
      layout="vertical"
    >
      <a-form-model-item prop="connection">
        <a-input id="connection" v-model="connectionForm.connection" :max-length="255" />
      </a-form-model-item>

      <div style="display: flex; flex-direction: row-reverse;">
        <a-button type="link" class="mf-btn-link-primary" @click="onTestConnection"> {{ $t('project.testConnection') }} </a-button>
      </div>

    </mf-form>
  </mf-modal>
</template>

<script>
import { TEST_CONNECTION_STRING } from 'config/help'
import { pingProject, updateProject } from '@/api/project'

export default {
  data() {
    return {
      visible: false,
      loading: false,
      isChange: false,
      isTestConnect: true,
      isTestSuccess: true,
      oldConnectString: '',

      TEST_CONNECTION_STRING,

      connectionForm: {
        connection: '',
        name: ''
      },

      rules: {
        connection: [{ required: true, message: this.$t('project.connectionStringRequired') }]
      }
    }
  },

  watch: {
    // Listens for changes to the connection string
    'connectionForm.connection': function(val, oldVal) {
      if (val !== this.oldConnectString) {
        this.isChange = true
        this.isTestConnect = false
      } else {
        this.isChange = false
        this.isTestConnect = true
        this.isTestSuccess = true
      }
    }
  },

  methods: {
    onShow(dbInfo) {
      this.visible = true
      this.connectionForm = dbInfo
      this.oldConnectString = dbInfo.connection
    },

    onCancel() {
      this.$refs.connectionForm.$children[0].resetFields()
      this.isChange = false
      this.isTestConnect = true
      this.isTestSuccess = true
      this.visible = false
    },

    onSave() {
      this.$refs.connectionForm.$children[0].validate(valid => {
        if (valid) {
          // Connection string has been modified
          if (this.isChange) {
            // Connection string is tested
            if (this.isTestConnect) {
              // Test success
              if (this.isTestSuccess) {
                this.saveConnectionString()
              } else {
                this.$mfConfirm({
                  message: this.$t('project.confirmFailedConnectSave'),
                  onConfirm: () => {
                    return this.saveConnectionString()
                  }
                })
              }
            } else {
              this.$mfConfirm({
                message: this.$t('project.confirmSaveConnectWithoutTest'),
                onConfirm: () => {
                  return this.saveConnectionString()
                }
              })
            }
          } else {
            this.visible = false
          }
        }
      })
    },

    saveConnectionString() {
      this.loading = true
      updateProject({
        domain: this.connectionForm['domain-name'],
        project: this.connectionForm.project,
        data: {
          'db-connstr-format': this.connectionForm.connection
        }
      }).then(data => {
        this.$emit('ok', data.project['db-connstr-format'])
        this.$message.success(this.$t('servers.ConnectingStringOK'))
        this.visible = false
      }).finally(() => {
        this.loading = false
      })
    },

    // ping connection string
    onTestConnection() {
      // pingDb(-1, {
      //   'connection-string': this.connectionForm.connection,
      //   name: this.connectionForm.name,
      //   type: this.connectionForm.type
      // }).then(data => {
      //   this.isTestConnect = true
      //   this.isTestSuccess = true
      // }).catch(() => {
      //   this.isTestConnect = true
      //   this.isTestSuccess = false
      // })
      this.loading = true
      pingProject({
        domain: this.connectionForm['domain-name'],
        project: this.connectionForm.project
      }, {
        project: {
          'db-connstr-format': this.connectionForm.connection
        }
      }).then(data => {
        this.isTestConnect = true
        this.isTestSuccess = true
        this.$message.success(this.$t('project.pingSuccess'))
      }).catch(() => {
        this.isTestConnect = true
        this.isTestSuccess = false
        // this.$message.success(this.$t('project.pingError'))
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style>

</style>
