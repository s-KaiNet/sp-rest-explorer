'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  JSON_SOURCE_URL: '"http://localhost:8089/metadata.latest.zip.json"'
})
