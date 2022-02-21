export const mixinImport = {
  methods: {
    handleRequestSucceedList(result) {
      result.forEach(item => {
        item.status = true
        item.message = this.$t('userManagement.import_user_success')
      })
      return result
    },
    handleRequestConflictList(importList, resultList) {
      resultList = resultList.filter(item => item.Exception && (item.Exception.Id === 'qccore.entity-already-exists' || item.Exception.Id === 'qccore.request-conflict'))
      resultList = resultList.map(item => {
        // const importUser = importList.find(it => it.name.toString().toUpperCase() === JSON.parse(item.Entity).user.name.toString().toUpperCase())
        return {
          type: item.Exception.Id === 'qccore.entity-already-exists' ? 'same-user' : 'same-user-name',
          name: JSON.parse(item.Entity).user.name,
          'full-name': JSON.parse(item.Entity).user['full-name'],
          email: JSON.parse(item.Entity).user.email,
          description: JSON.parse(item.Entity).user.description,
          phone: JSON.parse(item.Entity).user.phone,
          'user-auth-data': {
            'server-id': JSON.parse(item.Entity).user['user-auth-data']['server-id'],
            'user-dn': JSON.parse(item.Entity).user['user-auth-data']['user-dn']
          }
        }
      })
      return resultList
    },
    handleRequestFailedList(resultList) {
      resultList = resultList.map(item => {
        return {
          name: JSON.parse(item.Entity).user.name,
          'full-name': JSON.parse(item.Entity).user['full-name'],
          status: item.Succeeded,
          message: item.Succeeded ? this.$t('userManagement.import_user_success') : item.Exception.Title
        }
      })
      return resultList
    }
  }
}
