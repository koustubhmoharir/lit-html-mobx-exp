import { noChange } from "lit-html";
import { directive } from "lit-html/directive.js";
import { AsyncDirective, PartInfo } from "lit-html/async-directive.js";
import { Reaction } from "mobx";
import { pushCompleteRenderCallback, renderInContext } from "./render";
import { shallowEqual } from "./shallowEqual"

interface State<Props> {
  render(props: Props): unknown;
  renderCompleted?(): void;
  disconnected?(): void;
  reconnected?(): void;
}

interface StateConstructor<Props> {
  new (initialProps: Props): State<Props>;
}

type Component<Props> = (props: Props) => unknown;

export function component<Props>(cls: StateConstructor<Props>): Component<Props> {
  class ComponentDirective extends AsyncDirective {
    constructor(partInfo: PartInfo) {
      super(partInfo);
      this._connect();
    }
    private reaction!: Reaction;
    private _connect() {
      this.reaction = new Reaction(this.constructor.name, this.rerender);
    }

    private _props!: Props;
    private state?: State<Props>;

    render(props: Props) {
      const skipRender = this.state !== undefined && shallowEqual(this._props, props);
      this._props = props;
      if (this.state === undefined) this.state = new cls(props);
      if (skipRender) return noChange;
      return this.renderState();
    }
    private renderState() {
      const s = this.state;
      if (!s) return;
      const rc = s.renderCompleted?.bind(s);
      if (rc) {
        pushCompleteRenderCallback(rc);
      }
      let result;
      this.reaction.track(() => {
        result = s.render(this._props);
      });
      return result;
    }
    readonly rerender = () => {
      renderInContext(() => this.setValue(this.renderState()));
    };

    disconnected() {
      if (this.state?.disconnected) this.state.disconnected();
      this.reaction.dispose();
    }
    reconnected() {
      this._connect();
      if (this.state?.reconnected) this.state.reconnected();
    }
  }

  return directive(ComponentDirective);
}