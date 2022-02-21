<template>
  <div class="chang-password-wrap">
    <mf-modal
      id="db_server_passeord"
      :visible="visible"
      :confirm-loading="loading"
      width="500px"
      :ok-text="$t('OK')"
      @cancel="onCancel"
      @ok="onOk"
    >

      <!-- title -->
      <span slot="title">
        {{ passwordType===DB_PASSWORD_TYPE.dbPassword ? $t('servers.DatabaseAdministratorPassword'):$t('servers.UserPassword') }}
        <mf-help-btn :help="ADMIN_PASSWORD" />
      </span>

      <!-- form -->
      <mf-form
        id="change_passeord_form"
        ref="changePasswordForm"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :model="form"
        :rules="rules"
      >
        <a-form-model-item :label="$t('newPassword')" prop="newPassword">
          <a-input-password id="db_password_new" v-model.trim="form.newPassword" :placeholder="$t('userManagement.Please enter')" :max-length="40" />
        </a-form-model-item>

        <a-form-model-item :label="$t('confirmPassword')" prop="confirmNewPassword">
          <a-input-password id="db_password_confirm_new" v-model.trim="form.confirmNewPassword" :placeholder="$t('userManagement.Please enter')" :max-length="40" />
        </a-form-model-item>
      </mf-form>

    </mf-modal>
    <confirm-Password ref="confirmPassword" :change-passord-visible.sync="visible" />
  </div>
</template>

<script>
import confirmPassword from './confirmPassword'
import { DB_PASSWORD_TYPE } from '@/store/const'
import { updateDbServerDetail, getProjects } from '@/api/servers'
import { Encrypt } from '@/utils/forge'
import i18n from '@/locales'
import { ADMIN_PASSWORD } from 'config/help'
const Projects = { name: i18n.tc('project.Projects'), slots: { icon: 'folder' }, class: 'project-class' }
const Templates = { name: i18n.tc('project.TemplateProjects'), slots: { icon: 'folder' }, class: 'project-class' }
export default {
  components: {
    confirmPassword
  },
  props: {
    passwordType: {
      type: String,
      default: 'dbPassword'
    },

    helpHref: {
      type: String,
      default: '#'
    }
  },
  data() {
    return {
      DB_PASSWORD_TYPE,
      visible: false,
      loading: false,
      ADMIN_PASSWORD,
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      form: {
        newPassword: '',
        confirmNewPassword: ''
      },
      rules: {},
      details: {}
    }
  },
  watch: {
    visible(visible) {
      if (visible) {
        for (const key in this.form) {
          this.form[key] = ''
        }
      }
    }
  },

  methods: {

    show(details) {
      this.visible = true
      this.details = details
    },

    editDbServer(newPassword, type, msg) {
      this.loading = true
      this.details[type] = newPassword
      const result = JSON.parse(JSON.stringify(this.details))
      // password need encrypt
      const password = result[type]
      result[type] = password != null ? Encrypt(password.trim()) : ''
      updateDbServerDetail(result.id, result).then(res => {
        this.$message.success(msg)
        this.loading = false
        this.visible = false
      }).catch(() => {
        this.loading = false
      })
    },

    onCancel() {
      this.visible = false
      this.loading = false
    },

    async passwordDiff() {
      const { newPassword, confirmNewPassword } = this.form
      // if (newPassword.trim() === '' && confirmNewPassword.trim() === '') {
      //   this.editDbServer(newPassword.trim(), 'admin-password', this.$t('servers.PasswordChangedSuccess'))
      //   return
      // }
      // if password is different
      if (newPassword !== confirmNewPassword) {
        this.passwordConfirm(this.$t('servers.ReTypedWrongPassword'), () => {
          this.visible = true
        })
      } else {
        // password is same, use editDbServer to change password
        // change user password
        if (this.passwordType === DB_PASSWORD_TYPE.userPassword) {
          if (this.details.type === 3) {
            this.editDbServer(newPassword, 'alm-user-password', this.$t('servers.UserPasswordChangedSuccess'))
            this.visible = false
            return
          }
          const serverId = this.details.id
          const res = await getProjects(serverId)
          const project = res.projects.project
          if (!project) {
            this.editDbServer(newPassword, 'alm-user-password', this.$t('servers.UserPasswordChangedSuccess'))
            this.visible = false
            return
          }
          this.project = Array.isArray(project) ? project : [project]
          const treeData = this.arrangeTreeData(this.project)
          this.$refs.confirmPassword.show(treeData, newPassword)
        } else {
          // change admin password
          this.details['admin-password'] = newPassword
          this.editDbServer(newPassword, 'admin-password', this.$t('servers.PasswordChangedSuccess'))
        }
      }
    },

    _getProjectIconByStatus(status) {
      return status === true ? 'active' : 'inactive'
    },

    // set Project Data to tree Data
    arrangeTreeData(project) {
      const storageTreeData = []
      const treeData = []
      project.forEach((item, index) => {
        item.class = 'project-class'
        item.slots = { icon: this._getProjectIconByStatus(item['is-active']) }
        if (storageTreeData.indexOf(project[index]['domain-id']) === -1) {
          treeData.push({
            id: project[index]['domain-id'],
            name: project[index]['domain-name'],
            class: 'domain-class',
            slots: {
              icon: 'desktop'
            },
            children: [{ ...Projects, id: index + 'project', children: !item['is-template'] ? [item] : [] }, { ...Templates, id: index + 'template', children: item['is-template'] ? [item] : [] }]
          })
          storageTreeData.push(project[index]['domain-id'])
        } else {
          treeData.forEach((value, key) => {
            if (treeData[key].id === project[index]['domain-id']) {
              treeData[key].children = [
                { ...Projects, id: index + 'project', children: !item['is-template'] ? [...value.children[0].children, item] : [] },
                { ...Templates, id: index + 'template', children: item['is-template'] ? [...value.children[1].children, item] : [] }
              ]
            }
          })
        }
      })
      return treeData
    },

    // confirm message
    passwordConfirm(message, callback) {
      this.$mfConfirm({
        title: this.$t('Error'),
        iconType: 'Error',
        message,
        isShowCancel: false,
        confirmText: this.$t('OK'),
        onConfirm: () => {
          callback()
        }
      })
    },

    onOk() {
      this.passwordDiff()
    }
  }
}
</script>

<style lang="less" scoped>
  .chang-password-wrap{
    display:inline-block
  }
</style>
