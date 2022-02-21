<template>
  <a-modal
    id="tool-modal"
    :class="['mf-modal', hasIcon ? '' : 'no-icon-modal']"
    :visible="visible"
    :title="messageObj.title"
    :mask-closable="false"
    :closable="!loading"
    :width="size === 'auto' ? width : 520"
    destroy-on-close
    @cancel="$emit('onReturn')"
  >
    <a-icon v-if="iconType==='Confirm'" class="modal-title-icon" type="exclamation-circle" />
    <svg-icon v-if="iconType==='Warning'" class="modal-title-icon" icon-class="warning-icon" />
    <svg-icon v-if="iconType==='Information'" class="modal-title-icon" icon-class="information" />
    <svg-icon v-if="iconType==='Error'" class="modal-title-icon" icon-class="error" />
    <p
      id="icon-modal-content"
      class="mf-modal-body mf-body"
      style="margin-bottom: 16px;"
    >
      {{ messageObj.content }}
      <slot />
    </p>
    <template slot="footer">
      <a-button
        id="icon-modal-return"
        key="back"
        type="link"
        class="mf-btn-dashed"
        :disabled="loading"
        @click="$emit('onReturn')"
      >
        {{ messageObj.discard }}
      </a-button>

      <slot name="btn" />

      <a-button
        id="icon-modal-submit"
        ref="modal-submit"
        key="submit"
        type="primary"
        :loading="loading && btnLoading === 1"
        :disabled="loading && btnLoading !== 1"
        @click="$emit('onSubmit')"
      >
        {{ messageObj.onSubmit }}
      </a-button>
    </template>
  </a-modal>
</template>

<script>
import { autoFocusInput } from '@/utils'
import { MODAL_WIDTH } from '@/store/const.js'

export default {
  name: 'ModalConfirm',
  props: {
    visible: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    loading: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    btnLoading: {
      type: Number,
      default: () => {
        return 1
      }
    },
    messageObj: {
      type: Object,
      default: () => {
        return {}
      }
    },
    hasIcon: {
      type: Boolean,
      default: true
    },
    iconType: {
      type: String,
      default: 'Confirm' // Warning,Confirm,Information,Error

    },
    size: {
      type: String,
      default: ''
    },
    autoFocusEnter: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      width: 435
    }
  },
  watch: {
    visible(val) {
      if (val) {
        if (this.size === 'auto' && (this.messageObj.content.toString().length > MODAL_WIDTH.withoutNewline || (this.messageObj.content.toString().length > MODAL_WIDTH.withNewline && (this.messageObj.content.toString().indexOf('<br/>') > -1 || this.messageObj.content.toString().indexOf('\n') > -1)))) {
          this.width = 628
        } else {
          this.width = 435
        }
        this.$nextTick(() => {
          autoFocusInput(this)
          if (this.autoFocusEnter) {
            this.$refs['modal-submit'].$el.focus()
          }
        })
      }
    }
  },
  updated() {
    // autofocus when the first element is HTMLInputElement
    // if (this.visible) {
    //   autoFocusInput(this)
    // }
  },
  methods: {}
}
</script>

<style scoped lang="less">
@import '~@/styles/variables.less';

.mf-modal {
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0);
  position: relative;
}
.modal-title-icon {
  position: absolute;
  left: 24px;
  top: 27px;
  font-size: 32px;
  color: @w3C-compliant;
}

// modal
.mf-modal /deep/ .ant-modal-header {
  border-bottom: 0;
  padding: 32px 0 24px;
  margin-left: 80px !important;
  color: @dark-gray;
  font-family: BoldWeb, serif;
}
.mf-modal /deep/ .ant-modal-body {
  margin-left: 80px !important;
  padding: 0;
  line-height: 20px;
  color: @black;
  letter-spacing: 0.2px;
  margin-right: 56px;
}
.mf-modal /deep/ .ant-modal-close {
  margin-top: 15px;
}

.no-icon-modal /deep/ .modal-title-icon {
  display: none !important;
}

// modal
.no-icon-modal /deep/ .ant-modal-header {
  margin-left: 24px !important;
}
.no-icon-modal /deep/ .ant-modal-body {
  margin-left: 24px !important;
}
</style>
