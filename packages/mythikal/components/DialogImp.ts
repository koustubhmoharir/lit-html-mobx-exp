import { nothing } from "lit-html";
import { createRef, RefOrCallback } from "lit-html/directives/ref.js";
import { Bindable, ComponentTemplate, handleEvent, html, makeObservable, makeReactiveLithComponent, observable, ReactiveLithComponent, ref, render, RenderResult, renderTemplateContent, TemplateContent, unbind } from "realithy";
import { ComponentProps } from "./Component";


interface DialogImpProps<M, V> extends ComponentProps<M, V> {
    open: boolean;
    content?: TemplateContent<M, V>;
}

class DialogImp_<M, V> implements ReactiveLithComponent<M, V, DialogImpProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: DialogImpProps<M, V>) {
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
        let dialogElement = this._dialogRef.value as HTMLDialogElement;
        if (this.props.open && dialogElement && dialogElement.isConnected && !dialogElement.open) {
            dialogElement.showModal();
        }
        else if (!this.props.open && dialogElement && dialogElement.isConnected && dialogElement.open) {
            dialogElement.close();
        }
    }
}

const dialogImpComp = makeReactiveLithComponent(DialogImp_);

export function DialogImp<M, V>(props: DialogImpProps<M, V>): ComponentTemplate<M, V, DialogImpProps<M, V>> {
    return new ComponentTemplate(props, dialogImpComp);
}

export async function openDialog() {
    // TODO: Can pass an argument for container ref. If undefined, the container defaults to body.
    const dialogElem = document.createElement("dialog");
    document.body.insertAdjacentElement("beforeend", dialogElem);
    render(html`<div><h1>Header</h1><p>And paragraph</p></div>`, dialogElem)
    dialogElem.showModal();
    dialogElem.addEventListener('close', () => {
        dialogElem.remove();
    });
}