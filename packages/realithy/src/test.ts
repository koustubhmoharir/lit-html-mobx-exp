import { html, noChange, nothing, Part } from "lit-html";
import { AsyncDirective, PartInfo } from "lit-html/async-directive.js";
import { repeat as repeatLith } from "lit-html/directives/repeat.js";
import { createRef, RefOrCallback } from "lit-html/directives/ref.js";
import { makeObservable, observable, Reaction } from "mobx";
import { contentDirective } from "./directives/contentDirective";
import { ref } from "./directives/ref";
import { pushCompleteRender, renderInContext, RenderResult } from "./render";

export type Primitive = string | number | boolean | bigint | null | undefined;
interface Model {
    readonly parent: Model | undefined;
    render(): RenderResult;
}

export class Binding<M, V, T> {
    constructor(private expression: (m: M, v: V) => T) { }
    get(m: M, v: V) { return this.expression(m, v); }
}

export const identity = <M>(m: M) => m;

export function bind<M, V, T>(expression?: (m: M, v: V) => T): Binding<M, V, T> { return new Binding(expression ?? identity as any); }

type Template<M, V> = ComponentTemplate<M, V, any> | HtmlTemplate<M, V>;

export type Bindable<M, V, T> = T extends Template<any, any> | Binding<any, any, any> ? never : (T | Binding<M, V, T>);

export type TemplValue<M, V = any, T = any> = Primitive | RenderResult | Model | Template<M, V> | Binding<M, V, T>;

function unbind<M, V, B>(m: M, v: V, b: B): B extends Binding<M, V, infer T> ? T : B {
    return b instanceof Binding ? b.get(m, v) : b;
}

function arrayEquals(arr1: any[], arr2: any[]) {
    if (arr1.length !== arr2.length) return false;
    for (let index = 0; index < arr1.length; index++) {
        const element1 = arr1[index];
        const element2 = arr2[index];
        if (!Object.is(element1, element2))
            return false;
    }
    return true;
}

const RepeatLithDirective = ((repeatLith as any)() as any)["_$litDirective$"];

function makeReactiveRepeat<M, V, Item, ItemParentView>() {

    type RenderArgs = [M, V, ItemParentView, RepeatBinding<M, V, Item, ItemParentView>];

    class RenderItemDirective extends AsyncDirective {
        constructor(partInfo: PartInfo) {
            super(partInfo);
            this._rerender = this._rerender.bind(this);
        }
        private _reaction?: Reaction;
        private _connect() {
            this._reaction = new Reaction(this.constructor.name, this._rerender);
        }
        private _part?: Part;
        private _arrayItem?: ArrayItem<M, Item>;
        private _args?: RenderArgs;
        private _isDirty = false;
        render(item: Item, args: RenderArgs) {
            if (!this._arrayItem)
                this._arrayItem = new ArrayItem(args[0], item);
            this._args = args;
            this.renderUntracked();
        }
        renderUntracked() {
            const args = this._args!;
            const template = args[3].template;
            const itemParentView = args[2];
            return template instanceof HtmlTemplate ? template.renderUntracked(this._arrayItem!, itemParentView) : template.render(this._arrayItem!, itemParentView);
        }

        update(part: Part, [item, args]: [Item, RenderArgs]) {
            if (this._part && part !== this._part) {
                throw new Error("part changed"); // TODO: When does this occur?
            }
            this._part = part;
            const oldArrayItem = this._arrayItem;
            const oldArgs = this._args;
            this._isDirty = oldArrayItem === undefined || oldArrayItem.value !== item || oldArgs !== args;
            if (this._isDirty) {
                this._arrayItem = new ArrayItem(args[0], item);
                this._args = args;
            }
                
            if (!this.isConnected)
                return noChange;
            if (oldArgs === undefined)
                this._connect();
            if (this._isDirty)
                return this.updateReactive();
            return noChange;
        }
        protected updateReactive() {
            this._isDirty = false;
            let result;
            this._reaction!.track(() => {
                result = this.renderUntracked();
            });
            return result;
        }
        private _rerender() {
            if (!this.isConnected) {
                this._isDirty = true;
                return;
            }
            this._rerenderActual();
        };
        private _rerenderActual() {
            renderInContext(this._updateValue, this);
        }
        private _updateValue() {
            this.setValue(this.updateReactive())
        }

        disconnected() {
            this._reaction?.dispose();
            this._reaction = undefined;
        }
        reconnected() {
            this._connect();
            if (this._isDirty) this._rerenderActual();
        }
    }
    const renderItem = contentDirective(RenderItemDirective);
    
    class ReactiveRepeatDirective extends AsyncDirective {
        constructor(partInfo: PartInfo) {
            super(partInfo);
            this._rerender = this._rerender.bind(this);
            this._renderItem = this._renderItem.bind(this);
            this._repeat = new RepeatLithDirective(partInfo);
        }
        private _reaction?: Reaction;
        private _connect() {
            this._reaction = new Reaction(this.constructor.name, this._rerender);
        }
        private _part?: Part;
        private _repeat: any;
        private _args?: RenderArgs;
        private _isDirty = false;
        render(...args: RenderArgs) {
            this._args = args;
            this.renderUntracked();
        }
        _renderItem(item: Item) {
            return html`${renderItem(item, this._args!)}`;
        }
        renderUntracked() {
            const args = this._args!;
            const binding = args![3];
            const array = binding.expression(args[0], args[1]);
            return this._repeat.render(array, identity, this._renderItem);
        }

        update(part: Part, args: RenderArgs) {
            if (this._part && part !== this._part) {
                throw new Error("part changed"); // TODO: When does this occur?
            }
            this._part = part;
            const oldArgs = this._args;
            this._isDirty = oldArgs === undefined || !arrayEquals(oldArgs, args);
            if (this._isDirty)
                this._args = args;
            if (!this.isConnected)
                return noChange;
            if (oldArgs === undefined)
                this._connect();
            if (this._isDirty)
                return this.updateReactive();
            return noChange;
        }
        protected updateReactive() {
            this._isDirty = false;
            let result;
            this._reaction!.track(() => {
                result = this.renderUntracked();
            });
            return result;
        }
        private _rerender() {
            if (!this.isConnected) {
                this._isDirty = true;
                return;
            }
            this._rerenderActual();
        };
        private _rerenderActual() {
            renderInContext(this._updateValue, this);
        }
        private _updateValue() {
            this.setValue(this.updateReactive())
        }

        disconnected() {
            this._reaction?.dispose();
            this._reaction = undefined;
        }
        reconnected() {
            this._connect();
            if (this._isDirty) this._rerenderActual();
        }
    }

    const dir = contentDirective(ReactiveRepeatDirective);
    return (parent: M, parentView: V, itemParentView: ItemParentView, binding: RepeatBinding<M, V, Item, ItemParentView>) => html`${dir(parent, parentView, itemParentView, binding)}`;
}

