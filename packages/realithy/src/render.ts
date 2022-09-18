import { render as renderLith } from "lit-html";
export { isTemplateResult } from "lit-html/directive-helpers.js"

export function render(value: unknown, container: HTMLElement | DocumentFragment) {
    console.log("render start");
    const rootPart = renderLith(value, container);
    console.log("render end");
    return rootPart;
}
