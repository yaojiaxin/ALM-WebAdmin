<template>
  <a-modal
    id="confirm-modal"
    class="mf-modal"
    :visible="visible"
    :title="$t('Information')"
    @cancel="onCancel"
  >
    <svg-icon class="modal-title-icon" icon-class="information" />
    <a-spin :spinning="textLoading">
      <div id="icon-modal-content" class="mf-modal-body mf-body">
        <p class="mf-modal-p" v-html="$t('tools.collectInformationMessage', { path })" />
      </div>
    </a-spin>

    <template slot="footer">
      <a-button
        id="icon-modal-submit"
        ref="modal-submit"
        key="submit"
        :disabled="disButton"
        type="primary"
        @click="onSubmit"
      >
        {{ $t('OK') }}
      </a-button>
    </template>
  </a-modal>

</template>

<script>
import { getCollectors } from '@/api/tools'

export default {
  name: 'CollectInformationModal',
  props: {
    selectTreeNode: {
      type: [Object, null],
      default() {
        return null
      }
    }
  },
  data() {
    return {
      visible: false,
      path: '',
      textLoading: false,
      disButton: false
    }
  },
  methods: {
    onShow() {
      this.visible = true
      this.path = ''
      let data
      if (this.selectTreeNode === null) {
        data = null
      } else if (this.selectTreeNode.level === undefined) {
        data = { project: this.selectTreeNode.data }
      } else if (this.selectTreeNode.level === 3) {
        data = { project: this.selectTreeNode.data }
      } else if (this.selectTreeNode.level === 1) {
        data = { project: { 'domain-name': this.selectTreeNode.data.name }}
      } else {
        data = { project: { 'domain-name': this.selectTreeNode.data['domain-name'] }}
      }
      this.textLoading = true
      this.disButton = true

      getCollectors(data).then(res => {
        this.path = res['collect-info'].path
      }).catch((e) => {
        this.visible = false
      }).finally(() => {
        this.textLoading = false
        this.disButton = false
        this.$nextTick(() => {
          this.$refs['modal-submit'].$el.focus()
        })
      })
    },
    onSubmit() {
      this.visible = false
    },
    onCancel() {
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>

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
  margin-right:56px;
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
