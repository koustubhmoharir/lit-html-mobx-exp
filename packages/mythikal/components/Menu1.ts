import { createPopper, Instance as Popper } from '@popperjs/core';
import { nothing } from 'lit-html';
import { createRef, RefOrCallback } from 'lit-html/directives/ref.js';
import { Bindable, ComponentTemplate, html, makeObservable, makeReactiveLithComponent, observable, ReactiveLithComponent, ref, RenderResult, renderTemplateContent, RepeatedTemplate, TemplateContent, unbind } from 'realithy';
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
            <div ${ref(this.contentRef)} style="width: fit-content; display: inline-block">
                ${renderTemplateContent(this.parent, this, props.content)}
            </div>
            ${this._isOpen ? html`
                <dialog ${ref(this._itemsContRef)} class="${styles.itemsContainer} ${styles.noBackdrop}" style="padding: 0">
                    <ul style="margin: 0; padding: 0.5em 0; list-style-type: none; min-width: 7em">
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
            this._popper = createPopper(this.contentRef.value, dialogElement, {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            altAxis: true,
                        }
                    }
                ]
            });
            const current = this;
            dialogElement.addEventListener('click', function (event) { // TODO: Check and clean up event listener
                let rect = dialogElement.getBoundingClientRect();
                let isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
                if (!isInDialog) {
                    dialogElement.close();
                    current.close();
                }
            });
            dialogElement.addEventListener('close', () => current.close());
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
    content: TemplateContent<M, V>;
    interactable?: Bindable<M, V, boolean>;
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
        const interactable = (props.interactable == undefined) ? true : unbind(this.parent, this.parentView, props.interactable);
        return html`
            <li ${ref(root)} tabindex="${interactable ? 0 : -1}" @focus=${(e: FocusEvent) => {
                const current = e.target as HTMLLIElement;
                if (current.classList.contains(styles.disabled)) {
                    const enabledItems = [...current.parentElement!.children].filter(c => (c.nodeName === "LI") && !c.classList.contains(styles.disabled));
                    if (enabledItems.length === 0) {
                        console.log("blur");
                        current.blur();
                    }
                    else {
                        (enabledItems[0] as HTMLLIElement)?.focus();
                    }
                }
            }} @click=${this} @keydown=${(e: KeyboardEvent) => {
                if (e.key === "Enter") this.handleEvent();
                if ((e.key !== "ArrowUp") && (e.key !== "ArrowDown")) return;
                e.preventDefault();
                const current = e.target as HTMLLIElement;
                const first = current.parentElement!.firstElementChild as HTMLLIElement;
                const last = current.parentElement!.lastElementChild as HTMLLIElement;
                if (first === last) return;
                else if (e.key === "ArrowUp") {
                    let prev = (current === first) ? last : current.previousElementSibling;
                    while (prev!.nodeName === "HR" || prev!.classList.contains(styles.disabled)) {
                        prev = (prev === first) ? last : prev!.previousElementSibling;
                    }
                    (prev as HTMLLIElement).focus();
                }
                else if (e.key === "ArrowDown") {
                    let next = (current === last) ? first : current.nextElementSibling;
                    while (next!.nodeName === "HR" || next!.classList.contains(styles.disabled)) {
                        next = (next === last) ? first : next!.nextElementSibling;
                    }
                    (next as HTMLLIElement).focus();
                }
            }} class="${styles.menuItem} ${interactable ? "" : styles.disabled}" style="padding: 0 1em">
                ${renderTemplateContent(this.parent, this.parentView, props.content)}
            </li>
        `;
    }
}
const menu1ItemComp = makeReactiveLithComponent(Menu1Item_);
export function Menu1Item<M, V extends Menu1_<any, any>>(props: Menu1ItemProps<M, V>): ComponentTemplate<M, V, Menu1ItemProps<M, V>> {
    return new ComponentTemplate(props, menu1ItemComp);
}

class Menu1Separator_<M, V> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: {}) {
    }

    render() {
        return html`
            <hr>
        `;
    }
}
const menu1SeparatorComp = makeReactiveLithComponent(Menu1Separator_);
export function Menu1Separator<M, V>(props: {}): ComponentTemplate<M, V, {}> {
    return new ComponentTemplate(props, menu1SeparatorComp);
}