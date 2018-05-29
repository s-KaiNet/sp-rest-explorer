import { Metadata } from "../../../parser/src/interfaces";

declare module 'vue/types/vue' {
    interface Vue {
      metadata: Metadata
    }
  }