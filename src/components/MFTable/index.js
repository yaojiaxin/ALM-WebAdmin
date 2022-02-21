import T from 'ant-design-vue/es/table/Table'

export default {
  name: 'mf-table',
  props: Object.assign({}, T.props, {
    rowKey: {
      rowKey: {
        type: [String, Function],
        default: 'key'
      }
    },
    data: {
      type: Function,
      required: true
    },
    pageNum: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    rowSelection: {
      type: Object,
      default: null
    },
    showPagionation: {
      type: [String, Boolean],
      default: 'auto'
    },
    pagination: {
      type: [Function, Boolean]
    }
  }),

  data() {
    return {
      selectedRows: [],
      selectedRowKeys: [],

      localLoading: false,
      localDataSource: [],
      localPagination: Object.assign({}, this.pagination)
    }
  },

  created() {
    this.loadData()
  },

  methods: {
    /**
     * Table reload method
     * If the parameter is true, it forces the refresh to the first page
     * @param Boolean bool
     */
    refresh(bool = false) {
      bool && (this.localPagination = Object.assign({}, {
        current: 1,
        pageSize: this.pageSize
      }))
      this.loadData()
    },

    /**
     * Load data method
     * @param {Object} pagination Page selector
     * @param {Object} filters Filter conditions
     * @param {Object} sorter Sorting conditions
     */
    loadData(pagination, filter, sorter) {
      this.localLoading = true

      let parameter

      if (this.showPagionation) {
        parameter = {
          pageNo: (pagination && pagination.current) || this.localPagination.current || this.pageNum,
          pageSize: (pagination && pagination.pageSize) || this.localPagination.pageSize || this.pageSize
        }
      }

      parameter = Object.assign({
        ...pagination,
        filter
      })
      const result = this.data(parameter)

      if ((typeof result === 'object' || typeof result === 'function') && typeof result.then === 'function') {
        result.then(res => {
          this.localDataSource = res
          this.localLoading = false
        })
      }
    }
  },

  render() {
    const props = {}
    const localKeys = Object.keys(this.$data)

    Object.keys(T.props).forEach(k => {
      const localKey = `local${k.substring(0, 1).toUpperCase()}${k.substring(1)}`

      if (localKeys.includes(localKey)) {
        props[k] = this[localKey]

        return props[k]
      }
      if (k === 'rowSelection') {
        if (!this.rowSelection) {
          props[k] = null
          return props[k]
        }
      }

      this[k] && (props[k] = this[k])
      return props[k]
    })
    if (!this.showPagionation) {
      props.pagination = false
    }

    return (
      <a-table
        {...{ props, scopedSlots: { ...this.$scopedSlots }}}
        onChange={this.loadData}>
        { Object.keys(this.$slots).map(name => (<template slot={name}>{this.$slots[name]}</template>)) }
      </a-table>
    )
  }
}
