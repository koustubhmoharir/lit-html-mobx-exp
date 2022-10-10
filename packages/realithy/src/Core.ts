import { html, nothing } from "lit-html";
import { PartInfo } from "lit-html/async-directive.js";
import { createRef, RefOrCallback } from "lit-html/directives/ref.js";
import { repeat as repeatLith } from "lit-html/directives/repeat.js";
import { makeObservable, observable, Reaction } from "mobx";
import { contentDirective } from "./directives/contentDirective";
import { ref } from "./directives/ref";
import { RenderResult } from "./render";
import { ReactiveLithDirective } from "./ReactiveDirective";
import { arrayEquals, identity } from "./Utils";
import { Model } from "./Model";


export type Primitive = string | number | boolean | bigint | null | undefined;

export class Binding<M, V, T> {
    constructor(readonly expression: (m: M, v: V) => T) { }
}

export class ModelArrayBinding<M, V, T extends Model> {
    constructor(readonly expression: (m: M, v: V) => ReadonlyArray<T>) { }
}

export class EventHandler<M, V> {
    constructor(readonly handler: (e: Event, m: M, v: V) => void) { }
}

export interface EventHandlerContext<M, V> {
    readonly parent: M;
    readonly parentView: V;
}

export class HtmlTemplate<M, V> {
    constructor(private strings: TemplateStringsArray, private values: TemplateValue<M, V>[]) {
        const ht = this;
        class HtmlTemplateDirective extends ReactiveLithDirective<[M, V]> {
            constructor(partInfo: PartInfo) {
                super(partInfo);
            }
            parent!: M;
            parentView!: V;
            storeArgs([parent, parentView]: [M, V]): void {
                this.parent = parent;
                this.parentView = parentView;
            }
            haveArgsChanged([parent, parentView]: [M, V]) {
                return this.parent !== parent || this.parentView !== parentView;
            }
            renderUntracked(): RenderResult {
                return ht.renderUntracked(this.parent, this.parentView, this);
            }
            get displayName() { return ht._displayName; }
        }
        this._directive = contentDirective(HtmlTemplateDirective);
    }
    private _displayName = "Template";
    displayName(name: string) { this._displayName = name; return this; }
    private _directive: (parent: M, parentView: V) => RenderResult;
    renderUntracked(parent: M, parentView: V, evhContext: EventHandlerContext<M, V>): RenderResult {
        return html(this.strings, ...this.values.map(v => renderTemplateValue(parent, parentView, v, evhContext)));
    }
    render(parent: M, parentView?: V): RenderResult {
        return html`${this._directive(parent, parentView!)}`;
    }
}

export class ComponentTemplate<M, V, Props> {
    constructor(private readonly props: Props, private readonly component: (parent: M, parentView: V, props: Props) => RenderResult) { }
    render(parent: M, parentView: V): RenderResult {
        return this.component(parent, parentView, this.props);
    }
}

type Template<M, V> = ComponentTemplate<M, V, any> | HtmlTemplate<M, V>;

type NoBind = Template<any, any> | Binding<any, any, any> | ModelArrayBinding<any, any, any> | EventHandler<any, any> | ReadonlyArray<Model>;

export type Bindable<M, V, T> = T extends NoBind ? unknown : (T | Binding<M, V, T>);

export type TemplateValue<M, V = any, T = any> = Primitive | RenderResult | Model | Template<M, V> | Binding<M, V, T> | ModelArrayBinding<M, V, any> | EventHandler<M, V>;

export class ArrayItem<M, Item> {
    constructor(readonly parent: M, readonly value: Item) { }
}

export class RepeatedTemplate<M, V, Item, ItemParentView> {
    constructor(
        readonly expression: (m: M, v: V) => ReadonlyArray<Item>,
        readonly template: Template<ArrayItem<M, Item>, ItemParentView>
    ) { }
    render(parent: M, parentView: V, itemParentView: ItemParentView): RenderResult {
        return renderRepeatedTemplate(parent, parentView, itemParentView, this as any);
    }
}

const RepeatLithDirective = ((repeatLith as any)() as any)["_$litDirective$"];

