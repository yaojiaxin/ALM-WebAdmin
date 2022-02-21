<template>
  <div class="qpm-scheduling">
    <card-container>
      <card-item>
        <template #title>{{ $t('tools.QPM.Scheduling.title') }}</template>

        <template #content>
          <!-- Automatically Run Calculations on -->
          <a-row>
            <a-checkbox
              id="automatically-run-calculations-on"
              v-model="value[QPMFieldMap.qpmScheduling.isAutoRun]"
            />

            <span class="qpm-scheduling-sub-title">
              {{ $t('tools.QPM.Scheduling.AutomaticallyRunCalculationsOn') }}
            </span>
          </a-row>

          <!-- Daily Calculation Start Time -->
          <row-layout class="mf-select-row qpm-content-sub-row">
            <template #label>
              <span
                class="qpm-content-sub-label"
                :title="$t('tools.QPM.Scheduling.DailyCalculationStartTime')"
              >
                {{ $t('tools.QPM.Scheduling.DailyCalculationStartTime') }}
              </span>
            </template>

            <template #content>
              <mf-select
                id="daily-calculation-start-time-select"
                v-model="value[QPMFieldMap.qpmScheduling.startTime]"
                :allow-clear="false"
                style="width: 230px;"
              >
                <a-select-option
                  v-for="item in schedulingStartTimeMap"
                  :key="item.value"
                  :value="item.value"
                  :title="item.title"
                >
                  {{ item.title }}
                </a-select-option>
              </mf-select>
            </template>
          </row-layout>

          <!-- Calculation Recurrence -->
          <row-layout class="mf-select-row qpm-content-sub-row">
            <template #label>
              <span
                class="qpm-content-sub-label"
                :title="$t('tools.QPM.Scheduling.CalculationRecurrence')"
              >
                {{ $t('tools.QPM.Scheduling.CalculationRecurrence') }}
              </span>
            </template>

            <template #content>
              <mf-select
                id="calculation-recurrence-select"
                v-model="value[QPMFieldMap.qpmScheduling.recurrence]"
                :allow-clear="false"
                style="width: 230px;"
              >
                <a-select-option
                  v-for="item in schedulingRecurrenceMap"
                  :key="item.value"
                  :value="item.value"
                  :title="item.title"
                >
                  {{ item.title }}
                </a-select-option>
              </mf-select>
            </template>
          </row-layout>

          <!-- Abort Calculation After -->
          <row-layout class="mf-select-row qpm-content-sub-row">
            <template #label>
              <span class="qpm-content-sub-label">
                <a-checkbox
                  id="abort-calculation-after"
                  v-model="value[QPMFieldMap.qpmScheduling.isAbortCalc]"
                />

                <span
                  class="qpm-content-sub-label-text"
                  :title="$t('tools.QPM.Scheduling.AbortCalculationAfter')"
                >
                  {{ $t('tools.QPM.Scheduling.AbortCalculationAfter') }}
                </span>
              </span>
            </template>

            <template #content>
              <mf-select
                id="Abort-Calculation-After-select"
                v-model="value[QPMFieldMap.qpmScheduling.calcDurationLimit]"
                :allow-clear="false"
                style="width: 230px;"
                :disabled="!value[QPMFieldMap.qpmScheduling.isAbortCalc]"
              >
                <a-select-option
                  v-for="item in schedulingCalcDurationLimitMap"
                  :key="item.value"
                  :value="item.value"
                  :title="item.title"
                >
                  {{ item.title }}
                </a-select-option>
              </mf-select>
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
import {
  schedulingStartTimeMap,
  schedulingRecurrenceMap,
  schedulingCalcDurationLimitMap,
  QPMFieldMap
} from '../../config/QPM.config.js'

export default {
  components: { CardContainer, CardItem, RowLayout },

  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      schedulingStartTimeMap,
      schedulingRecurrenceMap,
      schedulingCalcDurationLimitMap,
      QPMFieldMap
    }
  }
}
</script>

<style scoped lang="less">
.qpm-scheduling-sub-title {
  margin-left: 6px;
}

.qpm-content-sub-label-text {
  margin-left: 8px;
}

/deep/ .ant-select-selection {
  height: 32px;
}
</style>
