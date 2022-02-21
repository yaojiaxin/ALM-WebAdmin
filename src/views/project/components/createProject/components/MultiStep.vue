<template>
  <div>
    <keep-alive>
      <component
        :is="component"
        ref="detail"
        :create-type="createType"
        :creation-type="creationType"
        :props="props"
        :form-data="data"
      />
    </keep-alive>
  </div>
</template>

<script>
import ProjectForm from './ProjectForm'
import ProjectDatabase from './ProjectDatabase'
import TableSpace from './DatabseTableSpace'
import SelectProject from './SelectProject'
import CopyCustomization from './CopyCustomization'
import Customization from './Customization'
import { DATABASE_TYPE } from '@/store/const'

export default {
  components: { ProjectForm, ProjectDatabase, TableSpace, SelectProject, CopyCustomization, Customization },

  props: {
    props: {
      type: Object,
      default: () => {}
    },

    childComponents: {
      type: Array,
      default: () => []
    },

    createType: {
      type: Number,
      default: 1
    },

    // The creation type of the entire process
    creationType: {
      type: String,
      default: ''
    },

    formData: {
      type: Object,
      default: () => {}
    },

    componentName: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      step: 0,

      components: this.childComponents,

      data: this.formData
    }
  },
  computed: {
    component() {
      if (this.components.length > 0) {
        return this.components[this.step].name
      } else {
        return ''
      }
    }
  },

  watch: {
    // If the contents of the child components change, re-render from the first step
    childComponents(val, oldVal) {
      if (val[0].name !== oldVal[0].name && oldVal.length > 0 && val.length > 0) {
        this.step = 0
        this.components = val
      }
    },

    formData(val) {
      if (this.formData) {
        this.data = {
          ...this.data,
          ...this.formData
        }
      } else {
        this.data = null
      }
    }
  },

  methods: {
    async next() {
      const valid = await this.$refs.detail.validate()
      // this.data = valid.data
      return this.runNext(valid)
    },

    runNext(valid) {
      return this.isDoNext(valid, { continue: true, data: { ...this.data, ...valid.data }})
    },

    isDoNext(valid, callback) {
      if (valid.continue) {
        // For Oracle types, one more table space is displayed
        if (this.step === 1 && valid.data['db-type'] === DATABASE_TYPE.Oracle && this.components[this.step].name === 'ProjectDatabase') {
          if (this.components.findIndex(i => i.name === 'TableSpace') === -1) {
            this.components.push({ name: 'TableSpace', props: { id: valid.data.dbServerId }})
          }
        } else {
          if (this.step === 1 && this.components.findIndex(i => i.name === 'TableSpace') > -1) {
            this.components.splice(this.components.findIndex(i => i.name === 'TableSpace'), 1)
          }
        }

        this.data = { ...this.data, ...valid.data }

        if (this.step === this.components.length - 1) {
          return { continue: true, data: this.data }
        } else {
          this.step++
        }
      }
      return { continue: false }
    },

    back() {
      if (this.step === 0) {
        return true
      } else {
        this.step--
        return false
      }
    }
  }
}
</script>

<style>
.step-form{
  width: 420px;
  margin: 0 auto;
}
</style>
