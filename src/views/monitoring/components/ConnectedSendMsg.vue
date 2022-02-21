<template>
  <mf-modal
    id="send_msg_modal"
    class="send_msg_modal"
    :visible="visible"
    width="802px"
    :confirm-loading="false"
    :ok-text="okText"
    destroy-on-close
    @ok="SendMsg"
    @cancel="onCancel"
  >
    <span slot="title" class="msg-title">
      {{ $t('monitoring.send_message') }}
      <mf-help-btn :help="SEND_MESSAGE" />

    </span>

    <div class="msg-cont">
      <div class="to-user">
        <span class="to-txt">{{ $t('monitoring.to_recipients') }}</span>
        <a-input id="send-msg-to" v-model="ruleForm.to" class="to-input" disabled />
      </div>

      <div class="to-msg">
        <span class="msg-txt">{{ $t('message') }}</span>
        <!--        <textarea v-model="ruleForm.message" cols="85" rows="10" style="margin-left: 20px" />-->
        <m-f-editor v-model="ruleForm.message" :forced-root-block="false" :menubar="false" :height="342" :width="653" style="padding-left: 20px" />
      </div>
    </div>
  </mf-modal>
</template>

<script>
import MFEditor from '@/components/MFEditor/index'
import { MAIL_SETTINGS, SEND_MESSAGE } from 'config/help'
import { sendActionEmails } from '@/api/connection'

export default {
  components: {
    MFEditor
  },
  props: {
    send: {
      type: String,
      default: ''
    },
    show: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      SEND_MESSAGE,
      MAIL_SETTINGS,
      visible: false,
      sendTo: '',
      okText: this.$t('monitoring.send'),
      sendProjectList: [],
      ruleForm: {
        to: '',
        message: ''
      }
    }
  },
  methods: {
    showSendMsg() {
      this.ruleForm.to = this.show
      this.ruleForm.message = ''
      this.visible = true
    },
    SendMsg() {
      let message = JSON.parse(JSON.stringify(this.ruleForm.message))
      message = message.replace('<span style="text-decoration: underline;">', '<u>')
      message = message.replace('</span>', '</u>')
      const msgBody = {
        'session-message': {
          // 'message-body': this.ruleForm.message
          'message-body': '<html><body>' + message + '</body></html>'
        }
      }
      this.send ? this.sendTo = this.send : this.send = ''

      sendActionEmails(this.sendTo, msgBody).then((res) => {
        this.$message.success(this.$t('sendEmailsSuccess'))
        this.$emit('refresh')
        this.visible = false
      })
    },
    onCancel() {
      this.visible = false
    },
    sendMsgShow(sendToEmail, showSendProject) {
      this.ruleForm.to = showSendProject
      this.ruleForm.message = ''

      this.sendTo = sendToEmail
      this.visible = true
    }
  }
}
</script>

<style lang="less" scoped>
  .msg-cont{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .to-input{
    margin-left: 60px;
    width: 631px;
  }

  .to-user{
    display: flex;
    align-items: center;
  }

  .to-msg{
    display: flex;
    align-items: center;
    margin-top: 40px;
  }

  .msg-txt{
    align-self: flex-start;
  }

  .editor{
    width: 653px;
    margin-left: 20px;
  }

  .send_msg_modal .mf-editor /deep/ .w-e-text-container{
    height: 182px !important;
  }

</style>
