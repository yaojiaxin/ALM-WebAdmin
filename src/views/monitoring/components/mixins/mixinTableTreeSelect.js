export const mixinTableTreeSelect = {
  methods: {
    onSelectAll(selected) {
      if (selected) {
        const groupList = this.groupList
        const arr = []
        setVal(groupList, arr)
        this.groupRowKeys = arr
      } else {
        this.groupRowKeys = []
      }
      function setVal(list, arr) {
        list.forEach(v => {
          arr.push(v.id)
          if (v.children) {
            setVal(v.children, arr)
          }
        })
      }
    },
    onSelect(record, selected) {
      const set = new Set(this.groupRowKeys)
      const rowSet = new Set(this.selectedRows)
      const id = record.id
      const that = this
      if (selected) {
        set.add(id)
        rowSet.add(record)
        record.isChecked = true
        record.children && setChildCheck(record.children)
      } else {
        set.delete(id)
        rowSet.delete(record)
        record.isChecked = false
        record.children && setChildUncheck(record.children)
      }
      this.groupRowKeys = Array.from(set)
      this.selectedRows = Array.from(rowSet)
      this.onGroupSelect(this.groupRowKeys, this.selectedRows)
      // set All Child checked
      function setChildCheck(list) {
        list.forEach(function(v) {
          set.add(v.id)
          rowSet.add(record)
          // parent if checked, parent's children must be disabled and checked
          v.disabled = true
          v.isChecked = true
          v.children && setChildCheck(v.children)
        })
        // change children's disabled, the groupList need to reload
        that.groupList = [...that.groupList]
      }
      // set All Child unChecked
      function setChildUncheck(list) {
        list.forEach(function(v) {
          set.delete(v.id)
          rowSet.delete(record)
          v.disabled = false
          v.isChecked = false
          v.children && setChildUncheck(v.children)
        })
        that.groupList = [...that.groupList]
      }
    },
    // get currentTarget's parent
    getParent(id) {
      const groupList = this.groupList
      for (let i = 0; i < groupList.length; i++) {
        if (groupList[i].id === id) {
          return null
        }
      }
      return _getParent(groupList)
      function _getParent(list) {
        let childlist
        let isExist = false
        for (let i = 0; i < list.length; i++) {
          if ((childlist = list[i].children)) {
            childlist.forEach(function(v) {
              if (v.id === id) isExist = true
            })
            if (isExist) {
              return list[i]
            }
            if (_getParent(childlist)) {
              return _getParent(childlist)
            }
          }
        }
      }
    },
    // default All Child checked
    defaultChildCheck(list) {
      list.forEach((v) => {
        this.groupRowKeys = [...this.groupRowKeys, v.id]
        v.isChecked = true
        v.children && this.defaultChildCheck(v.children)
      })
    }
  }
}

