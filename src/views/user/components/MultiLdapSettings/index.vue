<template>
  <mf-drawer
    placement="right"
    wrap-class-name="ldap-setting"
    width="860"
    :visible="visible"
    destroy-on-close
    :cancel-text="$t('Cancel')"
    :ok-text="$t('Save')"
    :next-disabled="isChange"
    @close="onClosed"
    @ok="onClosed"
  >
    <span slot="title">
      {{ $t('userManagement.ldapSetting') }}
      <mf-help-btn :help="MULIT_LDAP_SETTINGS" />
    </span>

    <div id="drawer_left" class="drawer-left mf-tabpanel-autoheight">
      <div class="leftTitle mf-h5">
        {{ $t('userManagement.LDAP Server') }}
        <a-button id="add_ldapserver" class="add" type="primary" shape="circle" icon="plus" size="small" @click="addModalShow" />
      </div>
      <a-menu
        id="drawer_left_menu"
        style="width: 250px;"
        :selected-keys="selectedKeys"
        mode="inline"
        @select="handleClick"
      >
        <a-menu-item v-for="(item,index) in ldapServers" :key="index" ref="ldapList" class="ldap-item">
          <span class="menu-item-title">{{ item.label }}</span>
          <a-tooltip :title="$t('userManagement.Delete_LDAP')" placement="top">
            <icon-btn
              id="a-icon-delete"
              icon-style="icon-delete"
              class="icon-is-show"
              @onClick="onIconButton(item)"
            />
          </a-tooltip>
        </a-menu-item>
      </a-menu>

      <add-ldap-modal ref="addLdap" @isShow="addModalShow" @addServer="addServer" />
    </div>

    <drawer-right
      ref="drawerRight"
      class="drawer-right mf-tabpanel-autoheight"
      :rule-form="ruleForm"
      :search-criteria="ruleForm['search-criteria']"
      :disabled="ldapServers.length===0"
      :rule-radio-value.sync="ruleRadioValue"
      :is-change="isChange"
      :old-rule-form="oldRuleForm"
      @restRuleForm="restRuleForm"
      @onClosed="onClosed"
    />

  </mf-drawer>
</template>
<script>

import DrawerRight from '@/views/user/components/MultiLdapSettings/DrawerRight'
// import DrawerLeft from '@/views/user/components/MultiLdapSettings/DrawerLeft'
// eslint-disable-next-line no-unused-vars
import {
  deleteLDAPById,
  getAllLDAP,
  getAuthenticationSettings,
  getLDAPById,
  postLDAP,
  updateAuthenticationSettings
} from '@/api/user'
import { MULIT_LDAP_SETTINGS } from 'config/help'

import AddLdapModal from '@/views/user/components/MultiLdapSettings/AddLdapModal'
import IconBtn from '@/components/BtnIcon/index'
import { isChangeObjorArr } from '@/utils'
import { LDAP_DEFAULT_VALUES_ACTIVE_DIRECTORY, LDAP_DEFAULT_VALUES_LDAP } from '@/store/const'

