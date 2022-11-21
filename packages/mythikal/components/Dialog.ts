import { createRef, RefOrCallback } from "lit-html/directives/ref.js";
import { Bindable, ComponentTemplate, html, makeReactiveLithComponent, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, TemplateContent, unbind } from "realithy";
import styles from "./Button.module.scss";
import "./Button.scss";
import { ComponentProps } from "./Component";


interface DialogProps<M, V> extends ComponentProps<M, V> {
    onClick: (m: M, v: V) => void;
    label: Bindable<M, V, string>;
    content?: TemplateContent<M, V>;
    root?: Bindable<M, V, RefOrCallback>;
}

class Dialog_<M, V> implements ReactiveLithComponent<M, V, DialogProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: DialogProps<M, V>) {
    }
    private readonly _dialogRef = createRef();
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
        console.log(root);
        return html`
            <button ${ref(root)} @click=${this}>
                ${content === undefined ? label : renderTemplateContent(parent, parentView, content)}
            </button>
            <dialog ${ref(this._dialogRef)}>
                something
            </dialog>
        `;
    }
    renderCompleted() {
        if (this._dialogRef.value) {
            setTimeout(() => {
                (this._dialogRef.value as HTMLDialogElement).showModal();
            }, 0);
        }
    }
}

const dialogComp = makeReactiveLithComponent(Dialog_);

export function Dialog<M, V>(props: DialogProps<M, V>): ComponentTemplate<M, V, DialogProps<M, V>> {
    return new ComponentTemplate(props, dialogComp);
}