<template>
  <div id="user_drawer_tool" class="user-drawer-tool">
    <a-button
      id="user_edit_cancel"
      class="mf-btn-dashed"
      :disabled="loading"
      v-on="$listeners"
    >
      {{ cancel }}
    </a-button>
    <a-button
      id="user_edit_save"
      type="primary"
      style="margin-left: 8px"
      :disabled="isChange"
      :loading="loading"
      @click="sendEmail"
    >
      {{ submit }}
    </a-button>
  </div>
</template>

<script>
import { sendEmails } from '@/api/email'
export default {
  name: 'DrawerFooter',
  props: {
    // loading: {
    //   type: Boolean,
    //   default: false
    // },
    cancel: {
      type: String,
      default: ''
    },
    submit: {
      type: String,
      default: ''
    },
    form: {
      type: Object,
      default: () => {}
    },
    user: {
      type: Boolean,
      default: false
    },
    isChange: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false
    }
  },
  watch: {
    value: function(val) {
      this.form = val
    },

    form: {
      handler: function(val) {
        this.$emit('input', val)
      },
      deep: true
    }
  },
  methods: {
    sendEmail() {
      let arr = []
      if (this.user) {
        arr = {
          mail: {
            subject: this.form.subject,
            comment: this.form.message,
            'to-recipients': this.form.to.split(',')
          }
        }
      } else {
        let toArray = []
        // this.form.to.forEach(item => {
        //   this.form.toDetail.filter(i => {
        //     if (i.value === item) {
        //       toArray.push(i)
        //     }
        //   })
        // })

        toArray = this.form.toDetail

        toArray = toArray.map(ele => {
          if (ele.isProject) {
            return '[' + ele.domain + '/' + ele.value + ']'
          } else {
            return '[' + ele.value + '/' + '*' + ']'
          }
        })

        arr = {
          mail: {
            subject: this.form.subject,
            comment: this.form.message,
            'to-recipients': toArray
          }
        }
      }
      const bool = this.$parent.validateValue()
      if (bool) {
        this.loading = true
        sendEmails(arr).then((res) => {
          this.loading = false
          this.$emit('update:isChange', true)
          this.$parent.onClose()
          this.$message.success(this.$t('sendEmailsSuccess'))
        }).catch(() => {
          this.loading = false
        })
      }
    },
    changeForm(form) {
      this.form = form
    }
  }
}
</script>

<style scoped>

</style>
