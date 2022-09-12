import { directive } from "lit-html/directive";
import { AsyncDirective, PartInfo } from "lit-html/async-directive";
import { Reaction } from "mobx";

interface State<Props> {
  render(props: Props): unknown;
  disconnected?(): void;
  reconnected?(): void;
}

interface StateConstructor<Props> {
  new (initialProps: Props): State<Props>;
}

export function component<Props>(cls: StateConstructor<Props>) {
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
      console.log(cls.name + " render started");
      this._props = props;
      if (this.state === undefined) this.state = new cls(props);
      let result;
      this.reaction.track(() => {
        result = this.state!.render(this._props);
      });
      console.log(cls.name + " render ended");
      return result;
    }
    readonly rerender = () => {
      console.log(cls.name + " rerender triggered");
      this.setValue(this.render(this._props));
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
