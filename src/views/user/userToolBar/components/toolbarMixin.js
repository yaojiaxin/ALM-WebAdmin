
const toolbarMixin = {
  data() {
    return {
      visible: false,
      loading: false,
      value: '',
      resultVisible: false,
      resultUserList: []
    }
  },
  methods: {
    onClick() {
      this.visible = true
    },

    onCancel() {
      this.visible = false
    },

    onOk(param) {
      this.visible = false

      this.$mfConfirm({
        title: param === 'role' ? this.$t('userManagement.SetRole') : this.$t('userManagement.SetPolicy'),
        message: param === 'role' ? this.$t('userManagement.setrolestoalluser') : this.$t('userManagement.SetPolicytoselecteduser'),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.submit
      })
    },

    resultMessage(res) {
      if (res.length === 1) {
        const responseData = res[0]
        if (responseData.status) {
          this.$message.success(responseData.message)
          this.$emit('refreshUser')
        } else {
          this.$message.error(responseData.message ? responseData.message : this.$t('userManagement.userToolBar.Error'))
        }
      } else {
        this.resultUserList = res
        this.resultVisible = true
        this.$emit('refreshUser')
      }
    }

  }
}

export default toolbarMixin
