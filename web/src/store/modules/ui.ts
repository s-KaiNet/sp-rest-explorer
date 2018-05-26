import { DefineMutations } from 'vuex-type-helper'
import { IRootState } from '..'
import { Module } from 'vuex'

const namespace = 'ui'

const SET_DATA_LOADING = 'SET_DATA_LOADING'

export interface Types {
  [SET_DATA_LOADING]: string
}

export interface UIState {
  dataLoading: boolean
}

export interface UIMutations {
  [SET_DATA_LOADING]: {
    loading: boolean
  }
}

export const uiTypes: Types = {
  [SET_DATA_LOADING]: `${namespace}/${SET_DATA_LOADING}`
}

export const uiState: UIState = {
  dataLoading: true
}

const mutations: DefineMutations<UIMutations, UIState> = {
  [SET_DATA_LOADING](uiState: UIState, { loading }): void {
    uiState.dataLoading = loading
  }
}

export const uiModule: Module<UIState, IRootState> = {
  state: uiState,
  mutations,
  namespaced: true
}
