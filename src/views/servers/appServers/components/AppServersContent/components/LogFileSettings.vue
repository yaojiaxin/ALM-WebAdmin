<template>
  <div class="log-file-settings-wrapper">
    <a-row :gutter="16">
      <!-- Log Level -->
      <a-col :span="8" :sm="24" :md="24" :lg="24" :xl="12" :xxl="8">
        <a-form-model-item :label="$t('servers.LogLevel')">
          <mf-select
            id="log-level"
            v-model="value.LogLevel"
            :allow-clear="false"
          >
            <a-select-option
              v-for="(item, key) in APP_SERVERS_LOG_LEVEL"
              :key="key"
              :value="key"
              :title="item"
            >
              {{ item }}
            </a-select-option>
          </mf-select>
        </a-form-model-item>
      </a-col>

      <!-- Max. Log Lines -->
      <a-col
        :span="6"
        :sm="24"
        :md="24"
        :lg="24"
        :xl="12"
        :xxl="{ span: 6, push: 1 }"
      >
        <a-form-model-item
          :label="$t('servers.MaximumLogLines')"
          class="max-log-lines"
          :prop="propPrefix + '.' + 'LogLines'"
        >
          <a-input-number
            id="max-log-lines-input-number"
            :ref="propPrefix + 'LogLinesRef'"
            v-model="value.LogLines"
            :min="APP_SERVER_BOUNDARY_CONDITION.LogLines.min"
            :max="APP_SERVER_BOUNDARY_CONDITION.LogLines.max"
            :formatter="limitNumber"
            :parser="limitNumber"
            @pressEnter="checkLogLines"
          />
        </a-form-model-item>
      </a-col>

      <!-- Max. Log Days -->
      <a-col
        :span="9"
        :sm="24"
        :md="24"
        :lg="24"
        :xl="24"
        :xxl="{ span: 9, push: 1 }"
        class="max-log-days"
      >
        <a-form-model-item
          class="log-days-24span"
          :label="$t('servers.MaximumLogDays')"
          :label-col="{ span: 10, xxl: 6 }"
          :wrapper-col="{ span: 14, xxl: 18 }"
          :prop="propPrefix + '.' + 'LogDays'"
        >
          <span class="max-log-days-content">
            <!-- radio group -->
            <a-radio-group
              id="max-log-days-radio-group"
              v-model="isLogDaysDisabled"
              class="max-log-days-radio-group"
              @change="onRadioGroupChange"
            >
              <a-radio :value="true">
                <span class="unlimited-radio" :title="$t('servers.Unlimited')">
                  {{ $t('servers.Unlimited') }}
                </span>
              </a-radio>

              <a-radio :value="false" style="margin-right: 10px;">
                <span class="maximum-radio" :title="$t('servers.Maximum')">{{
                  $t('servers.Maximum')
                }}</span>
              </a-radio>
            </a-radio-group>

            <!-- input days -->
            <a-input-number
              id="max-log-days-input-number"
              :ref="propPrefix + 'LogDaysRef'"
              v-model="tempLogDays"
              class="max-log-days-input-number"
              :min="APP_SERVER_BOUNDARY_CONDITION.LogDays.min"
              :max="APP_SERVER_BOUNDARY_CONDITION.LogDays.max"
              :disabled="isLogDaysDisabled"
              :formatter="limitNumber"
              :parser="limitNumber"
              @pressEnter="checkLogDays"
              @change="onLogDaysChange"
            />

            <!-- unit -->
            <span class="max-log-days-text" :title="$t('servers.days')">
              {{ $t('servers.days') }}
            </span>
          </span>
        </a-form-model-item>
      </a-col>

      <!-- Log File Location -->
      <a-col :span="24">
        <a-form-model-item
          :label="$t('servers.LogFileLocation')"
          class="log-file-settings-24span"
          :prop="propPrefix + '.' + 'LogFileLocation'"
        >
          <a-input
            id="log-file-location-input"
            v-model="value.LogFileLocation"
            :max-length="255"
          />
        </a-form-model-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { APP_SERVER_BOUNDARY_CONDITION } from '@/store/const'
import { APP_SERVERS_LOG_LEVEL } from '../../../config/appServers.config.js'
import { limitNumber } from '@/utils/validate'

