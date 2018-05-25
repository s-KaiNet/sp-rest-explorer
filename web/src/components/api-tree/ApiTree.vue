<template>
  <div class="api-tree">
    <el-tree :data="functions"></el-tree>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { ApiService } from '../../services/api'
import { uiTypes } from '../../store/modules/ui'

interface IData {
  functions: any[]
  data: any
}

export default Vue.extend({
  name: 'api-tree',
  data(): IData {
    return {
      data: null,
      functions: []
    }
  },
  mounted() {
    let api = new ApiService()
    api
      .getMetaData()
      .then(data => {
        this.$store.commit(uiTypes.SET_DATA_LOADING, {
          loading: false
        })

        this.data = data
        for (const funcId in data.functions) {
          if (data.functions.hasOwnProperty(funcId)) {
            const func = data.functions[funcId]
            if (func.isRoot) {
              this.functions.push({
                label: func.name
              })
            }
          }
        }
      })
      .catch(err => {
        throw err
      })
  }
})
</script>