function makeRepeatDirective<M, V, Item, ItemParentView>() {

    type RenderArgs = [M, V, ItemParentView, RepeatedTemplate<M, V, Item, ItemParentView>];

    class RenderItemDirective extends ReactiveLithDirective<[Item, RenderArgs]> implements EventHandlerContext<ArrayItem<M, Item>, ItemParentView> {
        constructor(partInfo: PartInfo) {
            super(partInfo);
        }
        private _arrayItem!: ArrayItem<M, Item>;
        private _args!: RenderArgs;
        storeArgs([item, args]: [Item, RenderArgs]): void {
            this._arrayItem = new ArrayItem(args[0], item);
            this._args = args;
        }
        haveArgsChanged([item, args]: [Item, RenderArgs]) {
            return this._arrayItem!.value !== item || this._args !== args;
        }
        
        get parent() { return this._arrayItem; }
        get parentView() { return this._args[2]; } // This is probably not a useful parent
        renderUntracked() {
            const args = this._args!;
            const template = args[3].template;
            const itemParentView = args[2];
            return template instanceof HtmlTemplate ? template.renderUntracked(this._arrayItem!, itemParentView, this) : template.render(this._arrayItem!, itemParentView);
        }
        get displayName() { return "RepeatItem" }
    }
    const renderItem = contentDirective(RenderItemDirective);

    class ReactiveRepeatDirective extends ReactiveLithDirective<RenderArgs> {
        constructor(partInfo: PartInfo) {
            super(partInfo);
            this._renderItem = this._renderItem.bind(this);
            this._repeat = new RepeatLithDirective(partInfo);
        }
        private _repeat: any;
        private _args?: RenderArgs;
        storeArgs(args: RenderArgs): void {
            this._args = args;
        }
        haveArgsChanged(args: RenderArgs) {
            return !arrayEquals(this._args!, args);
        }
        _renderItem(item: Item) {
            return html`${renderItem(item, this._args as any)}`;
        }
        renderUntracked() {
            const args = this._args!;
            const binding = args![3];
            const array = binding.expression(args[0], args[1]);
            return this._repeat.render(array, identity, this._renderItem);
        }
        get displayName() { return "Repeat"; }
    }

    const directive = contentDirective(ReactiveRepeatDirective);
    return (parent: M, parentView: V, itemParentView: ItemParentView, template: RepeatedTemplate<M, V, Item, ItemParentView>) => html`${directive(parent, parentView, itemParentView, template)}`;
}
const renderRepeatedTemplate: <M, V, Item, ItemParentView>(parent: M, parentView: V, itemParentView: ItemParentView, binding: RepeatedTemplate<M, V, Item, ItemParentView>) => RenderResult = makeRepeatDirective();

function makeModelArrayDirective<M, V, Item extends Model>() {
    type RenderArgs = [M, V, ModelArrayBinding<M, V, Item>];

    const renderItem = (item: Item) => item.render();

    class ModelArrayDirective extends ReactiveLithDirective<RenderArgs> {
        constructor(partInfo: PartInfo) {
            super(partInfo);
            this._repeat = new RepeatLithDirective(partInfo);
        }
        private _repeat: any;
        private _args?: RenderArgs;
        storeArgs(args: RenderArgs): void {
            this._args = args;
        }
        haveArgsChanged(args: RenderArgs) {
            return !arrayEquals(this._args!, args);
        }
        renderUntracked() {
            const args = this._args!;
            const binding = args![2];
            const array = binding.expression(args[0], args[1]);
            return this._repeat.render(array, identity, renderItem);
        }
        get displayName() { return "Array"; }
    }

    const directive = contentDirective(ModelArrayDirective);
    return (parent: M, parentView: V, binding: ModelArrayBinding<M, V, Item>) => html`${directive(parent, parentView, binding)}`;
}
const renderModelArray: <M, V, Item extends Model>(parent: M, parentView: V, binding: ModelArrayBinding<M, V, Item>) => RenderResult = makeModelArrayDirective();

