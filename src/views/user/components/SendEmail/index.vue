<template>
  <div id="send_message" class="send-message">
    <mf-drawer
      id="send_message_drawer"
      placement="right"
      width="760"
      wrap-class-name="user-drawer"
      :drawer-style="{ position: 'relative' }"
      :visible="sendEmailVisible"
      destroy-on-close
      @close="onClosed"
    >
      <a-tabs :default-active-key="defaultKey" class="user-tabs-detail" @change="tabsChangeCallback">
        <!-- Send To Users -->
        <a-tab-pane id="send_to_users" key="1" :tab="$t('userManagement.sendToUsers')" :disabled="defaultKey!=='1'">
          <keep-alive>
            <send-to-users
              v-if="users"
              ref="users"
              :visible="sendEmailVisible"
              :selected-user-list="selectedUserList"
              @onClosed="onClosed"
            />
          </keep-alive>
        </a-tab-pane>
        <!-- Send to Projects/Domains -->
        <a-tab-pane id="send_to_projects" key="2" :tab="$t('userManagement.sendToProjects')">
          <keep-alive>
            <send-to-projects
              v-if="projects"
              ref="projects"
              :visible="sendEmailVisible"
              @onClosed="onClosed"
            />
          </keep-alive>
        </a-tab-pane>
      </a-tabs>
    </mf-drawer>
  </div>
</template>

<script>
import sendToUsers from '@/views/user/components/SendEmail/components/ToUsers'
import sendToProjects from '@/views/user/components/SendEmail/components/ToProjects'
export default {
  name: 'UserSendEmail',
  components: { sendToUsers, sendToProjects },
  props: {
    selectedUserList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      sendEmailVisible: false,
      users: true,
      projects: true

    }
  },
  computed: {
    defaultKey: function() {
      return this.selectedUserList.length === 0 ? '2' : '1'
    }
  },

  methods: {
    onClosed() {
      this.sendEmailVisible = false
      this.users = true
      this.projects = true
      this.$emit('refreshUser')
    },
    tabsChangeCallback(key) {
      if (key === '1') {
        this.users = true
        this.projects = false
      } else {
        this.users = false
        this.projects = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.user-tabs-detail /deep/ .ant-tabs-nav .ant-tabs-tab-disabled,.user-tabs-detail /deep/ .ant-tabs-nav .ant-tabs-tab-disabled:hover{
  font-size: 18px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.5);
  line-height: 1.5;
}
</style>
