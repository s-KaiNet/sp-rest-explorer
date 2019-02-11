<template>
  <div class="diff-api">
    <h2 class="head">
      SharePoint REST API Change Log
    </h2>
    <div class="desc">What's new and what's changed in SharePoint REST API in last 6 months</div>
    <div class="legend">
      <p class="colorSample"><span class="color -green"></span><span class="text"> - Added</span></p>
      <p class="colorSample"><span class="color -yellow"></span><span class="text"> - Updated</span></p>
      <p class="colorSample"><span class="color -red"></span><span class="text"> - Deleted</span></p>
    </div>

    <el-tabs
      tab-position="top"
      v-if="!fetching"
    >
      <el-tab-pane
        :label="value.monthName + ' ' + value.year"
        v-for="(value, index) in values"
        :key="index"
      >
        <div>
          <div v-if="value.data.functions.length > 0">
            <h2>Root functions (_api/...)</h2>
            <table class="changes">
              <tr class="sub-title">
                <td>Name</td>
                <td>Return type</td>
              </tr>
              <tr
                v-for="(func, index) in value.data.functions"
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
            v-for="(entity, index) in value.data.entities"
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
      </el-tab-pane>
    </el-tabs>
    <div v-if="fetching">
      Fetching...
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Api } from '../../../../../../../../Projects/gh/src/sp-rest-explorer/web/src/services/api'
import { Logger } from '../../../../../../../../Projects/gh/src/sp-rest-explorer/web/src/services/logger'
import { MonthDiffData } from '../../models/MonthDiffData'

interface MonthValue extends MonthDiffData {
  expanded: boolean
}

interface Data {
  values: MonthValue[]
  fetching: boolean
}

export default Vue.extend({
  data(): Data {
    return {
      values: [],
      fetching: true
    }
  },
  mounted(): void {
    Api.loadChangesJson()
      .then(data => {
        this.fetching = false
        this.values = data as any
      })
      .catch(err => {
        this.fetching = false
        Logger.Error(err)
        throw err
      })
  }
})
</script>

<style lang="scss" scoped>
.diff-api {
  margin: 0 0 0 20px;
  overflow: auto;
  font-size: 18px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    Arial, sans-serif;
  color: #2f2f2f;
  line-height: 26px;

  > .head {
    margin-bottom: 8px;
  }

  > .desc {
    margin: 5px 0 8px 0;
    font-weight: bold;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  > .legend {
    margin-bottom: 20px;
  }

  > .legend .color {
    display: inline-block;
    width: 30px;
    height: 15px;
    vertical-align: middle;
    opacity: 0.6;
  }

  > .legend > .colorSample {
    margin: 0 2px;
  }

  .color.-red {
    background-color: #f56c6c;
  }

  .color.-green {
    background-color: #67c23a;
  }

  .color.-yellow {
    background-color: #e6d73c;
  }

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
    border: 3px solid #AAAAAA;
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

.diff-api /deep/ .el-tabs__item {
  font-size: 18px;
}
</style>
