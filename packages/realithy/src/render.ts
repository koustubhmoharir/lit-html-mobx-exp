import { render as renderLith } from "lit-html";
export { isTemplateResult } from "lit-html/directive-helpers.js"
import { configure } from "mobx"

interface TemplateOrDirectiveResult { values: unknown[]; }
export type RenderResult = TemplateOrDirectiveResult | null;

configure({
    enforceActions: "never",
    useProxies: "always"
})

interface CompleteRender {
    renderCompleted?(): void;
}

class RenderContext {
    private _objs: Array<CompleteRender> = [];
    pushCompleteRender(obj: CompleteRender) {
        this._objs.push(obj);
    }
    completeRender() {
        for (let index = this._objs.length - 1; index >= 0; index--) {
            this._objs[index].renderCompleted?.();
        }
        this._objs = [];
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
export function renderInContext(render: () => void, thisArg?: any) {
    renderContext = new RenderContext();
    render.call(thisArg);
    renderContext.completeRender();
}
/** @internal */
export function pushCompleteRender(obj: CompleteRender) {
    if (renderContext === undefined)
        throw new Error("render was called without a RenderContext");
    renderContext.pushCompleteRender(obj);
}