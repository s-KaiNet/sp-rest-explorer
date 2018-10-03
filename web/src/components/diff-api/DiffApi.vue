<template>
  <div class="diff-api">
    <h2 class="head">
      SharePoint REST API Change Log
    </h2>
    <div class="desc">What's new and what's changed in SharePoint REST API in last 6 months (changes data is available starting from July, 2018)</div>
    <div class="legend">
      <p class="colorSample"><span class="color -green"></span><span class="text"> - Added</span></p>
      <p class="colorSample"><span class="color -yellow"></span><span class="text"> - Updated</span></p>
      <p class="colorSample"><span class="color -red"></span><span class="text"> - Deleted</span></p>
    </div>

    <el-tabs tab-position="top" v-if="!fetching">
      <el-tab-pane :label="value.monthName + ' ' + value.year" v-for="(value, index) in values" :key="index">
        <div v-html="value.htmlValue"></div>
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
    Api.loadChangesData()
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
}

.diff-api /deep/ .el-tabs__item {
  font-size: 18px;
}
</style>
