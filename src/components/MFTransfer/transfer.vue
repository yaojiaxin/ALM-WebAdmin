<template>
  <div>
    <a-transfer
      v-if="type === 'tree'"
      class="tree-transfer"
      :list-style="{width: '50%'}"
      :data-source="dataSource"
      :target-keys="targetKeyArr"
      :locale="localeOption"
      :render="item => item.title"
      :show-select-all="false"
      @change="onTreeChange"
      @selectChange="onSelectChange"
    >
      <template
        slot="children"
        slot-scope="{ props: { direction, selectedKeys }, on: { itemSelect, itemSelectAll } }"
      >

        <div v-if="direction === 'left'" class="header mf-subtitle">
          {{ localeOption.itemsUnit }}
          <span class="totalnum">{{ localeOption.total }}</span>
        </div>
        <div v-else class="header mf-subtitle">
          {{ localeOption.itemUnit }}
        </div>

        <a-input-search
          v-if="direction === 'left'"
          class="search-input"
          :placeholder="$t('inputSearchPlaceholder')"
          @search="onSearch"
        />
        <div v-if="direction === 'left'" class="tree-box">
          <a-tree
            show-icon
            block-node
            :tree-data="treeData"
            :checked-keys="[...selectedKeys, ...targetKeys]"
            :load-data="onLoadTreeNode"
            :expanded-keys="expandedKeys"
            :auto-expand-parent="autoExpandParent"
            @expand="onExpand"
          >
            <i slot="desktop" class="iconfont icon-Icon-Domain" />
            <!-- <a-icon slot="desktop" type="desktop" style="margin-right:5px" /> -->

            <i slot="folder" class="item-icon iconfont icon-projects" />

            <template slot="noCheckbox" slot-scope="item">
              <!-- {{ item.title }} -->
              <template>
                <span v-if="searchValue && toLowerCase(item.title).indexOf(toLowerCase(searchValue)) > -1" class="project-name-ship">
                  {{ item.title.toString().substr(0, toLowerCase(item.title).indexOf(toLowerCase(searchValue))) }}
                  <span style="color: #f50"> {{ item.title.toString().substring(toLowerCase(item.title).indexOf(toLowerCase(searchValue)),
                                                                                toLowerCase(item.title).indexOf(toLowerCase(searchValue)) + searchValue.length) }}</span>
                  {{ item.title.toString().substr(toLowerCase(item.title).indexOf(toLowerCase(searchValue)) + searchValue.length) }}
                </span>
                <span v-else class="project-name-ship">{{ item.title }}</span>
              </template>
            </template>

            <template slot="checkbox" slot-scope="item">
              <a-checkbox :checked="checkedNodes.includes(item.key)" :disabled="item.disabled" @click="onItemChecked(item, itemSelect)">
                <template>
                  <i class="item-icon iconfont icon-project" style="margin:0 10px 0 5px" />
                  <span v-if="searchValue && toLowerCase(item.title).indexOf(toLowerCase(searchValue)) > -1" class="project-name-ship">
                    {{ item.title.toString().substr(0, toLowerCase(item.title).indexOf(toLowerCase(searchValue))) }}
                    <span style="color: #f50"> {{ item.title.toString().substring(toLowerCase(item.title).indexOf(toLowerCase(searchValue)),
                                                                                  toLowerCase(item.title).indexOf(toLowerCase(searchValue)) + searchValue.length) }}</span>
                    {{ item.title.toString().substr(toLowerCase(item.title).indexOf(toLowerCase(searchValue)) + searchValue.length) }}
                  </span>
                  <span v-else class="project-name-ship">{{ item.title }}</span>
                </template>
              </a-checkbox>
            </template>
          </a-tree>
        </div>
        <a-table
          v-else
          :row-selection="getSelection({ selectedKeys, itemSelectAll, itemSelect })"
          :columns="tableColumns"
          :data-source="rightData"
          :pagination="false"
        />
      </template>
    </a-transfer>
  </div>
</template>

<script>
import { getProjectsInDomains } from '@/api/project'
// import TableTransfer from './tableTransfer'

const getParentKey = (key, tree) => {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

const dataList = []
const generateList = data => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i]
    var key = node.key
    var title = node.title
    if (typeof (key) !== 'string') {
      key = key.toString()
    }
    dataList.push({ key, title: title })
    if (node.children) {
      generateList(node.children)
    }
  }
}

