import { repeat as repeatSync } from "lit-html/directives/repeat.js";
import { isObservable } from "mobx";
import { trackDirective } from "../trackDirective";

const trackedRepeat = trackDirective(repeatSync, ([pl], [cl]) => {
    const skip: boolean = Object.is(pl, cl) && isObservable(cl);
    return skip;
});

interface Presentable {
    render(): unknown;
}

const identity = <T>(x: T) => x;
const render = <T extends Presentable>(item: T) => item.render();

export function repeat<T extends Presentable>(list: readonly T[]): ReturnType<typeof repeatSync> {
    return trackedRepeat(list, identity, render);
}