<template>
  <div
    v-if="monthData"
    class="monthData"
  >
    <div v-if="monthData.data.functions.length > 0">
      <h2>Root functions (_api/...)</h2>
      <table class="changes">
        <tr class="sub-title">
          <td>Name</td>
          <td>Return type</td>
        </tr>
        <tr
          v-for="(func, index) in monthData.data.functions"
          :key="index"
          v-bind:class="{added: func.changeType == 0, deleted: func.changeType == 2, updated: func.changeType == 1}"
        >
          <td>{{func.name}}</td>
          <td>{{func.returnType}}</td>
        </tr>
      </table>
    </div>
    <h2>Entities</h2>
    <div
      v-for="(entity, index) in monthData.data.entities"
      :key="index"
    >
      <div v-if="entity.hasChanges">
        <h3
          class="entity-name"
          v-bind:class="{added: entity.changeType == 0, deleted: entity.changeType == 2, updated: entity.changeType == 1}"
        >{{entity.name}}</h3>
        <table class="changes">
          <template v-if="entity.properties.length > 0">
            <tr class="title">
              <td colspan="2">Properties</td>
            </tr>
            <tr class="sub-title">
              <td>Name</td>
              <td>Type</td>
            </tr>
            <tr
              v-for="(prop, index) in entity.properties"
              :key="index"
              v-bind:class="{added: prop.changeType == 0, deleted: prop.changeType == 2, updated: prop.changeType == 1}"
            >
              <td>{{prop.name}}</td>
              <td>{{prop.typeName}}</td>
            </tr>
          </template>
          <template v-if="entity.navigationProperties.length > 0">
            <tr class="title">
              <td colspan="2">Navigation properties</td>
            </tr>
            <tr class="sub-title">
              <td>Name</td>
              <td>Type</td>
            </tr>
            <tr
              v-for="(prop, index) in entity.navigationProperties"
              :key="index"
              v-bind:class="{added: prop.changeType == 0, deleted: prop.changeType == 2, updated: prop.changeType == 1}"
            >
              <td>{{prop.name}}</td>
              <td>{{prop.typeName}}</td>
            </tr>
          </template>
          <template v-if="entity.functionIds.length > 0">
            <tr class="title">
              <td colspan="2">Functions</td>
            </tr>
            <tr class="sub-title">
              <td>Name</td>
              <td>Return type</td>
            </tr>
            <tr
              v-for="(func, index) in entity.functionIds"
              :key="index"
              v-bind:class="{added: func.changeType == 0, deleted: func.changeType == 2, updated: func.changeType == 1}"
            >
              <td>{{func.name}}</td>
              <td>{{func.typeName}}</td>
            </tr>
          </template>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router'

import { Logger } from '../../services/logger'
import { Api } from '../../services/api'

interface Data {
  monthData: any
}

export default Vue.extend({
  data(): Data {
    return {
      monthData: null
    }
  },
  props: {
    monthKey: String
  },
  mounted() {
    Api.loadChangesJson()
      .then(data => {
        let currentMonthData = data.filter(d => d.monthKey === this.monthKey)[0]
        this.monthData = currentMonthData
      })
      .catch(err => {
        Logger.Error(err)
        throw err
      })
  },
  watch: {
    $route(to: Route): void {
      Api.loadChangesJson()
        .then(data => {
          let currentMonthData = data.filter(
            d => d.monthKey === this.monthKey
          )[0]
          this.monthData = currentMonthData
        })
        .catch(err => {
          Logger.Error(err)
          throw err
        })
    }
  }
})
</script>

<style lang="scss" scoped>
.monthData {
  .title td {
    text-align: center;
    background-color: #e2edff;
    font-weight: bold;
    font-style: italic;
  }
  .sub-title td {
    font-weight: bold;
  }
  table.changes {
    width: 60%;
    text-align: left;
    border-collapse: collapse;
  }

  .changes td {
    border: 3px solid #aaaaaa;
    padding: 6px 7px;
    font-size: 16px;
  }

  .added {
    background-color: rgba(103, 194, 58, 0.4);
  }
  .updated {
    background-color: rgba(230, 215, 60, 0.4);
  }
  .deleted {
    background-color: rgba(245, 108, 108, 0.4);
  }

  .entity-name {
    width: fit-content;
    padding: 5px;
  }
}
</style>
