function downloadFiles(response, filename) {
  const data = response.data

  if (!data) return

  // getfilename
  // eslint-disable-next-line no-unused-vars
  let name = ''
  let contentArr = []

  if (response.headers['content-disposition']) {
    contentArr = response.headers['content-disposition'].split(';').filter(item => {
      return item.indexOf('filename') > -1
    })
  }

  if (contentArr.length > 0) {
    name = contentArr[0].split('=')[1]
  } else {
    name = filename
  }

  // data type
  const type = response.headers['content-type'].split(';')[0]

  var blob = new Blob([data], { type: type })
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    // IE version
    // blob = new Blob([data], { type: 'application/force-download' })
    window.navigator.msSaveBlob(blob, name)
  } else {
    // fireFox || chrome
    var link = document.createElement('a')
    link.href = URL.createObjectURL(data)
    link.download = name
    link.click()
  }
}

export default downloadFiles