const repeatComponent = makeReactiveRepeat();

function renderTemplValue<M, V, T = any>(m: M, v: V, t: TemplValue<M, V, T>): Primitive | RenderResult {
    let o: unknown = t;
    if (t instanceof HtmlTemplate || t instanceof ComponentTemplate)
        o = t.render(m, v);
    else if (t instanceof Binding)
        o = t.get(m, v);
    const r = (o as any).render;
    if (typeof r === "function")
        o = r.call(o);
    if ((typeof o === "object" && o !== null && !("values" in o)) || typeof o === "function" || typeof o === "symbol")
        throw new Error("Encountered an unrenderable value")
    return o as any;
}

class ArrayItem<M, Item> {
    constructor(readonly parent: M, readonly value: Item) { }
}

export class RepeatBinding<M, V, Item, ItemParentView> {
    constructor(
        readonly expression: (m: M, v: V) => ReadonlyArray<Item>,
        readonly template: Template<ArrayItem<M, Item>, ItemParentView>
    ) { }
    render(parent: M, parentView: V, itemParentView: ItemParentView): RenderResult {
        return repeatComponent(parent, parentView, itemParentView, this as any);
    }
}

export function repeat<M, V, Item, ItemParentView>(expression: (m: M, v: V) => ReadonlyArray<Item>, component: ComponentTemplate<ArrayItem<M, Item>, ItemParentView, any>): RepeatBinding<M, V, Item, ItemParentView> {
    return new RepeatBinding(expression, component);
}

