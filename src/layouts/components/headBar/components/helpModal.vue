<template>
  <mf-modal
    :visible="visible"
    :confirm-loading="false"
    width="800px"
    :footer="null"
    class="help-modal"
    @cancel="onCancel"
  >
    <div class="help-modal-body">
      <div class="help-modal-icon">
        <svg-icon icon-class="help-link-logo" />
      </div>
      <div class="help-modal-head">
        <div class="help-modal-title">
          {{ $t('helpLinks.APP_LIFE_MANAGE') }}
        </div>
        <div class="help-modal-text">
          {{ $t('helpLinks.SITE_ADMIN_BUILD',{version:siteVersion}) }}
        </div>
      </div>

      <div class="help-modal-content">
        <div class="help-modal-content-top">
          <p>{{ $t('helpLinks.COPYRIGHT') }}</p>
          <p class="copyright-content">{{ $t('helpLinks.COPYRIGHT_CONTENT').replace(/'/g,'"') }}</p>
        </div>

        <div class="help-modal-content-bottom">
          <mf-ag-grid
            ref="gridTableRef"
            class="grid-table"
            :columns="columns"
            :data-source="extensionList"
            :loading="loading"
          />
        </div>
        <div class="help-modal-content-btn" style="text-align:right">
          <a-button @click="copyVersionInfo">{{ $t('helpLinks.COPYVERSIONINFORMATION') }}</a-button>
        </div>
      </div>
      <a-divider />
      <div class="help-modal-footer">{{ $t('helpLinks.CERTAINSVERSIONS') }}</div>
    </div>
  </mf-modal>
</template>
<script>
import { getExtensions } from '@/api/application'
import MfAgGrid from '@/components/MFTable/AgGrid/grid'
export default {
  components: {
    MfAgGrid
  },
  props: {
    helpVisible: {
      type: Boolean,
      default: false
    },
    siteVersion: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      extensionList: [],
      columns: Object.freeze([{
        dataIndex: 'display-name',
        title: this.$t('helpLinks.INTERNAL_COMPONENTS'),
        sorter: 'desc'
      }, {
        dataIndex: 'full-version',
        title: this.$t('helpLinks.BUILD'),
        sorter: 'desc'
      }]),
      copyEvent: false
    }
  },
  watch: {
    helpVisible: {
      handler(visible) {
        this.visible = visible
        if (visible) {
          this.getExtensionTable()
        }
      }
    }
  },

  mounted() {
    document.addEventListener('copy', (event) => {
      if (this.copyEvent) {
        if (event.clipboardData || event.originalEvent) {
          const clipboardData = (event.clipboardData || event.originalEvent.clipboardData)
          clipboardData.setData('text/plain', this.copyContent())
          event.preventDefault()
          this.$message.success(this.$t('helpLinks.VERSION_COPY_SUCCESS'))
          this.copyEvent = false
        }
      }
    })
  },

  methods: {
    getExtensionTable() {
      this.loading = true
      getExtensions().then(res => {
        const list = res.extensions.extension
        this.extensionList = Array.isArray(list) ? list : [list]
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    copyVersionInfo() {
      this.copyEvent = true
      if (!(!!window.ActiveXObject || 'ActiveXObject' in window)) { // not ie
        document.execCommand('copy')
      } else {
        if (window.clipboardData) {
          // 清空操作系统粘贴板
          window.clipboardData.clearData()
          // 将需要复制的内容复制到操作系统粘贴板
          window.clipboardData.setData('Text', this.copyContent())
          this.$message.success(this.$t('helpLinks.VERSION_COPY_SUCCESS'))
          this.copyEvent = false
        }
      }
    },

    copyContent() {
      const column = this.columns.map(item => item.title).join('\t')
      const content = this.extensionList.map(item => `${item['display-name']}\t${item['full-version']}`).join('\n')
      const title = `${this.$t('helpLinks.APP_LIFE_MANAGE')}\n${this.$t('helpLinks.SITE_ADMIN_BUILD', { version: this.siteVersion })}`
      const selection = `${column}\n${content}\n${title}`
      return selection.toString()
    },

    onCancel() {
      this.visible = false
      this.$emit('update:helpVisible', false)
    }
  }
}
</script>
<style lang="less" scoped>
  // help modal
.help-modal{
  /deep/ .ant-modal-body{
    padding:24px;
  }
}
.help-modal-body{
  /deep/ .ant-divider, .ant-divider-vertical{
    margin:0;
    height:1px;
  }
  /deep/ .ant-btn{
     border: 1px solid #000000;
  }

  /deep/ .ant-btn:hover, .ant-btn:focus{
     color:#000
  }
}
.help-modal-icon {
   text-align:center;
   margin-bottom:16px;
   .svg-icon{
    width:119px;
    height:29px;
   }
}
.help-modal-title{
  font-size:24px;
  font-weight:600;
  color: #323435;
  line-height: 29px;
  text-align:center;
}

.help-modal-text{
  font-weight: 600;
  color: #747577;
  line-height: 21px;
  margin-top:8px;
  text-align:center;
}

.help-modal-content-top{
  width: 751px;
  // height: 168px;
  background: #F5F7F8;
  margin-top:28px;
  padding:21px 13px 24px 25px;

  .copyright-content {
    margin-bottom: 0;
  }
}

.help-modal-content-bottom{
  width: 752px;
  height: 300px;
  background: #FFFFFF;
  // box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.1);
  // border: 1px solid #DCDEDF;
  margin-top:16px;
}

.help-modal-content-btn{
  text-align:right;
  margin:16px 0;
}

.help-modal-footer{
  font-size: 14px;
  font-weight: 400;
  color: #747577;
  line-height: 22px;
  margin-top:15px;
}
</style>

