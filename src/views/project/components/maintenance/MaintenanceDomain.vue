<template>
  <span>
    <a-dropdown :trigger="['click']">
      <a-tooltip
        :title="$t('project.domain_maintenance')"
      >
        <a-button
          id="span-icon-setting"
          class="tool-dropdown-btn"
          type="link"
        >
          <i class="iconfont icon-Project-MaintainProjects tool-dropdown-btn-i" />
          <i class="iconfont icon-CaretDown tool-dropdown-btn-i tool-CaretDown-btn-i" />
        </a-button>
      </a-tooltip>
      <a-menu slot="overlay" @click="onSettingChange">
        <a-menu-item key="upgrade" :disabled="!domainHasProjects">
          <span class="maintenance-item">
            <i id="menu-Upgrade" class="iconfont icon-Project-UpgradeProject" />
            {{ $t('project.UpgradeDomain') }}
          </span>
        </a-menu-item>
        <a-menu-item key="verify" :disabled="!domainHasProjects">
          <span class="maintenance-item">
            <i id="menu-Verify" class="iconfont icon-Project-Verify" />
            {{ $t('project.VerifyDomain') }}
          </span>
        </a-menu-item>
        <a-menu-item key="repair" :disabled="!domainHasProjects">
          <span class="maintenance-item">
            <i id="menu-Repair" class="iconfont icon-Project-RepairProject" />
            {{ $t('project.RepairDomain') }}
          </span>
        </a-menu-item>
        <a-menu-item key="convert" :disabled="!domainHasSqlProjects">
          <span class="maintenance-item">
            <i id="menu-Convert" class="iconfont icon-Project-ConvertToUnicode" />
            {{ $t('project.ConvertToUnicodeInDomain') }}
          </span>
        </a-menu-item>
        <a-sub-menu v-if="showRecovery" key="tool" :disabled="!domainHasProjects" class="mf-tool-more-dropdown">
          <span slot="title" class="maintenance-item">
            <i id="menu-Recovery" class="iconfont icon-Project-RecoveryTool" />
            {{ $t('project.RecoveryTool') }}
          </span>
          <a-menu-item key="realign">
            <span class="maintenance-item">
              <i id="menu-Recovery-child" class="iconfont icon-a-Project-repairrecovery" />
              {{ $t('project.realign_repository') }}
            </span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-dropdown>
    <upgrade-domain ref="upgrade" />
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import { isSiteAdmin } from '@/utils/permission'
import UpgradeDomain from './components/DomainMaintenance'
// import VerifyDomain from './components/VerifyDomain'

export default {
  components: { UpgradeDomain },
  props: {
    showRecovery: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters(['selectTreeNode', 'domainHasSqlProjects', 'domainHasProjects']),
    nodeType() {
      if (this.selectTreeNode) {
        return (this.selectTreeNode && this.selectTreeNode.level === 3) || this.projectType === 'LAB_PROJECT' ? 'project' : ''
      }
      return ''
    }
  },

  methods: {
    isSiteAdmin,
    onSettingChange({ item, key, keyPath }) {
      if (key === 'upgrade') {
        this.$refs.upgrade.show(1) // 1: upgrade
      }

      if (key === 'verify') {
        this.$refs.upgrade.show(5)
      }

      if (key === 'repair') {
        this.$refs.upgrade.show(2) // 2: repaire
      }

      if (key === 'convert') {
        this.$refs.upgrade.show(3) // 3: convert to unicode
      }

      if (key === 'realign') {
        this.$refs.upgrade.show(4) // 4: realign
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
