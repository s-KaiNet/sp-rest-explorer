<template>
  <div class="top-header-line">
    <div>
      <div class="logo">
        <img class="icon" src="./../../assets/sharepoint.png">
        <span>SharePoint REST API Metadata Explorer</span>
      </div>
    </div>
    <div>
      <a class="link" href="https://github.com/s-KaiNet/sp-rest-explorer" target="_blank">Like it? Star it!<img class="github" src="./../../assets/github_logo_new.png"> GitHub </a>
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
    width: 40px;
    margin-right: 10px;
  }
}
</style>
