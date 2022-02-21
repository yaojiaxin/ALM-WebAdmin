import json2csv from 'json2csv'
import { urlEncode } from '@/utils'

const documentSuffix = {
  'text/csv': 'blobCsv',
  'application/msword': 'doc',
  'multipart/form-data': 'xls',
  'text/plain': 'txt',
  'text/html': 'html',
  csv: 'csv',
  word: 'doc',
  excel: 'xls',
  text: 'txt',
  html: 'html',
  blobCsv: 'blobCsv'
}

// IE or not
function MyBrowserIsIE() {
  let isIE = false
  if (
    navigator.userAgent.indexOf('compatible') > -1 &&
    navigator.userAgent.indexOf('MSIE') > -1
  ) {
    isIE = true
  }
  if (navigator.userAgent.indexOf('Trident') > -1) {
    // edge
    isIE = true
  }
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    isIE = true
  }
  return isIE
}

export function downloadCsv(datas, fileName = 'log', type = 'csv') {
  try {
    if (documentSuffix[type] === 'xls' || documentSuffix[type] === 'blobCsv') { // excel use binary stream
      const xlsxData = new Blob([datas.data], { type: 'application/vnd.ms-excel' })
      if (window.navigator.msSaveOrOpenBlob) { // msSaveOrOpenBlob方法返回bool值
        navigator.msSaveBlob(xlsxData, `${fileName}.${documentSuffix[type]}`)// 本地保存
      } else {
        const link = document.createElement('a') // a标签下载
        link.href = window.URL.createObjectURL(xlsxData)
        link.download = `${fileName}.${documentSuffix[type] === 'xls' ? 'xls' : 'csv'}`
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
        window.URL.revokeObjectURL(link.href)
      }
    } else {
      // columns array(except key)
      let result
      if (Array.isArray(datas)) {
        datas.forEach(item => {
          for (const key in item) {
            if (key.toUpperCase() !== key) {
              item[key.toUpperCase()] = item[key]
              delete item[key]
            }
          }
        })
        const fields = []
        datas.forEach(item => delete item.KEY)
        for (const key in datas[0]) {
          fields.push(key)
        }
        result = json2csv.parse(datas, {
          fields: fields
        })
        // some operating system cannot identify \n, so replace \n to \r\n. In order to prevent replacing \r\n to \r\r\n, so replace \r\n to \n first.
        result = result.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
      } else {
        result = datas
      }

      if (MyBrowserIsIE()) {
        // IE11 or Edge
        const BOM = '\uFEFF'
        const csvData = new Blob([BOM + result], { type: `text/${documentSuffix[type]}` })
        navigator.msSaveBlob(csvData, `${fileName}.${documentSuffix[type]}`)
      } else {
        // not IE
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + urlEncode(result)
        const link = document.createElement('a')
        link.href = csvContent
        // link.download = `${fileName}.csv`
        link.download = `${fileName}.${documentSuffix[type]}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  } catch (err) {
    console.log(err)
  }
}
