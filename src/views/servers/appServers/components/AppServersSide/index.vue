<template>
  <div class="app-servers-side-wrapper">
    <a-menu
      id="app-servers-side-menu"
      :selected-keys="selectedServerId"
      class="menu-wrapper"
      mode="vertical"
      @click="onMenuClick"
    >
      <a-menu-item
        v-for="server in serverList"
        :key="server[fieldMap.id]"
        class="menu-item-wrapper"
      >
        <!-- icon -->
        <svg-icon
          :icon-class="
            server[fieldMap.isActive] ? 'app-server' : 'app-server-disable'
          "
          class="menu-item-left-icon"
        />

        <!-- server name -->
        <div class="menu-item-text" :title="server[fieldMap.name]">
          {{ server[fieldMap.name] }}
        </div>

        <!-- delete btn -->
        <icon-btn
          btn-id="app-servers-delete-server-btn"
          class="menu-item-icon-btn"
          :icon-title="$t('servers.DeleteServer')"
          icon-style="icon-delete"
          :is-disabled="serverList.length === 1"
          @onClick="onDelete(server[fieldMap.id], server[fieldMap.name])"
        />
      </a-menu-item>
    </a-menu>
  </div>
</template>

<script>
import IconBtn from '@/components/BtnIcon/index.vue'
import { fieldMap, dataWrapperMap } from '../../config/appServers.config.js'
import { getAllAppServers, deleteAppServer } from '@/api/servers.js'

export default {
  components: { IconBtn },

  emits: ['update:selectedServerId'],

  data() {
    return {
      selectedServerId: [],
      serverList: [],
      fieldMap
    }
  },

  created() {
    this.getServerList()
  },

  methods: {
    onDelete(serverId, serverName) {
      this.$mfConfirm({
        title: this.$t('confirm'),
        message: this.$t('servers.deleteAppServer', {
          name: serverName
        }),
        cancelText: this.$t('no'),
        confirmText: this.$t('yes'),
        onConfirm: () =>
          deleteAppServer(serverId)
            .then(res => {
              this.$message.success(
                this.$t('servers.ApplicationServerDeletedSuccessfully')
              )
            })
            // if the server to delete is the selected server, choose the first server in new serverlist
            // else maintain the selectedServerId
            .finally(() =>
              this.getServerList(serverId === this.selectedServerId)
            )
      })
    },

    // when isDefault is true, it means (vm created / delete selected server)
    // when isDefault is false, it means (refresh / delete another server)
    // have at least 1 server
    getServerList(isDefault = true) {
      getAllAppServers()
        .then(res => {
          const serverList =
            res?.[dataWrapperMap.wrapper]?.[dataWrapperMap.serverList] || []

          this.serverList = Array.isArray(serverList)
            ? serverList
            : [serverList]

          let selectedServerId = this.selectedServerId[0]

          if (isDefault) {
            // set default serverId -> the first
            if (this.serverList.length > 0) {
              selectedServerId = this.serverList[0][fieldMap.id]
            }
          } else {
            // find current selectedServerId whether in new server list
            const ret = this.serverList.find(
              server => server[fieldMap.id] === this.selectedServerId[0]
            )

            // selectedServerId is not in new server list, set the first one as the selected server
            if (!ret && this.serverList.length > 0) {
              selectedServerId = this.serverList[0][fieldMap.id]
            }
          }

          this.selectedServerId = [selectedServerId]
          this.updateSelectedServerId(selectedServerId)
        })
        .catch(console.log)
    },

    onMenuClick({ key: serverId }) {
      if (serverId !== this.selectedServerId[0]) {
        if (this.$store.getters.isPageChanged) {
          this.$mfConfirm({
            title: this.$t('confirm'),
            message: this.$t('changePageConfirm'),
            cancelText: this.$t('Cancel'),
            confirmText: this.$t('OK'),
            onConfirm: () => {
              this.$store.dispatch('pageChange/resetPageChanged')
              this.updateSelectedServerId(serverId)
            }
          })
        } else {
          this.updateSelectedServerId(serverId)
        }
      }
    },

    updateSelectedServerId(serverId) {
      this.selectedServerId = [serverId]
      this.$emit('update:selectedServerId', serverId)
    }
  }
}
</script>

<style scoped lang="less">
.app-servers-side-wrapper {
  width: 285px;
  flex-shrink: 0;
  padding-top: 14px;
  border-right: solid 1px rgba(101, 102, 104, 0.16);
  overflow-y: auto;
  overflow-x: hidden;

  .ant-menu-vertical .ant-menu-item {
    padding: 0;
  }

  .menu-wrapper {
    width: 100%;

    .menu-item-wrapper {
      width: 100%;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .menu-item-left-icon {
        width: 16px;
        min-width: 16px;
        font-size: 16px;
        margin-left: 19px;
        margin-right: 16px;
      }

      .menu-item-text {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        height: 32px;
        line-height: 32px;
        font-size: 16px;
        color: #323435;
        flex-grow: 1;
        margin-right: 10px;
      }

      .menu-item-icon-btn {
        display: none;
        margin-right: 8px;

        /deep/ i {
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .ant-menu-vertical .ant-menu-item::after {
    display: none;
  }

  .menu-item-wrapper:hover {
    .menu-item-text {
      width: 30%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      margin-right: 10px;
    }

    .menu-item-icon-btn {
      display: block !important;
      margin-right: 8px;
      flex-shrink: 0;
    }
  }
}
</style>

<style lang="less">
.app-servers-side-wrapper {
  .tool-icon-btn {
    margin-right: 0;
  }

  span.tool-icon-btn {
    display: none !important;
  }

  span .tool-icon-btn {
    display: flex;
  }
}
</style>
