import { RefOrCallback } from "lit-html/directives/ref.js";
import { Bindable } from "realithy";

export interface ComponentProps<M, V> {
    root?: Bindable<M, V, RefOrCallback>;
}