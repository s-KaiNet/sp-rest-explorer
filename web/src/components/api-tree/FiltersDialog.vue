<template>
  <div class="filters-dialog">
    <div class="filters" @click="dialogVisible = true">
      <a>Filter settings</a>
    </div>
    <el-dialog title="Modify default endpoint filters" :visible.sync="dialogVisible" :append-to-body="true" :width="'40%'" @open="onDialogOpen">
      <div>
        <div>
          <h3 class="top">Below namespaces are hidden from tree. Uncheck appropriate namespace if you want to show it:</h3>
        </div>

        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="onSelectAll">Check all</el-checkbox>
        <br><br>
        <el-checkbox-group v-model="selectedFilters" @change="onCheckChange">
          <div v-for="row in rowCount" :key="row">
            <el-row>
              <el-col v-for="filter in getFilterValues(row)" :key="filter" :sm="12" :lg="8">
                <el-checkbox :label="filter" name="filter">{{filter}}</el-checkbox>
              </el-col>
            </el-row>
          </div>
        </el-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveFilters">Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'

import { filterTypes } from '../../store/modules/filters'
import { FilterManager } from '../../services/filterManager'

export default Vue.extend({
  data() {
    return {
      dialogVisible: false,
      selectedFilters: [],
      allFilters: [],
      isIndeterminate: false,
      checkAll: false,
      rows: 3
    }
  },
  computed: {
    rowCount(): number[] {
      let rowsNumber = Math.ceil(
        FilterManager.DefaultFilters.length / this.rows
      )
      let rowsArray = []
      for (let index = 0; index < rowsNumber; index++) {
        rowsArray.push(index)
      }

      return rowsArray
    }
  },
  methods: {
    onCheckChange(value: any): void {
      let checkedCount = value.length
      this.checkAll = checkedCount === FilterManager.DefaultFilters.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < FilterManager.DefaultFilters.length
    },
    onSelectAll(check: boolean): void {
      if (check) {
        this.selectedFilters = FilterManager.DefaultFilters
      } else {
        this.selectedFilters = []
      }
      this.isIndeterminate = false
    },
    getFilterValues(index: number): string[] {
      return FilterManager.DefaultFilters.slice(
        index * this.rows,
        index * this.rows + this.rows
      )
    },
    onDialogOpen() {
      this.selectedFilters = this.$store.state.filter.filters.slice(0)

      this.isIndeterminate =
        this.selectedFilters.length !== FilterManager.DefaultFilters.length
      this.checkAll =
        this.selectedFilters.length === FilterManager.DefaultFilters.length
    },
    saveFilters() {
      this.$store.commit(filterTypes.REPLACE_FILTERS, {
        filters: this.selectedFilters
      })
      FilterManager.save(this.selectedFilters)
      this.dialogVisible = false
    }
  }
})
</script>

<style lang="scss" scoped>
.filters-dialog {
  .filters {
    text-align: left;
    padding: 15px;
    border-bottom: 1px solid #d2d1d1;
    cursor: pointer;

    &:hover {
      background-color: #f3f2f2;
    }
  }
}
.top{
  margin: 0 0 10px;
}
</style>
