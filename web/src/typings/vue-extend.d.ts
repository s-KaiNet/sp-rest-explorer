import { Metadata } from "../../../azure-funcs/src/interfaces";

declare module 'vue/types/vue' {
    interface Vue {
      metadata: Metadata
    }
  }