export class HtmlTemplate<M, V> {
    constructor(private strings: TemplateStringsArray, private values: TemplValue<M, V>[]) {
        const ht = this;
        class HtmlTemplateDirective extends AsyncDirective {
            constructor(partInfo: PartInfo) {
                super(partInfo);
                this._rerender = this._rerender.bind(this);
            }
            private _reaction?: Reaction;
            private _connect() {
                this._reaction = new Reaction(this.constructor.name, this._rerender);
            }
            private _part?: Part;
            private _parent?: M;
            private _parentView?: V;
            private _isDirty = false;
            render(parent: M, parentView: V) {
                this._parent = parent;
                this._parentView = parentView;
                return ht.renderUntracked(this._parent, this._parentView);
            }

            update(part: Part, [parent, parentView]: [M, V]) {
                if (this._part && part !== this._part) {
                    throw new Error("part changed"); // TODO: When does this occur?
                }
                this._part = part;
                const oldParent = this._parent;
                const oldParentView = this._parentView;
                this._isDirty = parent !== oldParent || parentView !== oldParentView;
                this._parent = parent;
                this._parentView = parentView;
                if (!this.isConnected)
                    return noChange;
                if (oldParent === undefined)
                    this._connect();
                if (this._isDirty)
                    return this.updateReactive();
                return noChange;
            }
            protected updateReactive() {
                this._isDirty = false;
                let result;
                this._reaction!.track(() => {
                    result = ht.renderUntracked(this._parent!, this._parentView!);
                });
                return result;
            }
            private _rerender() {
                if (!this.isConnected) {
                    this._isDirty = true;
                    return;
                }
                this._rerenderActual();
            };
            private _rerenderActual() {
                renderInContext(this._updateValue, this);
            }
            private _updateValue() {
                this.setValue(this.updateReactive())
            }

            disconnected() {
                this._reaction?.dispose();
                this._reaction = undefined;
            }
            reconnected() {
                this._connect();
                if (this._isDirty) this._rerenderActual();
            }
        }
        this._directive = contentDirective(HtmlTemplateDirective);
    }
    private _directive: (parent: M, parentView: V) => RenderResult;
    renderUntracked(parent: M, parentView: V): RenderResult {
        return html(this.strings, ...this.values.map(v => renderTemplValue(parent, parentView, v)));
    }
    render(parent: M, parentView: V): RenderResult {
        return html`${this._directive(parent, parentView)}`;
    }
}

export class ComponentTemplate<M, V, Props> {
    constructor(private readonly props: Props, private readonly component: (parent: M, parentView: V, props: Props) => RenderResult) { }
    render(parent: M, parentView: V) : RenderResult {
        return this.component(parent, parentView, this.props);
    }
}

export function template<M, V = any>(strings: TemplateStringsArray, ...values: TemplValue<M, V>[]): HtmlTemplate<M, V> {
    return new HtmlTemplate(strings, values);
}

interface LithComp<M, V, Props> {
    readonly parent: M;
    readonly parentView: V;
    readonly props: Props;
    render(): RenderResult;
    renderCompleted?(): void;
    disconnected?(): void;
    reconnected?(): void;
}

interface LithCompConstructor<M, V, Props> {
    new(parent: M, parentView: V, props: Props): LithComp<M, V, Props>;
}

function makeLithComp<Props, M = any, V = any>(cls: LithCompConstructor<M, V, Props>) {
    type Args = [M, V, Props];
    type Comp = InstanceType<typeof cls>;
    class LithCompDirective extends AsyncDirective {
        constructor(partInfo: PartInfo) {
            super(partInfo);
            this._rerender = this._rerender.bind(this);
        }
        private _reaction?: Reaction;
        private _connect() {
            this._reaction = new Reaction(cls.name, this._rerender);
        }
        private _part?: Part;
        private _comp?: Comp;
        private _isDirty = false;
        render(parent: M, parentView: V, props: Props) {
            if (!this._comp) {
                this._comp = new cls(parent, parentView, props);
            }
            return this._comp.render();
        }

        update(part: Part, [parent, parentView, props]: Args) {
            if (this._part && part !== this._part) {
                throw new Error("part changed"); // TODO: When does this occur?
            }
            this._part = part;

            const oldComp = this._comp;
            this._isDirty = oldComp === undefined || parent !== oldComp.parent || parentView !== oldComp.parentView || props !== oldComp.props;
            if (this._isDirty) {
                if (oldComp !== undefined)
                    oldComp.disconnected?.();
                this._comp = new cls(parent, parentView, props);
            }
            if (!this.isConnected)
                return noChange;
            if (oldComp === undefined)
                this._connect();
            if (this._isDirty)
                return this.updateReactive();
            return noChange;
        }
        protected updateReactive() {
            this._isDirty = false;
            const comp = this._comp!;
            if (comp.renderCompleted) {
                pushCompleteRender(comp);
            }
            let result;
            this._reaction!.track(() => {
                result = comp.render();
            });
            return result;
        }
        private _rerender() {
            if (!this.isConnected) {
                this._isDirty = true;
                return;
            }
            this._rerenderActual();
        }
        private _rerenderActual() {
            renderInContext(this._updateValue, this);
        }
        private _updateValue() {
            this.setValue(this.updateReactive())
        }

        disconnected() {
            this._comp?.disconnected?.();
            this._reaction?.dispose();
            this._reaction = undefined;
        }
        reconnected() {
            this._connect();
            this._comp?.reconnected?.();
            if (this._isDirty) this._rerenderActual();
        }
    }
    const dir = contentDirective(LithCompDirective);
    return (m: M, v: V, p: Props) => html`${dir(m, v, p)}`;
}

