<template>
  <div class="diff-api">
    <h2>
      SharePoint REST API Change Log
    </h2>
    <h4>What's new and what's changed in SharePoint REST API in last 6 months (for now changes data is available starting from September, 2018)</h4>
    <div class="legend">
      <p><span class="color -green"></span><span class="text"> - Added</span></p>
      <p><span class="color -yellow"></span><span class="text"> - Updated</span></p>
      <p><span class="color -red"></span><span class="text"> - Deleted</span></p>
    </div>
    <div class="changes">

    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({

})
</script>

<style lang="scss" scoped>
  .diff-api {
    margin: 20px 0 20px 20px;
    overflow: auto;
    font-size: 18px;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", Arial, sans-serif;
    color: #2f2f2f;
    line-height: 26px;

    > .legend .color {
      display: inline-block;
      width: 30px;
      height: 15px;
      vertical-align: middle;
      opacity: 0.7;
    }

    .color.-red{
      background-color: #F56C6C;
    }
    .color.-green{
      background-color: #67C23A;
    }
    .color.-yellow{
      background-color: #E6A23C;
    }
  }
</style>
