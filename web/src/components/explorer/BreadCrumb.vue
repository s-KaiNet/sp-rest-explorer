<template>
  <div class="breadcrumb-menu" v-if="path">
    <div class="breadcrumb">
      <span>_api/{{path}}</span>
    </div>
    <div class="info" v-if="hasInfo">
      <div class="apiLink">
        <span>
          <i class="el-icon-info"></i>
        </span>
        This API has official documentation here:
        <a href="" target="_blank">some link goes here</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  computed: {
    path(): string {
      return this.$store.state.navigation.breadcrumb
    },
    hasInfo(): boolean {
      return true
    }
  }
})
</script>

<style lang="scss" scoped>
.breadcrumb-menu {
  .breadcrumb {
    background-color: #b6dafd5c;
    padding: 15px;
    margin: 15px;
    border-radius: 4px;
    font-size: 17px;
    font-weight: bold;
    font-family: $textFontFamily;
  }

  .apiLink {
    margin: 10px 0;
  }

  .info {
    padding: 15px;
    margin: 15px 15px 0 15px;
    border-radius: 4px;
    font-size: 19px;
    font-weight: bold;
    background-color: #d4edda;
  }
}
</style>
