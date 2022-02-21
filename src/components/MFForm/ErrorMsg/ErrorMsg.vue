<template>
  <div v-show="isShowErrorMsg" class="ant-form-explain password-error-message">
    <i class="anticon anticon-close-circle">
      <svg viewBox="64 64 896 896" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" class="">
        <path
          d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6
            448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3
            118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5
            359a8.32 8.32 0 0 1-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512
            464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9
            5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"
        />
      </svg>
    </i>
    <span class="error-msg" />
  </div>
</template>

<script>
export default {
  props: {
    itemClass: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isShowErrorMsg: false
    }
  },
  methods: {
    showError(msg) {
      msg = msg.replace(/\./g, '.\n')
      this.isShowErrorMsg = true
      this.$nextTick(() => {
        const $formExtra = document.getElementsByClassName(this.itemClass)[0]
        $formExtra.classList.add('ant-form-item-with-help')
        $formExtra.getElementsByClassName('ant-form-item-control')[0].classList.add('has-error')

        const div = $formExtra.getElementsByClassName('password-error-message')[0]
        const errMsg = div.getElementsByClassName('error-msg')[0]
        errMsg.innerHTML = msg

        if (!(!!window.ActiveXObject || 'ActiveXObject' in window)) { // not ie
          const strHeight = errMsg.clientHeight
          if (strHeight > 63) { // whether show all string in three lines or not
            errMsg.classList.add('ellipsis')

            const hr = document.createElement('hr')
            div.appendChild(hr)

            const btn = document.createElement('a')
            btn.className = 'show-more'
            btn.onclick = function() {
              errMsg.classList.remove('ellipsis')
              div.removeChild(div.childNodes[2])
              div.removeChild(div.childNodes[2])
            }
            btn.innerHTML = this.$t('mysetting.ShowMore')
            div.appendChild(btn)
          }
        }
      })
    },

    hideError() {
      this.isShowErrorMsg = false
    }
  }
}
</script>

<style lang="less">
  .password-error-message {
    flex-wrap: wrap;

    .error-msg {
      white-space: pre-wrap;
    }
    .error-msg.ellipsis {
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
    }

    hr {
      visibility: hidden;
    }
  }
</style>
