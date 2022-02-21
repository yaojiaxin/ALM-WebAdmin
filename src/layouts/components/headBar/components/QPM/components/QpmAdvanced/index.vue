<template>
  <div class="qpm-advanced">
    <card-container style="padding-bottom: 32px;">
      <card-item>
        <template #title>{{ $t('tools.QPM.Advanced.title') }}</template>

        <template #content>
          <!-- Override Settings -->
          <a-row class="qpm-advanced-row">
            <span>{{ $t('tools.QPM.Advanced.OverrideSettings') }}</span>

            <a-switch
              id="override-settings-switch"
              v-model="overrideSettingsStatus"
              class="qpm-advanced-content-switch"
            />
          </a-row>

          <!-- Number of Engines -->
          <row-layout class="input-number-row qpm-content-sub-row">
            <template #label>
              <span
                class="qpm-content-sub-label"
                :title="$t('tools.QPM.Advanced.NumberOfEngines')"
              >
                {{ $t('tools.QPM.Advanced.NumberOfEngines') }}
              </span>
            </template>

            <template #content>
              <qpm-input-number
                id="qpm-engine-count-input-number"
                ref="qpmEngineCountInputNumberRef"
                v-model="value[QPMFieldMap.qpmAdvanced.engineCount]"
                :min="QPM_BOUNDARY_CONDITION.qpmAdvanced.engineCount.min"
                :max="QPM_BOUNDARY_CONDITION.qpmAdvanced.engineCount.max"
                :disabled="!overrideSettingsStatus"
                :formatter="limitNumber"
                :parser="limitNumber"
                @pressEnter="onPressEnter"
                @change="onInputNumberChange"
              />
            </template>
          </row-layout>

          <!-- Engines Throttle -->
          <row-layout class="qpm-content-sub-row">
            <template #label>
              <span
                class="qpm-content-sub-label"
                :title="$t('tools.QPM.Advanced.EnginesThrottle')"
              >
                {{ $t('tools.QPM.Advanced.EnginesThrottle') }}
              </span>
            </template>

            <template #content>
              <div class="qpm-advanced-engine-throttle">
                <!-- slider -->
                <div class="qpm-advanced-slider">
                  <a-slider
                    id="qpm-engine-throttle-slider"
                    v-model="value[QPMFieldMap.qpmAdvanced.engineThrottle]"
                    :max="QPM_BOUNDARY_CONDITION.qpmAdvanced.engineThrottle.max"
                    :min="QPM_BOUNDARY_CONDITION.qpmAdvanced.engineThrottle.min"
                    :disabled="!overrideSettingsStatus"
                    :tooltip-visible="false"
                  />
                </div>

                <!-- slider scale -->
                <div class="qpm-advanced-slider-scale">
                  <span
                    class="qpm-advanced-slider-scale-text"
                    :style="{ left: scaleTextLeftPostion }"
                  >
                    {{ value[QPMFieldMap.qpmAdvanced.engineThrottle] }}
                  </span>
                </div>

                <!-- slider info -->
                <div class="qpm-advanced-slider-info">
                  <div class="less-info">
                    <span>{{ $t('tools.QPM.Advanced.Slower') }}</span>
                    <span>{{ $t('tools.QPM.Advanced.LessDBStress') }}</span>
                  </div>

                  <div class="more-info">
                    <span>{{ $t('tools.QPM.Advanced.Faster') }}</span>
                    <span>{{ $t('tools.QPM.Advanced.MoreDBStress') }}</span>
                  </div>
                </div>
              </div>
            </template>
          </row-layout>
        </template>
      </card-item>
    </card-container>
  </div>
</template>

<script>
import CardContainer from '../Card/CardContainer.vue'
import CardItem from '../Card/CardItem.vue'
import RowLayout from '../shared/RowLayout.vue'
import QpmInputNumber from '../shared/QpmInputNumber.vue'
import { QPMFieldMap } from '../../config/QPM.config.js'
import { limitNumber } from '@/utils/validate'
import { QPM_BOUNDARY_CONDITION } from '@/store/const.js'

export default {
  components: { CardContainer, CardItem, RowLayout, QpmInputNumber },

  emits: ['trigger:enableSave'],

  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      overrideSettingsStatus: false,
      QPMFieldMap,
      QPM_BOUNDARY_CONDITION,
      limitNumber
    }
  },

  computed: {
    scaleTextLeftPostion() {
      return (
        (
          Math.ceil(this.value[QPMFieldMap.qpmAdvanced.engineThrottle]) * 10
        ).toString() + '%'
      )
    }
  },

  watch: {
    overrideSettingsStatus: {
      handler: function(isOverrided) {
        this.$emit('trigger:enableSave', isOverrided)
      }
    }
  },

  methods: {
    onPressEnter() {
      this.onInputNumberChange(this.value[QPMFieldMap.qpmAdvanced.engineCount])
      this.$refs.qpmEngineCountInputNumberRef.blur()
    },

    onInputNumberChange(currEngineCount) {
      let ret = currEngineCount

      if (
        !currEngineCount ||
        currEngineCount < QPM_BOUNDARY_CONDITION.qpmAdvanced.engineCount.min
      ) {
        ret = QPM_BOUNDARY_CONDITION.qpmAdvanced.engineCount.min
      } else if (
        currEngineCount > QPM_BOUNDARY_CONDITION.qpmAdvanced.engineCount.max
      ) {
        ret = QPM_BOUNDARY_CONDITION.qpmAdvanced.engineCount.max
      }

      this.value[QPMFieldMap.qpmAdvanced.engineCount] = ret
    }
  }
}
</script>

<style scoped lang="less">
.qpm-advanced-row {
  height: 22px;
  line-height: 22px;

  .qpm-advanced-content-switch {
    margin-left: 20px;
  }
}

/deep/ .ant-slider {
  width: 230px;
  margin: 0;
}

/deep/ .ant-slider-track,
/deep/ .ant-slider:hover .ant-slider-track {
  background-color: #0079ef;
}

/deep/ .ant-slider-rail,
/deep/ .ant-slider:hover .ant-slider-rail {
  background-color: #dcdedf;
}

.qpm-advanced-engine-throttle {
  .qpm-advanced-slider {
    height: 24px;
    line-height: 24px;
    padding-top: 6px;
  }

  .qpm-advanced-slider-scale {
    width: 230px;
    height: 16px;
    line-height: 16px;
    transform: translateX(-4px);

    .qpm-advanced-slider-scale-text {
      height: 16px;
      line-height: 16px;
      position: relative;
    }
  }

  .qpm-advanced-slider-info {
    display: flex;
    font-size: 14px;
    font-family: RegularWeb;
    font-weight: 400;
    color: #323435;

    .less-info,
    .more-info {
      display: flex;
      flex-direction: column;
      height: 32px;
      line-height: 16px;
    }

    .less-info {
      width: 230px;
    }
  }
}
</style>
