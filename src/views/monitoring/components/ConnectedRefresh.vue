<template>
  <span class="refresh-btn">
    <a-dropdown :trigger="['click']">
      <template #overlay>
        <a-menu>
          <a-menu-item id="a-refresh-list-refresh" key="1" @click="refreshConnect">{{ $t('refresh') }}</a-menu-item>
          <!--          <a-menu-item id="a-refresh-list-autorefresh" key="2" class="dropdown-menu-import">-->
          <!--            <a id="dropdown-more-list-import" rel="noopener noreferrer">{{ $t('monitoring.automatical_refresh') }}</a>-->
          <!--            <div class="menu-import-content">-->
          <!--              <p id="a-refresh-list-autorefresh-rate" :title="$t('monitoring.set_refresh_rate')" class="menu-import-item" @click="onIconButton">-->
          <!--                {{ $t('monitoring.set_refresh_rate') }}-->
          <!--              </p>-->
          <!--            </div>-->
          <!--          </a-menu-item>-->
          <a-sub-menu id="a-refresh-list-autorefresh" key="2" :title="$t('monitoring.automatical_refresh')">
            <a-menu-item id="a-refresh-list-autorefresh-rate" @click="onIconButton">{{ $t('monitoring.set_refresh_rate') }}</a-menu-item>
          </a-sub-menu>
        </a-menu>
      </template>
      <a-tooltip
        :title="$t('monitoring.RefreshSettings')"
      >
        <a-button
          id="a-refresh-btn"
          class="tool-dropdown-btn"
          type="link"
        >
          <i class="iconfont icon-ConnectRefresh tool-dropdown-btn-i" />
          <i class="iconfont icon-CaretDown tool-dropdown-btn-i tool-CaretDown-btn-i" />
        </a-button>
      </a-tooltip>
    </a-dropdown>

    <mf-modal
      id="set_refresh_modal"
      class="set-auto-refresh-modal"
      :visible="refreshVisible"
      :confirm-loading="false"
      :ok-text="$t('OK')"
      :cancel-text="$t('Cancel')"
      width="434px"
      @close="refreshClose"
      @cancel="refreshClose"
      @ok="refreshSubmit"
    >
      <span slot="title">
        {{ $t('monitoring.set_refresh_rate') }}
        <mf-help-btn :help="CONNECTED_REFRESH_HELP" />

      </span>

      <mf-form
        ref="formRef"
        :model="form"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :rules="rules"
      >
        <a-form-model-item prop="refreshRate">
          <template #label>
            <span
              class="refresh-form-label"
              :title="$t('monitoring.refresh_rate_in_seconds')"
            >
              {{ $t('monitoring.refresh_rate_in_seconds') }}
            </span>
          </template>

          <template #default>
            <a-input-number
              id="a-refresh-list-autorefresh-rate-time"
              ref="rateTimeInput"
              v-model="form.refreshRate"
              class="inputNumber"
              :min="1"
              :max="9999"
              :formatter="limitNumber"
              :parser="limitNumber"
            />
          </template>
        </a-form-model-item>
      </mf-form>

    </mf-modal>

  </span>
</template>

<script>
import { CONNECTED_REFRESH_HELP } from 'config/help.js'

export default {
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
      CONNECTED_REFRESH_HELP,
      refreshVisible: false,

      form: {
        refreshRate: 60
      },

      labelCol: { span: 12 },
      wrapperCol: { span: 12 },

      rules: {
        refreshRate: [{ required: true, message: this.$t('monitoring.requiredAutoRefreshRate') }]
      }
    }
  },
  computed: {
    refreshObj: function() {
      return {
        title: this.$t('monitoring.set_refresh_rate'),
        content: '',
        discard: this.$t('Cancel'),
        onSubmit: this.$t('OK')
      }
    }
  },
  methods: {
    refreshSubmit() {
      this.$refs.formRef.$children[0].validate(valid => {
        if (valid) {
          this.$emit('startRefresh', this.form.refreshRate)
          this.refreshVisible = false
        }
      })
    },
    refreshClose() {
      setTimeout(() => {
        this.form.refreshRate = 60
      }, 1000)

      this.refreshVisible = false
    },
    onIconButton() {
      this.refreshVisible = true
      this.$nextTick(() => {
        this.$refs.rateTimeInput.focus()
      })
    },
    refreshConnect() {
      this.$emit('refreshConnect')
    },
    limitNumber(value) {
      if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(/^(0+)|[^\d]/g, '') : ''
      } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(/^(0+)|[^\d]/g, '') : ''
      } else {
        return ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/variables.less';

  /deep/.ant-modal-content{
    width: 434px !important;
  }

  /deep/.ant-modal-body{
    line-height: 28px !important;
  }

  /deep/.ant-dropdown-menu-submenu-arrow{
    /*display: none !important;*/
    right: 3px;
  }

  .inputNumber{
    width: 100%;
  }

.refresh-form-label {
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
  line-height: 19px;
}

#a-refresh-list-autorefresh-rate{
  left:-30px
}

.dropdown-menu-import {
  position: relative;
  .menu-import-content {
    display: none;
    width: 150px;
    height: 32px;
    position: absolute;
    top: 0;
    right: -150px;
    box-shadow: 1px 1px 2px 0 rgba(101, 102, 104, 0.3);
    background-color: #fff;
    .menu-import-item {
      margin: 0;
      padding: 5px 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.dropdown-menu-import:hover .menu-import-content {
  display: block;
}

.dropdown-menu-import:hover .menu-import-content .menu-import-item:hover {
  background-color: #e6f7ff;
}

.ant-dropdown-menu{
  padding: 0 !important;
}
</style>

<style lang="less">
.set-auto-refresh-modal {
  .ant-row.ant-form-item {
    margin-bottom: 0;
  }

  .ant-form label {
    // margin-left: 0;
  }

  .ant-form-item,
  .ant-form-item-label,
  .ant-form-item-control-wrapper {
    height: 32px;
    line-height: 32px;
  }

  .ant-form-item-control {
    height: 32px;
    line-height: 32px;
  }
}

</style>