export default {
  name: 'Transfer',

  props: {
    // transfer type
    type: {
      type: String,
      default: 'table'
    },
    // You need to exclude items when loading the domain tree
    exclude: {
      type: Array,
      default: () => []
    },
    datas: {
      type: Array,
      default: function() {
        return []
      }
    },
    tableColumns: {
      type: Array,
      default: function() {
        return Object.freeze([
          {
            dataIndex: 'title',
            title: this.$t('login.userName')
          },
          {
            dataIndex: 'fullName',
            title: this.$t('userManagement.FULL_NAME')
          }
        ])
      }
    },
    titles: {
      type: Array,
      default: function() {
        return []
      }
    },
    treeTargetKeys: {
      type: Array,
      default: function() {
        return []
      }
    },
    localeOption: {
      type: Object,
      default: () => { return { itemUnit: '', itemsUnit: '' } }
    },
    noData: {
      type: Boolean,
      default: false
    },

    isShowTemplate: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      selectedRowKeys: [],
      targetKeys: [],
      treeData: [],
      tableData: [],
      rightData: [],
      dataSource: [],
      targetKeyArr: [...this.treeTargetKeys],
      checkedData: [],
      tableChecked: [],

      expandedKeys: [],
      autoExpandParent: true,
      searchValue: '',

      pageTotal: 0,
      pageNum: 1,

      checkedNodes: []

    }
  },

  watch: {
    datas: {
      handler(val) {
        if (this.type === 'tree') {
          this.treeData = JSON.parse(JSON.stringify(val))
        } else {
          if (!this.noData) {
            this.tableData = val
          }
        }
      },
      immediate: true
    }

  },

  created() {
    if (this.type === 'tree') {
      this.treeData = JSON.parse(JSON.stringify(this.datas)).map(item => {
        return {
          ...item,
          key: item.name + '',
          title: item.name + '',
          slots: { icon: 'desktop' }
        }
      })
      this.flatten(this.treeData)
    }
  },

  methods: {
    toLowerCase(val) {
      return val.toString().toLowerCase()
    },

    onRestTransfer() {
      this.selectedRowKeys = []
      this.rightData = []
      this.targetKeys = []
      this.checkedNodes = []
    },

    onSearch(value) {
      // if (dataList.length === 0) return
      // if (value === this.searchValue) return
      this.expandedKeys = dataList.map(item => {
        if (this.toLowerCase(item.title).indexOf(this.toLowerCase(value)) > -1) {
          return getParentKey(item.key, this.treeData)
        }
        return null
      })
        .filter((item, i, self) => item && self.indexOf(item) === i)
      this.searchValue = value
      this.autoExpandParent = true
      // Object.assign(this, {
      //   expandedKeys,
      //   searchValue: value,
      //   autoExpandParent: true
      // })
    },

    onExpand(expandedKeys, { expanded: bool, node }) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },

    onLoadTreeNode(node) {
      return new Promise(resolve => {
        const nodeInfo = node.dataRef

        if (nodeInfo.children || (nodeInfo.type === 'project')) {
          resolve()
          return
        }

        getProjectsInDomains(nodeInfo.title).then(res => {
          const template = []
          const projects = []
          let response = res.projects.project

          // response is null status
          if (!response) {
            node.dataRef.children = [
              { key: `${node.eventKey}-1`, title: ' Projects', scopedSlots: { title: 'noCheckbox' }, isLeaf: true, slots: { icon: 'folder' }}
            ]
            if (this.isShowTemplate) {
              node.dataRef.children.push({ key: `${node.eventKey}-2`, title: 'Template Projects', scopedSlots: { title: 'noCheckbox' }, isLeaf: true, slots: { icon: 'folder' }})
            }
            this.treeData = [...this.treeData]
            resolve()
            return
          }
          if (!Array.isArray(response)) {
            response = [response]
          }

          response.forEach(item => {
            if (item['project-type'] !== 'LabManagement') {
              if (item['is-template']) {
                template.push({
                  // key: item.uid,
                  key: `${nodeInfo.title}/${item.name}`,
                  title: item.name,
                  type: 'project',
                  scopedSlots: { title: 'checkbox' },
                  checked: false,
                  disabled: this.exclude.findIndex(i => i.name === item.name && i['domain-name'] === nodeInfo.title) > -1,
                  hiddenCheckbox: this.exclude.findIndex(i => i['target-project'] === item.name && i['target-domain'] === nodeInfo.title) < 0,
                  isLeaf: true,
                  domain: nodeInfo.title
                })
              } else {
                projects.push({
                  // key: item.uid,
                  key: `${nodeInfo.title}/${item.name}`,
                  title: item.name,
                  type: 'project',
                  scopedSlots: { title: 'checkbox' },
                  checked: false,
                  disabled: this.exclude.findIndex(i => i['target-project'] === item.name && i['target-domain'] === nodeInfo.title) > -1,
                  hiddenCheckbox: this.exclude.findIndex(i => i['target-project'] === item.name && i['target-domain'] === nodeInfo.title) < 0,
                  isLeaf: true,
                  domain: nodeInfo.title
                })
              }
            } else {
              return false
            }
          })
          node.dataRef.children = [
            { key: `${node.eventKey}-1`, title: ' Projects', scopedSlots: { title: 'noCheckbox' }, children: projects, isLeaf: !projects.length, slots: { icon: 'folder' }}
          ]

          if (this.isShowTemplate) {
            node.dataRef.children.push({ key: `${node.eventKey}-2`, title: 'Template Projects', scopedSlots: { title: 'noCheckbox' }, children: template, isLeaf: !template.length, slots: { icon: 'folder' }})
          }

          this.treeData = [...this.treeData]
          generateList(this.treeData)
          resolve()
        })
      })
    },

    // deep copy treeData
    flatten(list = []) {
      list.forEach(item => {
        this.dataSource.push(item)
        this.flatten(item.children)
      })
    },

    // left is tree transfer change
    onTreeChange(targetKeys, direction) {
      if (direction === 'right') {
        this.rightData = []
        const noRepeat = [...new Set(this.checkedData)]
        noRepeat.forEach(item => {
          this.setTreeDisabled(this.treeData, item, true)
        })
        this.returnSelectedItem(this.treeData)
        this.tableChecked = []
        this.checkedData = []
      } else {
        const newRight = []
        const noRepeat = [...new Set(this.tableChecked)]
        noRepeat.forEach(item => {
          this.setTreeDisabled(this.treeData, item, false)
        })
        this.checkedNodes = this.checkedNodes.filter(it => !noRepeat.includes(it))
        this.rightData.forEach(item => {
          if (!noRepeat.includes(item.key)) {
            newRight.push(item)
          }
        })
        this.rightData = newRight
        this.checkedData = []
      }
      this.$emit('selected', this.rightData)
    },

    returnSelectedItem(trees, key) {
      // console.log(trees)
      trees.forEach(item => {
        if (item.hiddenCheckbox && item.disabled) {
          const obj = { ...item }
          delete obj.children
          this.rightData.push(obj)
        }
        if (item.children) { this.returnSelectedItem(item.children, key) }
      })
    },

    handleTreeData(data, targetKeys = []) {
      data.forEach(item => {
        item.disabled = targetKeys.includes(item.key)
        if (item.children) {
          this.handleTreeData(item.children, targetKeys)
        }
      })
      return data
    },

    getSelectedUsers(val) {
      this.$emit('selected', val)
    },

    // right is tree: table options
    getSelection({ selectedKeys, itemSelectAll, itemSelect }) {
      const _this = this
      return {
        onSelectAll(selected) {
          const Keys = selected ? _this.rightData.map(item => item.key) : selectedKeys
          _this.tableChecked = Keys
          itemSelectAll(Keys, selected)
        },
        onSelect({ key }, selected) {
          const index = _this.tableChecked.indexOf(key)
          if (index === -1 && selected) {
            _this.tableChecked.push(key)
          } else {
            if (index > -1 && !selected) { _this.tableChecked.splice(index, 1) }
          }
          itemSelect(key, selected)
        },
        selectedRowKeys: selectedKeys
      }
    },

    onItemChecked(target, itemSelect) {
      const index = this.checkedData.indexOf(target.key)
      const allCheck = this.checkedNodes.indexOf(target.key)
      if (index > -1) {
        this.checkedData.splice(index, 1)
        this.checkedNodes.splice(allCheck, 1)
      } else {
        this.checkedData.push(target.key)
      }

      this.checkedNodes = [...new Set([...this.checkedNodes, ...this.checkedData])]
      this.setTreeChecked(this.treeData, target.key)
      itemSelect(target.key, !target.checked)
    },

    setTreeChecked(tree, key) {
      tree.forEach(item => {
        if (item.key === key) {
          item.checked = !item.checked
        }
        if (item.children) { this.setTreeChecked(item.children, key) }
      })
      return tree
    },

    setTreeDisabled(tree, key, status) {
      tree.forEach(item => {
        if (item.hiddenCheckbox && item.key === key) {
          item.disabled = status
          item.checked = status
        }
        if (item.children) { this.setTreeDisabled(item.children, key, status) }
      })
      return tree
    },

    onSelectChange() {}

    // onChecked(_, e, checkedKeys, itemSelect) {
    //   const { eventKey } = e.node
    //   itemSelect(eventKey, !this.isChecked(checkedKeys, eventKey))
    // },

    // isChecked(selectedKeys, eventKey) {
    //   return selectedKeys.indexOf(eventKey) !== -1
    // }
  }
}
</script>

