<template>
  <div>
    <div
      v-if="name"
      :name="name"
      :type="type"
      :isRequest="target.isRequest"
      :customId="target.customId"
      :target="target.domainName || target.name"
      :class="['tree-name',
               target.selected ? 'tree-name-selected' : '',
               type === 'domain' ? 'tree-domain-node' : '',
               type === 'project' ? 'tree-project-node project-status-dot': '',
               target['is-active'] && target['is-active'] ? 'dot-active' : 'dot-inactive']"
      :style="indent"
    >
      <span v-if="type !== 'project'">
        <a-icon
          class="item-arrow"
          :type="showChildLoading ? 'loading' : !target.showChildren?'right':'down'"
          @click.stop="onToggleChildren(target)"
        />
      </span>

      <!--   name   -->
      <span v-show="!target.edit" class="tree-node-name" @click.stop="onSelectedTarget(target)">
        <i v-if="type !== 'project' && type !== 'template'" :class="['item-icon iconfont', nodeIcon]" />
        <svg-icon v-else class-name="item-icon svg-icon" :icon-class="target['is-active'] ? 'active-folder' :'inactive-folder'" />
        <span :class="[(String(name).toLocaleUpperCase().indexOf(searchName.toLocaleUpperCase()) > -1)&&searchName? 'search-node' : '']">{{ name }}</span>
      </span>

      <!-- <div v-if="target.edit">
        <i :class="['item-icon iconfont', type==='domain'? 'icon-Icon-Domain':(type==='projects'||type==='template')? 'icon-projects': 'icon-AddProject']" />
        <a-input
          v-show="target.edit"
          :default-value="name"
          class="tree-name-edit"
          @change="onChangeItem"
        />
        <span v-show="target.edit" class="tree-edit-icon">
          <a-icon type="check" :style="'font-size:12px;color:#1AAC60; margin-right:10px'" @click.stop="onUpdateName(target)" />
          <a-icon type="close" :style="'font-size:12px;color:#000000; margin-right:10px'" @click.stop="onCloseEdit(target)" />
        </span>
      </div> -->

      <div class="tree-node-tools">

        <!--        <mf-switch-->
        <!--          v-if="target.type === 'project' && !target.edit"-->
        <!--          class="tree-switch"-->
        <!--          :checked="!showEditIcon"-->
        <!--          @onChange="onSwitchChange($event, target)"-->
        <!--        />-->

        <!-- switch button -->
        <!-- <mf-switch
          v-if="target.type === 'project' && !target.edit"
          class="tree-switch"
          :checked="target['is-active']&&target['is-active']"
          @onChange="onSwitchChange($event, target)"
        /> -->

        <!-- edit icon -->
        <!-- <icon-btn
          v-if="target.edit ? false : (target.type === 'project' && !target['is-active'])"
          class="tree-edit"
          icon-style="icon-edit"
          @onClick="onEditItem(target)"
        /> -->

        <!-- delete icon -->
        <icon-btn
          v-if="!target.edit && (target.type !== 'projects' && target.type !== 'templates') "
          class="tree-delete"
          icon-style="icon-delete"
          @onClick="onDeleteItem(target)"
        />

      </div>
    </div>

    <!-- children -->
    <tree-menu
      v-for="node in nodes"
      v-show="target.showChildren||!name"
      :key="node.id"
      :target="node"
      :nodes="node.nodes"
      :name="node.name"
      :type="node.type"
      :depth="depth+1"
    />

    <!-- input db password -->
    <mf-modal
      :visible="visible"
      :confirm-loading="deleteLoading"
      :cancel-text="$t('Cancel')"
      :ok-text="$t('OK')"
      width="434px"
      @cancel="onCloseModal"
      @ok="onDeleteTreeNodeBtn"
    >
      <span slot="title">
        {{ $t('project.database_admin_password') }}
      </span>
      <span class="mf-subtitle mf-margin-b-24">
        {{ target['db-type'] === 2 ? $t('project.ms_sql_settings') : $t('project.oracle_settings') }}
      </span>
      <mf-form
        ref="addRef"
        :label-col="{ span: 15 }"
        :wrapper-col="{ span: 9 }"
        class="add-form"
        :rules="rules"
        :model="form"
      >
        <a-form-model-item :label="$t('project.database_administrator_user')" prop="name">
          <a-input id="db_user" v-model="form.name" :max-length="30" />
        </a-form-model-item>
        <a-form-model-item :label="$t('project.database_administrator_password')" prop="value">
          <a-input-password id="db-password" v-model="form.password" />
        </a-form-model-item>
      </mf-form>
    </mf-modal>
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index'
// import MfSwitch from '@/components/MFSwitch/index'
// import ModalConfirm from '@/components/ModalConfirm/index'
import { mapActions, mapMutations } from 'vuex'
// import { activeProject, deActiveProject } from '@/api/project'

