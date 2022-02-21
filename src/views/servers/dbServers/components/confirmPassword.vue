<template>
  <mf-modal
    id="confirm-password-modal"
    :visible="visible"
    width="497px"
    :confirm-loading="loading"
    :ok-text="$t('yes')"
    :cancel-text="$t('no')"
    @ok="onOK"
    @cancel="onCancel"
  >
    <span slot="title" class="project-title">
      {{ $t('servers.ConfirmChangeQCUserPassword') }}
    </span>
    <div class="mf-subtitle confirm-password-subtitle"><svg-icon icon-class="warning-triangle" />{{ $t('servers.ChangingDefaultPasswordToFollowingProjects') }}</div>
    <div class="pro-cont">
      <a-tree
        id="project-tree"
        :tree-data="treeData"
        :replace-fields="{title:'name',key:'id'}"
        show-icon
      >
        <template #switcherIcon>
          <a-icon slot="icon" type="down" class="down-class" />
        </template>
        <template #desktop>
          <i slot="domain" class="iconfont icon-Icon-Domain" />
        </template>
        <template #folder>
          <i slot="folder" class="item-icon iconfont icon-projects" />
        </template>
        <template #active>
          <svg-icon slot="active" icon-class="project-active" />
        </template>
        <template #inactive>
          <svg-icon slot="inactive" icon-class="project-inactive" />
        </template>
      </a-tree>
    </div>
    <div class="bottom-layout">
      <div class="bottom-text">{{ $t('servers.ActiveProjectWillbeDisactivatedDuringTheChanging') }}</div>
      <div class="bottom-text">{{ $t('servers.SureToContinue') }}</div>
    </div>

  </mf-modal>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      treeData: [],
      sendToEmail: '',
      showSendProject: '',
      loading: false,
      project: [],
      newPassword: ''
    }
  },
  methods: {
    show(treeData, newPassword) {
      this.treeData = treeData
      this.visible = true
      this.newPassword = newPassword
    },

    onOK() {
      this.$parent.editDbServer(this.newPassword, 'alm-user-password', this.$t('servers.UserPasswordChangedSuccess'))
      this.visible = false
    },
    onCancel() {
      this.visible = false
      this.$emit('update:changePassordVisible', false)
    }
  }
}
</script>

<style lang="less" scoped>
  .msg-cont{
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .pro-cont{
    height: 300px;
    width: 100%;
    box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(101, 102, 104, 0.16);
    padding-top: 9px;
    overflow: auto;
    flex: 1;
    margin-top:20px
  }

  #confirm-password-modal{
      .confirm-password-subtitle{
        font-family:'RegularWeb';
        font-size:16px;
      }
      .confirm-password-subtitle:before{
        content:none
      }
      .confirm-password-subtitle .svg-icon{
        width:2.5em;
        height:2.5em;
        margin-right:16px;
      }
      /deep/ .ant-modal-body{
        padding:8px 16px 24px 13px;
      }
      .bottom-layout{
          margin:20px 0 24px 0
      }
      .bottom-text{
          color:#000;
          height:19px;
          line-height:19px
      }
      .bottom-text:nth-of-type(2){
          margin-top:8px;
      }
      /deep/ .anticon{
        color:#656668
      }
      /deep/ .ant-tree li .ant-tree-node-content-wrapper{
        color:#333333
      }
      /deep/ .down-class{
        color:#000
      }
  }

  #confirm-password-modal /deep/.ant-modal{
    height: 456px !important;
  }

  #confirm-password-modal /deep/ .ant-tree li span.ant-tree-switcher{
    padding-left: 18px;
    margin-right:5px;
  }

  #confirm-password-modal /deep/ .ant-tree li span.ant-tree-iconEle{
    margin-right:8px;
    color:#656668
  }

  #confirm-password-modal /deep/ .ant-tree li span.ant-tree-checkbox{
    margin-left: 13px;
  }

</style>
