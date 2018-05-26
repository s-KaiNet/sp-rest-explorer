<template>
  <div class="top-header-line">
    <div>
      <div class="logo">
        <img class="icon" src="./../../assets/sp_logo.png">
        <span>SharePoint REST API Metadata Explorer</span>
      </div>
    </div>
    <div>
      <a class="link" href="#" target="_blank"> <img class="github" src="./../../assets/github_logo.png"> GitHub </a>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
})
</script>

<style lang="scss" scoped>

.top-header-line {
  display: flex;
  justify-content: space-between;
  color: $textColor;
  font-size: $textSize;

  .github {
    width: 32px;
    vertical-align: text-bottom;
  }
  .link {
    color: $textColor;
    text-decoration: none;
    line-height: 50px;
  }
  .logo {
    display: flex;
    align-items: center;
    line-height: 50px;
  }
  .icon {
    width: 44px;
    margin-right: 10px;
  }
}
</style>