<style scoped lang="less">
/deep/.ant-table{
  border: none;
  box-shadow: none;
}
/deep/.ant-table-placeholder{
  border-bottom: 0;
}

/deep/.ant-transfer-customize-list .ant-transfer-list{
  border: 0;
}
/deep/.ant-transfer-list-header{
  border: 0;
  display: none;
}
/deep/.ant-transfer-list-body{
  border:1px solid rgba(101, 102, 104, 0.16)
}
/deep/.ant-transfer-customize-list .ant-transfer-list-body-customize-wrapper{
  padding: 0;
}
/deep/.ant-transfer-operation{
  width: 24px;
}
/deep/.ant-transfer-operation .ant-btn{
  min-width: 24px;
}
/deep/.ant-transfer-operation .ant-btn:first-child{
  margin-bottom: 10px;
}

.header{
  position: absolute;
  top: -41px;
  left: 0;
  width: 100%;
  height: 40px;
  padding: 6.5px 0;
  overflow: hidden;
  color: #000;
  background: #fff;
}
.search-input{
  width: 80%;
  margin-left: 8%;
  margin-bottom: 10px;
  margin-top: 10px;
}

.totalnum{
  padding-left: 10px;
  font-size: 12px;
  font-family: Regular-Web serif;
  color: #0075F3;
}

.tree-box{
  max-height: 400px;
  overflow:auto;
}
</style>
