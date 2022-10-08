import { createPopper, Instance as Popper } from '@popperjs/core';
import { nothing } from 'lit-html';
import { createRef, RefOrCallback } from 'lit-html/directives/ref.js';
import { controllerView, html, makeObservable, observable, ref, RenderResult } from 'realithy';
import { ComponentProps } from './Component';
import styles from "./Menu.module.scss";

interface MenuTargetProps {
    toggle: () => void;
    ref: RefOrCallback;
}

interface MenuProps extends ComponentProps {
    
}

class Menu<M> {
    constructor(private source: M, private target: (m: M, p: MenuTargetProps) => RenderResult, private items: (m: M, menu: Menu<M>) => RenderResult[]) {
        makeObservable(this);
    }

    @observable
    private _open = false;

    readonly close = () => {
        this._open = false;
    }

    private _targetRef = createRef();
    private _itemContainerRef = createRef();
    private _popper?: Popper
    render(props: MenuProps) {
        const toggle = () => { this._open = !this._open; }

        return html`
        ${this.target(this.source, { ref: this._targetRef, toggle })}
        ${this._open ? html`
        <div ${ref(this._itemContainerRef)} class=${styles.itemsContainer}>
            <ul>
                ${this.items(this.source, this)}
            </ul>
        </div>` : nothing}
        `;
    }

    renderCompleted() {
        if (this._open && this._targetRef.value && this._itemContainerRef.value && !this._popper)
            this._popper = createPopper(this._targetRef.value, this._itemContainerRef.value as HTMLElement);
        else if (!this._open) {
            this._destroyPopper();
        }
    }

    private _destroyPopper() {
        if (this._popper) {
            this._popper.destroy();
            this._popper = undefined;
        }
    }
}

export const menu: <M>(source: M, target: (m: M, p: MenuTargetProps) => RenderResult, items: (m: M, menu: Menu<M>) => RenderResult[], props: MenuProps) => RenderResult = controllerView(Menu, 3);

interface MenuItemProps extends ComponentProps {
    content: string | (() => RenderResult);
}

class MenuItem {
    constructor(private menu: Menu<any>) {

    }

    render(props: MenuItemProps) {
        return html`
        <li @click=${this.menu.close}>
            ${typeof props.content === "function" ? props.content() : props.content}
        </li>`;
    }
}

export const menuItem = controllerView(MenuItem, 1);