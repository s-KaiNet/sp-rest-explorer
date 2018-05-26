<template>
    <div class="entity-view" v-if="!!entity">
        <h2>entity-view</h2>
        <h2>{{entity.name}}</h2>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'entity-view',
  props: {
    entity: Object
  },
  watch: {
    entity(to, from) {
      console.log(to)
      console.log(from)
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
