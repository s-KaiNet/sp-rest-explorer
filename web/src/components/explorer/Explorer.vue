<template>
  <div class="explorer-container">
    <el-aside width="auto" class="aside" v-mydir>
      <router-view name="tree"></router-view>
    </el-aside>
    <div class="content">
      <router-view name="breadcrumb" />
      <router-view name="docs" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as interact from 'interactjs'

export default Vue.extend({
  directives: {
    mydir: {
      // directive definition
      inserted: function(el) {
        interact(el)
          .resizable({
            edges: {
              right: true
            }
          })
          .on('resizemove', function(event: any) {
            let target = event.target
            let x = parseFloat(target.getAttribute('data-x')) || 0
            let y = parseFloat(target.getAttribute('data-y')) || 0

            // update the element's style
            target.style.maxWidth = 'none'
            target.style.width = event.rect.width + 'px'
            target.style.height = event.rect.height + 'px'

            // translate when resizing from top or left edges
            x += event.deltaRect.left
            y += event.deltaRect.top
            target.setAttribute('data-x', x)
            target.setAttribute('data-y', y)
          })
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.explorer-container {
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;

  .content {
    width: 100%;
  }
  .aside {
    min-width: 280px;
    max-width: 500px;
    border-right: 4px solid transparent;
    flex-shrink: 0;
    background-color: #dae0ec;
    box-shadow: 1px 0px 8px 0 rgba(0, 0, 0, 0.2),
      3px 0 4px 0 rgba(0, 0, 0, 0.14), 3px 0 3px -2px rgba(0, 0, 0, 0.12);
    z-index: 1;
  }
  .aside,
  .content {
    height: 100%;
    overflow-y: auto;
  }
}
</style>
