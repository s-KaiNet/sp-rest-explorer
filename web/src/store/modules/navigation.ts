import { DefineMutations } from 'vuex-type-helper'
import { IRootState } from '..'
import { Module } from 'vuex'

const namespace = 'navigation'

const SET_BREADCRUMB = 'SET_BREADCRUMB'

export interface Types {
  [SET_BREADCRUMB]: string
}

export interface NavigationState {
  breadcrumb: string
}

export interface NavigationMutations {
  [SET_BREADCRUMB]: {
    breadcrumb: string
  }
}

export const navigationTypes: Types = {
  [SET_BREADCRUMB]: `${namespace}/${SET_BREADCRUMB}`
}

export const navigationState: NavigationState = {
  breadcrumb: ''
}

const mutations: DefineMutations<NavigationMutations, NavigationState> = {
  [SET_BREADCRUMB](navState: NavigationState, { breadcrumb }): void {
    navState.breadcrumb = breadcrumb
  }
}

export const navigationModule: Module<NavigationState, IRootState> = {
  state: navigationState,
  mutations,
  namespaced: true
}
