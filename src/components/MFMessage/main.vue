<template>

  <transition
    name="message"
    @after-leave="handleAfterLeave"
  >
    <div
      v-show="visible"
      class="ant-message-notice"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <div class="ant-message-notice-content">
        <div :class="classObject">
          <a-icon :type="iconType" :theme="iconType === 'loading' ? 'outlined' : 'filled'" />
          <span>
            {{ content }}
          </span>
          <a-icon v-if="type === 'error' || closable" type="close" class="ant-close" @click="close" />
        </div>
      </div>

    </div>
  </transition>
</template>

<script>
const typeMap = {
  info: 'info-circle',
  success: 'check-circle',
  error: 'close-circle',
  warning: 'exclamation-circle',
  loading: 'loading'
}

export default {
  data() {
    return {
      visible: false,
      content: '',
      type: 'info',
      timer: null,
      duration: 3,
      top: 24,
      closed: false,
      id: 'message_',
      closable: false
    }
  },

  computed: {
    iconType() {
      return typeMap[this.type]
    },

    position() {
      return {
        top: `${this.top}px`
      }
    },

    classObject() {
      const className = { 'ant-message-custom-content': true }

      className[`ant-message-${this.type}`] = true

      return className
    }
  },

  watch: {
    closed(newVal) {
      if (newVal) {
        this.visible = false
      }
    }
  },

  mounted() {
    this.startTimer()
  },

  methods: {
    handleAfterLeave() {
      this.$destroy(true)
      this.$el.parentElement.removeChild(this.$el)
    },

    close() {
      this.closed = true
      if (typeof this.onClose === 'function') {
        this.onClose(this)
      }
    },

    clearTimer() {
      clearTimeout(this.timer)
    },

    startTimer() {
      if (this.duration > 0 || this.type !== 'error') {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close()
          }
        }, this.duration * 1000)
      }
    }
  }
}
</script>

<style lang="less">
.ant-close{
  color: #000 !important;
  margin-left: 8px;
  margin-right: 0;
  font-size: 14px !important;
}
.ant-close:hover{
  cursor: pointer;
}

.message-enter-active{
  animation: antMoveUpIn .2s;
  animation-play-state: running;
}

.message-leave-active{
  animation: MessageMoveOut .3s;
  animation-play-state: running;
}
.message-appear,
.message-enter {
  opacity: 0;
  animation-timing-function: cubic-bezier(0.08, 0.82, 0.17, 1);
}
.message-leave {
  animation-timing-function: cubic-bezier(0.6, 0.04, 0.98, 0.34);
}

@keyframes antMoveUpIn {
  0% {
    transform: translateY(-100%);
    transform-origin: 0 0;
    opacity: 0;
  }
  to {
    transform: translateY(0);
    transform-origin: 0 0;
    opacity: 1;
  }
}

@keyframes MessageMoveOut {
  0% {
    max-height: 150px;
    padding: 8px;
    opacity: 1;
  }
  to {
    max-height: 0;
    padding: 0;
    opacity: 0;
  }
}
</style>
