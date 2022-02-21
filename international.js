const fs = require('fs')

const readPath = './lang/'
const inputPath = './src/locales/'
const defaultLang = 'en'
const messageRelativeAddress = '../../lang/'
const config = fs.readFileSync(`${readPath}config.json`)
const configJson = JSON.parse(config)

const agGridLicense = fs.readFileSync('./licenses/ag-grid.txt')

const renderMessageJSFile = (defaultLang) => {
  let importString = `import ${defaultLang}Local from '${messageRelativeAddress}${defaultLang}.json'\n`
  importString += `import antdLocale from 'ant-design-vue/es/locale/${configJson[defaultLang].filename}'\n`

  let messagesString = 'const messages = {\n'
  messagesString += `  ${defaultLang}: {\n    ...${defaultLang}Local\n  }\n}\n`
  messagesString += 'export const antdLang = antdLocale\n'

  return importString + messagesString + 'export default messages\n'
}

// The default language package is introduced into the project when it is packaged
const internationalizedFileOperation = (readPath, inputPath) => {
  const defaultLanguage = configJson.default

  // Determine if the default language package exists
  if (fs.existsSync(`${readPath}${defaultLanguage}.json`)) {
    fs.writeFileSync(`${inputPath}messages.js`, renderMessageJSFile(defaultLanguage))
  } else {
    fs.writeFileSync(`${inputPath}messages.js`, renderMessageJSFile(defaultLang))
  }

  // copy ag-grid license to use
  if (fs.existsSync('./licenses/ag-grid.txt')) {
    fs.writeFileSync('./public/static/licenses/ag-grid.txt', agGridLicense)
  }
}

internationalizedFileOperation(readPath, inputPath)
