<template>
  <mf-form
    ref="selectFileForm"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    :model="form"
    :rules="rules"
    class="mf-step-content step-form"
  >

    <a-form-model-item
      :label="$t('project.import_file', { type: props.type === 'project' ? $t('project.project') : $t('project.template') })"
      prop="file"
    >
      <a-upload
        name="file"
        :multiple="false"
        accept=".qcp"
        :file-list="fileList"
        :headers="headers"
        :before-upload="beforeUpload"
        :custom-request="customRequest"
        :remove="onRemoveFile"
        class="file"
      >
        <a-button class="mf-btn-dashed"> {{ $t("project.browse") }} </a-button>
      </a-upload>

    </a-form-model-item>
  </mf-form>
</template>

<script>
export default {
  props: {
    props: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      fileList: [],

      form: {
        file: null
      },

      headers: {
        authorization: 'authorization-text'
      },

      rules: {
        file: { required: true, message: this.$t('project.please_select_file') }
      },

      labelCol: { span: 10 },
      wrapperCol: { span: 14 }
    }
  },

  methods: {
    beforeUpload(file) {
      const reg = /\.(qcp)(\?.*)?$/
      return new Promise((resolve, reject) => {
        if (reg.test(file.name)) {
          if (this.fileList.length) {
            this.fileList = []
          }
          this.fileList.push(file)
          this.form.file = file
          resolve()
        } else {
          this.$message.error(this.$t('PleaseUploadTheCorrectFileFormat', { fileType: '.qcp' }))
          reject(new Error(this.$t('PleaseUploadTheCorrectFileFormat', { fileType: '.qcp' })))
        }
      })
    },

    onRemoveFile() {
      this.fileList = []
      this.form.file = null
    },

    customRequest(param) {
    },

    async next() {
      try {
        const valid = await this.$refs.selectFileForm.$children[0].validate()

        if (valid) {
          return { continue: true, data: { 'file-name': this.form.file }}
        }

        return { continue: false }
      } catch (e) {
        return { continue: false }
      }
    }
  }
}
</script>

<style>

</style>
