import Vue from 'vue'
import Vuex, { Store, StoreOptions } from 'vuex'
import { IUiState, uiModule, uiState } from './modules/ui'

const debug = process.env.NODE_ENV !== 'production'

Vue.use(Vuex)

export interface IRootState {
  version: string,
  ui: IUiState
}

const rootState: IRootState = {
  version: '1.0',
  ui: uiState
}

const storeOptions: StoreOptions<IRootState> = {
  state: rootState,
  modules: {
    ui: uiModule
  },
  strict: debug
}

export default new Store<IRootState>(storeOptions)
