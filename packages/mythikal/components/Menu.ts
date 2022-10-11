import { createPopper, Instance as Popper } from '@popperjs/core';
import { nothing } from 'lit-html';
import { createRef, RefOrCallback } from 'lit-html/directives/ref.js';
import { ComponentTemplate, html, makeObservable, makeReactiveLithComponent, observable, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, RepeatedTemplate, TemplateContent, unbind } from 'realithy';
import { ComponentProps } from './Component';
import styles from "./Menu.module.scss";

interface MenuProps<M, V, T = any> extends ComponentProps<M, V> {
    content: TemplateContent<M, Menu_<M, V>>;
    items: ReadonlyArray<ComponentTemplate<M, Menu_<M, V>, any>> | RepeatedTemplate<M, V, T, Menu_<M, V>>;
}

class Menu_<M, V> implements ReactiveLithComponent<M, V, MenuProps<M, V>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: MenuProps<M, V>) {
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
        // TODO: setup root ref
        const props = this.props;
        return html`
            ${renderTemplateContent(this.parent, this, props.content)}
            ${this._isOpen ? html`
            <div ${ref(this._itemsContRef)} class=${styles.itemsContainer}>
                <ul>
                    ${props.items instanceof RepeatedTemplate ? props.items.render(this.parent, this.parentView, this) :
                    props.items.map(item => item.render(this.parent, this))}
                </ul>
            </div>` :
                nothing
            }
        `;
    }

    renderCompleted() {
        if (this._isOpen && this.contentRef.value && this._itemsContRef.value && !this._popper)
            this._popper = createPopper(this.contentRef.value, this._itemsContRef.value as HTMLElement);
        else if (!this._isOpen) {
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
const menuComp = makeReactiveLithComponent(Menu_);
export function Menu<M, V, T>(props: MenuProps<M, V, T>): ComponentTemplate<M, V, MenuProps<M, V, T>> {
    return new ComponentTemplate(props, menuComp);
}

interface MenuItemProps<M, V> extends ComponentProps<M, V> {
    onClick: (m: M, v: V) => void;
    content: TemplateContent<M, V>
}
class MenuItem_<M, V extends Menu_<any, any>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: MenuItemProps<M, V>) {
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
const menuItemComp = makeReactiveLithComponent(MenuItem_);
export function MenuItem<M, V extends Menu_<any, any>>(props: MenuItemProps<M, V>): ComponentTemplate<M, V, MenuItemProps<M, V>> {
    return new ComponentTemplate(props, menuItemComp);
}
