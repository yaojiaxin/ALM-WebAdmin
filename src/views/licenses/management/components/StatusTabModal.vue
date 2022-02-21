<template>
  <div>
    <mf-modal
      class="add-parameter-modal"
      :visible="UploadVisible"
      :confirm-loading="uploadLoading"
      :ok-text="$t('OK')"
      :next-disabled="fileList.length === 0"
      @cancel="uploadCancel"
      @ok="uploadOk"
    >
      <span slot="title">
        {{ $t("licenses.UploadLicense") }}
      </span>
      <div class="csv-box">
        <div class="upload-title">{{ $t("licenses.UploadTitleDat") }}</div>
        <a-upload
          :file-list="fileList"
          :before-upload="beforeUpload"
          :custom-request="customRequest"
          :remove="uploadRemoveLicense"
          accept=".dat"
        >
          <a-button id="license-browse" class="mf-btn-dashed">{{ $t("userManagement.browse") }}</a-button>
        </a-upload>
      </div>
    </mf-modal>

    <mf-modal
      class="add-parameter-modal"
      :visible="PasteVisible"
      :next-disabled="!description"

      :confirm-loading="PasteLoading"
      @cancel="pasteCancel"
      @ok="onPasteSubmit"
    >
      <span slot="title">
        {{ $t("licenses.PasteLicense") }}
      </span>
      <div>
        <a-button
          id="license-Pastebtn"
          class="paste-license-btn"
          @click="pasteLicense"
        >
          <i class="iconfont icon-Copy" />
          {{ $t("licenses.PasteLicense") }}
        </a-button>
        <a-textarea id="license-Paste-input" ref="licensePasteInput" v-model="description" style="height: 138px" />
      </div>
    </mf-modal>
  </div>
</template>

<script>
import { postLicenses, putLicenses } from '@/api/license'
// import { csv2Object, file2Url } from '@/utils'

export default {
  name: 'StatusTabModal',
  data() {
    return {
      PasteLoading: false,
      UploadVisible: false,
      PasteVisible: false,
      uploadLoading: false,
      disabled: false,
      description: '',
      fileList: [],
      file: null,
      modelMessage: ''
    }
  },
  methods: {
    uploadCancel() {
      this.UploadVisible = false
      this.fileList = []
    },
    pasteCancel() {
      this.PasteVisible = false
      this.description = ''
    },
    uploadOk() {
      // Confirm to upload
      this.uploadLoading = true
      const { fileList } = this
      if (fileList.length === 0) {
        this.$mfConfirm({
          isShowCancel: false,
          title: this.$t('licenses.SiteManagement'),
          message: this.$t('licenses.NoLicenseSelected'),
          confirmText: this.$t('OK'),
          iconType: 'Warning',
          closable: false,
          onConfirm: () => {
            this.uploadLoading = false
          }
        })
      } else {
        postLicenses({ file: this.file }).then(res => {
          this.parsingRes(res)
          this.UploadVisible = false
          this.description = ''
          this.$emit('upLicenses', true)
        }).catch(e => {
        }).finally(() => {
          this.fileList = []
          this.uploadLoading = false
          this.$emit('getTableData')
        })
      }
    },
    beforeUpload(file) {
      const reg = /\.(dat)(\?.*)?$/
      return new Promise((resolve, reject) => {
        if (reg.test(file.name)) {
          if (this.fileList.length) {
            this.fileList = []
          }
          this.fileList = [file]
          resolve()
        } else {
          this.$message.error(this.$t('PleaseUploadTheCorrectFileFormat', { fileType: '.dat' }))
          reject(new Error(this.$t('PleaseUploadTheCorrectFileFormat', { fileType: '.dat' })))
        }
      })
    },
    customRequest(param) {
      this.file = param.file
    },
    uploadRemoveLicense(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
      this.formData = []
    },
    onPasteSubmit() {
      // Confirm the paste
      this.PasteLoading = true
      if (!this.description) {
        this.$mfConfirm({
          isShowCancel: false,
          title: this.$t('licenses.SiteManagement'),
          message: this.$t('licenses.PasteLicenseArea'),
          iconType: 'Warning',

          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.PasteLoading = false
          }
        })
      } else {
        putLicenses({
          'license-data': {
            data: this.description
          }
        }).then(res => {
          this.parsingRes(res)
          this.PasteVisible = false
          this.description = ''
          this.$emit('upLicenses', true)
        }).catch(e => {
          // this.$message.error(this.$t('licenses.license_paste_error'))
        }).finally(() => {
          this.PasteLoading = false
          this.$emit('getTableData')
        })
      }
    },

    parsingRes(res) {
      if (!res['failed-to-add-license-results']) {
        this.$message.success(this.$t('licenses.license_paste_success'))
      } else {
        let addLicenseResult = res['failed-to-add-license-results']['add-license-result']
        if (addLicenseResult && !Array.isArray(addLicenseResult)) {
          addLicenseResult = [addLicenseResult]
        }

        addLicenseResult.forEach(item => {
          this.modelMessage += this.modelMessage ? '' : '\n'
          this.modelMessage += this.$t('licenses.error_message', { message: item['@custom-error-message'], code: item['@error-code'], key: item['@license-key'] }) + '\n\n'
        })

        this.$mfConfirm({
          isShowCancel: false,
          iconType: 'Error',
          width: 835,
          pStyle: 'white-space: pre-line; max-height:160px',
          title: this.$t('licenses.Unable_to_add_the_following_license'),
          message: this.modelMessage,
          confirmText: this.$t('OK')
        })
      }
    },
    pasteLicense() {
      if (window.clipboardData && window.clipboardData.getData) { // IE
        // IE paste
        this.description = window.clipboardData.getData('Text')
      } else {
        // not IE paste
        navigator.permissions.query({
          name: 'clipboard-read'
        }).then(async permissionStatus => {
          // permissionStatus.state : 'granted'、'denied'、'prompt':
          if (permissionStatus.state === 'denied') {
            this.$message.error(this.$t('licenses.CTRL_V'))
          } else {
            this.description = await navigator.clipboard.readText()
          }
        })
      }
    }
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';

.upload-title{
  color: fade(#000,45%);
  margin-bottom: 24px;
}
.mf-btn-dashed{
  margin-right: 24px;
  font-size: 14px;
}
</style>
