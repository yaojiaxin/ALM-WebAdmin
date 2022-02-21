export default {
  name: 'TableBody',
  props: {
    columns: {
      type: Array,
      default: () => []
    },

    data: {
      type: Array,
      default: () => []
    }
  },

  render() {
    const data = this.data || []

    return (
      <table
        class='mf-table_body'
        cellspacing='0'
        cellpadding='0'
      >
        <colgroup>
          {
            this.columns.map(col => <col key={col.dataIndex} name={'column_' + col.dataIndex} width={col.width} style={{ width: col.width + 'px', minWidth: col.width + 'px' }}/>)
          }
        </colgroup>
        <tbody>
          {
            data.reduce((acc, row) => {
              return acc.concat(this.renderRow(row, acc.length))
            }, [])
          }
        </tbody>
      </table>
    )
  },

  methods: {
    renderRow(row) {
      return (
        <tr>
          {
            this.columns.map((col) => {
              return (
                <td>
                  <div class='cell'>
                    { row[col.dataIndex] }
                  </div>
                </td>
              )
            })
          }
        </tr>
      )
    }
  }
}
