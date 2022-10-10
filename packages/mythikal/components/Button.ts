import { RefOrCallback } from "lit-html/directives/ref";
import { Bindable, ComponentTemplate, html, makeReactiveLithComponent, ReactiveLithComponent, ref, RenderResult, renderTemplateValue, TemplateValue, unbind } from "realithy";
import styles from "./Button.module.scss";
import "./Button.scss";
import { ComponentProps } from "./Component";


interface ButtonProps<M, V> extends ComponentProps<M, V> {
    onClick: (m: M, v: V) => void;
    label: Bindable<M, V, string>;
    content?: TemplateValue<M, V>;
    root?: Bindable<M, V, RefOrCallback>;
}

class Button<M, V> implements ReactiveLithComponent<M, V, ButtonProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: ButtonProps<M, V>) {
    }
    handleEvent() {
        this.props.onClick?.(this.parent, this.parentView);
    }
    render() {
        const parent = this.parent;
        const parentView = this.parentView;
        const props = this.props;
        const content = props.content;
        const label = unbind(parent, parentView, props.label);
        const root = unbind(parent, parentView, props.root);
        return html`
        <button ${ref(root)} @click=${this}>
            ${content === undefined ? label : renderTemplateValue(parent, parentView, content, this)}
        </button>`;
    }
}

const buttonComp = makeReactiveLithComponent(Button);

export function button<M, V>(props: ButtonProps<M, V>): ComponentTemplate<M, V, ButtonProps<M, V>> {
    return new ComponentTemplate(props, buttonComp);
}