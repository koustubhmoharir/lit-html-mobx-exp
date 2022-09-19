import { directive, DirectiveResult } from "lit-html/directive.js";
import { Keyed, keyed } from "lit-html/directives/keyed.js";
import { shallowEqual } from "./shallowEqual"
import { ReactiveDirective } from "./ReactiveDirective";

interface State<Props> {
    render(props: Props): unknown;
    renderCompleted?(): void;
    disconnected?(): void;
    reconnected?(): void;
}

interface StateConstructor<Props> {
    new(initialProps: Props): State<Props>;
}

type Component<Props> = (props: Props) => unknown;

export function controllerView<Props>(cls: StateConstructor<Props>): Component<Props> {

    class ComponentDirective extends ReactiveDirective<[Props]> {
        private state?: State<Props>;
        render(props: Props) {
            console.log("render", cls.name);
            if (this.state === undefined) this.state = new cls(props);
            return this.state.render(props);
        }
        protected skipUpdate([oldProps]: [Props], [newProps]: [Props]) {
            return shallowEqual(oldProps, newProps);
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

    return directive(ComponentDirective);
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
    return (m: Model) => keyed(m, dir(m));
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