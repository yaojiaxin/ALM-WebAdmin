<template>
  <a-modal
    :id="id"
    :class="['mf-modal',hasIcon?'':'no-icon-modal']"
    :visible="visible"
    :title="title"
    :closable="!loading"
    :width="width"
    :mask-closable="false"
    @cancel="onClose"
  >
    <a-icon v-if="iconType==='Confirm'" class="modal-title-icon" type="exclamation-circle" />
    <svg-icon v-if="iconType==='Warning'" class="modal-title-icon" icon-class="warning-icon" />
    <svg-icon v-if="iconType==='Information'" class="modal-title-icon" icon-class="information" />
    <svg-icon v-if="iconType==='Error'" class="modal-title-icon" icon-class="error" />
    <div id="icon-modal-content" class="mf-modal-body mf-body">
      <p :style="pStyle" class="mf-modal-p" v-html="message" />
      <slot />
    </div>
    <template slot="footer">
      <slot name="btn" />

      <a-button
        v-if="isShowCancel"
        id="icon-modal-return"
        key="back"
        type="link"
        class="mf-btn-dashed"
        :disabled="loading"
        @click="onCancel"
      >
        {{ cancelText }}
      </a-button>

      <a-button
        id="icon-modal-submit"
        ref="modal-submit"
        key="submit"
        type="primary"
        :loading="loading"
        @click="onSubmit"
      >
        {{ confirmText }}
      </a-button>
    </template>

  </a-modal>
</template>

<script>
import { MODAL_WIDTH } from '@/store/const.js'

export default {
  name: 'MfConfirm',
  data() {
    return {
      id: 'confirm-modal',
      visible: false,
      title: '',
      message: '',
      cancelText: '',
      confirmText: '',
      iconType: 'Confirm', // Warning,Confirm,Information,Error
      hasIcon: true,
      loading: false,
      isShowCancel: true,
      onConfirm: undefined,
      onCancelChange: undefined,
      onCloseChange: undefined,
      callback: undefined,
      closable: true,
      width: 435,
      pStyle: ''
    }
  },
  watch: {
    visible(val) {
      if (this.message.toString().length > MODAL_WIDTH.withoutNewline || (this.message.toString().length > MODAL_WIDTH.withNewline && (this.message.toString().indexOf('<br/>') > -1 || this.message.toString().indexOf('\n') > -1))) {
        this.width = 628
      } else {
        this.width = 435
      }
      if (val) {
        this.$nextTick(() => {
          this.$refs['modal-submit'].$el.focus()
        })
      }
    }
  },
  methods: {
    onCancel() {
      if (this.onCancelChange) {
        this.onCancelChange()
      }
      this.visible = false
    },
    onClose() {
      if (this.onCloseChange) {
        this.onCloseChange()
        this.visible = false
      } else {
        this.onCancel()
      }
    },

    async onSubmit() {
      if (this.onConfirm) {
        try {
          this.loading = true
          await this.onConfirm()
          if (this.callback) {
            await this.callback()
          }
          this.loading = false
          this.visible = false
        } catch (e) {
          this.loading = false
        }
      } else {
        this.onCancel()
      }
    }
  }

}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';

.mf-modal{
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0);
  position: relative;
}
.modal-title-icon{
  position: absolute;
  left: 24px;
  top: 27px;
  font-size: 32px;
  color: @w3C-compliant;
}
.yellow-icon{
  color:#F48B34 !important;
}

// modal
.mf-modal /deep/ .ant-modal-header{
  border-bottom: 0;
  padding: 32px 0 24px;
  margin-left: 80px !important;
  color: @dark-gray;
  font-family: BoldWeb, serif;
}
.mf-modal /deep/ .ant-modal-body{
  margin-left: 80px !important;
  padding: 0;
  line-height: 20px;
  color: @black;
  letter-spacing:0.2px;
  /*margin-right:56px;*/
  padding-right: 56px;
  max-height: 380px;
}
.mf-modal /deep/ .ant-modal-close{
  margin-top: 15px;
}

.no-icon-modal /deep/ .modal-title-icon{
  display: none !important;
}

// modal
.no-icon-modal /deep/ .ant-modal-header{
  margin-left: 24px !important;
}
.no-icon-modal /deep/ .ant-modal-body{
  margin-left: 24px !important;
}
.mf-modal-p{
  white-space: pre-line;
}
</style>
