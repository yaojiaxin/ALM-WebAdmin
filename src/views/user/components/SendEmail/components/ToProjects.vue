<template>
  <div id="to_project">
    <mf-form
      id="to_project_form"
      ref="ruleForm"
      label-align="right"
      v-bind="formItemLayout"
      :model="ruleForm"
      :rules="rules"
    >
      <a-form-model-item :label="$t('userManagement.recipientTitle')" prop="to" class="mf-margin-bottom">
        <a-tree-select
          v-if="treeOpen"
          id="sendmaill_project"
          v-model="ruleForm.to"
          dropdown-class-name="dropdown-to"
          style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto'}"
          :tree-data="treeData"
          :placeholder="$t('userManagement.Select_projects_or_domains')"
          multiple
          :load-data="onLoadData"
          @select="onSelect"
          @change="onChange"
        />
      </a-form-model-item>
      <a-form-model-item
        :label="$t('userManagement.subject')"
        prop="subject"
        class="mf-margin-bottom"
      >
        <a-input id="subject" v-model="ruleForm.subject" />
      </a-form-model-item>
      <a-form-model-item
        :label="$t('message')"
        prop="message"
        class="mf-margin-bottom message-item"
      >
        <m-f-editor v-model="ruleForm.message" :menubar="false" :height="342" :width="593" @focus="onFocus" />
      </a-form-model-item>
    </mf-form>
    <drawer-footer
      ref="drwfooter"
      :form="ruleForm"
      :user="false"
      :submit="$t('userManagement.Send')"
      :is-change.sync="isChangeProject"
      :cancel="$t('Cancel')"
      @click="onClose"
    />
  </div>
</template>

<script>
import DrawerFooter from '@/views/user/components/SendEmail/components/DrawerFooter'
import { mapGetters } from 'vuex'
import { getProjectsInDomains } from '@/api/project'
import MFEditor from '@/components/MFEditor/index'
import { USER_PROJECTS } from '@/store/const'
import { isChangeObjorArr } from '@/utils'

export default {
  name: 'ToDP',
  components: { DrawerFooter, MFEditor },
  props: {
    selectedUserList: {
      type: Array,
      default: function() {
        return []
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ruleForm: {
        to: undefined,
        toDetail: [],
        subject: '',
        message: ''
      },
      treeOpen: true,
      initForm: {},
      isChangeProject: true,
      rules: {
        to: [{ required: true, message: this.$t('userManagement.Project_is_required') }],
        subject: [{ required: true, message: this.$t('userManagement.Subject_is_required') }]
      },

      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
      },
      treeData: []
    }
  },
  computed: {
    ...mapGetters(['domainList'])
  },
  watch: {
    ruleForm: {
      handler: function(form) {
        this.isChangeProject = isChangeObjorArr(form, this.initForm)
      },
      deep: true
    }
  },
  deactivated() {
    if (!this.isChangeProject && this.visible) {
      this.$message.warning(this.$t('warningNoSave'))
    }
  },
  mounted() {
    this.$store.dispatch('project/getDomainList', true).then(() => {
      this.treeData = this.domainList.map((item, index) => {
        return {
          title: item.name,
          key: item.id ? item.id.toString() : index,
          value: item.id ? item.id.toString() : index,
          customId: item.customId,
          children: []
        }
      })
    })
    this.initForm = JSON.parse(JSON.stringify(this.ruleForm))
  },
  methods: {
    onClose() {
      this.$emit('onClosed')
      this.ruleForm.toDetail = []
    },
    onFocus() {
      const dropdown = document.getElementsByClassName('dropdown-to')[0]
      if (dropdown && getComputedStyle(dropdown, null).display === 'block') {
        this.treeOpen = false
        this.$nextTick(() => {
          this.treeOpen = true
        })
      }
    },

    onContextChange(value) {
      this.ruleForm.to = value
    },

    // Verify that the input box is empty
    validateValue() {
      let bool
      this.$refs.ruleForm.$children[0].validate(valid => {
        valid ? bool = true : bool = false
      })
      return bool
    },

    // To obtain the projects of domains
    onLoadData(treeNode) {
      return new Promise((resolve) => {
        const name = treeNode.dataRef.title
        getProjectsInDomains(name).then((res) => {
          if (res.projects && res.projects.project) {
            const project = res.projects.project
            if (!project) {
              return
            }
            const arr = []
            if (Array.isArray(project)) {
              project.forEach(item => {
                arr.push({
                  title: item.name,
                  key: treeNode.eventKey + '-' + item.id,
                  value: treeNode.eventKey + '-' + item.id,
                  isLeaf: true,
                  parentName: name
                })
              })
            } else {
              arr.push({
                title: project.name,
                key: treeNode.eventKey + '-' + project.id,
                value: treeNode.eventKey + '-' + project.id,
                isLeaf: true,
                parentName: name
              })
            }
            treeNode.dataRef.children = arr.filter(item => item.title !== USER_PROJECTS.LabProject)
            resolve()
          } else {
            treeNode.dataRef.children = []
            resolve()
          }
        })
      })
    },

    onSelect(value, node, extra) {
      if (node.dataRef.isLeaf) {
        this.ruleForm.toDetail.push({ isProject: true, value: node.dataRef.title, domain: node.dataRef.parentName })
      } else {
        this.ruleForm.toDetail.push({ isProject: false, value: node.dataRef.title })
      }
    },

    onChange(value, label, extra) {
      let newArr = []
      label.forEach(item => {
        this.ruleForm.toDetail.filter(i => {
          if (item === i.value) {
            newArr.push(i)
          }
        })
      })
      newArr = Array.from(new Set(newArr))
      this.ruleForm.toDetail = newArr
      this.$refs.drwfooter.changeForm(this.ruleForm)
    }

  }
}
</script>

<style lang="less" scoped>
.message-item{
  margin-top: 28px;
}

.mf-editor /deep/ .w-e-text-container{
  z-index: 0!important;
}
.mf-editor /deep/ .w-e-toolbar{
  z-index: 0!important;
}
</style>
