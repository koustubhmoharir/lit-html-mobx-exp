import { Keyed, keyed, MultiKeyed, multiKeyed } from "./directives/keyed";
import { shallowEqual } from "./shallowEqual"
import { ReactiveDirective } from "./ReactiveDirective";
import { safeIndex } from "./Utils";
import { RenderResult } from "./render";
import { contentDirective } from "./directives/contentDirective";
import { Model } from "./Model";

interface State<Props> {
    render(props: Props): RenderResult;
    renderCompleted?(): void;
    disconnected?(): void;
    reconnected?(): void;
}

interface StateConstructor<Args extends unknown[], Props> {
    new(...args: Args): State<Props>;
}

type Component<Args extends unknown[], Props> = (...args: [...Args, Props]) => RenderResult;

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

    const dir = contentDirective(ComponentDirective);
    return (...rr: RArgs) => multiKeyed(dir(...rr), rr.slice(0, keys));
}

interface ViewState<M extends Model> {
    readonly model: M;
    renderCompleted?(): void;
    disconnected?(): void;
    reconnected?(): void;
}
interface ViewStateConstructor<M extends Model, C extends ViewState<M>> {
    new(model: M): C;
}

export function innerView<M extends Model>(template: (this: M) => RenderResult): (model: M) => RenderResult;

export function innerView<M extends Model, VS extends ViewState<M>>(template: (this: M, vm: VS) => RenderResult, ViewStateClass: ViewStateConstructor<M, VS>): (model: M) => RenderResult;

export function innerView<M extends Model, VS extends ViewState<M> | {} = {}>(template: (this: M, vm: VS) => RenderResult, ViewStateClass?: VS extends ViewState<M> ? ViewStateConstructor<M, VS> : undefined) {
    const dir = ViewStateClass ? makeViewStateDirective(template as any, ViewStateClass) : makeStatelessDiretive(template as any);
    return (m: M) => keyed(dir(m), m);
}
function makeStatelessDiretive<M extends Model>(template: () => RenderResult) {
    class ComponentDirective extends ReactiveDirective<[M]> {
        render(m: M) {
            return template.call(m);
        }
        protected get renderCompleteCallback() { return undefined; }
        protected skipUpdate([oldM]: [M], [newM]: [M]) {
            if (oldM !== newM) throw new Error("Model changed unexpectedly");
            return true;
        }
    }

    return contentDirective(ComponentDirective);
}
function makeViewStateDirective<M extends Model, VS extends ViewState<M>>(template: (this: M, vm: VS) => RenderResult, ViewStateClass: ViewStateConstructor<M, VS>) {
    class ComponentDirective extends ReactiveDirective<[M]> {
        private _vm?: VS;
        render(m: M) {
            if (!this._vm)
                this._vm = new ViewStateClass(m);
            return template.call(this._vm.model, this._vm);
        }
        protected get renderCompleteCallback() {
            return this._vm?.renderCompleted?.bind(this._vm);
        }
        protected skipUpdate([oldM]: [M], [newM]: [M]) {
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

    return contentDirective(ComponentDirective);
}