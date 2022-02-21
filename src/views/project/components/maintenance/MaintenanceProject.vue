<template>
  <span>
    <a-dropdown :trigger="['click']" :disabled="isDisabled">
      <a-tooltip
        :title="$t('project.project_maintenance')"
      >
        <a-button
          id="span-icon-setting"
          class="tool-dropdown-btn"
          type="link"
          :disabled="isDisabled"
        >
          <i class="iconfont icon-Project-MaintainProjects tool-dropdown-btn-i" />
          <i class="iconfont icon-CaretDown tool-dropdown-btn-i tool-CaretDown-btn-i" />
        </a-button>
      </a-tooltip>
      <a-menu slot="overlay" @click="onSettingChange">
        <a-menu-item key="upgrade" :disabled="actionDisabled">
          <span class="maintenance-item"><i id="menu-Upgrade" class="iconfont icon-Project-UpgradeProject" />{{ $t('project.UpgradeProject') }}</span>
        </a-menu-item>
        <a-menu-item key="verify" :disabled="actionDisabled">
          <span class="maintenance-item"><i id="menu-Verify" class="iconfont icon-Project-Verify" />{{ $t('project.VerifyProject') }}</span>
        </a-menu-item>
        <a-menu-item key="repair" :disabled="actionDisabled">
          <span class="maintenance-item"><i id="menu-Repair" class="iconfont icon-Project-RepairProject" />{{ $t('project.RepairProject') }}</span>
        </a-menu-item>
        <a-menu-item key="convert" :disabled="actionDisabled || isUnicode">
          <span class="maintenance-item"><i id="menu-Convert" class="iconfont icon-Project-ConvertToUnicode" />{{ $t('project.ConvertToUnicode') }}</span>
        </a-menu-item>
        <a-sub-menu v-if="showRecovery" key="tool" :disabled="actionDisabled" class="mf-tool-more-dropdown">
          <span slot="title" class="maintenance-item">
            <i id="menu-Recovery" class="iconfont icon-Project-RecoveryTool" />
            {{ $t('project.RecoveryTool') }}
          </span>
          <a-menu-item key="realign">
            <span class="maintenance-item">
              <i id="menu-Recovery" class="iconfont icon-a-Project-repairrecovery" />
              {{ $t('project.realign_repository') }}
            </span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-dropdown>
    <project-maintenance ref="upgrade" />
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import { isSiteAdmin } from '@/utils/permission'
import ProjectMaintenance from './components/ProjectMaintenance'
import { DATABASE_TYPE } from '@/store/const'

export default {
  components: { ProjectMaintenance },
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    },
    showRecovery: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['selectTreeNode']),
    project() {
      return this.selectTreeNode ? this.selectTreeNode.data : {}
    },

    actionDisabled() {
      return this.project.status === 'Maintenance'
    },

    isUnicode() {
      if (this.project['db-type'] === DATABASE_TYPE.MSSQL) {
        return this.project['is-unicode']
      } else {
        return true
      }
    }
  },

  methods: {
    isSiteAdmin,
    onSettingChange({ item, key, keyPath }) {
      switch (key) {
        case 'upgrade':
          this.$refs.upgrade.show(1) // 1: upgrade
          break
        case 'verify':
          this.$refs.upgrade.show(5) // 1: upgrade
          break
        case 'repair':
          this.$refs.upgrade.show(2) // 2: repaire
          break
        case 'convert':
          this.$refs.upgrade.show(3) // 3: convert to unicode
          break
        case 'realign':
          this.$refs.upgrade.show(4) // 4: realign
          break
      }
    }
  }
}
</script>

<style scoped>
.maintenance-item{
  display: flex;
  align-items: center;
}
.maintenance-item i{
  height: 20px;
  margin-right: 8px;
}
.mf-tool-more-dropdown /deep/ .ant-dropdown-menu-submenu-arrow {
  right: 3px;
  top: 4px;
}
</style>
