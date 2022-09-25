import { directive, DirectiveResult } from "lit-html/directive.js";
import { Keyed, keyed, MultiKeyed, multiKeyed } from "./directives/keyed";
import { shallowEqual } from "./shallowEqual"
import { ReactiveDirective } from "./ReactiveDirective";
import { safeIndex } from "./Utils";

interface State<Props> {
    render(props: Props): unknown;
    renderCompleted?(): void;
    disconnected?(): void;
    reconnected?(): void;
}

interface StateConstructor<Args extends unknown[], Props> {
    new(...args: Args): State<Props>;
}

type Component<Args extends unknown[], Props> = (...args: [...Args, Props]) => unknown;

export function controllerView<Args extends unknown[], Props>(cls: StateConstructor<Args, Props>, keys: Args["length"]): Component<Args, Props> {
    type RArgs = [...Args, Props];
    class ComponentDirective extends ReactiveDirective<RArgs> {
        private state?: State<Props>;
        render(...rr: RArgs) {
            console.log("render", cls.name);
            if (this.state === undefined) {
                const args = keys === rr.length ? rr : rr.slice(0, keys);
                this.state = new (cls as any)(...args);
            }
            return this.state!.render.call(this.state!, safeIndex(rr, keys) as Props);
        }
        protected skipUpdate(o: RArgs, n: RArgs) {
            return shallowEqual(safeIndex(o, keys), safeIndex(n, keys));
        }
        protected get renderCompleteCallback() {
            return this.state?.renderCompleted?.bind(this.state);
        }
        disconnected() {
            if (this.state?.disconnected) this.state.disconnected();
            super.disconnected();
        }
        reconnected() {
            super.reconnected();
            if (this.state?.reconnected) this.state.reconnected();
        }
    }

    const dir = directive(ComponentDirective);
    return (...rr: RArgs) => multiKeyed(dir(...rr), rr.slice(0, rr.length - 1));
}

interface ViewState<Model> {
    readonly model: Model;
    renderCompleted?(): void;
    disconnected?(): void;
    reconnected?(): void;
}
interface ViewStateConstructor<Model, C extends ViewState<Model>> {
    new(model: Model): C;
}

export function innerView<Model>(template: (this: Model) => unknown): (model: Model) => DirectiveResult<typeof Keyed>;

export function innerView<Model, VS extends ViewState<Model>>(template: (this: Model, vm: VS) => unknown, ViewStateClass: ViewStateConstructor<Model, VS>): (model: Model) => DirectiveResult<typeof Keyed>;

export function innerView<Model, VS extends ViewState<Model> | {} = {}>(template: (this: Model, vm: VS) => unknown, ViewStateClass?: VS extends ViewState<Model> ? ViewStateConstructor<Model, VS> : undefined) {
    const dir = ViewStateClass ? makeViewStateDirective(template as any, ViewStateClass) : makeStatelessDiretive(template as any);
    return (m: Model) => keyed(dir(m), m);
}
function makeStatelessDiretive<Model>(template: () => unknown) {
    class ComponentDirective extends ReactiveDirective<[Model]> {
        render(m: Model) {
            return template.call(m);
        }
        protected get renderCompleteCallback() { return undefined; }
        protected skipUpdate([oldM]: [Model], [newM]: [Model]) {
            if (oldM !== newM) throw new Error("Model changed unexpectedly");
            return true;
        }
    }

    return directive(ComponentDirective);
}
function makeViewStateDirective<Model, VS extends ViewState<Model>>(template: (this: Model, vm: VS) => unknown, ViewStateClass: ViewStateConstructor<Model, VS>) {
    class ComponentDirective extends ReactiveDirective<[Model]> {
        private _vm?: VS;
        render(m: Model) {
            if (!this._vm)
                this._vm = new ViewStateClass(m);
            return template.call(this._vm.model, this._vm);
        }
        protected get renderCompleteCallback() {
            return this._vm?.renderCompleted?.bind(this._vm);
        }
        protected skipUpdate([oldM]: [Model], [newM]: [Model]) {
            if (oldM !== newM) throw new Error("Model changed unexpectedly");
            return true;
        }
        disconnected() {
            this._vm?.disconnected?.();
            super.disconnected();
        }
        reconnected() {
            super.reconnected();
            this._vm?.reconnected?.();
        }
    }

    return directive(ComponentDirective);
}