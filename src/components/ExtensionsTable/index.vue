<template>
  <div style="height: 300px">
    <mf-table
      id="extensionTable"
      ref="table"
      row-key="name"
      :data="getextensions"
      :show-pagionation="false"
      :columns="columns"
      :row-selection="{selectedRowKeys:selectedKeys,onChange:onChange,onSelect:onSelect}"
      :row-class-name="setRowClassName"
      :custom-row="rowClick"
      :scroll="{y: 150}"
      size="small"
    >
      <span slot="name" slot-scope="text, record">
        <span :class="record['is-license-dependencies-met'] ? '' : 'disable'">{{ text }}</span>
        <a-tooltip v-if="!record['is-license-dependencies-met']" placement="right">
          <template slot="title">
            {{ $t('project.licenseStatus') }}
          </template>
          <span>
            <svg-icon icon-class="warning" class="warning-icon" />
          </span>
        </a-tooltip>
      </span>
    </mf-table>

    <div class="mf-subtitle" style="margin: 24px 0 8px 0">{{ $t('userManagement.Description') }}</div>
    <p class="mf-margin-l-14" style="font-size: 16px">
      {{ description }}
    </p>
  </div>
</template>

<script>
import { getSiteExtensions } from '@/api/project'

export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },

    // You need to exclude items when loading the domain tree
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
      columns: Object.freeze([{
        title: this.$t('project.ExtensionsName'),
        dataIndex: 'display-name',
        scopedSlots: {
          customRender: 'name'
        }
      }]),

      selectedKeys: [],

      description: '',

      clickRow: { name: '' },

      extensionList: []
    }
  },

  watch: {
    value: function(val) {
      this.selectedKeys = val
    },

    selectedKeys: function(val) {
      this.$emit('input', val)
      const selectedList = this.extensionList.filter(it => val.includes(it.name))
      this.$emit('checked', { selectedList, dependency: this.isDependency(selectedList) })
    },

    exclude: function(val) {
      this.$refs.table.loadData()
    }
  },

  methods: {
    rowClick(record, index) {
      const _this = this

      return {
        on: {
          click(event) {
            _this.clickRow = record
            _this.description = record.description
          }
        }
      }
    },
    onChange(selectedRowKeys, selectedRows) {
      this.selectedKeys = selectedRowKeys
      // const labExtension = this.extensionList.find(item => item.name === 'PCPROJECT')
      // if (labExtension && selectedRowKeys.indexOf('PCPROJECT') > -1 && this.labVersion !== labExtension.version) {
      //   this.selectedKeys.splice(this.selectedKeys.findIndex(item => item === 'PCPROJECT'), 1)
      //   this.$mfConfirm({
      //     message: this.$t('project.enable_Lab_extension_warning'),
      //     isShowCancel: false,
      //     confirmText: this.$t('OK'),
      //     title: this.$t('Warning'),
      //     iconType: 'Warning'
      //   })
      // }
    },

    onSelect(record, selected, selectedRows, nativeEvent) {
      if (record) {
        this.description = record.description
      } else {
        this.description = ''
      }
    },

    isDependency(list) {
      const info = []
      list.forEach(item => {
        if (item['extension-dependency'] && item['extension-dependency'] instanceof Array) {
          const dependency = item['extension-dependency'].filter(it => it['display-name'] !== 'Quality Center')
          const hasDependency = dependency.filter(it => !list.some(target => target['display-name'] === it['display-name']))
          if (hasDependency.length) {
            info.push({
              enabled: item['display-name'],
              dependency: hasDependency[0]['display-name']
            })
          } else {
            info.splice(0, info.length)
          }
        }
      })
      return info
    },
    getextensions() {
      return getSiteExtensions().then(data => {
        let tableList = data.extensions && data.extensions.extension
        tableList = Array.isArray(tableList) ? tableList : [tableList]
        tableList = tableList.filter(i => i['is-visible'] && i['is-enable-allowed'])
        if (this.exclude && this.exclude.length > 0) {
          this.extensionList = tableList.filter(x => this.exclude.findIndex(j => j.name === x.name) === -1)
          return this.extensionList
        }
        this.extensionList = tableList
        return this.extensionList
      }).catch(() => {

      })
    },

    // to set row click style (same as selected)
    setRowClassName(record, index) {
      return record.description === this.description ? 'ant-table-row-selected' : ''
    }
  }
}
</script>

<style scoped lang="less">
.disable{
  color: rgba(0,0,0,0.2);
}

.warning-icon{
  margin-left: 8px;
}

#extensionTable /deep/.ant-table-fixed-header .ant-table-scroll .ant-table-header {
  overflow-y: hidden !important;
}
</style>
