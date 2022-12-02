import { nothing } from "lit-html";
import { createRef, RefOrCallback } from "lit-html/directives/ref.js";
import { Bindable, ComponentTemplate, handleEvent, html, makeObservable, makeReactiveLithComponent, observable, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, TemplateContent, unbind } from "realithy";
import { ComponentProps } from "./Component";


interface DialogProps<M, V> extends ComponentProps<M, V> {
    open: Bindable<M, V, boolean>;
    content?: TemplateContent<M, V>;
}

class Dialog_<M, V> implements ReactiveLithComponent<M, V, DialogProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: DialogProps<M, V>) {
        makeObservable(this);
    }
    private readonly _dialogRef = createRef();

    @observable
    open: boolean = false;

    render() {
        const parent = this.parent;
        const parentView = this.parentView;
        const props = this.props;
        const content = props.content;
        return html`
            <dialog ${ref(this._dialogRef)}>
                ${content === undefined ? nothing : renderTemplateContent(parent, parentView, content)}
            </dialog>
            `;
    }
    renderCompleted() {
        const open = unbind(this.parent, this.parentView, this.props.open);
        let dialogElement = this._dialogRef.value as HTMLDialogElement;
        if (open && dialogElement && dialogElement.isConnected && !dialogElement.open) {
            dialogElement.showModal();
        }
        else if (!open && dialogElement && dialogElement.isConnected && dialogElement.open) {
            dialogElement.close();
        }
    }
}

const dialogComp = makeReactiveLithComponent(Dialog_);

export function Dialog<M, V>(props: DialogProps<M, V>): ComponentTemplate<M, V, DialogProps<M, V>> {
    return new ComponentTemplate(props, dialogComp);
}