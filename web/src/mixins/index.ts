import Vue from 'vue'

import { Metadata } from '../../../az-funcs/src/interfaces'
import { Api } from '../services/api'
import { Store } from 'vuex'
import { IRootState } from '../store'
import { FilterManager } from '../services/filterManager'

export let docsMixin = {
  methods: {
    getPropertyName(typeName: string): string {
      if (typeName.indexOf('Edm.') !== -1) {
        return typeName.replace(/Edm\./gi, '')
      }

      return typeName
    }
  }
}

export let metadataMixin = Vue.extend({
  computed: {
    metadata(): Metadata {
      let store = ((this as any).$store) as Store<IRootState>
      let allFilters: string[] = []
      FilterManager.DefaultFilters.forEach(filter => {
        if (store.state.filter.filters.indexOf(filter) === -1) {
          allFilters.push(filter)
        }
      })

      return Api.getMetadata(allFilters, store.state.filter.search)
    }
  }
})

export let toggleTableMixin = Vue.extend({
  data() {
    return {
      activeClass: null,
      collapsedClass: 'el-icon-minus'
    }
  },
  methods: {
    toggleVisibility(): void {
      if (!this.activeClass) {
        this.activeClass = 'hide'
        this.collapsedClass = 'el-icon-plus'
      } else {
        this.activeClass = null
        this.collapsedClass = 'el-icon-minus'
      }
    }
  }
})