export default {
  name: 'TreeMenu',
  components: { IconBtn },
  props: {
    // treeNode name
    name: { type: [String, Number], default: '' },
    // treeNode type
    type: { type: String, default: '' },
    // treeNode children
    nodes: { type: Array, default: function() { return [] } },
    // treeNode info
    target: { type: Object, default: function() { return {} } },
    // treeNode indent
    depth: { type: Number, default: 1 },
    // treeNode show children
    showChild: { type: Boolean, default: false },
    // edit treeNode
    edit: { type: Boolean, default: false }
  },
  data() {
    return {
      // eslint-disable-next-line no-prototype-builtins
      // showEditIcon: this.target.hasOwnProperty('is-active') && !this.target['is-active'],
      showChildLoading: false,
      newName: '',
      visible: false,
      deleteLoading: false,
      rules: {},
      form: {
        name: '',
        password: '123456'
      }
    }
  },
  computed: {
    selectedNode: function() {
      return this.$store.state.tree.selectedTreeNode
    },
    searchName() {
      return this.$store.state.tree.searchName
    },
    indent() {
      return { 'padding-left': `${this.depth * 24}px` }
    },

    nodeIcon() {
      if (this.type === 'domain') {
        return 'icon-Icon-Domain'
      } else if (this.type === 'projects' || this.type === 'templates') {
        return 'icon-projects'
      } else if (this.type === 'project' || this.type === 'template') {
        return this.target['is-active'] ? 'icon-active-icon' : 'icon-inactiveproject'
      } else {
        return ''
      }
    }
  },

  watch: {
    selectedNode: function(val, oldVal) {
      if (val.type === 'project' &&
          ((val['is-active'] !== oldVal['is-active']) &&
          (val.name === this.target.name && val.name === oldVal.name))) {
        this.active = val['is-active']
      }
    }
  },

  destroyed() {
    this.resetSearchName()
  },
  methods: {
    ...mapActions(['getProjectInDomain', 'deleteDomain', 'deleteProject', 'updateProjectName']),

    ...mapMutations(['selectedMenuItem', 'setTreeItemEditStatus', 'setShowMenuChild', 'resetSearchName']),

    async onToggleChildren({ type, isRequest, customId, domainName, name }) {
      const targetName = domainName || name
      if ((type === 'projects' || type === 'templates') && !isRequest) {
        this.showChildLoading = true
        await this.getProjectInDomain({ targetName, customId, type })
        this.showChildLoading = false
      } else {
        this.setShowMenuChild(customId)
      }
    },

    onSelectedTarget({ type, customId }) {
      this.selectedMenuItem({ customId, type, target: this.target })
    },

    onCloseModal() {
      this.visible = false
    },

    onDeleteTreeNodeBtn() {
      this.deleteLoading = true
      // const node = this.target
      // let title = ''
      // let message = ''
      // if (node.type === 'project') {
      //   title = this.$t('project.deleteProject')
      //   message = this.$t('project.delete_project_message', { name: node.name })
      // } else if (node.type === 'domain') {
      //   title = this.$t('project.DELETE_DOMAIN')
      //   message = this.$t('project.delete_domain_message', { name: node.name })
      // }
      this.deleteTreeNode()
    },

    async deleteTreeNode() {
      await this.onSubmit()
      this.deleteLoading = false
      this.visible = false
    },
    // onUpdateName(item) {
    //   // this.showEditIcon = false
    //   this.updateProjectName({ domain: item['domain-name'], name: item.name, newName: this.newName, id: item.customId })
    //   this.setTreeItemEditStatus({ id: item.customId, status: false })
    //   // this.showEditIcon = true
    // },

    // onCloseEdit(item) {
    //   // this.showEditIcon = false
    //   this.setTreeItemEditStatus({ id: item.customId, status: false })
    //   // this.showEditIcon = true
    // },

    // onSwitchChange(val, nodeInfo) {
    //   const param = {
    //     domain: nodeInfo['domain-name'],
    //     project: nodeInfo.name,
    //     treeNode: nodeInfo
    //   }
    //   val ? this.activeProject(param) : this.deactiveProject(param)
    //   // toggleStatusFunc({
    //   //   domain: nodeInfo['domain-name'],
    //   //   project: nodeInfo.name
    //   // }).then(() => {
    //   //   this.showEditIcon = !val
    //   // }).catch(() => {
    //   //
    //   // })
    // },

    // onEditItem(item) {
    //   this.setTreeItemEditStatus({ id: item.customId, status: true })
    // },

    onChangeItem(e) {
      this.newName = e.target.value
    },

    onDeleteItem(node) {
      // if (node.type === 'domain') {
      let title = ''
      let message = ''

      if (node.type === 'project') {
        title = this.$t('project.deleteProject')
        message = this.$t('project.delete_project_message', { name: node.name })
      } else if (node.type === 'domain') {
        title = this.$t('project.DELETE_DOMAIN')
        message = this.$t('project.delete_domain_message', { name: node.name })
      }

      this.$mfConfirm({
        title: title,
        iconType: 'Confirm',
        message: message,
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.onSubmit
      })
      // } else {
      //   this.visible = true
      // }
    },

    onSubmit() {
      const item = this.target
      if (item.type !== 'project') {
        return this.deleteDomain(item.name)
      } else {
        return this.deleteProject({ ...item, domain: item['domain-name'], project: item.name })
      }
    }
  }
}
</script>

