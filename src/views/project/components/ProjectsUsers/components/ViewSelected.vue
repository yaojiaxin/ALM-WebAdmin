<template>
  <mf-modal
    :visible="visible"
    :width="700"
    :confirm-loading="confirmLoading"
    :destroy-on-close="true"
    :next-disabled="isCanSave"
    :one-btn="true"
    @cancel="onClose"
    @ok="onOk"
  >
    <span slot="title">
      {{ $t('project.users.selected_users') }} <span class="count">({{ copyData.length }})</span>
    </span>
    <div class="mf-selected-wrapper">
      <div class="mf-selected-title">
        <span class="mf-title">{{ $t('login.userName') }}</span>
        <span class="mf-title">{{ $t('userManagement.FULL_NAME') }}</span>
        <span class="mf-title" style="width: 100px;flex: none">{{ $t('ACTION') }}</span>
      </div>

      <div class="mf-selected-body">
        <div v-for="(user, index) in copyData" :key="user.id" class="mf-selected-row">
          <span class="mf-cell">{{ user.name }}</span>
          <span class="mf-cell">{{ user['full-name'] }}</span>
          <span class="mf-cell" style="width: 100px;flex: none;">
            <i class="iconfont icon-Project-WrongNumber remove" @click="onRemove(user, index)" /></span>
        </div>
      </div>
    </div>
  </mf-modal>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      confirmLoading: false,
      isCanSave: false,

      selectedUsers: [],

      copyData: []
    }
  },

  methods: {
    show(data) {
      this.visible = true
      this.selectedUsers = data
      this.copyData = JSON.parse(JSON.stringify(this.selectedUsers))
    },

    onRemove(user, index) {
      this.copyData.splice(index, 1)
    },

    onClose() {
      this.visible = false
    },

    onOk() {
      this.selectedUsers = [...this.copyData]
      this.$emit('saveSelected', this.selectedUsers)
      this.visible = false
    }
  }
}
</script>

<style scoped lang="less">
.mf-selected-wrapper{
  border: 1px solid rgba(101, 102, 104, 0.16);
}

.mf-selected-title{
  display: flex;
  border-bottom: 1px solid rgba(101, 102, 104, 0.16);

  .mf-title{
    display: inline-block;
    padding: 9px 16px;
    font-family: BoldWeb;
    font-size: 14px;
    flex: 1;
  }
}

.mf-selected-body{
  width: 100%;
  height: 280px;
  overflow-y: auto;

  .mf-selected-row{
    display: flex;
    border-bottom: 1px solid rgba(101, 102, 104, 0.16);

    .mf-cell{
      display: inline-block;
      padding: 4px 16px;
      font-size: 16px;
      flex: 1;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      color: #323435;

      .remove{
        font-size: 12px;
        cursor: pointer;
      }

      .remove:hover{
        color: #0079ef;
      }
    }
  }
}

.count{
  font-family: RegularWeb;
  color: #0079ef;
  margin-left: 8px;
  font-size: 12px;
}
</style>
