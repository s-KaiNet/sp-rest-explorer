import Vue from 'vue'

import { Metadata } from '../../../parser/src/interfaces'
import { Api } from '../services/api'

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
      return Api.getMetadata((this as any).$store.state.filter.filters)
    }
  }
})
