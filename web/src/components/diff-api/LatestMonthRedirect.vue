<template>
  <div>
    latest
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { Logger } from '../../services/logger'
import { Api } from '../../services/api'

export default Vue.extend({
  mounted(): void {
    Api.loadChangesJson()
      .then(data => {
        this.$router.replace({
          path: '/api-diff/' + data[0].monthKey
        })
      })
      .catch(err => {
        Logger.Error(err)
        throw err
      })
  }
})
</script>
