<template>
  <div>
    <mf-drawer
      :visible="visible"
      wrap-class-name="user-csv"
      width="500"
      :drawer-style="{ position: 'relative' }"
      :closable="!submitLoading"
      @close="onClose"
    >
      <span slot="title">
        {{ $t('userManagement.AddUserFromCSV') }}
        <mf-help-btn :help="IMPORT_USER_FROM_CSV" />
      </span>
      <a-spin :spinning="submitLoading">
        <div class="mf-tabpanel-autoheight">

          <div style="padding-bottom:65px">
            <h5 class="csv-h5"> {{ $t("userManagement.ChooseCSVFile") }} </h5>
            <div class="csv-box">

              <a-upload
                :file-list="fileList"
                :before-upload="beforeUpload"
                :custom-request="customRequest"
                :remove="handleRemove"
                accept=".csv"
                @change="handleUploadWithoutBtn"
              >
                <div v-if="isIE" :class="disabled ? 'disable':''">
                  <a-button id="user_csv_browse" :disabled="disabled" class="mf-btn-dashed">{{ $t("userManagement.browse") }}</a-button>
                </div>
                <a-button v-else :disabled="disabled"> {{ $t('project.browse') }} </a-button>

              </a-upload>
              <!-- <a-button
                id="user_csv_upload"
                type="primary"
                :class="['csv-upload-btn', {disnone:!disabled}]"
                @click="handleUpload"
              >
                <a-icon type="upload" />
                {{ $t("userManagement.upload") }}
              </a-button> -->
            </div>

            <h5 v-if="isShow" class="csv-h5" style="margin-top:24px;margin-bottom: 8px">
              {{ $t("userManagement.mapToUserFields") }}
            </h5>

            <h5 v-if="isShow" style="padding-left: 15px;font-weight: bold;font-size: 14px">
              {{ $t("userManagement.selectFieldsMessage") }}
            </h5>

            <div v-serverType="[SERVER_TYPE.Saas]" class="csv-box">
              <csv-saas-form id="user_csv_csvsass" ref="csvsass" :is-show="isShow" :is-saving.sync="isSaving" :form-data="formData" @saveSaasForm="csvUserInfo=$event" />
            </div>

            <div v-serverType="[SERVER_TYPE.OnPremise]" class="csv-box">
              <csv-op-form id="user_csv_csvop" ref="csvop" :is-show="isShow" :is-saving.sync="isSaving" :form-data="formData" @saveOpForm="csvUserInfo=$event" />
            </div>
          </div>

          <div v-if="visible" class="user-drawer-tool" style="width:500px">
            <a-button id="user_csv_cancel" class="mf-btn-dashed" :disabled="isSaving" @click="onClose">{{ $t("Cancel") }}</a-button>
            <a-button
              id="user_csv_add"
              type="primary"
              style="margin-left: 8px"
              :loading="isSaving"
              :disabled="addBtnDisabled"
              @click="onAddCsvUser"
            >
              {{ $t("userManagement.addUsers") }}
            </a-button>
          </div>
        </div>
      </a-spin>

    </mf-drawer>

    <modal-result
      :visible.sync="resultVisible"
      :result-list="resultUserList"
      :is-show-cancel="false"
      :ok-text="$t('Close')"
      @ok="cancelFunc"
    >
      <a-button id="export_after_import_user" slot="footer" class="mf-btn-dashed" @click="successSubmit">{{ $t('userManagement.userToolBar.successSubmit') }}</a-button>
    </modal-result>
    <div class="csv-shadow" />
  </div>
</template>

<script>
import { SERVER_TYPE } from '@/store/const'
import ModalResult from '@/components/ModalResult/index'
import CsvSaasForm from './userCsvSaas'
import CsvOpForm from './userCsvOp'
import { mapGetters } from 'vuex'
import { csv2Object, file2Url } from '@/utils'
import { uploadCsv } from '@/api/user'
import { downloadCsv } from '@/utils/downloadCsv'
import { IMPORT_USER_FROM_CSV } from 'config/help'

