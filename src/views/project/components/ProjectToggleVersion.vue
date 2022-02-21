<template>
  <div class="mf-display-inherit">
    <icon-btn
      v-if="isVersion"
      id="project-disable-versioning"
      icon-style="icon-Project-EnableVersioning"
      :icon-title="$t('project.disable_versioning')"
      :is-disabled="isDisabled"
      @onClick="onToggleStatus"
    >
      <span slot="btnName" class="btn-name">{{ $t('project.disable_versioning') }}</span>

    </icon-btn>
    <icon-btn
      v-else
      id="project-enable-versioning"
      icon-style="icon-Project-DisableVersioning"
      :icon-title="$t('project.enable_versioning')"
      :is-disabled="isDisabled"
      @onClick="onToggleStatus"
    >
      <span slot="btnName" class="btn-name">{{ $t('project.enable_versioning') }}</span>
    </icon-btn>
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import { disableVersioning, enableVersioning } from '@/api/project'
import { mapGetters } from 'vuex'
import { eventEmitter } from '../event'

export default {
  components: {
    IconBtn
  },
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      enableLoading: false,
      params: {},
      activeStatus: false
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode']),
    isVersion: function() {
      return this.selectNode['has-vcs-db']
    },

    isActive: function() {
      return this.selectNode['is-active']
    },

    selectNode() {
      return this.selectTreeNode.data
    }
  },

  methods: {
    onEnableVersionBtn() {
      if (this.isVersion) {
        this.$mfConfirm({
          title: this.$t('warning'),
          message: this.$t('project.confirm_disable_version'),
          iconType: 'Warning',
          onConfirm: () => { return this.disableVersion() }
          // callback: callback
        })
      } else {
        this.enableVersion(this.params)
      }
    },
    onCloseModal() {
      this.visible = false
      this.enableLoading = false
    },
    // disable version
    disableVersion() {
      this.enableLoading = true

      return disableVersioning({
        domain: this.selectNode['domain-name'],
        project: this.selectNode.name
      }).then(res => {
        this.enableLoading = false
        this.visible = false
        this.selectTreeNode.data = { ...this.selectTreeNode.data, ...res.project }
        this.$store.commit('project/SET_SELECTTREENODE', this.selectTreeNode)
        this.$message.success(this.$t('project.disable_versioning_success'))
        eventEmitter.emit('updateProjectNode', res.project)
        eventEmitter.emit('projectSelected', 'details')
        this._restoreStatue()
      }).catch(() => {
        this.enableLoading = false
      })
    },

    // enable version
    enableVersion() {
      this.enableLoading = true
      const hide = this.$message.loading(this.$t('project.enablingVersion', { name: this.selectNode.name }), 0)
      // prevent click event during loading
      document.getElementsByClassName('ant-message')[0].style.bottom = 0
      document.getElementsByClassName('ant-message')[0].style.pointerEvents = 'auto'
      return enableVersioning({
        domain: this.selectNode['domain-name'],
        project: this.selectNode.name
      }).then(res => {
        hide.close()
        document.getElementsByClassName('ant-message')[0].style.bottom = 'unset'
        document.getElementsByClassName('ant-message')[0].style.pointerEvents = 'none'
        this.visible = false
        this.enableLoading = false
        this.selectTreeNode.data = { ...this.selectTreeNode.data, ...res.project }
        this.$store.commit('project/SET_SELECTTREENODE', this.selectTreeNode)
        this.$message.success(this.$t('project.enable_versioning_success'))
        eventEmitter.emit('updateProjectNode', res.project)
        eventEmitter.emit('projectSelected', 'details')
        this._restoreStatue()
      }).catch(() => {
        hide.close()
        this.enableLoading = false
      })
    },
    _restoreStatue() {
      if (this.isActive !== this.activeStatus) {
        this.$store.dispatch((this.activeStatus ? 'project/activeProject' : 'project/deactiveProject'), this.selectNode)
      }
    },
    onToggleStatus() {
      this.activeStatus = this.isActive
      this.params = {
        domain: this.selectNode['domain-name'],
        project: this.selectNode.name,
        treeNode: this.selectNode
      }

      // Determine whether the project has been deactivated. If not, deactivate the project first
      if (this.isActive) {
        this.$mfConfirm({
          message: this.isVersion ? this.$t('project.activeDisabledVersioning', { name: this.selectNode.name }) : this.$t('project.activeEnableVersioning', { name: this.selectNode.name }),
          onConfirm: () => { return this.$store.dispatch('project/deactiveProject', this.selectNode) },
          callback: () => { this.onEnableVersionBtn() }
        })
      } else {
        this.onEnableVersionBtn()
      }
    },

    toggleVersion() {
      this.$mfConfirm({

      })
    }
  }
}
</script>

<style>

</style>
