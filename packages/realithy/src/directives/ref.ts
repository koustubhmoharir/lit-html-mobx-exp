import { nothing } from "lit-html";
import { RefOrCallback, ref as litRef } from "lit-html/directives/ref.js";

export function ref(r: RefOrCallback | undefined) {
    return r ? litRef(r) : nothing;
}
