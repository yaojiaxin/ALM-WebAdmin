<template>
  <div id="tool-bar" class="mf-tool-bar">
    <!-- AddParameter -->
    <span class="title">{{ $t('configuration.CONFIGURATION') }}</span>
    <add-parameter
      style="margin-left: 24px"
      @refreshTableData="addParameterRefresh"
    />
    <!-- ExportParameter -->
    <icon-btn
      id="export_parameter"
      :icon-title="$t('export')"
      icon-style="icon-Configuration_export"
      @onClick="configurationDownloadCsv"
    />
    <!-- DeleteParameter -->
    <delete-parameter
      :selected-parameter="selectedItem"
      @refreshTableData="$emit('refresh')"
    />
    <!-- refresh -->
    <icon-btn
      id="refresh_parameter"
      :icon-title="$t('refresh')"
      icon-style="icon-refresh"
      @onClick="$emit('refresh')"
    />

    <!-- setting -->
    <a-dropdown :trigger="['click']">
      <a-tooltip
        :title="$t('configuration.SiteSettings')"
      >
        <a-button
          id="span-icon-setting"
          class="tool-dropdown-btn"
          type="link"
        >
          <i class="iconfont icon-setting tool-dropdown-btn-i" />
          <i class="iconfont icon-CaretDown tool-dropdown-btn-i tool-CaretDown-btn-i" />
        </a-button>
      </a-tooltip>

      <a-menu slot="overlay">
        <a-menu-item id="mail_setting" key="1" @click="onShowModal('MailSetting')">
          {{ $t('configuration.SetMailProtocol') }}
        </a-menu-item>
        <a-menu-item id="mail_restriction" key="2" @click="onShowModal('mailRestrictionDefinition')">
          {{ $t('configuration.MailRestriction') }}
        </a-menu-item>
      </a-menu>
    </a-dropdown>
    <mail-restriction-definition
      ref="mailRestrictionDefinition"
      :parameters="parameters"
      @onClick="$emit('refresh')"
      @refreshTableData="$emit('refresh')"
    />
    <mail-setting
      ref="MailSetting"
      @refresh="$emit('refresh')"
    />
  </div>
</template>

<script>
import DeleteParameter from '@/views/configuration/components/DeleteParameter'
import AddParameter from '@/views/configuration/components/AddParameter'
import MailRestrictionDefinition from '@/views/configuration/components/MailRestrictionDefinition'
import MailSetting from '@/views/configuration/components/MailSetting/index'
import IconBtn from '@/components/BtnIcon/index'
// eslint-disable-next-line no-unused-vars
import { downloadCsv } from '@/utils/downloadCsv'
import { sorting } from '@/utils'

export default {
  name: 'ConfigurationToolBar',
  components: {
    DeleteParameter,
    AddParameter,
    MailRestrictionDefinition,
    MailSetting,
    IconBtn
  },
  props: {
    selectedItem: {
      type: Object,
      default: function() {
        return {}
      }
    },
    parameters: {
      type: Array,
      default() {
        return []
      }
    },
    sortedInfos: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  methods: {
    onShowModal(type) {
      this.$refs[type].show()
    },
    addParameterRefresh(name) {
      this.$emit('refresh', name)
    },
    configurationDownloadCsv() {
      const order = this.sortedInfos.order
      const columnKey = this.sortedInfos.columnKey
      const configurationList = this.parameters.map(item => {
        return {
          name: item.name,
          value: item.value
        }
      })
      configurationList.sort(function(a, b) {
        if (order === 'ascend') {
          return sorting(a[columnKey], b[columnKey])
        } else if (order === 'descend') {
          return sorting(b[columnKey], a[columnKey])
        }
      })
      downloadCsv(configurationList, 'configuration', 'text')
    }
  }

}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';

.mf-tool-bar{
  display: flex;
  align-items: center;
  height: 55px;
  background-color: @white;
  border-left: 1px solid rgba(101, 102, 104, 0.16);
  border-right: 1px solid rgba(101, 102, 104, 0.16);
  //border-bottom: 0;
  //box-shadow: 2px 0 0 #dcdedf;
}
.title{
  padding: 16px 0 13px 24px;
  font-family: MediumWeb, serif;

}
</style>