export default {
  name: 'MultiLdapSettings',
  components: { DrawerRight, AddLdapModal, IconBtn },
  data() {
    return {
      MULIT_LDAP_SETTINGS,
      visible: false,
      ruleForm: {},
      oldRuleForm: {},
      ldapServers: [],
      ruleRadioValue: null,
      willDeletedKey: '',
      selectedKeys: [0],
      isChangeObjorArr,
      isChange: false
    }
  },
  watch: {
    ruleForm: {
      handler(val) {
        this.isChange = isChangeObjorArr(this.ruleForm, this.oldRuleForm)
      },
      deep: true
    }
  },
  methods: {
    onClosed() {
      this.visible = false
    },
    onShow() {
      this.ruleForm = {}
      this.visible = true
      this.$store.dispatch('forge/getKey')
      this.getAllLdap()
    },

    restRuleForm(ruleForm, changeOldRuleForm = true) {
      this.ruleForm = ruleForm
      this.ldapServers[this.selectedKeys[0]] = JSON.parse(JSON.stringify(this.ruleForm))
      this.oldRuleForm = changeOldRuleForm ? JSON.parse(JSON.stringify(this.ruleForm)) : this.oldRuleForm
    },
    onShowLdapServer(id) {
      // get ldap
      getLDAPById(id).then(res => {
        this.ruleForm = res['ldap-server']
        this.oldRuleForm = JSON.parse(JSON.stringify(this.ruleForm))
        Boolean(this.ruleForm['sso-name']) && this.$refs.drawerRight.onChange()
        this.ruleRadioValue = [LDAP_DEFAULT_VALUES_ACTIVE_DIRECTORY, LDAP_DEFAULT_VALUES_LDAP].findIndex(item => item === this.ruleForm['search-criteria']['user-name'])
        this.ruleRadioValue = this.ruleRadioValue === undefined ? null : this.ruleRadioValue + 1
      })
    },
    getAllLdap(selectedKeys) {
      return getAllLDAP().then(res => {
        const ldapServers = res['ldap-servers']['ldap-server']
        this.ldapServers = Array.isArray(ldapServers) ? ldapServers : ldapServers ? [ldapServers] : []
        if (this.ldapServers.length === 0) {
          this.ruleForm = {}
        } else {
          this.ldapServers[0] && this.onShowLdapServer(this.ldapServers[0]['ldap-id'])
          this.selectedKeys = selectedKeys || [0]
        }
        // this.ldapServers.sort(function(a, b) {
        //   return String(a.label).charCodeAt() - String(b.label).charCodeAt()
        // })
      })
    },
    addModalShow() {
      this.$refs.addLdap.isShow()
    },

    handleClick(item) {
      if (this.ldapServers[this.selectedKeys]['ldap-id'] === undefined || !isChangeObjorArr(this.ruleForm, this.oldRuleForm)) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('userManagement.userToolBar.changesToLDAPCerverConfiguration'),
          onConfirm: () => {
            this.$refs.drawerRight.onSave((itemKey = JSON.parse(JSON.stringify(item.key))) => {
              this.selectedKeys = [itemKey]
              this.onShowLdapServer(this.ldapServers[itemKey]['ldap-id'])
            })
          },
          onCancelChange: () => {
            this.selectedKeys = [item.key]
            this.onShowLdapServer(this.ldapServers[item.key]['ldap-id'])
          },
          onCloseChange: () => {
            // console.log()
          }
        })
      } else {
        this.selectedKeys = [item.key]
        this.onShowLdapServer(this.ldapServers[item.key]['ldap-id'])
      }
    },
    addServer(createForm) {
      // add ldap
      postLDAP({ 'ldap-server': createForm }).then(res => {
        this.ldapServers.push(res['ldap-server'])
        this.selectedKeys = [this.ldapServers.length - 1]
        this.restRuleForm(res['ldap-server'])
        this.$message.success(this.$t('userManagement.userToolBar.Create_successfully'))
      })
    },
    DeleteClick() {
      // Delete select ldap
      deleteLDAPById(this.willDeletedKey).then(async res => {
        await this.getAllLdap(this.selectedKeys)
        this.selectedKeys = this.selectedKeys[0] === 0 ? [0] : [this.selectedKeys[0] === this.ldapServers.length ? this.selectedKeys[0] - 1 : this.ldapServers.length - 1]
        if (this.ldapServers.length === 0) {
          // if ldapServers dont have
          this.selectedKeys = []
          getAuthenticationSettings().then(res => {
            const authentication = res['authentication-settings'].authentication
            if (authentication === 'LDAP') {
              const settingsData = {
                authentication: 'QualityCenter',
                'field-pattern': '',
                'field-type': ''
              }
              updateAuthenticationSettings(settingsData).then(response => {
                // set Authentication to QC
                this.$mfConfirm({
                  title: this.$t('warning'),
                  iconType: 'Warning',
                  isShowCancel: false,
                  message: this.$t('userManagement.AuthenticationIsSetQC'),
                  confirmText: this.$t('OK'),
                  onConfirm: () => {
                    setTimeout(() => {
                      window.location.reload()
                    }, 100)
                  }
                })
              })
            }
          }).catch(() => {

          })
        } else {
          this.onShowLdapServer(this.ldapServers[this.selectedKeys]['ldap-id'])
        }
        this.$message.success(this.$t('userManagement.DeleteSuccess'))
      })
    },
    onIconButton(item) {
      this.willDeletedKey = item['ldap-id']
      this.$mfConfirm({
        title: this.$t('userManagement.Delete_LDAP_Server'),
        message: this.$t('userManagement.DeleteLDAPServerContent'),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.DeleteClick
      })
    }
  }
}
</script>

<style lang="less" scoped>

.leftTitle{
  padding: 16px 0 13px 24px;
}
.ldap-item.ant-menu-item-selected::after{
  opacity: 0;
}
.menu-item-title{
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
.menu-item-title:hover{
  width: 180px;
}
.add{
  left: 20px;
  background-color: #0079EF;
  width: 16px;
  height: 16px;
  min-width: 16px;
  line-height: 16px;
  font-size: 12px;
}
.ldap-item{
  height: 32px;
  padding-right: 0;
  color: black;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ldap-item:hover{
  background-color: fade(#0079EF, 10%) !important;
  .icon-is-show{
    display: block;
  }
}
.ldap-item.ant-menu-item-selected{
  font-family: RegularWeb, serif;
  background-color: fade(#0079EF, 10%) !important;
}
.icon-is-show{
  display: none;
}
.ldap-setting /deep/ .ant-drawer-wrapper-body{
  overflow: hidden;
}
.mf-tabpanel-autoheight {
  height: calc(100vh - 118px);
}
.drawer-left{
  width: 250px;
  border: 1px #DCDEDF solid;
  border-bottom: 0;
  float: left;
}
.drawer-right{
  width: 610px;
  float: left;
  position: relative;

  //margin-top: 89px;
  // height: 976px;
}
.title{
  margin: 40px 0 0 24px;
  height: 40px;
}
.ldap-setting /deep/ .ant-drawer-body{
  padding: 0;
}
.user-drawer-tool{
  display: flex;
  justify-content: flex-end;
  width: 860px;
  border-top: 1px solid #DCDEDF;
}

</style>
<style lang="less">

.ldap-setting .ant-drawer-header{
  margin-bottom: 24px;
}
</style>
