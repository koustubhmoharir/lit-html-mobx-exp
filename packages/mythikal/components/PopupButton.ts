import { createPopper, Instance as Popper } from '@popperjs/core';
import { nothing } from 'lit-html';
import { createRef, RefOrCallback } from 'lit-html/directives/ref.js';
import { ComponentTemplate, html, makeObservable, makeReactiveLithComponent, observable, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, RepeatedTemplate, TemplateContent, unbind } from 'realithy';
import { ComponentProps } from './Component';
import styles from "./PopupButton.module.scss";

interface PopupButtonProps<M, V, T = any> extends ComponentProps<M, V> {
    content: TemplateContent<M, PopupButton_<M, V>>;
    items: ReadonlyArray<ComponentTemplate<M, PopupButton_<M, V>, any>> | RepeatedTemplate<M, V, T, PopupButton_<M, V>>;
}

class PopupButton_<M, V> implements ReactiveLithComponent<M, V, PopupButtonProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: PopupButtonProps<M, V>) {
        makeObservable(this);
    }
    readonly contentRef = createRef();
    private readonly _itemsContRef = createRef();
    private _popper?: Popper

    @observable
    private _isOpen = false;
    get isOpen() { return this._isOpen; }

    toggle() { this._isOpen = !this._isOpen; }

    open() { this._isOpen = true; }

    close() { this._isOpen = false; }

    render() {
        const props = this.props;
        return html`
            <div ${ref(this.contentRef)} style="width: fit-content; display: inline-block">
                ${renderTemplateContent(this.parent, this, props.content)}
            </div>
            ${this._isOpen ? html`
            <dialog ${ref(this._itemsContRef)} class="${styles.itemsContainer} ${styles.noBackdrop}">
                <ul>
                    ${props.items instanceof RepeatedTemplate ? props.items.render(this.parent, this.parentView, this) :
                    props.items.map(item => item.render(this.parent, this))}
                </ul>
            </dialog>` :
                nothing
            }
        `;
    }

    renderCompleted() {
        let dialogElement = this._itemsContRef.value as HTMLDialogElement;
        if (this._isOpen && this.contentRef.value && dialogElement && !this._popper) {
            dialogElement.showModal();
            this._popper = createPopper(this.contentRef.value, dialogElement, { placement: 'bottom' });
        }
        else if (!this._isOpen) {
            //dialogElement.close();
            this._destroyPopper();
        }
    }

    disconnected() {
        this._destroyPopper();
    }

    private _destroyPopper() {
        if (this._popper) {
            this._popper.destroy();
            this._popper = undefined;
        }
    }
}
const PopupButtonComp = makeReactiveLithComponent(PopupButton_);
export function PopupButton<M, V, T>(props: PopupButtonProps<M, V, T>): ComponentTemplate<M, V, PopupButtonProps<M, V, T>> {
    return new ComponentTemplate(props, PopupButtonComp);
}