interface ButtonProps<M, V> {
    onClick: (m: M, v: V) => void;
    label: Bindable<M, V, string>;
    content?: TemplValue<M, V>;
    root?: Bindable<M, V, RefOrCallback>;
}

class Button<M, V> implements LithComp<M, V, ButtonProps<M, V>> {
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
            ${content === undefined ? label : renderTemplValue(parent, parentView, content)}
        </button>`;
    }
}

const buttonComp = makeLithComp(Button);

export function button<M, V>(props: ButtonProps<M, V>): ComponentTemplate<M, V, ButtonProps<M, V>> {
    return new ComponentTemplate(props, buttonComp);
}

interface MenuProps<M, V, T = any> {
    content: TemplValue<M, Menu<M, V>>;
    items: ReadonlyArray<ComponentTemplate<M, Menu<M, V>, any>> | RepeatBinding<M, V, T, Menu<M, V>>;
}

class Menu<M, V> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: MenuProps<M, V>) {
        makeObservable(this);
    }
    readonly contentRef = createRef();

    private readonly _itemsContRef = createRef();

    @observable
    private _isOpen = false;
    get isOpen() { return this._isOpen; }

    toggle() { this._isOpen = !this._isOpen; }

    open() { this._isOpen = true; }

    close() { this._isOpen = false; }

    render() {
        const props = this.props;
        return html`
            ${renderTemplValue(this.parent, this, props.content)}
            ${this._isOpen ? html`
            <div ${ref(this._itemsContRef)}>
                <ul>
                    ${props.items instanceof RepeatBinding ? props.items.render(this.parent, this.parentView, this) : props.items.map(item => item.render(this.parent, this))}
                </ul>
            </div>` :
            nothing
            }
        `;
    }
}
const menuComp = makeLithComp(Menu);
export function menu<M, V, T>(props: MenuProps<M, V, T>): ComponentTemplate<M, V, MenuProps<M, V, T>> {
    return new ComponentTemplate(props, menuComp);
}

interface MenuItemProps<M, V> {
    onClick: (m: M, v: V) => void;
    content: TemplValue<M, V>
}
class MenuItem<M, V extends Menu<any, any>> {
    constructor(readonly parent: M, readonly parentView: V, readonly props: MenuItemProps<M, V>) {
    }

    handleEvent() {
        this.parentView.close();
        this.props.onClick?.(this.parent, this.parentView);
    }

    render() {
        const props = this.props;
        return html`
            <li @click=${this}>
                ${renderTemplValue(this.parent, this.parentView, props.content)}
            </li>
        `;
    }
}
const menuItemComp = makeLithComp(MenuItem);
export function menuItem<M, V extends Menu<any, any>>(props: MenuItemProps<M, V>): ComponentTemplate<M, V, MenuItemProps<M, V>> {
    return new ComponentTemplate(props, menuItemComp);
}

function if_() {

}

export class Test {
    constructor() {
        for (let index = 0; index < 5; index++) {
            this.options.push(String(Math.random()));
        }
        this.selectedOption = this.options[0];
        makeObservable(this);
    }

    @observable
    counter = 0;

    @observable
    step = 1;

    @observable
    options = observable.array([] as string[]);

    @observable
    selectedOption = "";

    increment() {
        this.counter += this.step;
        const i = Math.round(Math.random() * this.options.length + 2);
        if (i >= this.options.length || this.options.length < 3)
            this.options.push(String(Math.random()));
        else if (i < 2)
            this.options.splice(i, 1);
        else
            this.options[i] = String(Math.random());
    }

    static template = template<Test>`
        <div>
            <span>Click count is:</span>
            <span>${bind(m => m.counter)}</span>
            <br>
            ${button({ onClick: m => m.increment(), label: "Increment" })}
            <br>
            <span>Increment by: </span>
            ${menu({
                content: button({ label: bind(m => String(m.step)), onClick: (_, v) => v.toggle(), root: bind((_, v) => v.contentRef) }),
                items: [1, 2, 3].map(i =>
                    menuItem({ content: String(i), onClick: m => m.step = i })
                )
            })}
            <br>
            <span>Random options (generated on each increment): </span>
            ${menu<Test, any, string>({
                content: button({ label: bind(m => m.selectedOption || "(None)"), onClick: (_, v) => v.toggle(), root: bind((_, v) => v.contentRef) }),
                items: repeat(m => m.options, menuItem({ content: bind(item => item.value), onClick: item => item.parent.selectedOption = item.value }))
            })}
        </div>
    `;

    render() {
        return Test.template.render(this, undefined);
    }
}
