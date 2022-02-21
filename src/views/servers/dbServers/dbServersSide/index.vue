<template>
  <div class="mf-db-side">

    <div class="title mf-h5 main-sidebar-title">
      <span :title="$t('servers.DBSERVERS')">{{ $t('servers.DBSERVERS') }}</span>
      <a-button id="add_db_servers" class="db-add" type="primary" shape="circle" icon="plus" size="small" @click="onAddServer" />
    </div>

    <a-menu
      id="db_side_menu"
      :selected-keys="selectedKey"
      mode="inline"
    >
      <a-menu-item v-for="item in dbServersList" :key="item.id" ref="serversList" class="db-side-item" @click="onCheckedServer(item, true)">
        <a-tooltip
          :title="item.name"
        >
          <span class="db-side-name">
            {{ item.name }}
          </span>
        </a-tooltip>
        <!--        <icon-btn-->
        <!--          id="db-icon-delete"-->
        <!--          icon-style="icon-delete"-->
        <!--          class="icon-is-show"-->
        <!--          :icon-title="$t('servers.DeleteServer')"-->
        <!--          @onClick="onDeleteServer(item)"-->
        <!--        />-->
      </a-menu-item>
    </a-menu>

    <!-- add DbServer -->
    <add-db-server ref="addDbServerRef" />
  </div>
</template>

<script>
import { getAllDbServers, deleteDbServer } from '@/api/servers'
// import IconBtn from '@/components/BtnIcon/index'
import AddDbServer from './addDbServer'

export default {
  // components: { IconBtn, AddDbServer },
  components: { AddDbServer },
  data() {
    return {
      selectedKey: [1],
      dbServersList: [],
      deleteServerData: {},
      dbServerDetail: null
    }
  },
  watch: {
    selectedKey: {
      handler(val) {
        this.deleteServerData = this.dbServersList.find(item => {
          return item.id === this.selectedKey[0]
        })
      },
      immediate: true
    }
  },

  mounted() {
    this.getServersList()
  },

  methods: {
    getServersList(createdServerDetail = null) {
      return getAllDbServers().then(res => {
        const servers = res['db-servers']['db-server']
        this.dbServersList = Array.isArray(servers) ? servers : [servers]
        const list = this.dbServersList

        // after creating new db server successfully, focus on it
        if (createdServerDetail != null) this.dbServerDetail = createdServerDetail

        // if dbserver is chekced, show the checked dbserver after refresh
        if (this.dbServerDetail) {
          const checkedId = this.dbServerDetail.id
          const result = list.find((item) => {
            return item.id === checkedId
          })
          if (result) {
            this.onCheckedServer(this.dbServerDetail)
          } else {
            this.onCheckedServer(list[0])
          }
        } else {
          this.onCheckedServer(list[0])
        }
      })
    },

    onAddServer() {
      this.$refs.addDbServerRef.show()
    },

    onCheckedServer(item, isMenuClick = false) {
      if (isMenuClick && this.$store.getters.isPageChanged && this.selectedKey[0] !== item.id) {
        this.$mfConfirm({
          title: this.$t('confirm'),
          message: this.$t('changePageConfirm'),
          cancelText: this.$t('Cancel'),
          confirmText: this.$t('OK'),
          onConfirm: () => {
            this.$store.dispatch('pageChange/resetPageChanged')
            this.changeSelectedServer(item)
          }
        })
      } else {
        this.changeSelectedServer(item)
      }
    },

    changeSelectedServer(item) {
      this.$emit('dbServerDetail', item)
      this.selectedKey = [item.id]
      this.dbServerDetail = item
    },

    onDeleteServer() {
      // this.deleteServerData = data
      this.$mfConfirm({
        title: this.$t('confirm'),
        message: this.$t('servers.deleteDatabaseServer', { name: String(this.deleteServerData.name).replace(/\</g, '&lt') }),
        cancelText: this.$t('Cancel'),
        confirmText: this.$t('OK'),
        onConfirm: this.deleteServer
      })
    },

    deleteServer() {
      return deleteDbServer(this.deleteServerData.id).then(async res => {
        this.$message.success(this.$t('servers.DeleteDBServerSuccess'))
        await this.getServersList()
        if (this.dbServersList.length !== 0) {
          this.onCheckedServer(this.dbServersList[0])
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/styles/variables.less";

.mf-db-side{
    width: 285px;
    border-right: 1px solid fade(@dim-gray,16%);

    .title{
      padding: 24px 0 9px 24px;
      .db-add{
        margin-left: auto;
        margin-right: 15px;
        width: 16px;
        height: 16px;
        min-width: 16px;
        line-height: 16px;
        /deep/ i.anticon-plus {
          position: absolute;
          top: 1px;
          left: 0;
          width: 16px;
        }
      }
    }

    .db-side-item{
      width:100%;
      height: 32px;
      padding-right: 0;
      color: black;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-left:0;
      .db-side-name{
        width: 260px;
        height: 100%;
        line-height: 32px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      /deep/ .tool-icon-btn{
        margin-right: 15px;
      }
    }

    .db-side-item:hover{
      overflow-x:hidden;
      background-color: fade(#0079EF, 5%) !important;
      .db-side-name{
        width: 220px;
      }
      .icon-is-show{
        display: block;
      }
    }

    .db-side-item.ant-menu-item-selected{
      font-family: RegularWeb, serif;
      background-color: fade(#0079EF, 10%) !important;
    }

    /deep/ .ant-menu{
      height:calc(100vh - 260px);
      overflow-y:auto;
      overflow-x:hidden;
    }

    /deep/ .db-side-item.ant-menu-item-selected::after{
      opacity:0
    }

    .icon-is-show{
      display: none;
    }
}
.main-sidebar-title span {
  max-width: 220px;
}
</style>
