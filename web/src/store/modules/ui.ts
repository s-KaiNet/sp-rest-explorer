import { DefineMutations } from 'vuex-type-helper'
import { IRootState } from '..'
import { Module } from 'vuex'

const namespace = 'ui'

const SET_DATA_LOADING = 'SET_DATA_LOADING'

export interface Types {
  [SET_DATA_LOADING]: string
}

export interface IUiState {
  dataLoading: boolean
}

export interface IUiMutations {
  [SET_DATA_LOADING]: {
    loading: boolean
  }
}

export const uiTypes: Types = {
  [SET_DATA_LOADING]: `${namespace}/${SET_DATA_LOADING}`
}

export const uiState: IUiState = {
  dataLoading: true
}

const mutations: DefineMutations<IUiMutations, IUiState> = {
  [SET_DATA_LOADING](uiState: IUiState, { loading }): void {
    uiState.dataLoading = loading
  }
}

export const uiModule: Module<IUiState, IRootState> = {
  state: uiState,
  mutations,
  namespaced: true
}
