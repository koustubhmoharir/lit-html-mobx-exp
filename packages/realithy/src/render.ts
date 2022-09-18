import { render as renderLith } from "lit-html";
export { isTemplateResult } from "lit-html/directive-helpers.js"

class RenderContext {
    private _callbacks: Array<() => void> = [];
    pushCallback(callback: () => void) {
        this._callbacks.push(callback);
    }
    completeRender() {
        for (let index = this._callbacks.length - 1; index >= 0; index--) {
            this._callbacks[index]();
        }
        this._callbacks = [];
        renderContext = undefined;
    }
}
let renderContext: RenderContext | undefined;

export function render(value: unknown, container: HTMLElement | DocumentFragment) {
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
export function pushCompleteRenderCallback(callback: () => void) {
    if (renderContext === undefined)
        throw new Error("render was called without a RenderContext");
    renderContext.pushCallback(callback);
}