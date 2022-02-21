<template>
  <div class="extensions">
    <div class="extensions-header">
      <a-button
        v-if="checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_PC_EXTENSION_DETAILS_UPDATE'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_PC_EXTENSION_DETAILS_UPDATE'])"
        id="enable-extensions"
        type="primary"
        :disabled="isCreateProcess || !isSameVersion"
        @click="showEnable"
      >
        <span>{{ $t('project.enable_extensions') }}</span>
      </a-button>

      <icon-btn
        id="a-icon-refresh"
        :is-disabled="false"
        :icon-title="$t('refresh')"
        icon-style="icon-refresh"
        class="extensions-refresh"
        @onClick="onRefresh"
      />
    </div>

    <mf-table
      ref="extensionTable"
      class="project-extension-table"
      row-key="name"
      :columns="columns"
      :data="getExtentions"
      :show-pagionation="false"
    >
      <!-- column title slots -->
      <template v-for="item in columns">
        <a-tooltip
          :slot="item.dataIndex"
          :key="item.dataIndex"
          :title="item.titleText"
        >
          <span class="table-column-title-text">{{ item.titleText }}</span>
        </a-tooltip>
      </template>
    </mf-table>

    <extensions-enable
      ref="extendEnable"
      :exclude="extensionList"
      :lab-version="labVersion"
      @onEnabled="onRefresh"
    />
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
import ExtensionsEnable from './ExtensionsEnable'
import { getExtensionsInProject } from '@/api/project'
import { eventListener } from '../../event'
import { mapGetters } from 'vuex'

export default {
  components: {
    IconBtn,
    ExtensionsEnable
  },
  props: {
    isCreateProcess: {
      type: Boolean,
      default: false
    },
    isSameVersion: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      extensionList: [],

      columns: Object.freeze([
        {
          titleText: `${this.$t('project.extensionName')}`,
          slots: { title: 'display-name' },
          dataIndex: 'display-name',
          ellipsis: true
        }]),
      init: true
    }
  },
  computed: {
    ...mapGetters(['selectTreeNode', 'labVersion'])
  },

  activated() {
    this.$refs.extensionTable.loadData()
  },

  created() {
    const _this = this

    // The listening subscription event is emitted
    eventListener.on('projectSelected', function(active) {
      if (active === 'extensions') {
        _this.$refs.extensionTable.loadData()
      }
    })
  },

  methods: {
    getExtentions() {
      if (this.init) {
        this.init = false
        return false
      }
      const selectProject = this.selectTreeNode.data
      return getExtensionsInProject({
        domain: selectProject['domain-name'],
        project: selectProject.name
      }).then(data => {
        if (data.extensions) {
          const projectExtensions = data.extensions && data.extensions.extension
          this.extensionList = Array.isArray(projectExtensions) ? projectExtensions : [projectExtensions]
          return this.extensionList.filter(i => i['is-visible'])
        } else {
          this.extensionList = []
          return []
        }
      }).catch(() => {
        this.extensionList = []
        return []
      })
    },

    showEnable() {
      this.$refs.extendEnable.show()
    },

    onRefresh() {
      this.$refs.extensionTable.refresh()
    }
  }
}
</script>

<style lang="less" scoped>
.extensions{
  position: relative;
  left: -1px;
  padding-bottom: 24px;
  height: 100%;
  overflow: auto;
}
  .extensions-header{
    padding: 8px 24px 24px 24px;
    display: flex;
    align-items: center;
  }

  .extensions-refresh{
    margin-left: 40px;

    /deep/ .tool-icon-btn-i.iconfont.icon-refresh {
      display: flex;
      align-items: center;
    }
  }

  .extensions-content{
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    border: 1px solid rgba(101, 102, 104, 0.16);
    box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
    height: calc(100vh - 336px);
  }

  .extensions-cont-item{
    margin-left: 60px;
    font-size: 14px;
    font-family: MetricNEW-Bold, MetricNEW;
    font-weight: 400;
    color: #333333;
    line-height: 16px;
    margin-top: 20px;
  }
</style>