export default {
  components: { CsvSaasForm, CsvOpForm, ModalResult },
  data() {
    return {
      IMPORT_USER_FROM_CSV,
      SERVER_TYPE,

      visible: false,
      fileList: [],
      disabled: false,
      isIE: false,

      isShow: false,
      isSaving: false,
      addBtnDisabled: true,

      formData: [],

      csvUserInfo: {},
      file: null,
      resultUserList: [],
      resultVisible: false,
      submitLoading: false
    }
  },

  computed: {
    ...mapGetters(['serverType'])
  },

  watch: {
    fileList(val) {
      // eslint-disable-next-line no-unneeded-ternary
      this.disabled = val.length > 0 ? true : false
    }
  },

  created() {
    this.file = new FormData()
    var userAgent = navigator.userAgent
    const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1
    const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1
    this.isIE = isIE || isIE11
  },

  methods: {
    show() {
      this.visible = true
      this.isShow = false
      this.isSaving = false
      this.addBtnDisabled = true
    },
    onClose() {
      this.visible = false
      this.handleRemove()
    },

    onAddCsvUser() {
      let isValidation = false
      if (this.serverType === this.SERVER_TYPE.Saas) {
        this.$refs.csvsass.$children[0].$children[0].validate(valid => {
          if (valid) {
            isValidation = true
            this.$refs.csvsass.onAddusers()
          }
        })
      } else {
        this.$refs.csvop.$children[0].$children[0].validate(valid => {
          if (valid) {
            isValidation = true
            this.$refs.csvop.onAddusers()
          }
        })
      }
      if (this.csvUserInfo.name && isValidation) {
        const csvSaasData = {
          name: this.csvUserInfo.name,
          'full-name': this.csvUserInfo.fullName,
          'idp-name': this.csvUserInfo.idpName,
          'identity-key': this.csvUserInfo.identityKey,
          email: this.csvUserInfo.email,
          phone: this.csvUserInfo.phone,
          description: this.csvUserInfo.description,
          'request-id': this.csvUserInfo.requestId,
          'send-notification': this.csvUserInfo.notification,
          'is-update-allowed': this.csvUserInfo.isUpdate,
          'policy-id': this.csvUserInfo.description,
          file: this.fileList[0]

        }
        this.submitLoading = true
        uploadCsv(csvSaasData).then(res => {
          this.isSaving = false
          this.visible = false
          // this.$message.success(this.$t('userManagement.import_user_success'))
          this.resultVisible = true
          let arr = []
          Array.isArray(res.users.user) ? arr = res.users.user : arr.push(res.users.user)
          this.resultUserList = []
          this.resultUserList = arr.map((item, index) => {
            return {
              key: index,
              name: item.name,
              status: true,
              message: this.$t('userManagement.import_user_success')
            }
          })
          this.handleRemove()
          this.$emit('refresh')
        }).catch((e) => {
          this.isSaving = false
          this.visible = false
          this.resultVisible = true
          let arr = []
          Array.isArray(e.response.data.QCRestException.ExceptionProperties.ExceptionProperty.SaValue.BulkOperationResponse.BulkEntries.BulkEntry)
            ? arr = e.response.data.QCRestException.ExceptionProperties.ExceptionProperty.SaValue.BulkOperationResponse.BulkEntries.BulkEntry
            : arr.push(e.response.data.QCRestException.ExceptionProperties.ExceptionProperty.SaValue.BulkOperationResponse.BulkEntries.BulkEntry)

          this.resultUserList = arr.map((item, index) => {
            return {
              key: index,
              name: JSON.parse(item.Entity).user.name || (item.Exception.Title.match(/(name )(.*)( already)/) ? item.Exception.Title.match(/(name )(.*)( already)/)[2] : ''),
              status: item.Succeeded,
              message: item.Succeeded ? this.$t('userManagement.import_user_success') : item.Exception.Title
            }
          })
          this.handleRemove()
          this.$emit('refresh')
        }).finally(() => {
          this.submitLoading = false
        })
      }
    },

    beforeUpload(file) {
      const reg = /\.(csv)(\?.*)?$/
      return new Promise((resolve, reject) => {
        if (reg.test(file.name)) {
          this.fileList = [...this.fileList, file]
          resolve()
        } else {
          this.$message.error(this.$t('PleaseUploadTheCorrectFileFormat', { fileType: '.csv' }))
          reject(new Error(this.$t('PleaseUploadTheCorrectFileFormat', { fileType: '.csv' })))
        }
      })
    },

    handleRemove(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
      this.formData = []
      this.isShow = false
    },

    // handleUpload() {
    //   const { fileList } = this
    //   const objectData = new FormData()
    //   // Object.keys(fileList).forEach(file => {
    //   //   objectData.append('files[]', file)
    //   // })
    //   objectData.append('file[]', fileList[0])
    //   // this.file = objectData
    //   this.isShow = true
    //   this.addBtnDisabled = false

    //   if (this.isShow) {
    //     this.$refs.csvsass.resetForm()
    //     this.$refs.csvop.resetForm()
    //   }
    // },

    handleUploadWithoutBtn({ fileList }) {
      if (fileList.length && fileList[0].status === 'done') {
        const objectData = new FormData()
        objectData.append('file[]', fileList[0])
        this.isShow = true
        this.addBtnDisabled = false

        if (this.isShow) {
          this.$refs.csvsass.resetForm()
          this.$refs.csvop.resetForm()
        }
      }
    },

    customRequest(param) {
      // const file = param.file
      // var URL = window.URL || window.webkitURL
      // // 通过 file 生成目标 url
      // var imgURL = URL.createObjectURL(file)

      // axios.get(imgURL).then(data => {
      //   this.formData = csv2Object(data.data)
      //   this.formData.push('null')
      //   param.onSuccess()
      // }).catch(() => {})

      file2Url(param).then(data => {
        this.formData = csv2Object(data.data)
        // this.formData.push('null')
        param.onSuccess()
      }).catch(() => {})
    },

    successSubmit() {
      downloadCsv(this.resultUserList)
      this.handleRemove()
      // this.$emit('refresh')
      this.resultVisible = false
    },
    cancelFunc() {
      this.handleRemove()
      // this.$emit('refresh')
      this.resultVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.disable {
  pointer-events: none;
}
    .csv-box{
    padding-left: 16px;
    }

    .csv-h5{
        position: relative;
        color: #333;
        font-weight: bold;
        font-size: 14px;
        line-height: 16px;
        height: 19px;
        padding-left: 16px;
        margin-bottom: 24px;
    }

    .csv-h5::before{
        content: ' ';
        position: absolute;
        top: 44%;
        left: 0;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background: #0075F3;
        border-radius: 50%;
    }

    .csv-upload-btn{
        margin-top: 24px;
        color: #fff;
    }

    .disnone {
        display: none;
    }

</style>