export default {
  model: {
    prop: 'value',
    event: 'change'
  },

  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    propPrefix: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      APP_SERVER_BOUNDARY_CONDITION,
      APP_SERVERS_LOG_LEVEL,
      isLogDaysDisabled: true,
      tempLogDays: APP_SERVER_BOUNDARY_CONDITION.LogDays.min,
      limitNumber
    }
  },

  watch: {
    value: function(newValue) {
      this.isLogDaysDisabled =
        newValue.LogDays === APP_SERVER_BOUNDARY_CONDITION.LogDays.unlimited

      if (newValue.LogDays > APP_SERVER_BOUNDARY_CONDITION.LogDays.max) {
        this.tempLogDays = APP_SERVER_BOUNDARY_CONDITION.LogDays.max
      } else if (
        newValue.LogDays < APP_SERVER_BOUNDARY_CONDITION.LogDays.min &&
        newValue.LogDays !== APP_SERVER_BOUNDARY_CONDITION.LogDays.unlimited
      ) {
        this.tempLogDays = APP_SERVER_BOUNDARY_CONDITION.LogDays.min
      } else if (
        newValue.LogDays < APP_SERVER_BOUNDARY_CONDITION.LogDays.max &&
        newValue.LogDays > APP_SERVER_BOUNDARY_CONDITION.LogDays.min
      ) {
        this.tempLogDays = newValue.LogDays
      }
    }
  },

  methods: {
    onRadioGroupChange(e) {
      const isUnlimited = e.target.value
      if (isUnlimited) {
        this.value.LogDays = APP_SERVER_BOUNDARY_CONDITION.LogDays.unlimited
      } else {
        this.value.LogDays = this.tempLogDays
      }
    },

    onLogDaysChange(days) {
      this.value.LogDays = this.tempLogDays =
        +days || APP_SERVER_BOUNDARY_CONDITION.LogDays.min
    },

    checkLogDays() {
      this.onLogDaysChange(this.value.LogDays)
      this.$refs[this.propPrefix + 'LogDaysRef'] &&
        this.$refs[this.propPrefix + 'LogDaysRef'].blur()
    },

    checkLogLines() {
      if (
        !this.value.LogLines ||
        this.value.LogLines < APP_SERVER_BOUNDARY_CONDITION.LogLines.min
      ) {
        this.value.LogLines = APP_SERVER_BOUNDARY_CONDITION.LogLines.min
      }

      if (this.value.LogLines > APP_SERVER_BOUNDARY_CONDITION.LogLines.max) {
        this.value.LogLines.LogLines =
          APP_SERVER_BOUNDARY_CONDITION.LogLines.max
      }

      this.$refs[this.propPrefix + 'LogLinesRef'] &&
        this.$refs[this.propPrefix + 'LogLinesRef'].blur()
    }
  }
}
</script>

<style scoped lang="less">
.max-log-days-content {
  width: 100%;
  height: 32px;
  line-height: 32px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;

  label {
    display: flex;
    align-items: center;
  }

  .max-log-days-radio-group {
    width: 70%;
    // min-width: 210px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;

    .ant-radio-wrapper {
      width: 45%;
      margin-left: 0;

      /deep/ span:last-child {
        padding: 0 0 0 8px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }

    .unlimited-radio,
    .maximum-radio {
      padding: 0 !important;
    }
  }

  .max-log-days-input-number {
    width: 70px;
    min-width: 70px;
  }

  .max-log-days-text {
    width: 30px;
    min-width: 30px;
    margin-left: 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}

/deep/ .ant-input-number {
  width: 120px;
}
</style>

<style lang="less">
@media (min-width: 966px) {
  .log-file-settings-24span {
    .ant-form-item-label {
      width: 41.66666667%;
    }
  }
}

@media (min-width: 1200px) {
  .log-file-settings-24span {
    .ant-form-item-label {
      width: 20.5%;
    }
  }
}

@media (min-width: 1200px) and (max-width: 1600px) {
  .log-days-24span {
    .ant-form-item-label {
      width: 20.5%;
    }

    .ant-form-item-control-wrapper {
      width: 50%;
    }
  }
}

@media (min-width: 1600px) {
  .log-file-settings-24span {
    .ant-form-item-label {
      width: 13.5%;
    }
    .ant-form-item-control-wrapper {
      width: 86.5%;
    }
  }
}
</style>
