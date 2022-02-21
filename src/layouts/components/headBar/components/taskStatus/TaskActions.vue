<template>
  <div class="task-actions">
    <!-- download log -->
    <div class="grid-download-log" style="padding-left:13px">
      <a-tooltip :title="$t('taskStatus.downloadLog')">
        <i
          class="iconfont icon-ProjectExport downloadbtn"
          @click="onDownloadLog"
        />
      </a-tooltip>
    </div>

    <!-- download project file -->
    <div v-if="isExport" class="grid-download-project-file">
      <a-tooltip :title="$t('taskStatus.downloadProjectFile')">
        <i
          :class="[
            'iconfont',
            'icon-Configuration_export',
            canDownloadProjectFile ? 'active' : 'inactive'
          ]"
          @click="onDownloadProjectFile"
        />
      </a-tooltip>
    </div>
  </div>
</template>

<script>
import { downloadLogs, downloadProjectFile } from '@/api/taskStatus'
import downloadFiles from '@/utils/download'
import { MAP_TASK_DOWNLOAD_TYPE, MAP_TASK_STATUS_TYPE } from './config/type'
export default {
  name: 'TaskActions',

  computed: {
    // when type is export, user can download project file
    isExport() {
      return (
        this.params.data.action?.toLowerCase() === MAP_TASK_DOWNLOAD_TYPE.export
      )
    },

    canDownloadProjectFile() {
      return this.params.data.status === MAP_TASK_STATUS_TYPE.Success
    }
  },

  methods: {
    onDownloadLog() {
      const row = this.params.data
      downloadLogs({
        domain: row['domain-name'].replace(/\[|]/g, ''),
        project: row['project-name'],
        task: MAP_TASK_DOWNLOAD_TYPE[row.action.toLowerCase()]
      }).then(res => {
        downloadFiles(res)
      })
    },

    onDownloadProjectFile() {
      if (!this.canDownloadProjectFile) return

      const row = this.params.data
      downloadProjectFile({
        domain: row['domain-name'].replace(/\[|]/g, ''),
        project: row['project-name'],
        filename: row['result-data'].value
      }).then(res => downloadFiles(res, row['result-data'].value)).catch(error => {
        const res = error.response
        if (res.status === 500) this.$message.info(this.$t('taskStatus.Downloaded'))
      })
    }
  }
}
</script>
<style lang="less" scoped>
.task-actions {
  display: flex;

  .grid-download-log {
    /deep/ .icon-ProjectExport {
      color: #0079ef;
      cursor: pointer;
    }
  }

  .grid-download-project-file {
    margin-left: 8px;

    /deep/ .active {
      color: #0079ef;
      cursor: pointer;
    }

    /deep/ .inactive {
      cursor: not-allowed;
      color: rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
