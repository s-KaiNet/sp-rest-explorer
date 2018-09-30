import { Metadata } from "../../../az-funcs/src/interfaces";

declare module 'vue/types/vue' {
    interface Vue {
      metadata: Metadata
    }
  }