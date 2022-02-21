<template>
  <mf-modal
    id="extension_enable_modal"
    :visible="visible"
    width="802px"
    :confirm-loading="confirmLoading"
    :ok-text="$t('Enable')"
    @ok="handleEnableExtensions"
    @cancel="onCancel"
  >
    <span slot="title">
      {{ $t('project.enable_extensions') }}
      <mf-help-btn :help="ENABLE_EXTENSIONS" />
    </span>

    <div class="mf-subtitle mf-margin-b-24">
      {{ $t('project.selectExtensionsForProject') }}
    </div>

    <mf-alert
      :message="$t('project.noteEnableExtension')"
      class="mf-margin-b-24"
      style="margin-left: -24px;width: 802px;"
    />

    <extension-table ref="extensionTableRef" v-model="extensions" :exclude="exclude" :lab-version="labVersion" @checked="onChecked" />
  </mf-modal>
</template>

<script>
import ExtensionTable from '@/components/ExtensionsTable'
import MfAlert from '@/components/MFAlert'
import { EnableExtension } from '@/api/project'
import { ENABLE_EXTENSIONS } from 'config/help.js'
import { mapGetters } from 'vuex'
import { showTaskReminder } from '@/utils'
import { eventEmitter } from '@/views/project/event'

export default {
  components: { ExtensionTable, MfAlert },
  props: {
    exclude: {
      type: Array,
      default: () => []
    },
    labVersion: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,

      extensions: [],

      ENABLE_EXTENSIONS,

      // Operating results
      result: [],

      selectOneExtensionName: '',

      selectedRows: []
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode']),

    // project status
    isActive: function() {
      return this.selectTreeNode.data['is-active']
    }
  },

  methods: {
    show() {
      this.visible = true
      this.extensions = []
      if (this.$refs.extensionTableRef) {
        this.$refs.extensionTableRef.description = ''
      }
    },

    onCancel() {
      this.visible = false
      // this.extensions = []
    },

    onChecked(val) {
      const { selectedList } = val

      this.selectedRows = selectedList
      if (selectedList.length === 1) {
        this.selectOneExtensionName = selectedList[0]['display-name']
      }
    },

    // show enable extension confirm
    extensionsEnable() {
      this.$mfConfirm({
        title: this.$t('project.information'),
        iconType: 'Information',
        message: this.extensions.length === 1 ? this.$t('project.informContentOneExtension', { extension: this.selectOneExtensionName }) : this.$t('project.informContent'),
        onConfirm: this.confirmIsActive
      })
    },

    // Determine the current project status
    // If enabled, deactivate, otherwise continue
    confirmIsActive() {
      const selectedProject = this.selectTreeNode.data
      if (this.isActive) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('project.deactivateProject', { name: selectedProject.name }),
          onConfirm: () => {
            return this.$store.dispatch('project/deactiveProject', selectedProject)
          },
          callback: this.enableExtensions
        })
      } else {
        this.enableExtensions()
      }
    },

    // enable extension
    handleEnableExtensions() {
      if (this.extensions && this.extensions.length > 0) {
        const dependencies = this.selectedRows.filter(i => !i['is-license-dependencies-met'])
        if (dependencies.length > 0) {
          this.$mfConfirm({
            message: this.$t('project.extension_license_dependencies_met_message', { names: dependencies.map(i => i['display-name']).join(',') }),
            confirmText: this.$t('OK'),
            onConfirm: () => {
              return this.extensionsEnable()
            }
          })
        } else {
          this.extensionsEnable()
        }

        // const dependencies = this.selectedRows.filter(i => !i['is-license-dependencies-met'])
        // const extensionDependencies = []
        //
        // dependencies.map(i => {
        //   if (Array.isArray(i['extension-dependency'])) {
        //     extensionDependencies.push(...i['extension-dependency'])
        //   } else {
        //     extensionDependencies.push(i['extension-dependency'])
        //   }
        // })
        //
        // const dependenciesMet = []
        // extensionDependencies.forEach(item => {
        //   const isExist = dependenciesMet.find(i => i.name === item.name)
        //   if (!isExist) {
        //     dependenciesMet.push(item)
        //   }
        // })
        //
        // if (dependenciesMet.length > 0) {
        //   this.$mfConfirm({
        //     message: this.$t('project.extension_license_dependencies_met_message', { names: dependenciesMet.map(i => i['display-name']).join(',') }),
        //     confirmText: this.$t('OK'),
        //     onConfirm: () => {
        //       return this.extensionsEnable()
        //     }
        //   })
        // } else {
        //   this.extensionsEnable()
        // }
      } else {
        this.$message.error(this.$t('project.selectExtensionWarning'))
      }
    },

    enableExtensions() {
      const selectedProject = this.selectTreeNode.data
      this.confirmLoading = true
      const params = this.extensions.map(i => {
        return { name: i }
      })

      EnableExtension({
        domain: selectedProject['domain-name'],
        project: selectedProject.name,
        extension: { extensions: { extension: params }}
      }).then(() => {
        this.confirmLoading = false
        this.visible = false
        // this.$mfConfirm({
        //   id: 'project_sync_infomation',
        //   title: this.$t('Information'),
        //   iconType: 'Information',
        //   message: this.$t('operationInProcessWarning'),
        //   isShowCancel: false,
        //   confirmText: this.$t('OK')
        // })

        // show task reminder
        showTaskReminder(this.$store, true)
        eventEmitter.emit('projectSelected', 'details')
      }).catch(() => {
        this.confirmLoading = false
      })
    },

    // Click on the results page to continue
    onContinue() {
      const selectedProject = this.selectTreeNode.data

      this.$mfConfirm({
        title: this.$t('confirm'),
        message: this.$t('project.inConfirmContent'),
        onConfirm: () => {
          return this.$store.dispatch('project/activeProject', selectedProject)
        },
        callback: this.isToLabManagement
      })
    },

    isToLabManagement() {
      if (this.extensions && this.extensions.length > 0 && this.extensions.includes('PCPROJECT')) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('project.isLinkToLabManagement'),
          onConfirm: () => {
            this.$router.push({ path: 'lab' })
          }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
