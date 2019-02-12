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
      v-model="activeName"
    >
      <el-tab-pane
        :name="value.monthKey"
        v-for="(value, index) in values"
        :key="index"
      >
        <router-link
          slot="label"
          :to="value.monthKey"
          tag="span"
        >{{value.monthName + ' ' + value.year}}</router-link>
      </el-tab-pane>
    </el-tabs>
    <router-view name="monthDiff"></router-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router'

import { Api } from '../../services/api'
import { Logger } from '../../services/logger'
import { MonthDiffData } from '../../models/MonthDiffData'

interface Data {
  values: MonthDiffData[]
  activeName: string
}

export default Vue.extend({
  data(): Data {
    return {
      values: [],
      activeName: ''
    }
  },
  props: {
    monthKey: String
  },
  mounted() {
    Api.loadChangesJson()
      .then(data => {
        this.values = data
        if (!this.monthKey) {
          this.activeName = data[0].monthKey
        } else {
          this.activeName = this.monthKey
        }
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
          if (!this.monthKey) {
            this.activeName = data[0].monthKey
          } else {
            this.activeName = this.monthKey
          }
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
