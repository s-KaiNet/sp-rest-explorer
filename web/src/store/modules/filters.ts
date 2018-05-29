import { DefineMutations } from 'vuex-type-helper'
import { IRootState } from '..'
import { Module } from 'vuex'

const namespace = 'filter'

const ADD_FILTERS = 'ADD_FILTERS'

export interface Types {
  [ADD_FILTERS]: string
}

export interface FiltersState {
  filters: string[]
}

export interface FiltersMutations {
  [ADD_FILTERS]: {
    filters: string[]
  }
}

export const filterTypes: Types = {
  [ADD_FILTERS]: `${namespace}/${ADD_FILTERS}`
}

export const filterState: FiltersState = {
  filters: ['SP.WorkManagement', 'SP.Directory', 'SP.CompliancePolicy', 'Microsoft.Online.SharePoint.MultiGeo']
}

const mutations: DefineMutations<FiltersMutations, FiltersState> = {
  [ADD_FILTERS](filterState: FiltersState, { filters }): void {
    filters.forEach(filter => {
      if (filterState.filters.indexOf(filter) === -1) {
        filterState.filters.push(filter)
      }
    })
  }
}

export const filtersModule: Module<FiltersState, IRootState> = {
  state: filterState,
  mutations,
  namespaced: true
}
