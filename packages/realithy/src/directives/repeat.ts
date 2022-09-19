import { repeat as repeatSync } from "lit-html/directives/repeat.js";
import { isObservable } from "mobx";
import { trackDirective } from "../trackDirective";

const trackedRepeat = trackDirective(repeatSync, ([pl], [cl]) => {
    const skip: boolean = Object.is(pl, cl) && isObservable(cl);
    return skip;
});

type KeyOfType<T, V> = keyof {
    [P in keyof T as T[P] extends V ? P : never]: any
}

export function repeat<T>(list: readonly T[], idProperty: keyof T, render: KeyOfType<T, () => unknown>): ReturnType<typeof repeatSync> {
    return trackedRepeat(list, (item: T) => item[idProperty], (item: T) => (item[render] as any).call(item));
}