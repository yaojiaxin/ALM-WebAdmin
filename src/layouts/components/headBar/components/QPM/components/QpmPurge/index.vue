<template>
  <div class="qpm-purge">
    <card-container>
      <card-item>
        <template #title>{{ $t('tools.QPM.Purge.title') }}</template>

        <template #content>
          <row-layout class="input-number-row">
            <template #label>
              <span :title="$t('tools.QPM.Purge.DeleteDataOlderThan')">
                {{ $t('tools.QPM.Purge.DeleteDataOlderThan') }}
              </span>
            </template>

            <template #content>
              <qpm-input-number
                id="qpm-period-days-input-number"
                ref="qpmPeriodDaysInputNumberRef"
                v-model="value[QPMFieldMap.qpmPurge.periodDays]"
                :min="QPM_BOUNDARY_CONDITION.qpmPurge.periodDays.min"
                :max="QPM_BOUNDARY_CONDITION.qpmPurge.periodDays.max"
                :unit="$t('tools.QPM.Purge.Days')"
                :formatter="limitNumber"
                :parser="limitNumber"
                @pressEnter="onPressEnter"
                @change="onInputNumberChange"
              />
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

  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return { QPMFieldMap, QPM_BOUNDARY_CONDITION, limitNumber }
  },

  methods: {
    onPressEnter() {
      this.onInputNumberChange(this.value[QPMFieldMap.qpmPurge.periodDays])
      this.$refs.qpmPeriodDaysInputNumberRef.blur()
    },

    onInputNumberChange(currPeriodDays) {
      let ret = currPeriodDays

      if (
        !currPeriodDays ||
        currPeriodDays < QPM_BOUNDARY_CONDITION.qpmPurge.periodDays.min
      ) {
        ret = QPM_BOUNDARY_CONDITION.qpmPurge.periodDays.min
      } else if (
        currPeriodDays > QPM_BOUNDARY_CONDITION.qpmPurge.periodDays.max
      ) {
        ret = QPM_BOUNDARY_CONDITION.qpmPurge.periodDays.max
      }

      this.value[QPMFieldMap.qpmPurge.periodDays] = ret
    }
  }
}
</script>
