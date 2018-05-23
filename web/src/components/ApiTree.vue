<template>
    <div class="api-tree">
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        <div>api tree goes here</div>
        
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'api-tree',
  data() {
    return {
      json: null
    }
  },
  mounted() {
    this.axios.get('http://localhost:8089/out.json', {
      headers: {
        'Accept': 'application/json'
      }
    }).then(data => {
      this.json = data.data
    })
  }
})
</script>
