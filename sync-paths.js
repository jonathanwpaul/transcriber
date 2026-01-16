const fs = require('fs')
const path = require('path')

// Load craco.config.js
const cracoConfig = require('./craco.config')

// Extract the aliases from the craco config
const aliases = cracoConfig.webpack.alias

// Generate the jsconfig paths format
const jsConfigPaths = {}
for (const alias in aliases) {
  jsConfigPaths[`${alias}/*`] = [`${aliases[alias]}/*`]
}

// Create the jsconfig.json content
const jsConfig = {
  compilerOptions: {
    baseUrl: 'src',
    paths: jsConfigPaths,
  },
  include: ['src'],
}

// Write the jsconfig.json file
fs.writeFileSync(
  path.resolve(__dirname, 'jsconfig.json'),
  JSON.stringify(jsConfig, null, 2),
)

console.log('jsconfig.json updated successfully!')
