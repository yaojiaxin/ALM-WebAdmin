<template>
  <a-modal
    v-bind="$attrs"
    :closable="!$attrs['confirm-loading']"
    :mask-closable="false"
    destroy-on-close
    v-on="$listeners"
  >
    <a-spin
      v-if="hasSpin"
      :spinning="$attrs['confirm-loading'] ? $attrs['confirm-loading'] : false"
    >
      <slot />
    </a-spin>
    <slot v-else />

    <template slot="title">
      <slot name="title" />
    </template>

    <template v-if="!oneBtn" slot="footer">
      <a-button
        id="modalCancelbtn"
        key="back"
        type="link"
        class="mf-btn-dashed"
        :disabled="$attrs['confirm-loading']||$attrs['operation-disabled']"
        @click="onClose"
      >
        {{ $attrs['cancel-text'] || $t('Cancel') }}
      </a-button>
      <slot name="footer" />

      <a-button
        id="modalSavebtn"
        ref="modal-save"
        key="submit"
        type="primary"
        class="mf-btn-Save"
        :disabled="nextDisabled||$attrs['operation-disabled']"
        :loading="$attrs['confirm-loading']"
        @click="$listeners.ok"
      >
        {{ $attrs['ok-text'] || $t('Save') }}
      </a-button>
    </template>
    <template v-else slot="footer">
      <a-button
        id="modalOklbtn"
        ref="modal-ok"
        key="back"
        type="primary"
        :loading="$attrs['confirm-loading']"
        @click="$listeners.ok"
      >
        {{ $attrs['ok-text'] || $t('OK') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script>
import { autoFocusInput } from '@/utils'

export default {
  props: {
    oneBtn: {
      type: Boolean,
      default: false
    },

    nextDisabled: {
      type: Boolean,
      default: false
    },

    hasSpin: {
      type: Boolean,
      default: true
    },
    autoFocusEnter: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    '$attrs.visible'(val) {
      if (val) {
        this.$nextTick(() => {
          autoFocusInput(this)
          if (this.autoFocusEnter) {
            if (!this.oneBtn) {
              this.$refs['modal-save'].$el.focus()
            } else {
              this.$refs['modal-ok'].$el.focus()
            }
          }
        })
      }
    }
  },
  updated() {
    // autofocus when the first element is HTMLInputElement
    // if (this.$attrs.visible) {
    //   autoFocusInput(this)
    // }
  },
  methods: {
    onClose() {
      if (this.$listeners.close) {
        this.$emit('close')
      } else {
        this.$listeners.cancel()
      }
    }
  }
}
</script>

<style></style>
