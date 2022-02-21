function transformGroup(res) {
  let list = []
  if (Array.isArray(res)) {
    list = res.map((item, index) => {
      if (item.GroupByHeader) {
        return {
          id: `${index + 1}`,
          domainName: `${item['@Name']}: ${item['@Value']}`,
          children: Array.isArray(item.GroupByHeader) ? item.GroupByHeader.map((e, indx) => {
            return {
              id: `${index + 1}${indx + 1}`,
              domainName: `${e['@Name']}: ${e['@Value']}`,
              name: `${e['@Value']}`,
              children: []
            }
          }) : [{
            id: `${index + 1}1`,
            domainName: `${item.GroupByHeader['@Name']}: ${item.GroupByHeader['@Value']}`,
            name: `${item.GroupByHeader['@Value']}`,
            children: []
          }]
        }
      } else {
        return {
          id: `${index + 1}`,
          domainName: `${item['@Name']}: ${item['@Value']}`,
          name: `${item['@Value']}`,
          children: []
        }
      }
    })
  } else {
    if (res.GroupByHeader) {
      list.push(
        {
          id: '1',
          domainName: `${res['@Name']}: ${res['@Value']}`,
          children: Array.isArray(res.GroupByHeader) ? res.GroupByHeader.map((e, indx) => {
            return {
              id: `1${indx + 1}`,
              domainName: `${e['@Name']}: ${e['@Value']}`,
              name: `${e['@Value']}`,
              children: []
            }
          }) : [{
            id: '11',
            domainName: `${res.GroupByHeader['@Name']}: ${res.GroupByHeader['@Value']}`,
            name: `${res.GroupByHeader['@Value']}`,
            children: []
          }]
        }
      )
    } else {
      list.push(
        {
          id: '1',
          domainName: `${res['@Name']}: ${res['@Value']}`,
          name: `${res['@Value']}`,
          children: []
        }
      )
    }
  }
  return list
}

export default transformGroup
