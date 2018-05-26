<template>
    <div class="function-view" v-if="!!func">
        <h2>function-view</h2>
        <h2>{{func.name}}</h2>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'function-view',
  props: {
    func: Object
  }
})
</script>

<style lang="scss" scoped>

</style>