<style scoped lang="less">
.tree-name{
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #323435;
  height: 32px;
  .tree-switch, .tree-delete, .tree-edit-icon{
    //display: none;
    margin: 0 8px;
  }

  &:hover .tree-switch{
    display: initial;
  }
  &:hover .tree-delete{
    display: initial;
  }
  &:hover .tree-edit{
    display: initial;
  }
  &:hover .tree-edit-icon{
    display: initial;
  }
  .tree-name-edit{
    width: 80px;
  }
  .tree-node-name{
    position: relative;
    font-size: 16px;
    // max-width: 90px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex: 1;

    .status-icon{
      position: absolute;
      left: 17px;
      bottom: 3px;
    }
  }
  .tree-node-name:hover{
    width: auto;
  }
}

.tree-domain-node{
  font-family: MediumWeb;
  padding-left: 24px;
  height: 40px;
}

.item-arrow{
  font-size: 12px;
  margin-right: 5px;
}
.tree-name-selected{
  background-color: rgba(0,121, 239,0.05);

  .tree-node-name{
    font-family: MediumWeb;
  }
}
.item-icon{
  font-size: 14px;
  margin: 0 8px;
}
.project-status-word{
  display: inline-block;
  margin: 0 10px 3px 0;
}

.project-status-dot.dot-inactive{
  .tree-node-name{
    color: rgba(0, 0, 0, 0.5);
  }
}

.tree-project-node{
  .tree-node-tools{
    font-size: 12px;
  }
}

.tree-node-tools{
  display: none;
  flex-direction: row;
  .tool-icon-btn{
    margin: 0 10px;
  }
}
.tree-name:hover .tree-node-tools{
  display: flex;
}
.search-node{
  color: #29ceff;
}

.svg-icon{
  font-size: 16px;
}
</style>
