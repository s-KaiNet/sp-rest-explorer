'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  JSON_SOURCE_URL: '"http://127.0.0.1:10000/devstoreaccount1/api-files/metadata.latest.zip.json"',
  BASE_URL: '"/"'
})
