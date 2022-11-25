import { createPopper, Instance as Popper } from '@popperjs/core';
import { nothing } from 'lit-html';
import { createRef, RefOrCallback } from 'lit-html/directives/ref.js';
import { ComponentTemplate, html, makeObservable, makeReactiveLithComponent, observable, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, RepeatedTemplate, TemplateContent, unbind } from 'realithy';
import { ComponentProps } from './Component';
import styles from "./Menu1.module.scss";

interface Menu1Props<M, V, T = any> extends ComponentProps<M, V> {
    content: TemplateContent<M, Menu1_<M, V>>;
    items: ReadonlyArray<ComponentTemplate<M, Menu1_<M, V>, any>> | RepeatedTemplate<M, V, T, Menu1_<M, V>>;
}

class Menu1_<M, V> implements ReactiveLithComponent<M, V, Menu1Props<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: Menu1Props<M, V>) {
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
            <div ${ref(this.contentRef)}>
                ${renderTemplateContent(this.parent, this, props.content)}
            </div>
            ${this._isOpen ? html`
            <dialog ${ref(this._itemsContRef)} class=${styles.itemsContainer}>
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
            this._popper = createPopper(this.contentRef.value, dialogElement);
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
const menu1Comp = makeReactiveLithComponent(Menu1_);
export function Menu1<M, V, T>(props: Menu1Props<M, V, T>): ComponentTemplate<M, V, Menu1Props<M, V, T>> {
    return new ComponentTemplate(props, menu1Comp);
}

interface Menu1ItemProps<M, V> extends ComponentProps<M, V> {
    onClick: (m: M, v: V) => void;
    content: TemplateContent<M, V>
}
class Menu1Item_<M, V extends Menu1_<any, any>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: Menu1ItemProps<M, V>) {
    }

    handleEvent() {
        this.parentView.close();
        this.props.onClick?.(this.parent, this.parentView);
    }

    render() {
        const props = this.props;
        const root = unbind(this.parent, this.parentView, props.root);
        return html`
            <li ${ref(root)} @click=${this}>
                ${renderTemplateContent(this.parent, this.parentView, props.content)}
            </li>
        `;
    }
}
const menu1ItemComp = makeReactiveLithComponent(Menu1Item_);
export function Menu1Item<M, V extends Menu1_<any, any>>(props: Menu1ItemProps<M, V>): ComponentTemplate<M, V, Menu1ItemProps<M, V>> {
    return new ComponentTemplate(props, menu1ItemComp);
}
