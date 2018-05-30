import { DefineMutations } from 'vuex-type-helper'
import { IRootState } from '..'
import { Module } from 'vuex'
import { FilterManager } from '../../services/filterManager'

const namespace = 'filter'

const ADD_FILTERS = 'ADD_FILTERS'
const REMOVE_FILTERS = 'REMOVE_FILTERS'
const REPLACE_FILTERS = 'REPLACE_FILTERS'
const SET_SEARCH = 'SET_SEARCH'

export interface Types {
  [ADD_FILTERS]: string,
  [REMOVE_FILTERS]: string,
  [REPLACE_FILTERS]: string,
  [SET_SEARCH]: string,
}

export interface FiltersState {
  filters: string[]
  search: string
}

export interface FiltersMutations {
  [ADD_FILTERS]: {
    filters: string[]
  },
  [REMOVE_FILTERS]: {
    filters: string[]
  },
  [REPLACE_FILTERS]: {
    filters: string[]
  },
  [SET_SEARCH]: {
    search: string
  }
}

export const filterTypes: Types = {
  [ADD_FILTERS]: `${namespace}/${ADD_FILTERS}`,
  [REMOVE_FILTERS]: `${namespace}/${REMOVE_FILTERS}`,
  [REPLACE_FILTERS]: `${namespace}/${REPLACE_FILTERS}`,
  [SET_SEARCH]: `${namespace}/${SET_SEARCH}`
}

export const filterState: FiltersState = {
  filters: FilterManager.load(),
  search: ''
}

const mutations: DefineMutations<FiltersMutations, FiltersState> = {
  [ADD_FILTERS](filterState: FiltersState, { filters }): void {
    filters.forEach(filter => {
      if (filterState.filters.indexOf(filter) === -1) {
        filterState.filters.push(filter)
      }
    })
  },
  [REMOVE_FILTERS](filterState: FiltersState, { filters }): void {
    filters.forEach(filter => {
      let index = filterState.filters.indexOf(filter)
      if (index !== -1) {
        filterState.filters.splice(index, 1)
      }
    })
  },
  [REPLACE_FILTERS](filterState: FiltersState, { filters }): void {
    filterState.filters = filters
  },
  [SET_SEARCH](filterState: FiltersState, { search }): void {
    filterState.search = search
  }
}

export const filtersModule: Module<FiltersState, IRootState> = {
  state: filterState,
  mutations,
  namespaced: true
}
