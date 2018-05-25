import Vue, { ComponentOptions } from "vue";
import { Store } from "vuex";
import { IRootState } from "./../store";

declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    store?: Store<IRootState>;
  }
}

declare module "vue/types/vue" {
  interface Vue {
    $store: Store<IRootState>;
  }
}