const eventHandlers = new WeakMap<EventHandlerContext<any, any>, Map<EventHandler<any, any>, (e: Event) => void>>();
function getOrCreateHandler<M, V>(evhContext: EventHandlerContext<M, V>, eh: EventHandler<M, V>) {
    let map = eventHandlers.get(evhContext);
    if (map === undefined)
        eventHandlers.set(evhContext, map = new Map());
    let handler = map.get(eh);
    if (handler === undefined) {
        const h = eh.handler;
        map.set(eh, handler = (e: Event) => h(e, evhContext.parent, evhContext.parentView));
    }
    return handler;
}

export function renderTemplateValue<M, V, T = any>(m: M, v: V, t: TemplateValue<M, V, T>, evhContext: EventHandlerContext<M, V>): Primitive | ((e: Event) => void) | RenderResult {
    let o: unknown = t;
    if (t instanceof HtmlTemplate || t instanceof ComponentTemplate)
        o = t.render(m, v);
    else if (t instanceof Binding)
        o = t.expression(m, v);
    else if (t instanceof ModelArrayBinding)
        return renderModelArray(m, v, t);
    else if (t instanceof EventHandler)
        return getOrCreateHandler(evhContext, t);
    const r = (o as any).render;
    if (typeof r === "function")
        o = r.call(o);
    if ((typeof o === "object" && o !== null && !("values" in o)) || typeof o === "function" || typeof o === "symbol")
        throw new Error("Encountered an unrenderable value")
    return o as any;
}

export function bind<M, V, T>(expression?: (m: M, v: V) => T): T extends NoBind ? unknown : Binding<M, V, T> { return new Binding(expression ?? identity as any) as any; }

export function unbind<M, V, B>(m: M, v: V, b: B): B extends Binding<M, V, infer T> ? T : B {
    return b instanceof Binding ? b.expression(m, v) : b;
}

export function repeat<M, V, Item, ItemParentView>(expression: (m: M, v: V) => ReadonlyArray<Item>, component: ComponentTemplate<ArrayItem<M, Item>, ItemParentView, any>): RepeatedTemplate<M, V, Item, ItemParentView> {
    return new RepeatedTemplate(expression, component);
}

export function bindArray<M, V, Item extends Model>(expression: (m: M, v: V) => ReadonlyArray<Item>): ModelArrayBinding<M, V, Item> {
    return new ModelArrayBinding(expression);
}

export function handleEvent<M, V>(handler: (e: Event, m: M, v: V) => void): EventHandler<M, V> {
    return new EventHandler(handler);
}

export function template<M, V = any>(strings: TemplateStringsArray, ...values: TemplateValue<M, V>[]): HtmlTemplate<M, V> {
    return new HtmlTemplate(strings, values);
}

export interface ReactiveLithComponent<M, V, Props> {
    readonly parent: M;
    readonly parentView: V;
    readonly props: Props;
    render(): RenderResult;
    renderCompleted?(): void;
    disconnected?(): void;
    reconnected?(): void;
}

export interface ReactiveLithComponentConstructor<M, V, Props> {
    new(parent: M, parentView: V, props: Props): ReactiveLithComponent<M, V, Props>;
}

export function makeReactiveLithComponent<Props, M = any, V = any>(cls: ReactiveLithComponentConstructor<M, V, Props>) {
    type Args = [M, V, Props];
    type Comp = InstanceType<typeof cls>;
    class LithCompDirective extends ReactiveLithDirective<Args> {
        constructor(partInfo: PartInfo) {
            super(partInfo);
        }
        private _comp?: Comp;
        get lifecycleMethods() { return this._comp; }
        storeArgs([parent, parentView, props]: Args) {
            this._comp = new cls(parent, parentView, props);
        }
        haveArgsChanged([parent, parentView, props]: Args) {
            const oldComp = this._comp!;
            return parent !== oldComp.parent || parentView !== oldComp.parentView || props !== oldComp.props;
        }
        get displayName() { return cls.name; }
        renderUntracked(): RenderResult {
            return this._comp!.render();
        }
    }
    const dir = contentDirective(LithCompDirective);
    return (m: M, v: V, p: Props) => html`${dir(m, v, p)}`;
}

