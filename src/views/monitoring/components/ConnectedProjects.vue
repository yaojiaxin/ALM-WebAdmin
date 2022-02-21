<template>
  <mf-modal
    id="send_projects_modal"
    :visible="visible"
    width="802px"
    :confirm-loading="loading"
    :ok-text="text"
    @ok="SendMsg"
    @cancel="onCancel"
  >
    <span slot="title" class="project-title">
      {{ $t('monitoring.actions_domains/projects') }}
    </span>

    <div class="pro-cont">
      <a-tree
        id="project-tree"
        :tree-data="treeData"
        show-icon
        checkable
        :checked-keys="checkedKeys"
        :expanded-keys.sync="expandedKeys"
        @check="onCheck"
      >
        <template #switcherIcon>
          <a-icon slot="icon" type="down" />
        </template>
        <template #desktop>
          <a-icon slot="icon" type="desktop" />
        </template>
        <template #folder>
          <i slot="folder" class="item-icon iconfont icon-projects" />
        </template>
      </a-tree>
    </div>
  </mf-modal>
</template>

<script>
import { groupBySessions, disconnectSessions } from '@/api/connection'
export default {
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      checkedKeys: [],
      treeData: [],
      expandedKeys: [],
      sendToEmail: '',
      showSendProject: '',
      loading: false
    }
  },
  mounted() {
    this.getDomainProjects()
  },
  methods: {
    // get all domains and projects
    getDomainProjects() {
      const param = 'project'
      this.loading = true
      this.treeData = []
      groupBySessions(param).then((res) => {
        const arr = res.GroupByHeaders.GroupByHeader
        let data = []
        if (Array.isArray(arr)) {
          arr.forEach((item, index) => {
            data.push(
              {
                title: item['@Value'],
                slots: {
                  icon: 'desktop'
                },
                children: []
              }
            )
            if (Array.isArray(item.GroupByHeader)) {
              item.GroupByHeader.forEach((i) => {
                data[index].children.push(
                  {
                    title: i['@Value'],
                    key: i['@Value'],
                    slots: {
                      icon: 'folder'
                    }
                  }
                )
              })
            } else {
              data[index].children.push(
                {
                  title: item.GroupByHeader['@Value'],
                  key: item.GroupByHeader['@Value'],
                  slots: {
                    icon: 'folder'
                  }
                }
              )
            }
          })
        } else {
          data = [{
            title: arr['@Value'],
            slots: {
              icon: 'desktop'
            },
            children: []
          }]
          if (Array.isArray(arr.GroupByHeader)) {
            arr.GroupByHeader.forEach(e => {
              data[0].children.push(
                {
                  title: e['@Value'],
                  key: e['@Value'],
                  slots: {
                    icon: 'folder'
                  }
                }
              )
            })
          } else {
            data[0].children.push({
              title: arr.GroupByHeader['@Value'],
              key: arr.GroupByHeader['@Value'],
              slots: {
                icon: 'folder'
              }
            })
          }
        }
        this.treeData = data
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    show() {
      this.visible = true
      this.expandedKeys = []
    },
    SendMsg() {
      if (this.text === this.$t('monitoring.disconnect')) {
        if (this.sendToEmail) {
          disconnectSessions(this.sendToEmail).then((res) => {
            this.checkedKeys = []
            this.$message.success('Disconnected successfully')
            this.$emit('refresh')
          })

          this.visible = false
        } else {
          this.$message.error(this.$t('monitoring.choose_null_error'))
        }
      } else {
        if (this.sendToEmail) {
          this.checkedKeys = []
          this.$emit('onMsgOpen', this.sendToEmail, this.showSendProject)
          this.visible = false
        } else {
          this.$message.error(this.$t('monitoring.choose_null_error'))
        }
      }
    },
    onCancel() {
      this.checkedKeys = []
      this.visible = false
    },
    onCheck(checkedKeys, info) {
      this.checkedKeys = checkedKeys
      const list = []
      this.treeData.forEach(item => {
        item.children.forEach(i => {
          checkedKeys.forEach(e => {
            if (e === i.key) {
              list.push(i.title)
            }
          })
        })
      })
      this.sendToEmail = `project[${list.toString().replace(/,/g, ' OR ')}]`
      this.showSendProject = list.toString()
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
    width: 754px;
    box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(101, 102, 104, 0.16);
    padding-top: 24px;
    overflow: auto;
    flex: 1;
  }

  #send_projects_modal /deep/.ant-modal{
    height: 456px !important;
  }

  #send_projects_modal /deep/ .ant-tree li span.ant-tree-switcher_open{
    border-left: 4px solid #0079EF !important;
  }

  #send_projects_modal /deep/ .ant-tree li span.ant-tree-switcher_close{
    border-left: 4px solid #ffffff !important;
  }

  #send_projects_modal /deep/ .ant-tree li span.ant-tree-switcher{
    padding-left: 16px;
  }

  #send_projects_modal /deep/ .ant-tree li span.ant-tree-checkbox{
    margin-left: 13px;
  }

  #send_projects_modal /deep/ .ant-tree-treenode-switcher-open .ant-tree-treenode-switcher-close .ant-tree-switcher-icon{
    display: none;
  }

</style>
