<template>
  <mf-modal
    :visible="visible"
    :confirm-loading="false"
    width="802px"
    :footer="null"
    @cancel="onCancel"
  >
    <div class="link-modal-body">
      <div class="help-modal-icon">
        <svg-icon icon-class="help-link-logo" />
      </div>
      <div class="link-modal-head">
        <div class="link-modal-title">
          {{ $t('helpLinks.APP_LIFE_MANAGE') }}
        </div>
      </div>

      <div class="link-modal-content">
        <h3>{{ $t('helpLinks.TERMS_CONDITIONS') }}</h3>
        <p style="margin-bottom:25px">{{ $t('helpLinks.TERMS_CONDITIONS_CONTENT').replace(/'/g,'"') }}</p>
        <h3 style="margin-bottom: 0">{{ $t('helpLinks.ATTENTION') }}</h3>
        <p>{{ $t('helpLinks.ATTENTION_CONTENT').replace(/'/g,'"') }}</p>
        <span class="link-modal-bold">{{ $t('helpLinks.USE_MF_SAAS_WEB') }}</span>
        <p>{{ $t('helpLinks.USE_MF_SAAS_WEB_CONTENT').replace(/'/g,'"') }}</p>
        <p><span class="link-modal-bold">{{ $t('helpLinks.CREDENTIALS') }}</span>{{ $t('helpLinks.CREDENTIALS_CONTENT').replace(/'/g,'"') }}</p>
        <p>{{ $t('helpLinks.CREDENTIALS_CONTENT2').replace(/'/g,'"') }}</p>
        <p>{{ $t('helpLinks.CREDENTIALS_CONTENT3').replace(/'/g,'"') }}</p>
      </div>
    </div>
  </mf-modal>
</template>
<script>
export default {
  props: {
    linkVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false
    }
  },
  watch: {
    linkVisible: {
      handler(visible) {
        this.visible = visible
      }
    }
  },
  methods: {
    onCancel() {
      this.visible = false
      this.$emit('update:linkVisible', false)
    }
  }
}
</script>
<style lang="less" scoped>
  // link modal
.link-modal-body{
  margin-top: 38px;
  color:#323435;
}
.help-modal-icon {
  text-align:center;
  margin-bottom:16px;
  .svg-icon{
    width:119px;
    height:29px;
  }
}
.link-modal-title{
  font-size:24px;
  font-weight:600;
  color: #323435;
  line-height: 29px;
  text-align:center;
}

.link-modal-content{
    max-height: calc(100vh - 164px - 177px);
    min-height: calc(640px - 177px);
    overflow-y: auto;

    margin-top:36px;
    h3,.link-modal-bold{
        font-weight:600;
    }
}

/deep/ .ant-modal-content {
  min-height: 640px;
  max-height: calc(100vh - 164px);
  overflow: hidden;
}

/deep/ .ant-modal-body {
  min-height: 640px;
}
</style>

