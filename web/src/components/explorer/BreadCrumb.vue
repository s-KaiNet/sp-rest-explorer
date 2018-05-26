<template>
    <div class="breadcrumb-menu" v-if="path">
        <span>_api/{{path}}</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  computed: {
    path(): string {
      return this.$store.state.navigation.breadcrumb
    }
  }
})
</script>

<style lang="scss" scoped>
.breadcrumb-menu {
  background-color: #b6dafd5c;
  padding: 15px;
  margin: 15px;
  border-radius: 4px;
  font-size: 17px;
  font-weight: bold;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    Arial, sans-serif;
}
</style>
