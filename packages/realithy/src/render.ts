import { render as renderLith } from "lit-html";
export { isTemplateResult } from "lit-html/directive-helpers.js"
import { configure } from "mobx"

interface TemplateOrDirectiveResult { values: unknown[]; }
export type RenderResult = TemplateOrDirectiveResult | null;

configure({
    enforceActions: "never",
})

class RenderContext {
    private _callbacks: Array<[() => void, unknown]> = [];
    pushCallback(callback: () => void, thisArg: unknown) {
        this._callbacks.push([callback, thisArg]);
    }
    completeRender() {
        for (let index = this._callbacks.length - 1; index >= 0; index--) {
            const [c, thisArg] = this._callbacks[index];
            c.call(thisArg);
        }
        this._callbacks = [];
        renderContext = undefined;
    }
}
let renderContext: RenderContext | undefined;

export function render(value: RenderResult, container: HTMLElement | DocumentFragment) {
    let rootPart;
    renderInContext(() => rootPart = renderLith(value, container));
    return rootPart;
}

/** @internal */
export function renderInContext(render: () => void) {
    renderContext = new RenderContext();
    render();
    renderContext.completeRender();
}
/** @internal */
export function pushCompleteRenderCallback(callback: () => void, thisArg: unknown) {
    if (renderContext === undefined)
        throw new Error("render was called without a RenderContext");
    renderContext.pushCallback(callback, thisArg);
}